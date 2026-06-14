'use client'

import { useState, useEffect } from 'react'

export default function FreshnessIndicator() {
  // null until mounted to avoid SSR/client hydration mismatch
  const [mins, setMins] = useState<number | null>(null)

  useEffect(() => {
    setMins(0)
    const t = setInterval(() => setMins((m) => (m ?? 0) + 1), 60_000)
    return () => clearInterval(t)
  }, [])

  const label =
    mins === null ? 'syncing…' : mins === 0 ? 'just now' : `${mins} min ago`

  return (
    <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span>
        Live · synced <span className="text-zinc-700 font-medium">{label}</span>
      </span>
    </div>
  )
}