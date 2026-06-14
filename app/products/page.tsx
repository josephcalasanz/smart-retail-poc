'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { useProduct } from '@/context/ProductContext'
import { STORES } from '@/data/mock'
import { Badge } from '@/components/ui/badge'

const SKU_COLORS = ['#1a7a2e', '#5ab22e', '#3aaa9e', '#6ec6e6']
const shortSku = (color: string, storage: string) =>
  `${color.replace('Titanium', 'Ti')} ${storage.replace('GB', '')}`.replace(/\s+/g, ' ').trim()
const cityOf = (storeId: string) => STORES.find(s => s.id === storeId)?.city ?? ''
const nameOf = (storeId: string) => STORES.find(s => s.id === storeId)?.name ?? storeId

function coverStatus(cov: number) {
  if (cov < 0.70) return { label: 'Critical', color: '#ef4444' }
  if (cov < 0.90) return { label: 'Low', color: '#f59e0b' }
  return { label: 'Healthy', color: '#22c55e' }
}

export default function ProductsPage() {
  const { product, products, setProductId } = useProduct()
  const [skuId, setSkuId] = useState<string>('all')

  const pct = Math.round((product.unitsCommitted / product.preOrders) * 100)

  const KPI_CARDS = [
    { label: 'Pre-orders', value: product.preOrders.toLocaleString(), sub: `Across 6 stores · ${product.region}`, color: '', bg: 'bg-white', style: {}, valueStyle: {} },
    { label: 'Units Committed', value: product.unitsCommitted.toLocaleString(), sub: `${pct}% of pre-order demand`, color: '', bg: 'bg-white', style: {}, valueStyle: {} },
    { label: 'Supply Gap', value: product.unitsGap.toLocaleString(), sub: 'Units unallocated at launch', color: 'text-red-600', bg: 'bg-red-50', style: {}, valueStyle: {} },
    { label: 'Forecast Confidence', value: product.forecastConfidence + '%', sub: 'Based on 12-week sell-through', color: '', bg: '', style: { background: '#eaf5ec', border: '1px solid #b6deba' }, valueStyle: { color: '#1a7a2e' } },
  ]

  // SKU metadata for this product
  const skuMeta = product.skus.map((s, i) => ({
    id: s.id,
    name: `${s.color} ${s.storage}`,
    sv: shortSku(s.color, s.storage),
    color: SKU_COLORS[i % SKU_COLORS.length],
    conf: product.skuConfidence?.[s.id] ?? product.forecastConfidence,
  }))
  const metaOf = (id: string) => skuMeta.find(m => m.id === id)

  // Inventory aggregates per SKU (from allocation)
  const inventory = skuMeta.map(m => {
    const rows = product.allocation.filter(a => a.skuId === m.id)
    const onHand = rows.reduce((s, a) => s + a.current, 0)
    const demand = rows.reduce((s, a) => s + a.demand, 0)
    const cov = demand ? onHand / demand : 1
    const st = coverStatus(cov)
    const stores = rows
      .map(a => {
        const c = a.demand ? a.current / a.demand : 1
        const ss = coverStatus(c)
        return { store: nameOf(a.storeId), city: cityOf(a.storeId), current: a.current, demand: a.demand, gap: a.current - a.demand, cov: Math.floor(c * 100), status: ss.label, col: ss.color }
      })
      .sort((a, b) => a.gap - b.gap)
    return { id: m.id, name: m.name, sv: m.sv, conf: m.conf, onHand, demand, gap: onHand - demand, cov: Math.floor(cov * 100), status: st.label, col: st.color, stores }
  })

  // Allocation alerts (short rows only)
  const allShort = product.allocation
    .map(a => {
      const gap = a.current - a.demand
      const sev = gap <= -100 ? { label: 'Critical', color: '#ef4444' } : { label: 'Review', color: '#f59e0b' }
      const m = metaOf(a.skuId)
      return { storeId: a.storeId, store: nameOf(a.storeId), city: cityOf(a.storeId), skuId: a.skuId, sv: m?.sv ?? a.skuId, gap, sev: sev.label, col: sev.color }
    })
    .filter(r => r.gap < 0)
    .sort((a, b) => a.gap - b.gap)

  const maxGap = Math.max(1, ...allShort.map(r => Math.abs(r.gap)))
  const rowsData = skuId === 'all' ? allShort : allShort.filter(r => r.skuId === skuId)
  const shown = rowsData.slice(0, 6)
  const shownSum = shown.reduce((s, r) => s + Math.abs(r.gap), 0)
  const totSum = rowsData.reduce((s, r) => s + Math.abs(r.gap), 0)
  const misp = allShort.reduce((s, r) => s + Math.abs(r.gap), 0)

  const selectedInv = skuId !== 'all' ? inventory.find(i => i.id === skuId) : null

  const onProductChange = (id: string) => { setProductId(id); setSkuId('all') }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header title="Products" />
      <div className="px-4 md:px-8 py-6 space-y-8">

        {/* Selectors: Product + SKU */}
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="text-sm text-zinc-500">Product</span>
            <div className="relative inline-flex items-center">
              <select
                value={product.id}
                onChange={e => onProductChange(e.target.value)}
                className="appearance-none bg-white border border-zinc-200 rounded-lg pl-3.5 pr-8 py-2 text-sm font-bold text-zinc-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a7a2e]/30"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <svg className="pointer-events-none absolute right-2.5 w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm text-zinc-500">SKU</span>
            <div className="relative inline-flex items-center">
              <select
                value={skuId}
                onChange={e => setSkuId(e.target.value)}
                className="appearance-none bg-white border border-zinc-200 rounded-lg pl-3.5 pr-8 py-2 text-sm font-bold text-zinc-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a7a2e]/30"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <option value="all">All SKUs</option>
                {skuMeta.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <svg className="pointer-events-none absolute right-2.5 w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
        </div>

        {/* Alert banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-500 text-lg">!</span>
            <span className="text-sm text-red-700 font-medium">
              {product.name} launches in {product.launchDaysOut} days. Supply gap of {product.unitsGap.toLocaleString()} units detected across {product.region}.
            </span>
          </div>
          <Badge variant="destructive" className="text-xs">Action Required</Badge>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {KPI_CARDS.map(card => (
            <div key={card.label} className={`${card.bg} rounded-lg px-5 py-4 border border-zinc-200`} style={card.style}>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{card.label}</div>
              <div className={`text-3xl font-bold ${card.color}`} style={card.valueStyle}>{card.value}</div>
              <div className="text-xs text-zinc-400 mt-1">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Allocation alerts + Recommended Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 bg-white border border-zinc-200 rounded-lg">
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0fdf4' }}>
<span className="text-xs font-bold tracking-wide uppercase text-zinc-400">Store Allocation Alerts</span>              <span className="text-xs text-zinc-400">Live · {new Date().toLocaleDateString('en-PH')}</span>
            </div>
            <div className="px-5 py-2.5 text-xs text-zinc-500 border-b border-zinc-50">
              {skuId === 'all'
                ? <>Top {shown.length} of <b className="text-zinc-700">{rowsData.length}</b> short positions · <b className="text-zinc-700">{shownSum}</b> of <b className="text-zinc-700">{totSum}</b> units mispositioned · sorted by severity</>
                : <><b className="text-zinc-700">{rowsData.length}</b> stores short for <b className="text-zinc-700">{metaOf(skuId)?.name}</b> · <b className="text-zinc-700">{totSum}</b> units · sorted by severity</>}
            </div>
            {shown.length === 0 ? (
              <div className="px-5 py-6 text-sm text-zinc-400">No shortfalls — coverage healthy for this selection.</div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {shown.map(item => (
                  <div key={item.storeId + item.skuId} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-44 flex-shrink-0">
                      <div className="text-sm font-medium text-zinc-800">{item.store}</div>
                      <div className="text-xs text-zinc-400">{item.city} · {item.sv}</div>
                    </div>
                    <div className="flex-1 min-w-[40px]">
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.round(Math.abs(item.gap) / maxGap * 100)}%`, background: item.col }} />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-bold" style={{ color: item.col }}>{item.gap} u</div>
                    <span className="w-16 text-center text-[10px] font-bold py-0.5 rounded-full" style={{ background: `${item.col}1a`, color: item.col }}>{item.sev}</span>
                  </div>
                ))}
              </div>
            )}
            {skuId === 'all' && (
              <div className="px-5 py-3 text-[11px] text-zinc-500 border-t border-zinc-50 leading-relaxed">
                <b className="text-zinc-700">Two gaps to close:</b> {misp.toLocaleString()} units mispositioned across stores, rebalanceable now (positioning). Separately, Supply Gap {product.unitsGap.toLocaleString()} = pre-orders {product.preOrders.toLocaleString()} − committed {product.unitsCommitted.toLocaleString()} (procurement).
              </div>
            )}
          </div>

          {/* Recommended Actions panel — numbered steps */}
          <div className="self-start rounded-lg px-5 py-5 flex flex-col" style={{ background: '#0f5c20', border: '1px solid #1a7a2e' }}>
            <div className="text-xs uppercase tracking-wide mb-3" style={{ color: '#8dc63f' }}>Recommended Actions</div>
            {[
              { n: '1', label: 'Why is demand spiking?', href: '/forecasting', cta: 'View Forecast' },
              { n: '2', label: 'Which stores are exposed?', href: '/allocation', cta: 'Rebalance Stock' },
              { n: '3', label: 'What can frontliners do?', href: '/assistant', cta: 'Ask Assistant' },
            ].map(item => (
              <a key={item.n} href={item.href} className="group flex gap-3.5 py-2.5">
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-extrabold text-white"
                  style={{ background: 'linear-gradient(135deg, #8dc63f, #1a7a2e)' }}
                >
                  {item.n}
                </div>
                <div>
                  <div className="text-white text-sm font-medium mb-1 leading-snug">{item.label}</div>
                  <div className="text-xs font-semibold text-[#6ec6e6] group-hover:text-[#8dc63f] transition-colors">{item.cta} →</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Inventory by SKU */}
        <div>
          <h2 className="text-xs font-bold tracking-wide uppercase text-zinc-400 mb-3">Inventory by SKU</h2>
          <div className="bg-white border border-zinc-200 rounded-lg px-5 pt-4 pb-2">
            {!selectedInv ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <span className="text-sm font-bold text-zinc-700">{product.name}</span>
                  <span className="text-xs text-zinc-400">
                    {inventory.length} SKUs · on hand <b className="text-zinc-700">{inventory.reduce((s, r) => s + r.onHand, 0).toLocaleString()}</b> of <b className="text-zinc-700">{inventory.reduce((s, r) => s + r.demand, 0).toLocaleString()}</b> store-allocated demand
                  </span>
                </div>
                {inventory.map(r => (
                  <div key={r.id} className="py-3.5 border-t border-zinc-50 first:border-t-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-bold text-zinc-800">{r.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${r.col}1a`, color: r.col }}>{r.status}</span>
                    </div>
                    <div className="text-xs text-zinc-400 mb-2">
                      {product.name}
                      <button className="ml-2 text-[#1a7a2e] font-semibold" onClick={() => setSkuId(r.id)}>View by store →</button>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(r.cov, 100)}%`, background: r.col }} />
                      </div>
                      <span className="w-20 text-right text-xs font-bold text-zinc-600">{r.cov}% covered</span>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-zinc-500 flex-wrap">
                      <span>On hand <b className="text-zinc-900">{r.onHand}</b></span>
                      <span>Demand <b className="text-zinc-900">{r.demand}</b></span>
                      <span>Gap <b style={{ color: r.gap < 0 ? '#dc2626' : '#16a34a' }}>{r.gap > 0 ? '+' : ''}{r.gap}</b></span>
                      <span>Confidence <b className="text-zinc-900">{r.conf}%</b></span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <span className="text-sm font-bold text-zinc-700">
                    <button className="text-[#1a7a2e] mr-1.5" onClick={() => setSkuId('all')}>← All SKUs</button>
                    {selectedInv.name}
                  </span>
                  <span className="text-xs text-zinc-400">{product.name} · Confidence {selectedInv.conf}%</span>
                </div>
                <div className="py-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-zinc-800">Coverage</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${selectedInv.col}1a`, color: selectedInv.col }}>{selectedInv.status}</span>
                  </div>
                  <div className="text-xs text-zinc-400 mb-2">on hand {selectedInv.onHand} of {selectedInv.demand} demand</div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(selectedInv.cov, 100)}%`, background: selectedInv.col }} />
                    </div>
                    <span className="w-20 text-right text-xs font-bold text-zinc-600">{selectedInv.cov}% covered</span>
                  </div>
                </div>
                <div className="py-3 border-t border-zinc-50">
                  <div className="text-sm font-bold text-zinc-800 mb-2">By store</div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>{['Store', 'On hand', 'Demand', 'Gap', 'Cov', 'Status'].map(h => (
                        <th key={h} className="text-[9px] uppercase tracking-wide text-zinc-400 text-left font-bold pb-1.5 px-1.5">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {selectedInv.stores.map(s => (
                        <tr key={s.store}>
                          <td className="text-xs text-zinc-700 py-2 px-1.5 border-t border-zinc-50 font-medium">{s.store}<div className="text-[10px] text-zinc-400 font-normal">{s.city}</div></td>
                          <td className="text-xs text-zinc-700 py-2 px-1.5 border-t border-zinc-50">{s.current}</td>
                          <td className="text-xs text-zinc-700 py-2 px-1.5 border-t border-zinc-50">{s.demand}</td>
                          <td className="text-xs py-2 px-1.5 border-t border-zinc-50 font-bold" style={{ color: s.gap < 0 ? '#dc2626' : '#16a34a' }}>{s.gap > 0 ? '+' : ''}{s.gap}</td>
                          <td className="text-xs text-zinc-700 py-2 px-1.5 border-t border-zinc-50">{s.cov}%</td>
                          <td className="py-2 px-1.5 border-t border-zinc-50"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${s.col}1a`, color: s.col }}>{s.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
