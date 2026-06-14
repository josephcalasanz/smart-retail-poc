'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { useProduct } from '@/context/ProductContext'
import { STORES } from '@/data/mock'
import { buildDemandAlerts } from '@/lib/demandAlerts'

const SEV = {
  critical: { dot: '#ef4444', cta: 'Review' },
  review: { dot: '#f59e0b', cta: 'View forecast' },
  opportunity: { dot: '#22c55e', cta: 'Reallocate' },
} as const

function storeStatus(gap: number) {
  if (gap <= -100) return { label: 'Critical', dot: '#ef4444', text: '#dc2626', bg: '#fef2f2' }
  if (gap < 0) return { label: 'Review', dot: '#f59e0b', text: '#b45309', bg: '#fffbeb' }
  return { label: 'Healthy', dot: '#22c55e', text: '#16a34a', bg: '#f0fdf4' }
}

export default function DashboardPage() {
  const { product } = useProduct()
  const [greeting, setGreeting] = useState<string | null>(null)
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const now = new Date()
    const h = now.getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening')
    setDateStr(
      now.toLocaleDateString('en-PH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    )
  }, [])

  const priorities = buildDemandAlerts(product)

  const stores = STORES.map((store) => {
    const gap = product.allocation
      .filter((r) => r.storeId === store.id)
      .reduce((sum, r) => sum + (r.current - r.demand), 0)
    return { ...store, gap }
  }).sort((a, b) => a.gap - b.gap)

  return (
    <>
      <Header title="Dashboard" />
      <div className="px-4 md:px-8 py-6 space-y-8">

        {/* Greeting */}
        <div>
          <h1
            className={`text-2xl font-bold text-zinc-900 transition-opacity duration-300 ${
              greeting ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {greeting ?? 'Good day'}, Juan
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {dateStr ? `${dateStr} · ` : ''}Here&apos;s what needs your attention today.
          </p>
        </div>

        {/* Top priorities */}
        <section>
          <h2 className="text-xs font-bold tracking-wide uppercase text-zinc-400 mb-3">
            Top priorities today
          </h2>
          <div className="flex flex-col gap-2.5">
            {priorities.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3.5 bg-white border border-zinc-200 rounded-xl px-4 py-3.5"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: SEV[p.severity].dot }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-800">
                    {p.title}
                    {p.delta && (
                      <span
                        className={`ml-1.5 font-bold ${
                          p.delta.dir === 'up' ? 'text-red-600' : 'text-blue-600'
                        }`}
                      >
                        {p.delta.dir === 'up' ? '▲' : '▼'} {p.delta.label}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">{p.message}</div>
                </div>
                <Link
                  href={p.href}
                  className="text-xs font-semibold text-white bg-[#1a7a2e] hover:bg-[#156626]
                             rounded-lg px-3.5 py-1.5 whitespace-nowrap transition-colors"
                >
                  {SEV[p.severity].cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Store overview */}
        <section>
          <h2 className="text-xs font-bold tracking-wide uppercase text-zinc-400 mb-3">
            Store overview · {stores.length} stores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stores.map((store) => {
              const st = storeStatus(store.gap)
              return (
                <div
                  key={store.id}
                  className="bg-white border border-zinc-200 rounded-xl px-4 py-3.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-zinc-800">{store.name}</div>
                      <div className="text-[10.5px] uppercase tracking-wide text-zinc-400 mt-0.5">
                        {store.city}
                      </div>
                    </div>
                    <span
                      className="w-2.5 h-2.5 rounded-full mt-1"
                      style={{ background: st.dot }}
                    />
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-xl font-bold" style={{ color: st.text }}>
                        {store.gap > 0 ? '+' : ''}
                        {store.gap}
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-zinc-400">
                        {store.gap >= 0 ? 'Surplus' : 'Gap vs demand'}
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: st.bg, color: st.text }}
                    >
                      {st.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </>
  )
}
