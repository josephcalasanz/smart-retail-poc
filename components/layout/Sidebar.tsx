'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, BarChart2, MessageSquare, User, HelpCircle, Moon, LogOut, ChevronUp, ChevronDown, ChevronRight, Menu, Gauge, Users, Store } from 'lucide-react'
const DASHBOARD = {
  href: '/dashboard',
  label: 'Dashboard',
  icon: Gauge,
  children: [
    { href: '/dashboard/management', label: 'Management', icon: Users },
    { href: '/dashboard/store',      label: 'Store',      icon: Store },
  ],
}

const NAV_ITEMS = [
  { href: '/products',    label: 'Products',    icon: LayoutDashboard },
  { href: '/forecasting', label: 'Forecasting', icon: TrendingUp      },
  { href: '/allocation',  label: 'Allocation',  icon: BarChart2       },
  { href: '/assistant',   label: 'Assistant',   icon: MessageSquare   },
]

const USER = {
  firstName: 'Juan',
  lastName:  'Dela Cruz',
  position:  'Director, Supply Chain & Inventory',
  initials:  'JD',
}

export default function Sidebar() {
  const pathname    = usePathname()
  const [open, setOpen]         = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [dashOpen, setDashOpen] = useState(pathname.startsWith('/dashboard/'))

  const NavContent = () => (
    <>
      {/* Header */}
      <div className="px-5 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <Image
            src="/smart-logo.png"
            alt="Smart"
            width={700}
            height={201}
            priority
            className="h-7 w-auto"
          />
          <div className="mt-2 inline-block bg-[#8dc63f]/20 border border-[#8dc63f]/35
                          text-[#8dc63f] text-[8px] font-bold tracking-widest uppercase
                          px-2 py-0.5 rounded">
            Retail Intelligence
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden text-white/40 hover:text-white text-xl leading-none"
          aria-label="Close menu"
        >
          x
        </button>
      </div>

      {/* Nav */}
{/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {/* Dashboard group — label navigates, chevron toggles children */}
        <div>
          <div
            className={`flex items-center rounded-md text-sm transition-colors border-l-[2.5px]
              ${pathname === DASHBOARD.href
                ? 'bg-[#1a7a2e]/13 text-white font-semibold border-[#5ab22e]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border-transparent'
              }`}
          >
            <Link
              href={DASHBOARD.href}
              onClick={() => setOpen(false)}
              className={`flex-1 flex items-center gap-3 py-2.5 ${pathname === DASHBOARD.href ? 'pl-[9.5px]' : 'pl-3'}`}
            >
              <DASHBOARD.icon size={16} className={pathname === DASHBOARD.href ? 'text-[#5ab22e]' : 'text-zinc-600'} strokeWidth={2} />
              {DASHBOARD.label}
            </Link>
            <button
              onClick={() => setDashOpen((o) => !o)}
              className="self-stretch px-2.5 flex items-center text-zinc-500 hover:text-white"
              aria-label="Toggle dashboard menu"
              aria-expanded={dashOpen}
            >
              <ChevronRight size={13} className={`transition-transform ${dashOpen ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {dashOpen && (
            <div className="ml-[21px] pl-3 border-l border-zinc-800 mt-0.5 space-y-0.5">
              {DASHBOARD.children.map((child) => {
                const cactive = pathname === child.href
                const CIcon = child.icon
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors
                      ${cactive
                        ? 'bg-[#1a7a2e]/18 text-white font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                  >
                    <CIcon size={14} className={cactive ? 'text-[#5ab22e]' : 'text-zinc-600'} strokeWidth={2} />
                    {child.label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          const Icon   = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors
                ${active
                  ? 'bg-[#1a7a2e]/13 text-white font-semibold border-l-[2.5px] border-[#5ab22e] pl-[9.5px]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border-l-[2.5px] border-transparent'
                }`}
            >
              <Icon size={16} className={active ? 'text-[#5ab22e]' : 'text-zinc-600'} strokeWidth={2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Profile footer */}
      <div className="relative">
        {/* Popup menu */}
        {menuOpen && (
          <>
            {/* Click outside to close */}
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="fixed left-2 z-[999] w-52
                            bg-[#1c1c1f] border border-[#3f3f46] rounded-xl overflow-hidden
                            shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
                 style={{ bottom: '60px' }}>
              {/* User header in menu */}
              <div className="px-3 py-3 border-b border-[#2a2a2e] flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center
                                text-white text-sm font-extrabold flex-shrink-0"
                     style={{ background: 'linear-gradient(135deg, #1a7a2e, #5ab22e)' }}>
                  {USER.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-semibold">{USER.firstName} {USER.lastName}</div>
                  <div className="text-zinc-500 text-[10px] mt-0.5 truncate">{USER.position}</div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5 space-y-0.5">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                   text-xs text-zinc-300 hover:bg-white/10 transition-colors text-left">
                  <User size={14} className="text-zinc-500 flex-shrink-0" />
                  User Profile
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                   text-xs text-zinc-300 hover:bg-white/10 transition-colors text-left">
                  <HelpCircle size={14} className="text-zinc-500 flex-shrink-0" />
                  Help
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                             text-xs text-zinc-300 hover:bg-white/10 transition-colors text-left"
                >
                  <Moon size={14} className="text-zinc-500 flex-shrink-0" />
                  <span className="flex-1">Dark Mode</span>
                  {/* Toggle */}
                  <div className={`w-7 h-4 rounded-full relative transition-colors flex-shrink-0 ${darkMode ? 'bg-[#1a7a2e]' : 'bg-zinc-600'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                  </div>
                </button>
              </div>

              {/* Separator */}
              <div className="h-px bg-[#2a2a2e] mx-1.5" />

              {/* Logout */}
              <div className="p-1.5">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                   text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left">
                  <LogOut size={14} className="text-red-400 flex-shrink-0" />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}

        {/* Profile row */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-full px-3.5 py-3 border-t border-[#2a3a2e] flex items-center gap-2.5
                     hover:bg-[#1a7a2e]/10 transition-colors"
          style={{ background: 'rgba(26,122,46,0.06)' }}
        >
          <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center
                          text-white text-xs font-extrabold flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #1a7a2e, #5ab22e)' }}>
            {USER.initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-white text-[11.5px] font-semibold truncate">{USER.firstName} {USER.lastName}</div>
            <div className="text-zinc-600 text-[9px] truncate mt-0.5">Director, Supply Chain</div>
          </div>
          {menuOpen
            ? <ChevronUp size={13} className="text-zinc-500 flex-shrink-0" />
            : <ChevronDown size={13} className="text-zinc-500 flex-shrink-0" />
          }
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:flex md:left-0 md:top-0 md:h-screen md:w-56 bg-zinc-900 border-r border-zinc-800 flex-col z-40 overflow-visible">
        <NavContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 bg-zinc-900 text-white p-2 rounded-md shadow-lg"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col z-50 overflow-visible transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent />
      </aside>
    </>
  )
}
