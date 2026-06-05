'use client'

import { useProduct } from '@/context/ProductContext'

export default function Header({ title }: { title: string }) {
  const { product, products, setProductId } = useProduct()

  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3 pl-8 md:pl-0">
        <h1 className="text-sm font-semibold text-zinc-800">{title}</h1>
        {/* Product selector */}
        <div className="relative inline-flex items-center">
          <select
            value={product.id}
            onChange={e => setProductId(e.target.value)}
            className="appearance-none bg-zinc-100 border border-zinc-200 rounded-lg
                       pl-3 pr-7 py-1.5 text-xs font-medium text-zinc-700
                       font-[Inter] hover:bg-zinc-200 hover:border-zinc-300
                       focus:outline-none focus:ring-2 focus:ring-[#1a7a2e]/20
                       focus:border-[#1a7a2e] cursor-pointer transition-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2 w-3 h-3 text-zinc-400"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Desktop KPI strip */}
      <div className="hidden md:flex items-center gap-6 text-xs text-zinc-500">
        <span>
          <span className="text-zinc-400">Pre-orders </span>
          <span className="text-zinc-800 font-medium">{product.preOrders.toLocaleString()}</span>
        </span>
        <span>
          <span className="text-zinc-400">Committed </span>
          <span className="text-zinc-800 font-medium">{product.unitsCommitted.toLocaleString()}</span>
        </span>
        <span className="text-red-500 font-medium">
          ▼ {product.unitsGap.toLocaleString()} gap
        </span>
        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
          {product.forecastConfidence}% confidence
        </span>
      </div>

      {/* Mobile compact strip */}
      <div className="flex md:hidden items-center gap-2 text-xs">
        <span className="text-red-500 font-medium">▼ {product.unitsGap.toLocaleString()} gap</span>
        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
          {product.forecastConfidence}%
        </span>
      </div>
    </header>
  )
}
