'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { STORES, FORECAST_SERIES } from '@/data/mock'
import { useProduct } from '@/context/ProductContext'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

// FORECAST_SERIES peaks at 4800 — its intrinsic shape max, used to normalise the curve
// for ANY product/SKU. This is NOT a product total (that is derived from skuDemand below).
const SERIES_MAX = 4800
const SKU_COLORS = ['#1a7a2e', '#5ab22e', '#3aaa9e', '#6ec6e6']

type Scope = 'central' | 'store' | 'product'

function coverTag(gap: number) {
  if (gap <= -150) return { label: 'Critical', color: '#ef4444' }
  if (gap < 0) return { label: 'Review', color: '#f59e0b' }
  return { label: 'Healthy', color: '#22c55e' }
}
const confBadge = (c: number) =>
  c >= 80 ? 'text-emerald-600 bg-emerald-50' : c >= 75 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
const confText = (c: number) => (c >= 80 ? '#15803d' : c >= 75 ? '#b45309' : '#dc2626')

const chartTooltip = {
  contentStyle: { fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' },
  labelStyle: { fontWeight: 700, color: '#27272a', fontSize: 11 },
}

function Skel({ h }: { h: number }) {
  return <div className="animate-pulse rounded-lg bg-zinc-100" style={{ height: h }} />
}

export default function ForecastingPage() {
  const { product, products, setProductId } = useProduct()
  const [scope, setScope] = useState<Scope>('central')
  const [skuId, setSkuId] = useState(product.skus[0].id)
  const [storeId, setStoreId] = useState('ALL')
  const [bands, setBands] = useState(true)
  const [uplift, setUplift] = useState(0)
  const [loading, setLoading] = useState(true)

  // reset SKU/store/scenario when the product changes
  useEffect(() => {
    setSkuId(product.skus[0].id)
    setStoreId('ALL')
    setUplift(0)
  }, [product.id, product.skus])

  // brief skeleton on mount + product/scope switch (matches the dashboards' load feel)
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 460)
    return () => clearTimeout(t)
  }, [product.id, scope])

  const SKU_DEMAND = product.skuDemand
  const SKU_CONF = product.skuConfidence
  const WEIGHT = product.storeWeights
  const productTotal = Object.values(SKU_DEMAND).reduce((a, b) => a + b, 0) // FIX: derived, not hardcoded 4800
  const storeWeight = WEIGHT[storeId] ?? 1
  const storeName = storeId === 'ALL' ? 'All stores' : STORES.find((s) => s.id === storeId)?.name ?? storeId

  /* ---------- Product lens ---------- */
  const base = Math.round((SKU_DEMAND[skuId] ?? 0) * storeWeight)
  const mul = 1 + uplift / 100
  const chartData = FORECAST_SERIES.map((d) => ({
    day: d.day,
    forecast: Math.round((d.forecast / SERIES_MAX) * base * mul),
    high: Math.round((d.high / SERIES_MAX) * base * mul),
    low: Math.round((d.low / SERIES_MAX) * base * mul),
  }))
  const conf = SKU_CONF[skuId] ?? product.forecastConfidence
  const skuMeta = product.skus.find((s) => s.id === skuId)
  const skuLabel = skuMeta ? `${skuMeta.color} ${skuMeta.storage}` : skuId
  const adjusted = Math.round(base * mul)

  // trend 1 — cumulative forecast vs pre-orders
  let run = 0
  const cum = FORECAST_SERIES.map((d) => (run += d.forecast))
  const cmax = cum[cum.length - 1]
  const trendPre = FORECAST_SERIES.map((d, i) => ({ day: d.day, forecast: Math.round((cum[i] / cmax) * productTotal) }))

  // trend 2 — demand trend by SKU
  const trendSku = FORECAST_SERIES.map((d) => {
    const row: Record<string, number | string> = { day: d.day }
    product.skus.forEach((s) => { row[s.id] = Math.round((d.forecast / SERIES_MAX) * (SKU_DEMAND[s.id] ?? 0)) })
    return row
  })

  /* ---------- Central lens ---------- */
  const committed = product.unitsCommitted
  const recAdd = Math.round(product.unitsGap * mul)
  const cov = Math.round((committed / product.preOrders) * 100)
  const resultCov = Math.min(100, Math.round(((committed + recAdd) / product.preOrders) * 100))
  const onHand = product.allocation.reduce((a, x) => a + x.current, 0)
  const awaiting = committed - onHand
  const centralRows = product.skus.map((s) => {
    const fc = SKU_DEMAND[s.id] ?? 0
    const com = product.skuCommitted[s.id] ?? 0
    const g = com - fc
    return { id: s.id, name: `${s.color} ${s.storage}`, fc, com, g, tag: coverTag(g) }
  })

  /* ---------- Store lens ---------- */
  const storeRows = STORES.map((s) => {
    const fcDemand = Math.round(productTotal * (WEIGHT[s.id] ?? 0))
    const allocated = product.allocation.filter((a) => a.storeId === s.id).reduce((x, a) => x + a.current, 0)
    return { id: s.id, name: s.name, city: s.city, fcDemand, allocated, gap: allocated - fcDemand, has: allocated > 0 }
  })
  const maxFc = Math.max(1, ...storeRows.map((r) => r.fcDemand))

  const scopes: { id: Scope; label: string }[] = [
    { id: 'central', label: 'Central' }, { id: 'store', label: 'Store' }, { id: 'product', label: 'Product' },
  ]
  const selectCls = 'appearance-none bg-white border border-zinc-200 rounded-lg pl-3.5 pr-8 py-2 text-sm font-bold text-zinc-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a7a2e]/30'
  const Caret = () => (
    <svg className="pointer-events-none absolute right-2.5 w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
  )

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header title="Forecasting" />
      <div className="px-4 md:px-8 py-6 space-y-6">

        {/* Primary controls — View (scope) leads, paired with Product. Always present; never reflows. */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">View</span>
            <div className="flex bg-white border border-zinc-200 rounded-[10px] p-[3px]">
              {scopes.map((sc) => (
                <button key={sc.id} onClick={() => setScope(sc.id)}
                  className={`rounded-[7px] px-5 py-2 text-sm font-semibold transition-colors ${scope === sc.id ? 'bg-[#1a7a2e] text-white' : 'text-zinc-500 hover:text-zinc-700'}`}>
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden md:block w-px self-stretch bg-zinc-200 mx-1" />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Product</span>
            <div className="relative inline-flex items-center">
              <select className={selectCls} value={product.id} onChange={(e) => setProductId(e.target.value)} style={{ fontFamily: 'Inter, sans-serif' }}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select><Caret />
            </div>
          </div>
        </div>

        {/* Refinement row — Product lens only; visually subordinate to the primary row. */}
        {scope === 'product' && (
          <div className="flex flex-wrap items-end gap-x-5 gap-y-3 pt-4 border-t border-dashed border-zinc-200">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-transparent uppercase tracking-wide select-none">.</span>
              <span className="flex items-center h-[42px] text-[10px] uppercase tracking-[0.08em] text-zinc-400 font-bold">Refine view</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">SKU</span>
              <div className="relative inline-flex items-center">
                <select className={selectCls} value={skuId} onChange={(e) => setSkuId(e.target.value)} style={{ fontFamily: 'Inter, sans-serif' }}>
                  {product.skus.map((s) => <option key={s.id} value={s.id}>{s.color} {s.storage}</option>)}
                </select><Caret />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Store</span>
              <div className="inline-flex bg-white border border-zinc-200 rounded-lg p-[3px] gap-[2px] overflow-x-auto max-w-[85vw] md:max-w-none">
                {[{ id: 'ALL', name: 'All Stores' }, ...STORES].map((s) => (
                  <button key={s.id} onClick={() => setStoreId(s.id)}
                    className={`rounded-md px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors ${storeId === s.id ? 'bg-[#1a7a2e] text-white font-semibold' : 'text-zinc-500 hover:bg-zinc-50'}`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1 ml-auto">
              <span className="text-xs text-transparent uppercase tracking-wide select-none">.</span>
              <div className="inline-flex items-center gap-2.5 bg-white border border-zinc-200 rounded-[10px] px-3.5 h-[42px]">
                <span className="text-[11px] uppercase tracking-wide text-zinc-500">Range</span>
                <Switch checked={bands} onCheckedChange={setBands} />
                <span className="text-[13px] text-zinc-500 w-5">{bands ? 'On' : 'Off'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ============ CENTRAL ============ */}
        {scope === 'central' && (loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <Skel key={i} h={84} />)}</div>
            <Skel h={92} /><Skel h={260} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-zinc-200 rounded-lg px-5 py-4"><div className="text-xs text-zinc-500 uppercase tracking-wide">Pre-orders</div><div className="text-2xl font-extrabold mt-1">{product.preOrders.toLocaleString()}</div><div className="text-xs text-zinc-400 mt-1">confirmed demand signal</div></div>
              <div className="bg-white border border-zinc-200 rounded-lg px-5 py-4"><div className="text-xs text-zinc-500 uppercase tracking-wide">Forecast · launch window</div><div className="text-2xl font-extrabold mt-1">{productTotal.toLocaleString()}</div><div className="text-xs text-zinc-400 mt-1">model-predicted demand</div></div>
              <div className="bg-white border border-zinc-200 rounded-lg px-5 py-4"><div className="text-xs text-zinc-500 uppercase tracking-wide">Committed buy</div><div className="text-2xl font-extrabold mt-1">{committed.toLocaleString()}</div><div className="text-xs text-zinc-400 mt-1">{cov}% of pre-orders</div></div>
              <div className="rounded-lg px-5 py-4" style={{ background: '#eaf5ec', border: '1px solid #b6deba' }}><div className="text-xs text-zinc-500 uppercase tracking-wide">Recommended add&apos;l buy</div><div className="text-2xl font-extrabold mt-1" style={{ color: '#1a7a2e' }}>+{recAdd.toLocaleString()}</div><div className="text-xs text-zinc-400 mt-1">to close supply gap</div></div>
            </div>

            <div className={`rounded-lg px-5 py-4 border ${uplift ? 'bg-amber-50 border-amber-200' : 'bg-white border-zinc-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div><span className="text-sm font-semibold text-zinc-800">Order scenario</span><span className="text-xs text-zinc-500 ml-2">if launch-day demand shifts, how much more to commit?</span></div>
                <Badge className={uplift ? 'bg-amber-100 text-amber-700 border-amber-300 text-xs' : 'bg-zinc-100 text-zinc-500 border-zinc-200 text-xs'}>{uplift > 0 ? `+${uplift}%` : uplift < 0 ? `${uplift}%` : 'Baseline'}</Badge>
              </div>
              <div className="flex items-center gap-4"><span className="text-xs text-zinc-500 w-12">-50%</span><Slider min={-50} max={50} step={5} value={[uplift]} onValueChange={([v]) => setUplift(v)} className="flex-1" /><span className="text-xs text-zinc-500 w-12 text-right">+50%</span></div>
              <div className="mt-3 flex flex-wrap gap-6 text-xs text-zinc-600"><span>Supply gap: <b>{product.unitsGap.toLocaleString()} units</b></span><span>Recommended commit: <b className={uplift ? 'text-amber-700' : ''}>+{recAdd.toLocaleString()} units</b></span><span>Resulting coverage: <b>{resultCov}%</b></span></div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg">
              <div className="px-5 pt-4"><div className="text-sm font-semibold text-zinc-800">Where shortages hit · forecast vs committed by SKU</div><div className="text-xs text-zinc-400 mt-0.5">Negative = under-committed against forecast demand.</div></div>
              <div className="px-5 py-3">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[440px] border-collapse">
                  <thead><tr>{['SKU', 'Forecast', 'Committed', 'Gap', 'Status'].map((h) => <th key={h} className="text-[10px] uppercase tracking-wide text-zinc-400 text-left font-bold pb-1.5 px-2">{h}</th>)}</tr></thead>
                  <tbody>
                    {centralRows.map((r) => (
                      <tr key={r.id}>
                        <td className="text-[13px] font-semibold text-zinc-800 py-2 px-2 border-t border-zinc-100">{r.name}</td>
                        <td className="text-[13px] text-zinc-700 py-2 px-2 border-t border-zinc-100">{r.fc.toLocaleString()}</td>
                        <td className="text-[13px] text-zinc-700 py-2 px-2 border-t border-zinc-100">{r.com.toLocaleString()}</td>
                        <td className="text-[13px] font-bold py-2 px-2 border-t border-zinc-100" style={{ color: r.g < 0 ? '#dc2626' : '#16a34a' }}>{r.g > 0 ? '+' : ''}{r.g}</td>
                        <td className="py-2 px-2 border-t border-zinc-100"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${r.tag.color}1a`, color: r.tag.color }}>{r.tag.label}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
              <div className="px-5 py-3 text-[11px] text-zinc-500 border-t border-zinc-100 leading-relaxed">
                <b className="text-zinc-700">How this reconciles:</b> Supply Gap {product.unitsGap.toLocaleString()} = pre-orders {product.preOrders.toLocaleString()} − committed {committed.toLocaleString()} (same figure as Products). Committed {committed.toLocaleString()} = {onHand.toLocaleString()} positioned in stores + {awaiting.toLocaleString()} awaiting positioning. Central adds the buy decision, not a new number.
              </div>
            </div>
          </div>
        ))}

        {/* ============ STORE ============ */}
        {scope === 'store' && (loading ? <Skel h={360} /> : (
          <>
            <div className="bg-white border border-zinc-200 rounded-lg px-5 py-4">
              <div className="text-sm font-semibold text-zinc-800">Forecast demand by store · {product.name}</div>
              <div className="text-xs text-zinc-400 mt-0.5 mb-2">Forward launch-window demand vs what each store currently has allocated — where to pre-position before launch.</div>
              {storeRows.map((r) => (
                <div key={r.id} className="flex items-center gap-4 py-2.5 border-t border-zinc-50">
                  <div className="w-36 flex-shrink-0"><div className="text-[13px] font-semibold text-zinc-800">{r.name}</div><div className="text-[11px] text-zinc-400">{r.city}</div></div>
                  <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.round((r.fcDemand / maxFc) * 100)}%`, background: '#1a7a2e' }} /></div>
                  <div className="w-16 text-right text-[13px] font-bold text-zinc-800">{r.fcDemand.toLocaleString()}</div>
                  <div className="w-44 text-right text-[12px] text-zinc-500">{r.has ? <>allocated {r.allocated.toLocaleString()} · <span style={{ color: r.gap < 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>{r.gap > 0 ? '+' : ''}{r.gap}</span></> : 'no allocation set'}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-white border border-zinc-200 rounded-lg px-5 py-3 text-[11px] text-zinc-500 leading-relaxed">Distinct from the <b className="text-zinc-700">Store dashboard</b> (current operations / days of cover). This is forward demand for launch planning — where demand will land, not what is selling today.</div>
          </>
        ))}

        {/* ============ PRODUCT ============ */}
        {scope === 'product' && (loading ? (
          <div className="space-y-4"><Skel h={92} /><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="md:col-span-3"><Skel h={300} /></div><Skel h={300} /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skel h={190} /><Skel h={190} /></div></div>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-lg px-5 py-4 border ${uplift ? 'bg-amber-50 border-amber-200' : 'bg-white border-zinc-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div><span className="text-sm font-semibold text-zinc-800">Demand scenario</span><span className="text-xs text-zinc-500 ml-2">adjust demand uplift for a launch-day spike</span></div>
                <Badge className={uplift ? 'bg-amber-100 text-amber-700 border-amber-300 text-xs' : 'bg-zinc-100 text-zinc-500 border-zinc-200 text-xs'}>{uplift > 0 ? `+${uplift}%` : uplift < 0 ? `${uplift}%` : 'Baseline'}</Badge>
              </div>
              <div className="flex items-center gap-4"><span className="text-xs text-zinc-500 w-12">-50%</span><Slider min={-50} max={50} step={5} value={[uplift]} onValueChange={([v]) => setUplift(v)} className="flex-1" /><span className="text-xs text-zinc-500 w-12 text-right">+50%</span></div>
              <div className="mt-3 flex flex-wrap gap-6 text-xs text-zinc-600"><span>Base demand: <b>{base.toLocaleString()} units</b></span><span>Adjusted: <b className={uplift ? 'text-amber-700' : ''}>{adjusted.toLocaleString()} units</b></span><span>Delta: <b>{uplift > 0 ? '+' : ''}{(adjusted - base).toLocaleString()} units</b></span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 bg-white border border-zinc-200 rounded-lg px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div><div className="text-sm font-semibold text-zinc-800">Demand forecast · {skuLabel}</div><div className="text-xs text-zinc-400 mt-0.5">{storeName}{uplift !== 0 && <span className="ml-2 text-amber-500">· scenario {uplift > 0 ? '+' : ''}{uplift}% uplift</span>}</div></div>
                  <Badge variant="secondary" className={`text-xs ${confBadge(conf)}`}>{conf}% confidence</Badge>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1a7a2e" stopOpacity={0.15} /><stop offset="95%" stopColor="#1a7a2e" stopOpacity={0} /></linearGradient>
                      <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6ec6e6" stopOpacity={0.12} /><stop offset="95%" stopColor="#6ec6e6" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} width={46} />
                    <Tooltip {...chartTooltip}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any, name: any) => [Number(value)?.toLocaleString() ?? '0', name === 'forecast' ? 'Forecast' : name === 'high' ? 'Upper range' : 'Lower range']} />
                    <ReferenceLine x="D+0" stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Launch', fontSize: 11, fill: '#ef4444' }} />
                    {bands && (<>
                      <Area type="monotone" dataKey="high" stroke="#3aaa9e" strokeWidth={0} fill="url(#bGrad)" isAnimationActive animationDuration={1800} animationEasing="ease-in-out" />
                      <Area type="monotone" dataKey="low" stroke="#3aaa9e" strokeWidth={0.5} strokeDasharray="3 3" fill="white" isAnimationActive animationDuration={1800} animationEasing="ease-in-out" />
                    </>)}
                    <Area type="monotone" dataKey="forecast" stroke="#1a7a2e" strokeWidth={2.4} fill="url(#fGrad)" dot={{ fill: '#1a7a2e', r: 3 }} isAnimationActive animationDuration={1800} animationEasing="ease-in-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border border-zinc-200 rounded-lg px-4 py-4 flex flex-col gap-2.5">
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">SKU breakdown</div>
                {product.skus.map((s) => {
                  const raw = SKU_DEMAND[s.id] ?? 0
                  const dm = Math.round(raw * storeWeight)
                  const pc = Math.round((raw / productTotal) * 100)
                  const cf = SKU_CONF[s.id] ?? product.forecastConfidence
                  return (
                    <button key={s.id} onClick={() => setSkuId(s.id)} className={`text-left rounded-md px-3 py-2.5 border transition-colors ${skuId === s.id ? 'border-[#b6deba] bg-[#eaf5ec]' : 'border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50'}`}>
                      <div className="text-xs font-semibold text-zinc-800">{s.color}</div>
                      <div className="text-xs text-zinc-400">{s.storage}</div>
                      <div className="mt-2 flex items-center justify-between"><span className="text-sm font-bold text-zinc-800">{dm.toLocaleString()}</span><span className="text-xs font-semibold" style={{ color: confText(cf) }}>{cf}%</span></div>
                      <div className="mt-1.5 h-1.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pc}%`, background: '#5ab22e' }} /></div>
                    </button>
                  )
                })}
                <div className="mt-auto pt-3 border-t border-zinc-100"><div className="text-xs text-zinc-400">Forecast demand · launch window</div><div className="text-lg font-extrabold text-zinc-800 mt-0.5">{Math.round(productTotal * storeWeight).toLocaleString()}</div><div className="text-xs text-zinc-400">{storeName}</div></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-zinc-200 rounded-lg px-5 py-4">
                <div className="text-sm font-semibold text-zinc-800">Forecast vs pre-orders</div>
                <div className="text-xs text-zinc-400 mt-0.5 mb-2">cumulative forecast against confirmed demand</div>
                <ResponsiveContainer width="100%" height={170}>
                  <AreaChart data={trendPre} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
                    <defs><linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1a7a2e" stopOpacity={0.12} /><stop offset="95%" stopColor="#1a7a2e" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} width={42} />
                    <Tooltip {...chartTooltip}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [Number(value)?.toLocaleString() ?? '0', 'Cumulative forecast']} />
                    <ReferenceLine y={product.preOrders} stroke="#6ec6e6" strokeWidth={2} strokeDasharray="5 4" label={{ value: `Pre-orders ${product.preOrders.toLocaleString()}`, fontSize: 10, fill: '#2b8fb3', position: 'insideTopRight' }} />
                    <Area type="monotone" dataKey="forecast" stroke="#1a7a2e" strokeWidth={2.2} fill="url(#cGrad)" dot={false} isAnimationActive animationDuration={1800} animationEasing="ease-in-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border border-zinc-200 rounded-lg px-5 py-4">
                <div className="text-sm font-semibold text-zinc-800">Demand trend by SKU</div>
                <div className="text-xs text-zinc-400 mt-0.5 mb-2">forecast curve per colour · {storeName}</div>
                <ResponsiveContainer width="100%" height={170}>
                  <LineChart data={trendSku} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} width={42} />
                    <Tooltip {...chartTooltip} />
                    {product.skus.map((s, i) => (
                      <Line key={s.id} type="monotone" dataKey={s.id} name={`${s.color.split(' ')[1] ?? s.color} ${s.storage}`} stroke={SKU_COLORS[i % SKU_COLORS.length]} strokeWidth={2} dot={false} isAnimationActive animationDuration={1800} animationEasing="ease-in-out" />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
