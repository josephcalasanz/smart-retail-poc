'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ExternalLink, X, ArrowRight, Lock } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import Header from '@/components/layout/Header'
import {
  warehouse, whSkus, capacityUsed, fulfillmentRate, throughput,
  inbound, outbound, replenishment, pickPack, zones, movement, purchaseRecs,
} from '@/lib/warehouseData'

/* Reveal-on-scroll hook (matches Management / Store) */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView] as const
}

const GROW = 'cubic-bezier(0.4, 0, 0.2, 1)'

const tooltipStyle = {
  contentStyle: {
    borderRadius: 8,
    border: '1px solid #e4e4e7',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    fontSize: 11,
  },
  labelStyle: { fontWeight: 700, color: '#27272a', fontSize: 10 },
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold tracking-wide uppercase text-zinc-400 mb-3">{children}</h2>
  )
}

function Card({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4">
      <div className="text-xs font-bold text-zinc-700 mb-3">{title}</div>
      {children}
    </div>
  )
}

function Donut({ pct, color, inView }: { pct: number; color: string; inView: boolean }) {
  const r = 34
  const C = 2 * Math.PI * r
  const seg = (pct / 100) * C
  return (
    <svg
      viewBox="0 0 86 86" width={86} height={86}
      style={{ transform: 'rotate(-90deg)', opacity: inView ? 1 : 0, transition: 'opacity 0.7s ease' }}
    >
      <circle cx={43} cy={43} r={r} fill="none" stroke="#f1f1f3" strokeWidth={10} />
      <circle
        cx={43} cy={43} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${seg} ${C - seg}`} strokeLinecap="round"
      />
    </svg>
  )
}

const pesoM = (n: number) => `₱${(n / 1e6).toFixed(1)}M`

export default function WarehousePage() {
  const [stockRef, stockInView] = useInView<HTMLDivElement>()
  const [controlRef, controlInView] = useInView<HTMLDivElement>()
  const [modalOpen, setModalOpen] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const totalOnHand = whSkus.reduce((a, s) => a + s.onHand, 0)
  const available = whSkus.reduce((a, s) => a + Math.max(0, s.onHand - s.allocated), 0)
  const inboundTot = inbound.reduce((a, x) => a + x.qty, 0)
  const outboundTot = outbound.reduce((a, x) => a + x.qty, 0)
  const maxOnHand = Math.max(...whSkus.map((s) => s.onHand))

  const purchaseUnits = purchaseRecs.reduce((a, r) => a + r.qty, 0)
  const purchaseValue = purchaseRecs.reduce((a, r) => a + r.qty * r.price, 0)
  const purchaseByProduct = purchaseRecs.reduce((m, r) => { m[r.prod] = (m[r.prod] ?? 0) + r.qty; return m }, {} as Record<string, number>)
  const replenishTot = replenishment.reduce((a, x) => a + x.qty, 0)

  function handleContinue() {
    setRedirecting(true)
    setTimeout(() => { setRedirecting(false); setModalOpen(false) }, 1400)
  }

  const kpiCards: { label: string; value: string | number; sub: string; danger?: boolean }[] = [
    { label: 'Stock on Hand',       value: `${totalOnHand.toLocaleString()} u`, sub: `${whSkus.length} SKUs` },
    { label: 'Available to Allocate', value: `${available.toLocaleString()} u`, sub: 'uncommitted buffer' },
    { label: 'Inbound · 7 days',    value: `${inboundTot.toLocaleString()} u`, sub: `${inbound.length} receipts` },
    { label: 'Outbound Today',      value: `${outboundTot.toLocaleString()} u`, sub: `${outbound.length} dispatches` },
    { label: 'Fulfillment Rate',    value: `${fulfillmentRate}%`, sub: 'lines on time · 7d' },
    { label: 'Capacity Used',       value: `${capacityUsed}%`, sub: 'cubic occupancy', danger: capacityUsed >= 85 },
  ]

  return (
    <>
      <Header title="Warehouse" />
      <div className="px-4 md:px-8 py-6 space-y-8">

        {/* DC identity */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{warehouse.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {warehouse.city} · {warehouse.code} · central fulfillment for the 6 launch stores
          </p>
        </div>

        {/* Operational KPIs */}
        <section>
          <SectionLabel>Operational KPIs</SectionLabel>
          <div className="flex gap-3 flex-wrap">
            {kpiCards.map((k) => (
              <div key={k.label} className="flex-1 min-w-[150px] bg-white border border-zinc-200 rounded-xl px-4 py-3.5">
                <div className="text-[9.5px] uppercase tracking-wide text-zinc-400">{k.label}</div>
                <div className="text-2xl font-extrabold mt-0.5" style={{ color: k.danger ? '#dc2626' : '#18181b' }}>{k.value}</div>
                <div className="text-[10.5px] text-zinc-500 mt-0.5">{k.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Purchase Recommendations */}
        <section>
          <SectionLabel>Purchase Recommendations</SectionLabel>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-1">
              <div className="text-xs text-zinc-500 sm:max-w-[68%] leading-relaxed">
                Recommended items and quantities to order today, from demand forecasts, inventory levels, supplier lead times, and safety stock.
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap bg-[#1a7a2e] text-white hover:bg-[#156626] transition-colors"
              >
                Purchase Now
              </button>
            </div>
            {purchaseRecs.map((r) => (
              <div key={r.sv + r.prod} className="flex items-center gap-3 py-2.5 border-t border-zinc-50 first:border-t-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-800">{r.sv} <span className="font-normal text-zinc-400">· {r.prod}</span></div>
                  <div className="text-[11px] text-zinc-500">{r.reason}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold text-[#16a34a]">+{r.qty}</div>
                  <div className="text-[11px] text-zinc-400">{r.supplier} · {r.lead}</div>
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between pt-3 border-t border-zinc-200 mt-1 text-xs text-zinc-500">
              <span>{purchaseRecs.length} SKUs recommended · closes the launch supply gap</span>
              <span><b className="text-zinc-700">{purchaseUnits.toLocaleString()} units</b> · est. {pesoM(purchaseValue)}</span>
            </div>
          </div>
        </section>

        {/* Store Replenishment Recommendations */}
        <section>
          <SectionLabel>Store Replenishment Recommendations</SectionLabel>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-1">
              <div className="text-xs text-zinc-500 sm:max-w-[68%] leading-relaxed">
                Recommended replenishment quantities for each store, from projected sales, current inventory, and transfer availability.
              </div>
              <Link
                href="/allocation"
                className="w-full sm:w-auto text-center rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap bg-[#1a7a2e] text-white hover:bg-[#156626] transition-colors"
              >
                Open Allocation →
              </Link>
            </div>
            {replenishment.map((x, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-t border-zinc-50 first:border-t-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: x.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-800">{x.store}</div>
                  <div className="text-[11px] text-zinc-500">{x.sv} · {x.reason}</div>
                </div>
                <div className="text-[13px] font-bold text-[#16a34a]">+{x.qty}</div>
              </div>
            ))}
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between pt-3 border-t border-zinc-200 mt-1 text-xs text-zinc-500">
              <span>{replenishment.length} stores flagged · sourced from DC available stock</span>
              <span><b className="text-zinc-700">{replenishTot.toLocaleString()} units</b> to dispatch</span>
            </div>
          </div>
        </section>

        {/* Throughput */}
        <section>
          <SectionLabel>Throughput</SectionLabel>
          <Card
            title={
              <div className="flex items-center justify-between">
                <span>Received vs Dispatched</span>
                <div className="flex items-center gap-3 font-normal">
                  <span className="flex items-center gap-1.5 text-[11px] text-zinc-500"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3aaa9e' }} />Received</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-zinc-500"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#1a7a2e' }} />Dispatched</span>
                  <span className="text-zinc-400">last 14 days</span>
                </div>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={throughput} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip {...tooltipStyle} />
                <Line name="Received" type="monotone" dataKey="received" stroke="#3aaa9e" strokeWidth={2} dot={false} isAnimationActive animationDuration={1800} animationEasing="ease-in-out" />
                <Line name="Dispatched" type="monotone" dataKey="dispatched" stroke="#1a7a2e" strokeWidth={2} dot={false} isAnimationActive animationDuration={1800} animationEasing="ease-in-out" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* Stock Health — reveal on scroll */}
        <section ref={stockRef}>
          <SectionLabel>Stock Health</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            <Card title="Stock on Hand by SKU">
              {whSkus.map((s, i) => {
                const avail = s.onHand - s.allocated
                return (
                  <div key={s.sv} className="mb-2.5">
                    <div className="flex justify-between items-baseline text-[11.5px] mb-1">
                      <span className="text-zinc-500">{s.sv}</span>
                      <span>
                        <span className="text-[10.5px] font-semibold mr-2" style={{ color: avail < 0 ? '#dc2626' : '#16a34a' }}>
                          {avail < 0 ? `short ${Math.abs(avail)}` : `avail +${avail}`}
                        </span>
                        <span className="font-bold text-zinc-800">{s.onHand}</span>
                      </span>
                    </div>
                    <div className="h-[7px] bg-zinc-100 rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${(s.onHand / maxOnHand) * 100}%`,
                          background: s.color,
                          transform: stockInView ? 'scaleX(1)' : 'scaleX(0)',
                          transformOrigin: 'left',
                          transition: `transform 0.9s ${GROW}`,
                          transitionDelay: `${i * 0.06}s`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </Card>

            <Card title="Capacity Utilization">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Donut pct={capacityUsed} color="#3aaa9e" inView={stockInView} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-extrabold">{capacityUsed}%</div>
                </div>
                <div className="text-[11px] text-zinc-500 leading-relaxed">
                  Cubic occupancy across all zones. Inbound launch stock is filling reserve, leaving {100 - capacityUsed}% headroom before staging is constrained.
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Fulfillment */}
        <section>
          <SectionLabel>Fulfillment</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            <Card title="Inbound Receipts">
              {inbound.length ? inbound.map((x, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2 border-t border-zinc-100 first:border-t-0 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[#1a7a2e]" />
                  <div className="flex-1">
                    <div className="font-semibold text-zinc-800">{x.src} → DC</div>
                    <div className="text-[11px] text-zinc-500">{x.sv} · {x.qty} units</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-zinc-500">{x.eta}</div>
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#1a7a2e]/10 text-[#1a7a2e]">{x.status}</span>
                  </div>
                </div>
              )) : <div className="text-[11px] text-zinc-500">No inbound receipts scheduled.</div>}
            </Card>

            <Card title="Outbound Dispatch Queue">
              {outbound.length ? outbound.map((x, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2 border-t border-zinc-100 first:border-t-0 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: x.color }} />
                  <div className="flex-1">
                    <div className="font-semibold text-zinc-800">DC → {x.to}</div>
                    <div className="text-[11px] text-zinc-500">{x.sv} · {x.qty} units</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold" style={{ color: x.color }}>{x.priority}</div>
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#6ec6e6]/15 text-[#2b8fb3]">{x.status}</span>
                  </div>
                </div>
              )) : <div className="text-[11px] text-zinc-500">Dispatch queue clear.</div>}
            </Card>

            <Card title="Replenishment Recommendations">
              {replenishment.length ? replenishment.map((x, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2 border-t border-zinc-100 first:border-t-0 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: x.color }} />
                  <div className="flex-1">
                    <div className="font-semibold text-zinc-800">{x.store}</div>
                    <div className="text-[11px] text-zinc-500">{x.sv} · {x.reason}</div>
                  </div>
                  <span className="font-bold" style={{ color: x.color }}>+{x.qty}</span>
                </div>
              )) : <div className="text-[11px] text-zinc-500">No stores flagged for replenishment.</div>}
            </Card>
          </div>
        </section>

        {/* Warehouse Control — short cards stacked left, tall log right */}
        <section ref={controlRef}>
          <SectionLabel>Warehouse Control</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
            <div className="space-y-3.5">
              <Card title="Pick &amp; Pack Status">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Donut pct={pickPack.pct} color="#1a7a2e" inView={controlInView} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-extrabold">{pickPack.pct}%</div>
                  </div>
                  <div className="text-[11.5px] text-zinc-600 leading-7">
                    <div>Picked today <b>{pickPack.picked} lines</b></div>
                    <div>In queue <b>{pickPack.queued} lines</b></div>
                    <div>SLA breaches <b style={{ color: pickPack.breaches ? '#b45309' : '#16a34a' }}>{pickPack.breaches}</b></div>
                  </div>
                </div>
              </Card>

              <Card title="Zone Utilization">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {['Zone', 'Used', 'Capacity', '%'].map((h) => (
                        <th key={h} className="text-[9px] uppercase tracking-wide text-zinc-400 text-left font-bold pb-1.5 px-1.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((z) => {
                      const pct = Math.round((z.used / z.cap) * 100)
                      const col = pct >= 85 ? '#dc2626' : pct >= 75 ? '#b45309' : '#16a34a'
                      return (
                        <tr key={z.zone}>
                          <td className="text-[11.5px] text-zinc-700 py-1.5 px-1.5 border-t border-zinc-100">{z.zone}</td>
                          <td className="text-[11.5px] text-zinc-700 py-1.5 px-1.5 border-t border-zinc-100">{z.used.toLocaleString()}</td>
                          <td className="text-[11.5px] text-zinc-700 py-1.5 px-1.5 border-t border-zinc-100">{z.cap.toLocaleString()}</td>
                          <td className="text-[11.5px] py-1.5 px-1.5 border-t border-zinc-100 font-bold" style={{ color: col }}>{pct}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Card>
            </div>

            <Card title="Stock Movement Log">
              {movement.slice(0, 6).map((m, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2 border-t border-zinc-100 first:border-t-0 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                  <div className="flex-1">
                    <div className="font-semibold text-zinc-800">{m.type}</div>
                    <div className="text-[11px] text-zinc-500">{m.sv}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: m.qty < 0 ? '#dc2626' : '#16a34a' }}>{m.qty > 0 ? '+' : ''}{m.qty}</div>
                    <div className="text-[11px] text-zinc-500">{m.time}</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </section>

      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/45"
            onClick={() => { if (!redirecting) setModalOpen(false) }}
          />
          <div className="relative bg-white rounded-2xl w-[430px] max-w-full shadow-2xl overflow-hidden">
            <div className="px-6 pt-6">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-[10px] bg-[#1a7a2e]/10 flex items-center justify-center">
                  <ExternalLink size={20} className="text-[#1a7a2e]" strokeWidth={2} />
                </div>
                <button aria-label="Close" onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={18} />
                </button>
              </div>
              <div className="text-[17px] font-semibold text-zinc-900 mt-3">Continue to Procurement</div>
              <div className="text-[13px] text-zinc-500 leading-relaxed mt-1.5">
                Open the Procurement System with all AI-recommended purchase items and quantities pre-filled, allowing you to review and initiate the order in just one step.
              </div>
            </div>

            <div className="mx-6 my-4 bg-zinc-50 border border-zinc-200 rounded-[10px] p-3.5">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[22px] font-extrabold text-zinc-900 leading-none">{purchaseUnits.toLocaleString()}</div>
                  <div className="text-[11px] text-zinc-400 mt-1">units · {purchaseRecs.length} SKUs</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-zinc-900">{pesoM(purchaseValue)}</div>
                  <div className="text-[11px] text-zinc-400 mt-1">est. commitment</div>
                </div>
              </div>
              <div className="border-t border-zinc-200/70 mt-3 pt-2.5 flex gap-4 flex-wrap text-[11px] text-zinc-600">
                {Object.entries(purchaseByProduct).map(([prod, qty]) => (
                  <span key={prod} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a7a2e]" />{prod} · {qty.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>

            <div className="px-6 flex items-center gap-1.5 text-[11px] text-zinc-400">
              <Lock size={12} /> Opens in the Procurement System · review before final submit
            </div>

            <div className="flex gap-2.5 justify-end px-6 py-4 border-t border-zinc-100 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                disabled={redirecting}
                className="bg-white border border-zinc-300 text-zinc-700 rounded-[9px] px-4 py-2 text-[13px] font-medium hover:bg-zinc-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={redirecting}
                className="bg-[#1a7a2e] text-white rounded-[9px] px-4 py-2 text-[13px] font-medium hover:bg-[#156626] disabled:opacity-70 inline-flex items-center gap-1.5 transition-colors"
              >
                {redirecting ? 'Redirecting…' : <>Continue to Procurement <ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
