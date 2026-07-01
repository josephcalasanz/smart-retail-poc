'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import Header from '@/components/layout/Header'
import {
  demandSeries, mgmtStores, aging, stockouts, kpis, attentionItems,
} from '@/lib/managementData'
import { purchaseRecs } from '@/lib/warehouseData'

const pesoM = (n: number) => `₱${(n / 1e6).toFixed(1)}M`

/* Reveal-on-scroll hook */
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
      { threshold: 0.25 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView] as const
}

const GROW = 'cubic-bezier(0.4, 0, 0.2, 1)'

const ATTENTION_DOT = {
  critical: '#ef4444',
  review: '#f59e0b',
  opportunity: '#22c55e',
} as const

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
    <h2 className="text-xs font-bold tracking-wide uppercase text-zinc-400 mb-3">
      {children}
    </h2>
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

export default function ManagementPage() {
  const [invRef, invInView] = useInView<HTMLDivElement>()

  const purchaseUnits = purchaseRecs.reduce((a, r) => a + r.qty, 0)
  const purchaseValue = purchaseRecs.reduce((a, r) => a + r.qty * r.price, 0)

  const maxCover = Math.max(...mgmtStores.map((s) => s.daysCover))

  const THRESHOLD = 14 // "healthy" days-of-cover cutoff
  const threshPct = (THRESHOLD / maxCover) * 100

  // donut geometry for Inventory Aging
  const R = 38
  const CIRC = 2 * Math.PI * R
  const GAP = 3
  let cum = 0
  const arcs = aging.map((a) => {
    const seg = (a.pct / 100) * CIRC - GAP
    const offset = -(cum / 100) * CIRC
    cum += a.pct
    return { ...a, seg, offset }
  })

  return (
    <>
      <Header title="Management" />
      <div className="px-4 md:px-8 py-6 space-y-8">

        {/* Executive KPIs */}
        <section>
          <SectionLabel>Executive KPIs</SectionLabel>
          <div className="flex gap-3 flex-wrap">
            {kpis.map((k) => (
              <div key={k.label} className="flex-1 min-w-[150px] bg-white border border-zinc-200 rounded-xl px-4 py-3.5">
                <div className="text-[9.5px] uppercase tracking-wide text-zinc-400">{k.label}</div>
                <div className="text-2xl font-extrabold text-zinc-900 mt-0.5">{k.value}</div>
                <div className="text-[10.5px] font-semibold mt-0.5" style={{ color: k.color }}>
                  {k.delta}
                  {k.sub && <span className="text-zinc-400 font-medium"> {k.sub}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Attention Required Today + Purchase Recommendations */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4 items-stretch">
            {/* Attention */}
            <div className="flex flex-col">
              <SectionLabel>Attention Required Today</SectionLabel>
              <div className="flex flex-col gap-2.5 flex-1 justify-between">
                {attentionItems.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3.5 bg-white border border-zinc-200 rounded-xl px-4 py-3.5"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: ATTENTION_DOT[a.severity] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-800">
                        {a.title}
                        {a.delta && (
                          <span
                            className={`ml-1.5 font-bold ${
                              a.delta.dir === 'up' ? 'text-red-600' : 'text-blue-600'
                            }`}
                          >
                            {a.delta.dir === 'up' ? '▲' : '▼'} {a.delta.label}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">{a.message}</div>
                    </div>
                    <Link
                      href={a.href}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1a7a2e] hover:bg-[#156626]
                                 rounded-lg px-3.5 py-1.5 whitespace-nowrap transition-colors"
                    >
                      {a.cta}
                      <span className="text-[13px] opacity-80">→</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Recommendations */}
            <div className="flex flex-col">
              <SectionLabel>Purchase Recommendations</SectionLabel>
              <div className="bg-white border border-zinc-200 rounded-xl p-4 flex-1 flex flex-col">
                <div className="text-xs text-zinc-500 leading-relaxed mb-3">
                  Recommended purchase commitment sized from demand forecasts, warehouse inventory, supplier lead times, and safety-stock targets.
                </div>
                <div className="flex items-baseline justify-between pb-3 border-b border-zinc-100">
                  <div>
                    <div className="text-2xl font-extrabold text-zinc-900 leading-none">{purchaseUnits.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-400 mt-1">units · {purchaseRecs.length} SKUs</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-zinc-800">{pesoM(purchaseValue)}</div>
                    <div className="text-[10px] text-zinc-400 mt-1">est. commitment</div>
                  </div>
                </div>
                <div className="flex flex-col justify-around flex-1">
                  {purchaseRecs.map((r) => (
                    <div key={r.sv + r.prod} className="flex items-center gap-2.5 py-2 border-t border-zinc-50 first:border-t-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-zinc-800">{r.sv}</div>
                        <div className="text-[11px] text-zinc-400">{r.prod}</div>
                      </div>
                      <div className="text-[13px] font-bold text-[#16a34a]">+{r.qty}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demand Forecast */}
        <section>
          <SectionLabel>Demand Forecast</SectionLabel>
          <Card title="Forecast vs Actual">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={demandSeries} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={46} />
                <Tooltip {...tooltipStyle} />
                <Line name="Forecast" type="monotone" dataKey="forecast" stroke="#a1a1aa" strokeWidth={2} dot={false} isAnimationActive animationDuration={1800} animationEasing="ease-in-out" />
                <Line name="Actual" type="monotone" dataKey="actual" stroke="#1a7a2e" strokeWidth={2} dot={false} isAnimationActive animationDuration={1800} animationEasing="ease-in-out" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* Inventory Health — reveal on scroll */}
        <section ref={invRef}>
          <SectionLabel>Inventory Health</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            <Card title={<>Days of Cover by Store <span className="font-normal text-[9px] text-zinc-400 ml-1">| {THRESHOLD}d healthy</span></>}>
              {[...mgmtStores].sort((a, b) => a.daysCover - b.daysCover).map((s, i) => {
                const col = s.daysCover < 7 ? '#ef4444' : s.daysCover < 14 ? '#f59e0b' : '#22c55e'
                return (
                  <div key={s.name} className="mb-2.5">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-600">{s.name}</span>
                      <span className="font-bold" style={{ color: col }}>{s.daysCover}d</span>
                    </div>
                    <div className="relative h-[7px] bg-zinc-100 rounded">
                      <div
                        className="h-full rounded"
                        style={{
                          width: invInView ? `${(s.daysCover / maxCover) * 100}%` : 0,
                          background: col,
                          transition: `width 0.9s ${GROW}`,
                          transitionDelay: `${i * 0.08}s`,
                        }}
                      />
                      <div
                        className="absolute -top-[3px] -bottom-[3px] w-[1.5px] bg-zinc-400"
                        style={{ left: `${threshPct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </Card>

            <Card title="Inventory Aging">
              <div className="text-[22px] font-extrabold leading-none" style={{ color: '#b45309' }}>11%</div>
              <div className="text-[9px] uppercase tracking-wide text-zinc-400 mt-0.5">aged 60+ days</div>
              <div className="h-px bg-zinc-100 my-3" />
              <div className="flex items-center gap-4">
                <svg
                  viewBox="0 0 104 104" width="96" height="96"
                  style={{ transform: 'rotate(-90deg)', flexShrink: 0, opacity: invInView ? 1 : 0, transition: 'opacity 0.7s ease' }}
                >
                  {arcs.map((a) => (
                    <circle
                      key={a.label} cx="52" cy="52" r={R} fill="none"
                      stroke={a.color} strokeWidth="12"
                      strokeDasharray={`${a.seg} ${CIRC - a.seg}`}
                      strokeDashoffset={a.offset}
                    />
                  ))}
                </svg>
                <div className="flex-1 min-w-0">
                  {aging.map((a) => (
                    <div key={a.label} className="flex items-center gap-2 text-[11.5px] text-zinc-600 mb-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: a.color }} />
                      <span className="flex-1">{a.label}</span>
                      <span className="font-bold text-zinc-800">{a.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Supply Risk */}
        <section>
          <SectionLabel>Supply Risk</SectionLabel>
          <Card title="Stockout Risks">
            {stockouts.map((s) => (
              <div key={`${s.store}-${s.sku}`} className="flex items-center gap-3 py-2.5 border-t border-zinc-100 first:border-t-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-800">{s.store} · {s.sku}</div>
                  <div className="text-[11.5px] text-zinc-500">{s.days} days of cover remaining</div>
                </div>
                <span
                  className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: `${s.color}1a`, color: s.color }}
                >
                  {s.risk} risk
                </span>
              </div>
            ))}
          </Card>
        </section>

      </div>
    </>
  )
}
