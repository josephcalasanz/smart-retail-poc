'use client'

import FreshnessIndicator from './FreshnessIndicator'
import NotificationBell from './NotificationBell'

export default function Header({ title }: { title: string }) {
  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3 pl-8 md:pl-0">
        <h1 className="text-sm font-semibold text-zinc-800">{title}</h1>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <FreshnessIndicator />
        <div className="hidden md:block w-px h-5 bg-zinc-200" />
        <NotificationBell />
      </div>
    </header>
  )
}