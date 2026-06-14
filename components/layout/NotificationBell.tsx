'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useProduct } from '@/context/ProductContext'
import { buildDemandAlerts } from '@/lib/demandAlerts'

const SEV_COLOR: Record<string, string> = {
  critical: '#ef4444',
  review: '#f59e0b',
  opportunity: '#22c55e',
}

export default function NotificationBell() {
  const { product } = useProduct()
  const [open, setOpen] = useState(false)

  const alerts = buildDemandAlerts(product)
  const count = alerts.length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-lg border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 transition-colors"
        aria-label={`${count} demand notifications`}
      >
        <Bell size={17} className="text-zinc-600" strokeWidth={2} />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* click-outside to close */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-2rem)] z-50
                       bg-white border border-zinc-200 rounded-xl overflow-hidden
                       shadow-[0_14px_36px_rgba(0,0,0,0.10)]"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-100">
              <span className="text-sm font-bold text-zinc-800">Notifications</span>
              <button
                onClick={() => setOpen(false)}
                className="text-[11px] font-semibold text-[#1a7a2e] hover:underline"
              >
                Mark all read
              </button>
            </div>

            <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
              <span className="text-[10.5px] font-bold tracking-wide uppercase text-zinc-400">
                Forecast &amp; Demand Shifts
              </span>
              <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 rounded-full px-2 py-0.5">
                {count} new
              </span>
            </div>

            <div>
              {alerts.map((a) => (
                <Link
                  key={a.id}
                  href={a.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 border-t border-zinc-50 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex gap-3">
                    <span
                      className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: SEV_COLOR[a.severity] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-zinc-800">
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
                      <div className="text-xs text-zinc-500 mt-0.5 leading-snug">
                        {a.message}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10.5px] text-zinc-400">{a.time}</span>
                        <span className="text-[11px] font-semibold text-[#2b8fb3]">
                          View forecast →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="px-4 py-2.5 text-center border-t border-zinc-100">
              <Link
                href="/forecasting"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-[#1a7a2e] hover:underline"
              >
                View all activity
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}