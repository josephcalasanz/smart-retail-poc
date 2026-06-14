'use client'

import { useState, useRef, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { STORES } from '@/data/mock'
import { useProduct } from '@/context/ProductContext'
import type { Product } from '@/data/mock/products'

type Message = { role: 'user' | 'assistant'; text: string; timestamp: Date }

type Action =
  | { type: 'store'; store: string; sku: string }
  | { type: 'transfer'; store: string }
  | { type: 'risk' }
  | { type: 'confidence' }

type Reply = { text: string; next: Action | null }

const CONFIRM = /\b(yes|yeah|yep|yup|sure|ok|okay|proceed|go ahead|do it|please do|go for it|sounds good|that works|let'?s do it|draft|drafts|sequence|the plan|rebalancing plan|buffers|surplus|network|picture|send it)\b/
const DECLINE = /\b(no|nope|not now|nevermind|never mind|maybe later|that'?s all|cancel|stop)\b/

const CANNED_QUERIES = [
  { label: 'Stock status at Glorietta',  query: 'How is stock looking at Glorietta?' },
  { label: 'Stock status at Greenhills', query: 'How is stock looking at Greenhills?' },
  { label: 'Lowest stock for launch',    query: 'Which store has the lowest stock for launch day?' },
  { label: 'Ayala Avenue shortfall',     query: 'How short is Ayala Avenue for launch?' },
  { label: 'Forecast confidence by SKU', query: 'What is the forecast confidence for each SKU?' },
  { label: 'Rockwell transfer options',  query: 'What transfer options does Rockwell have?' },
]

// Pure, product-aware, demand-based response engine. Returns the reply text plus
// the follow-up action it offers (so a later "proceed/ok" can execute the next step).
function getReply(product: Product, rawInput: string, last: Action | null): Reply {
  const raw = rawInput.trim().toLowerCase()
  const name = product.name
  const launch = product.launchDaysOut
  const overall = product.forecastConfidence
  const conf = product.skuConfidence

  const skuLabel = (id: string) => { const s = product.skus.find(x => x.id === id); return s ? `${s.color} ${s.storage}` : id }
  const sName = (sid: string) => STORES.find(s => s.id === sid)?.name ?? sid
  const sCity = (sid: string) => STORES.find(s => s.id === sid)?.city ?? ''
  const rowsOf = (sid: string) => product.allocation.filter(a => a.storeId === sid)
  const pctOver = (c: number, d: number) => (c > 0 ? Math.round(((d - c) / c) * 100) : 0)

  const transferPlan = (skuId: string, needStore: string, need: number) => {
    const src = product.allocation
      .filter(a => a.skuId === skuId && a.storeId !== needStore && a.current - a.demand > 0)
      .map(a => ({ store: a.storeId, avail: a.current - a.demand }))
      .sort((x, y) => y.avail - x.avail)
    let rem = need
    const plan: { store: string; take: number }[] = []
    for (const s of src) { if (rem <= 0) break; const t = Math.min(s.avail, rem); plan.push({ store: s.store, take: t }); rem -= t }
    return { plan, rem }
  }

  // ---- base responses ----
  const storeResponse = (sid: string): Reply => {
    const rows = rowsOf(sid)
    const net = rows.reduce((a, r) => a + (r.current - r.demand), 0)
    const lines = rows.map(r => { const g = r.current - r.demand; return `• ${skuLabel(r.skuId)}: ${r.current} on hand vs ${r.demand} demand (${g >= 0 ? '+' : ''}${g})` }).join('\n')
    const worst = [...rows].sort((a, b) => (a.current - a.demand) - (b.current - b.demand))[0]
    const wg = worst.current - worst.demand
    const head = net < 0
      ? `Here's where ${sName(sid)} stands for the ${name} launch — it's running ${Math.abs(net)} units short of demand overall, so I'd flag it as an at-risk store.`
      : `${sName(sid)} is in solid shape for the ${name} launch — net ${net >= 0 ? '+' : ''}${net} against demand, so nothing urgent here.`
    let rec: string
    if (wg < 0) {
      const { plan, rem } = transferPlan(worst.skuId, sid, -wg)
      const parts = plan.map(p => `${p.take} from ${sName(p.store)}`)
      const intro = `The real pressure point is ${skuLabel(worst.skuId)}: ${worst.demand} demand against ${worst.current} on hand — about ${pctOver(worst.current, worst.demand)}% over current stock, and the deepest single gap at this store.`
      let action: string
      if (parts.length && rem > 0) action = `pull ${parts.join(' and ')}, then escalate the remaining ${rem} units to warehouse replenishment`
      else if (parts.length) action = `pull ${parts.join(' and ')} — that closes the gap entirely from existing surplus`
      else action = `there's no surplus of this SKU anywhere in the network, so all ${-wg} units have to come from warehouse replenishment — a replenishment call, not a rebalance`
      rec = `${intro}\n\nWhat I'd do: ${action}. Launch is ${launch} days out, so I'd move now; a short position here means customers walking out without the colour they pre-ordered.`
    } else {
      rec = `Every SKU here is at or above demand — I'd leave it untouched and keep attention on the at-risk stores instead.`
    }
    return { text: `${head}\n\n${lines}\n\n${rec}\n\nWant me to draft the transfer request, or pull forecast confidence on ${skuLabel(worst.skuId)}?`, next: { type: 'store', store: sid, sku: worst.skuId } }
  }

  const transferResponse = (sid: string): Reply => {
    const rows = rowsOf(sid)
    const surplus = rows.filter(r => r.current - r.demand > 0)
    const short = rows.filter(r => r.current - r.demand < 0)
    let out: string
    if (surplus.length) {
      out = `Good news — ${sName(sid)} is carrying surplus you can redeploy. Here's how I'd use it:`
      surplus.forEach(r => {
        const avail = r.current - r.demand
        const dests = product.allocation.filter(x => x.skuId === r.skuId && x.storeId !== sid && x.current - x.demand < 0).sort((a, b) => (a.current - a.demand) - (b.current - b.demand))
        let rem = avail
        const alloc: string[] = []
        for (const dx of dests) { if (rem <= 0) break; const need = -(dx.current - dx.demand); const t = Math.min(need, rem); alloc.push(`${t} to ${sName(dx.storeId)} (${dx.current - dx.demand} short)`); rem -= t }
        out += `\n• ${avail} surplus ${skuLabel(r.skuId)} — ` + (alloc.length ? `I'd send ${alloc.join(', then ')}` + (rem > 0 ? `, holding ${rem} as buffer` : '') + `.` : `no short stores need it, so hold it as buffer.`)
      })
    } else {
      out = `${sName(sid)} has nothing spare to give right now — it's net short itself, so I wouldn't pull from it.`
    }
    if (short.length) {
      out += `\n\nOne caution: ${sName(sid)} is itself short on ${short.map(r => `${skuLabel(r.skuId)} (${r.current - r.demand})`).join(' and ')}. I'd cover those gaps from warehouse replenishment rather than another store — network surplus is thin, and robbing Peter to pay Paul just moves the gap around.`
    }
    return { text: out + `\n\nWant me to sequence these by urgency, or show the full network surplus picture?`, next: { type: 'transfer', store: sid } }
  }

  const riskResponse = (): Reply => {
    const gaps = product.allocation.map(r => ({ s: r.storeId, k: r.skuId, g: r.current - r.demand }))
    const short = gaps.filter(r => r.g < 0).sort((a, b) => a.g - b.g)
    const top = short.slice(0, 3)
    const lines = top.map((r, i) => `${i + 1}. ${sName(r.s)} — ${Math.abs(r.g)} short on ${skuLabel(r.k)}`).join('\n')
    const grossShort = short.reduce((a, r) => a + -r.g, 0)
    const surplus = gaps.filter(r => r.g > 0).reduce((a, r) => a + r.g, 0)
    const w = top[0]
    return { text: `For the ${name} launch (${launch} days out), these are the three positions I'd worry about most:\n\n${lines}\n\n${sName(w.s)}'s ${skuLabel(w.k)} is the single biggest exposure at ${Math.abs(w.g)} units. Stepping back: across the network you're ${grossShort} units short, but ${surplus} units are sitting as surplus in other stores — so roughly ${surplus} of that gap is fixable by rebalancing today, and the remaining ${grossShort - surplus} needs warehouse or central replenishment.\n\nI'd start with ${sName(w.s)} since it's both the deepest and a customer-facing flagship. Want a full store-by-store rebalancing plan?`, next: { type: 'risk' } }
  }

  const confidenceResponse = (): Reply => {
    const ks = Object.keys(conf).sort((a, b) => conf[b] - conf[a])
    const top = ks[0], bot = ks[ks.length - 1]
    const lines = ks.map(k => `• ${skuLabel(k)}: ${conf[k]}%`).join('\n')
    return { text: `Forecast confidence for ${name} sits at ${overall}% overall. By SKU:\n\n${lines}\n\n${skuLabel(top)} is your most reliable read at ${conf[top]}% — I'd be comfortable committing to it aggressively. ${skuLabel(bot)} at ${conf[bot]}% is the one I'd treat with caution: build in a buffer and lean on rebalancing over a large upfront commit, since the demand signal there is softer.\n\nWant me to translate these into suggested order buffers per SKU?`, next: { type: 'confidence' } }
  }

  const overviewResponse = (): Reply => {
    const lines = STORES.map(s => { const r = rowsOf(s.id); const c = r.reduce((a, x) => a + x.current, 0); const d = r.reduce((a, x) => a + x.demand, 0); const g = c - d; return `• ${s.name} (${s.city}): ${c} on hand / ${d} demand (${g >= 0 ? '+' : ''}${g})` }).join('\n')
    return { text: `All-store allocation summary for ${name}:\n\n${lines}`, next: null }
  }

  // ---- follow-ups (triggered by a confirmation) ----
  const draftTransfer = (sid: string, skuId: string): Reply => {
    const row = rowsOf(sid).find(r => r.skuId === skuId)
    if (!row) return overviewResponse()
    const wg = row.current - row.demand
    const { plan, rem } = transferPlan(skuId, sid, -wg)
    const sev = wg <= -100 ? 'Critical' : 'High'
    const moves = plan.map(p => `• ${p.take} units from ${sName(p.store)} (surplus available)`)
    if (rem > 0) moves.push(`• ${rem} units — warehouse replenishment request`)
    return { text: `Draft transfer request — ready to send:\n\nTRANSFER REQUEST · ${name} launch\nDestination: ${sName(sid)} (${sCity(sid)})\nSKU: ${skuLabel(skuId)}\nShortfall: ${-wg} units (demand ${row.demand} vs ${row.current} on hand)\nPriority: ${sev} · target ETA 1–2 days before launch\n\nMoves:\n${moves.join('\n')}\n\nThat closes the full ${-wg}-unit gap. Want me to run the rest of the at-risk stores as a rebalancing plan?`, next: { type: 'risk' } }
  }

  const sequenceTransfers = (sid: string): Reply => {
    const surplus = rowsOf(sid).filter(r => r.current - r.demand > 0)
    const steps: string[] = []
    let n = 1
    let firstDest: string | null = null
    let firstSku: string | null = null
    surplus.forEach(r => {
      const dests = product.allocation.filter(x => x.skuId === r.skuId && x.storeId !== sid && x.current - x.demand < 0).sort((a, b) => (a.current - a.demand) - (b.current - b.demand))
      let rem = r.current - r.demand
      for (const dx of dests) {
        if (rem <= 0) break
        const t = Math.min(-(dx.current - dx.demand), rem)
        if (!firstDest) { firstDest = dx.storeId; firstSku = r.skuId }
        steps.push(`${n++}. Ship ${t} ${skuLabel(r.skuId)} → ${sName(dx.storeId)} (gap ${dx.current - dx.demand}) — ${dx.current - dx.demand <= -100 ? 'critical, do first' : 'high priority'}`)
        rem -= t
      }
    })
    const body = steps.length ? steps.join('\n') : 'No surplus at this store to sequence.'
    const next: Action | null = firstDest && firstSku ? { type: 'store', store: firstDest, sku: firstSku } : null
    return { text: `Sequenced by urgency — deepest shortfall first:\n\n${body}\n\nAfter these moves, flag ${sName(sid)}'s own shortfalls for warehouse replenishment.${firstDest ? ` Want me to draft the transfer request for ${sName(firstDest)}?` : ''}`, next }
  }

  const surplusPicture = (): Reply => {
    const sur = product.allocation.filter(r => r.current - r.demand > 0).sort((a, b) => (b.current - b.demand) - (a.current - a.demand))
    const lines = sur.length ? sur.map(r => `• ${sName(r.storeId)} — ${r.current - r.demand} surplus ${skuLabel(r.skuId)}`).join('\n') : '• No surplus anywhere in the network.'
    const total = sur.reduce((a, r) => a + (r.current - r.demand), 0)
    const gross = product.allocation.filter(r => r.current - r.demand < 0).reduce((a, r) => a + (r.demand - r.current), 0)
    return { text: `Full network surplus for ${name} — redeployable stock right now:\n\n${lines}\n\nThat's ${total} units against a gross shortfall of ${gross}, so rebalancing only goes so far — the remaining ${gross - total} needs warehouse or central replenishment, not a transfer.`, next: null }
  }

  const rebalancePlan = (): Reply => {
    const stores = STORES.filter(s => rowsOf(s.id).reduce((a, r) => a + (r.current - r.demand), 0) < 0)
      .sort((a, b) => rowsOf(a.id).reduce((x, r) => x + (r.current - r.demand), 0) - rowsOf(b.id).reduce((x, r) => x + (r.current - r.demand), 0))
    if (!stores.length) return overviewResponse()
    const lines = stores.map(s => {
      const rows = rowsOf(s.id)
      const net = rows.reduce((a, r) => a + (r.current - r.demand), 0)
      const w = [...rows].sort((a, b) => (a.current - a.demand) - (b.current - b.demand))[0]
      const wg = w.current - w.demand
      const { plan, rem } = transferPlan(w.skuId, s.id, -wg)
      const move = plan.length ? `pull ${plan.map(p => `${p.take} ${sName(p.store)}`).join(' + ')}` : 'no network surplus'
      return `• ${sName(s.id)} (net ${net}) — ${skuLabel(w.skuId)} ${wg}: ${move}${rem > 0 ? `, ${rem} to warehouse` : ''}`
    }).join('\n')
    const gross = product.allocation.filter(r => r.current - r.demand < 0).reduce((a, r) => a + (r.demand - r.current), 0)
    const sur = product.allocation.filter(r => r.current - r.demand > 0).reduce((a, r) => a + (r.current - r.demand), 0)
    const ws = [...rowsOf(stores[0].id)].sort((a, b) => (a.current - a.demand) - (b.current - b.demand))[0]
    return { text: `Store-by-store rebalancing plan for ${name}:\n\n${lines}\n\nNetwork totals: ${sur} units rebalanceable from surplus today, ${gross - sur} requiring warehouse or central replenishment. Want me to draft the transfer request for ${sName(stores[0].id)} first — it's the deepest?`, next: { type: 'store', store: stores[0].id, sku: ws.skuId } }
  }

  const orderBuffers = (): Reply => {
    const ks = Object.keys(conf).sort((a, b) => conf[b] - conf[a])
    const buf = (c: number) => (c >= 80 ? 5 : c >= 75 ? 8 : c >= 70 ? 12 : 15)
    const lines = ks.map(k => `• ${skuLabel(k)}: ${conf[k]}% confidence → +${buf(conf[k])}% order buffer`).join('\n')
    return { text: `Suggested order buffers for ${name}, scaled inversely to confidence:\n\n${lines}\n\nLogic: high-confidence SKUs get a lean buffer; the softer the signal, the larger the cushion to absorb forecast error. These feed straight into the order-sizing scenario on the Forecasting page.`, next: null }
  }

  const runFollowup = (a: Action, q: string): Reply => {
    if (a.type === 'store') return draftTransfer(a.store, a.sku)
    if (a.type === 'transfer') return (q.includes('surplus') || q.includes('network') || q.includes('picture')) ? surplusPicture() : sequenceTransfers(a.store)
    if (a.type === 'risk') return rebalancePlan()
    return orderBuffers()
  }

  // ---- routing: explicit intents take priority over confirmation words ----
  if (raw.includes('confidence')) return confidenceResponse()
  if (raw.includes('lowest') || raw.includes('risk') || raw.includes('launch day')) return riskResponse()
  if (raw.includes('all store') || raw.includes('overview') || raw.includes('summary')) return overviewResponse()
  const store = STORES.find(s => raw.includes(s.name.toLowerCase().split(' ')[0]) || (s.id === 'PH-CNC' && raw.includes('cash')))
  if (store) return raw.includes('transfer') ? transferResponse(store.id) : storeResponse(store.id)

  if (DECLINE.test(raw)) return { text: `Understood — I'll leave it there. I'm here whenever you need a store readout, a transfer plan, the launch-risk view, or forecast confidence.`, next: null }
  if (CONFIRM.test(raw)) {
    if (!last) return { text: `Happy to — what should I look at? Try a store (Glorietta, Rockwell…), launch risk, transfers, or forecast confidence.`, next: null }
    return runFollowup(last, raw)
  }
  return { text: `I can break down any of the six stores, a specific SKU, transfer options, launch-day risk, or forecast confidence — all from live ${name} allocation. What would you like?`, next: last }
}

export default function AssistantPage() {
  const { product, products, setProductId } = useProduct()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [lastAction, setLastAction] = useState<Action | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Reset chat + show a fresh per-product welcome whenever the product changes
  useEffect(() => {
    setMessages([])
    setLastAction(null)
    setTyping(true)
    const delay = 800 + Math.random() * 600
    const timer = setTimeout(() => {
      setMessages([{
        role: 'assistant',
        text: `Good morning. I'm Smart Assistant, your retail intelligence assistant for ${product.name}.\n\nI can read stock across Makati, Manila and San Juan stores, surface transfer options, and flag at-risk SKUs — then recommend the next move, all from live allocation data.\n\nWhat would you like to know?`,
        timestamp: new Date(),
      }])
      setTyping(false)
    }, delay)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function sendMessage(text: string) {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', text: text.trim(), timestamp: new Date() }
    const pending = lastAction
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    setSidebarOpen(false)
    setTimeout(() => {
      const reply = getReply(product, text, pending)
      setMessages(prev => [...prev, { role: 'assistant', text: reply.text, timestamp: new Date() }])
      setLastAction(reply.next)
      setTyping(false)
    }, 1000 + Math.floor(Math.random() * 700))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header title="Smart Assistant" />

      <div className="relative flex flex-1 gap-0 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-20 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`absolute md:relative z-30 w-64 bg-white border-r border-zinc-200 flex flex-col shrink-0 h-full transition-transform duration-300 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          {/* Product selector — scopes status, queries and every response */}
          <div className="px-4 py-4 border-b border-zinc-100">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Product</div>
            <div className="relative flex items-center">
              <select
                value={product.id}
                onChange={e => setProductId(e.target.value)}
                className="appearance-none w-full bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 text-sm font-bold text-zinc-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a7a2e]/30"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <svg className="pointer-events-none absolute right-2.5 w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          <div className="px-4 py-4 border-b border-zinc-100">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Store Status</div>
            {STORES.map(store => {
              const rows = product.allocation.filter(r => r.storeId === store.id)
              const onHand = rows.reduce((s, r) => s + r.current, 0)
              const demand = rows.reduce((s, r) => s + r.demand, 0)
              const gap = onHand - demand
              const status = gap >= 0 ? 'ok' : gap > -100 ? 'warn' : 'critical'
              return (
                <button
                  key={store.id}
                  onClick={() => sendMessage(`How is stock looking at ${store.name}?`)}
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-zinc-50 transition-colors mb-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-800">{store.name}</span>
                    <span className={`w-2 h-2 rounded-full ${status === 'ok' ? 'bg-emerald-400' : status === 'warn' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">{store.city} · {onHand} on hand · {gap >= 0 ? '+' : ''}{gap} vs demand</div>
                </button>
              )
            })}
          </div>
          <div className="px-4 py-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Quick Queries</div>
            <div className="space-y-1.5">
              {CANNED_QUERIES.map(q => (
                <button
                  key={q.label}
                  onClick={() => sendMessage(q.query)}
                  className="w-full text-left px-3 py-2 rounded-md text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-100 hover:border-zinc-300 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2 px-4 pt-3 pb-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 text-xs text-zinc-500 border border-zinc-200 rounded-md px-3 py-1.5 bg-white hover:bg-zinc-50"
            >
              Stores and Queries
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5">
            <div className="flex flex-col justify-end min-h-full gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] md:max-w-2xl rounded-xl px-4 py-3 ${msg.role === 'user' ? 'text-white' : 'bg-white border border-zinc-200 text-zinc-800'}`}
                  style={msg.role === 'user' ? { background: '#1a7a2e' } : {}}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold" style={{ background: '#5ab22e' }}>S</div>
                      <span className="text-xs font-medium text-zinc-500">Smart Assistant</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                  <div className="text-xs mt-2 text-zinc-400">{msg.timestamp.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-zinc-200 rounded-xl px-4 py-3 max-w-[85%] md:max-w-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold" style={{ background: '#5ab22e' }}>S</div>
                    <span className="text-xs font-medium text-zinc-500">Smart Assistant</span>
                    <span className="text-xs text-zinc-300 ml-1">is thinking...</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#5ab22e', animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#5ab22e', animationDelay: '180ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#5ab22e', animationDelay: '360ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-zinc-200 bg-white px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about stock levels, transfers, or launch readiness..."
                className="flex-1 bg-transparent text-sm text-zinc-800 placeholder-zinc-400 outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || typing}
                className="px-3 py-1.5 text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-colors"
                style={{ background: '#1a7a2e' }}
              >
                Send
              </button>
            </div>
            <div className="text-xs text-zinc-400 mt-2 text-center">
              Responses computed from live allocation data · {product.name} · {new Date().toLocaleDateString('en-PH')}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
