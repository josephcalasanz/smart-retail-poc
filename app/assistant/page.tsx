'use client'

import { useState, useRef, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { TRANSFER_SUGGESTIONS, STORES, SKUS } from '@/data/mock'
import { useProduct } from '@/context/ProductContext'

type Message = {
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
}

const CANNED_QUERIES = [
  { label: 'Stock status at Glorietta',  query: 'What is the current stock status at Glorietta?' },
  { label: 'Stock status at Greenhills', query: 'What is the current stock status at Greenhills?' },
  { label: 'Lowest stock for launch',    query: 'Which store has the lowest stock for launch day?' },
  { label: 'Ayala Avenue shortfall',     query: 'What is the stock situation at Ayala Avenue for Natural Titanium?' },
  { label: 'Forecast confidence by SKU', query: 'What is the forecast confidence for each SKU?' },
  { label: 'Rockwell transfer options',  query: 'What transfer suggestions do you have for Black Titanium stock at Rockwell?' },
]

function buildAutoResponse(query: string, ALLOCATION_TABLE: typeof import('@/data/mock/products').PRODUCTS[0]['allocation']): string {
  const q = query.toLowerCase()
  const match = TRANSFER_SUGGESTIONS.find((s: { trigger: string[]; response: string }) => s.trigger.every((t: string) => q.includes(t)))
  if (match) return match.response
  if (q.includes('glorietta')) {
    const rows = ALLOCATION_TABLE.filter(r => r.storeId === 'PH-GLO')
    const lines = rows.map(r => { const sku = SKUS.find(s => s.id === r.skuId); const gap = r.current - r.demand; return `* ${sku?.color} ${sku?.storage}: ${r.current} committed vs ${r.demand} demand (${gap >= 0 ? '+' : ''}${gap})` })
    return `Glorietta current allocation:\n${lines.join('\n')}\n\nRecommendation: Prioritise Black Titanium 128GB - 160 unit shortfall against launch-day demand.`
  }
  if (q.includes('greenhills')) {
    const rows = ALLOCATION_TABLE.filter(r => r.storeId === 'PH-GRH')
    const lines = rows.map(r => { const sku = SKUS.find(s => s.id === r.skuId); const gap = r.current - r.demand; return `* ${sku?.color} ${sku?.storage}: ${r.current} committed vs ${r.demand} demand (${gap >= 0 ? '+' : ''}${gap})` })
    return `Greenhills (San Juan) current allocation:\n${lines.join('\n')}\n\nRecommendation: Black Titanium 128GB and Desert Titanium 256GB are both critically short. Escalate to warehouse replenishment.`
  }
  if (q.includes('rockwell')) {
    const rows = ALLOCATION_TABLE.filter(r => r.storeId === 'PH-RKW')
    const lines = rows.map(r => { const sku = SKUS.find(s => s.id === r.skuId); const gap = r.current - r.demand; return `* ${sku?.color} ${sku?.storage}: ${r.current} committed / ${r.demand} demand (${gap >= 0 ? 'surplus' : 'shortfall'} ${Math.abs(gap)})` })
    return `Rockwell allocation snapshot:\n${lines.join('\n')}\n\nOverall: Slight surplus on Black Titanium - available for transfer to Glorietta or Greenhills.`
  }
  if (q.includes('ayala')) {
    const rows = ALLOCATION_TABLE.filter(r => r.storeId === 'PH-AYA')
    const lines = rows.map(r => { const sku = SKUS.find(s => s.id === r.skuId); const gap = r.current - r.demand; return `* ${sku?.color} ${sku?.storage}: ${r.current} committed / ${r.demand} demand (${gap >= 0 ? '+' : ''}${gap})` })
    return `Ayala Avenue allocation snapshot:\n${lines.join('\n')}\n\nHighest-risk store for launch day. Recommend immediate warehouse replenishment request.`
  }
  if (q.includes('robinsons')) {
    const rows = ALLOCATION_TABLE.filter(r => r.storeId === 'PH-RBP')
    const lines = rows.map(r => { const sku = SKUS.find(s => s.id === r.skuId); const gap = r.current - r.demand; return `* ${sku?.color} ${sku?.storage}: ${r.current} committed / ${r.demand} demand (${gap >= 0 ? '+' : ''}${gap})` })
    return `Robinsons Place allocation snapshot:\n${lines.join('\n')}`
  }
  if (q.includes('cash')) {
    const rows = ALLOCATION_TABLE.filter(r => r.storeId === 'PH-CNC')
    const lines = rows.map(r => { const sku = SKUS.find(s => s.id === r.skuId); const gap = r.current - r.demand; return `* ${sku?.color} ${sku?.storage}: ${r.current} committed / ${r.demand} demand (${gap >= 0 ? '+' : ''}${gap})` })
    return `Cash and Carry allocation snapshot:\n${lines.join('\n')}\n\nNear-balanced. Minor surplus available for reallocation.`
  }
  if (q.includes('all stores') || q.includes('overview')) {
    const lines = STORES.map(store => { const rows = ALLOCATION_TABLE.filter(r => r.storeId === store.id); const committed = rows.reduce((s, r) => s + r.current, 0); const demand = rows.reduce((s, r) => s + r.demand, 0); const gap = committed - demand; return `* ${store.name} (${store.city}): ${committed} committed / ${demand} demand (${gap >= 0 ? '+' : ''}${gap})` })
    return `All-store allocation summary:\n${lines.join('\n')}`
  }
  if (q.includes('lowest') || q.includes('risk')) {
    return 'Ayala Avenue has the highest demand-to-supply gap: 150 units short on Natural Titanium 256GB. Greenhills follows with a 120-unit shortfall on Black Titanium 128GB. Both stores should be prioritised for warehouse replenishment before launch day.'
  }
  return `I don't have a specific answer for that query yet. Try asking about a specific store (Glorietta, Rockwell, Robinsons Place, Cash and Carry, Ayala Avenue, Greenhills), SKU status, transfer suggestions, or forecast confidence.`
}

export default function AssistantPage() {
  const { product } = useProduct()
  const ALLOCATION_TABLE = product.allocation
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Reset chat and show new welcome message when product changes
  useEffect(() => {
    setMessages([])
    setTyping(true)
    const delay = 800 + Math.random() * 600
    const timer = setTimeout(() => {
      setMessages([{
        role: 'assistant',
        text: `Good morning. I'm Smart Assistant, your retail intelligence assistant for ${product.name}.\n\nI can help you check stock levels across Makati, Manila and San Juan stores, identify transfer opportunities, and flag at-risk SKUs.\n\nWhat would you like to know?`,
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
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    setSidebarOpen(false)
    setTimeout(() => {
      const response = buildAutoResponse(text, ALLOCATION_TABLE)
      setMessages(prev => [...prev, { role: 'assistant', text: response, timestamp: new Date() }])
      setTyping(false)
    }, 1200 + Math.floor(Math.random() * 800))
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
        <div className={`absolute md:relative z-30 w-64 bg-white border-r border-zinc-200 flex flex-col shrink-0 h-full transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <div className="px-4 py-4 border-b border-zinc-100">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Store Status</div>
            {STORES.map(store => {
              const rows = ALLOCATION_TABLE.filter(r => r.storeId === store.id)
              const committed = rows.reduce((s, r) => s + r.current, 0)
              const demand = rows.reduce((s, r) => s + r.demand, 0)
              const gap = committed - demand
              const status = gap >= 0 ? 'ok' : gap > -100 ? 'warn' : 'critical'
              return (
                <button
                  key={store.id}
                  onClick={() => sendMessage(`What is the current stock status at ${store.name}?`)}
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-zinc-50 transition-colors mb-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-800">{store.name}</span>
                    <span className={`w-2 h-2 rounded-full ${status === 'ok' ? 'bg-emerald-400' : status === 'warn' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">{store.city} · {committed} committed · {gap >= 0 ? '+' : ''}{gap} vs demand</div>
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
              Responses based on live allocation data · {product.name} · {new Date().toLocaleDateString('en-PH')}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
