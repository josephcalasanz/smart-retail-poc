'use client'

import { useState, useEffect, useRef } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ChevronDown } from 'lucide-react'
import Header from '@/components/layout/Header'
import { storeData, storeOrder, storeOptions } from '@/lib/storeData'

/* Reveal-on-scroll hook (matches Management) */
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
const DAY_LABELS = Array.from({ length: 14 }, (_, i) => (i === 13 ? 'Today' : `Day ${i + 1}`))

const peso = (n: number) =>
  n >= 1e6 ? `₱${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `₱${(n / 1e3).toFixed(0)}k` : `₱${n}`

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

export default function StorePage() {
  const [storeId, setStoreId] = useState(storeOrder[0])
  const d = storeData[storeId]

  const [statusRef, statusInView] = useInView<HTMLDivElement>()
  const [salesRef, salesInView] = useInView<HTMLDivElement>()
  const [controlRef, controlInView] = useInView<HTMLDivElement>()

  const maxStock = Math.max(...d.skus.map((s) => s.stock))
  const maxDays = Math.max(...d.skus.map((s) => s.days))
  const unitsToday = d.skus.reduce((a, s) => a + s.soldToday, 0)
  const trendData = d.daily.map((v, i) => ({ label: DAY_LABELS[i], units: v }))

  const kpiCards: { label: string; value: string | number; sub: string; danger?: boolean }[] = [
    { label: "Today's Sales", value: peso(d.todaySales), sub: `${unitsToday} units` },
    { label: 'MTD Sales', value: peso(d.mtdSales), sub: 'month to date' },
    { label: 'Current Inventory', value: `${d.currentInv.toLocaleString()} u`, sub: 'on hand' },
    { label: 'Low Stock Alerts', value: d.lowAlerts, sub: d.lowAlerts ? 'needs reorder' : 'all healthy', danger: d.lowAlerts > 0 },
    { label: 'Incoming Stock', value: `${d.incomingStock} u`, sub: `${d.incoming.length} transfers` },
  ]

  return (
    <>
      <Header title="Store" />
      <div className="px-4 md:px-8 py-6 space-y-8">

        {/* Store selector */}
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm text-zinc-500">Store</span>
            <div className="relative inline-flex items-center">
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="appearance-none bg-white border border-zinc-200 rounded-lg pl-3.5 pr-8 py-2 text-sm font-bold text-zinc-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a7a2e]/30"
              >
                {storeOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-2">Showing SKUs stocked at this store.</p>
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

        {/* Inventory Status */}
        <section ref={statusRef}>
          <SectionLabel>Inventory Status</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            <Card title="Stock by SKU">
              {d.skus.map((s, i) => (
                <div key={s.sv} className="mb-2.5">
                  <div className="flex justify-between text-[11.5px] mb-1">
                    <span className="text-zinc-500">{s.sv}</span>
                    <span className="font-bold text-zinc-800">{s.stock}</span>
                  </div>
                  <div className="h-[7px] bg-zinc-100 rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${(s.stock / maxStock) * 100}%`,
                        background: '#1a7a2e',
                        transform: statusInView ? 'scaleX(1)' : 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: `transform 0.9s ${GROW}`,
                        transitionDelay: `${i * 0.06}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </Card>

            <Card title="Days Remaining">
              {d.skus.map((s, i) => (
                <div key={s.sv} className="mb-2.5">
                  <div className="flex justify-between text-[11.5px] mb-1">
                    <span className="text-zinc-500">{s.sv}</span>
                    <span className="font-bold" style={{ color: s.color }}>{s.days}d</span>
                  </div>
                  <div className="h-[7px] bg-zinc-100 rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${(s.days / maxDays) * 100}%`,
                        background: s.color,
                        transform: statusInView ? 'scaleX(1)' : 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: `transform 0.9s ${GROW}`,
                        transitionDelay: `${i * 0.06}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </Card>

            <Card title="Inventory Status Indicators">
              {d.skus.map((s) => (
                <div key={s.sv} className="flex items-center gap-2.5 py-2 border-t border-zinc-100 first:border-t-0 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <div className="flex-1">
                    <div className="font-semibold text-zinc-800">{s.sv}</div>
                    <div className="text-[11px] text-zinc-500">{s.prod}</div>
                  </div>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${s.color}1a`, color: s.color }}>{s.status}</span>
                </div>
              ))}
            </Card>
          </div>
        </section>

        {/* Sales Activity — trend full-width, then 2-up */}
        <section ref={salesRef}>
          <SectionLabel>Sales Activity</SectionLabel>
          <div className="space-y-3.5">
            <Card title={<div className="flex justify-between"><span>Daily Sales Trend</span><span className="font-normal text-zinc-400">last 14 days</span></div>}>
              <ResponsiveContainer width="100%" height={170}>
                {salesInView ? (
                  <LineChart data={trendData} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} height={6} />
                    <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip {...tooltipStyle} />
                    <Line name="Units sold" type="monotone" dataKey="units" stroke="#1a7a2e" strokeWidth={2.4} dot={false} isAnimationActive animationDuration={1800} animationEasing="ease-in-out" />
                  </LineChart>
                ) : <div />}
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              <Card title="Top Selling SKU">
                {d.topList.map((t, i) => (
                  <div key={t.sv} className="flex items-center gap-2.5 py-2 border-t border-zinc-100 first:border-t-0 text-xs">
                    <span className="w-[18px] font-extrabold text-zinc-400">{i + 1}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-zinc-800">{t.sv}</div>
                      <div className="text-[11px] text-zinc-500">{t.prod}</div>
                    </div>
                    <span className="font-bold text-zinc-800">{t.sold}</span>
                  </div>
                ))}
              </Card>

              <Card title="Sell-Through %">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Donut pct={d.sellThrough} color="#1a7a2e" inView={salesInView} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-extrabold">{d.sellThrough}%</div>
                  </div>
                  <div className="text-[11px] text-zinc-500">Units sold vs available this cycle. Higher means stock is converting to sales faster.</div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Replenishment */}
        <section>
          <SectionLabel>Replenishment</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            <Card title="Reorder Recommendations">
              {d.reorder.length ? d.reorder.map((x) => (
                <div key={x.sv} className="flex items-center gap-2.5 py-2 border-t border-zinc-100 first:border-t-0 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: x.color }} />
                  <div className="flex-1">
                    <div className="font-semibold text-zinc-800">{x.sv}</div>
                    <div className="text-[11px] text-zinc-500">{x.reason}</div>
                  </div>
                  <span className="font-bold text-[#1a7a2e]">+{x.qty}</span>
                </div>
              )) : <div className="text-[11px] text-zinc-500">No reorders needed — stock healthy.</div>}
            </Card>

            <Card title="Incoming Transfers">
              {d.incoming.length ? d.incoming.map((x, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2 border-t border-zinc-100 first:border-t-0 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[#3aaa9e]" />
                  <div className="flex-1">
                    <div className="font-semibold text-zinc-800">{x.frm} → here</div>
                    <div className="text-[11px] text-zinc-500">{x.sv} · {x.qty} units</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-zinc-500">{x.eta}</div>
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#3aaa9e]/10 text-[#3aaa9e]">{x.status}</span>
                  </div>
                </div>
              )) : <div className="text-[11px] text-zinc-500">No incoming transfers.</div>}
            </Card>

            <Card title="Outgoing Transfers">
              {d.outgoing.length ? d.outgoing.map((x, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2 border-t border-zinc-100 first:border-t-0 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[#6ec6e6]" />
                  <div className="flex-1">
                    <div className="font-semibold text-zinc-800">here → {x.to}</div>
                    <div className="text-[11px] text-zinc-500">{x.sv} · {x.qty} units</div>
                  </div>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#6ec6e6]/15 text-[#2b8fb3]">{x.status}</span>
                </div>
              )) : <div className="text-[11px] text-zinc-500">No outgoing transfers.</div>}
            </Card>
          </div>
        </section>

        {/* Inventory Control — short cards stacked left, tall log right */}
        <section ref={controlRef}>
          <SectionLabel>Inventory Control</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
            <div className="space-y-3.5">
              <Card title="Cycle Count Status">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Donut pct={d.cycle.pct} color="#3aaa9e" inView={controlInView} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-extrabold">{d.cycle.pct}%</div>
                  </div>
                  <div className="text-[11.5px] text-zinc-600 leading-7">
                    <div>Last count <b>{d.cycle.last}</b></div>
                    <div>Next due <b>{d.cycle.next}</b></div>
                    <div>Open variances <b style={{ color: d.cycle.openVar ? '#b45309' : '#16a34a' }}>{d.cycle.openVar}</b></div>
                  </div>
                </div>
              </Card>

              <Card title="Inventory Variance Report">
                {d.variance.length ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {['SKU', 'System', 'Counted', 'Δ'].map((h) => (
                          <th key={h} className="text-[9px] uppercase tracking-wide text-zinc-400 text-left font-bold pb-1.5 px-1.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {d.variance.map((v) => (
                        <tr key={v.sv}>
                          <td className="text-[11.5px] text-zinc-700 py-1.5 px-1.5 border-t border-zinc-100">{v.sv}</td>
                          <td className="text-[11.5px] text-zinc-700 py-1.5 px-1.5 border-t border-zinc-100">{v.system}</td>
                          <td className="text-[11.5px] text-zinc-700 py-1.5 px-1.5 border-t border-zinc-100">{v.counted}</td>
                          <td className="text-[11.5px] py-1.5 px-1.5 border-t border-zinc-100 font-bold" style={{ color: v.diff < 0 ? '#dc2626' : '#16a34a' }}>{v.diff > 0 ? '+' : ''}{v.diff}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <div className="text-[11px] text-zinc-500">No variances — system matches counts.</div>}
              </Card>
            </div>

            <Card title="Stock Movement Log">
              {d.movement.slice(0, 5).map((m, i) => (
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
    </>
  )
}
