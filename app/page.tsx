'use client'

import Header from '@/components/layout/Header'
import { useProduct } from '@/context/ProductContext'
import { STORES, SKUS } from '@/data/mock'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const { product } = useProduct()

  const KPI_CARDS = [
    { label: 'Pre-orders',          value: product.preOrders.toLocaleString(),        sub: `Across 6 stores · ${product.region}`,  color: '',             bg: 'bg-white', style: {}, valueStyle: {} },
    { label: 'Units Committed',     value: product.unitsCommitted.toLocaleString(),   sub: `${Math.round(product.unitsCommitted / product.preOrders * 100)}% of pre-order demand`, color: '', bg: 'bg-white', style: {}, valueStyle: {} },
    { label: 'Supply Gap',          value: product.unitsGap.toLocaleString(),         sub: 'Units unallocated at launch',           color: 'text-red-600', bg: 'bg-red-50', style: {}, valueStyle: {} },
    { label: 'Forecast Confidence', value: product.forecastConfidence + '%',          sub: 'Based on 12-week sell-through',         color: '',             bg: '', style: { background: '#eaf5ec', border: '1px solid #b6deba' }, valueStyle: { color: '#1a7a2e' } },
  ]

  // Derive alert items from product allocation
  const ALERT_ITEMS = product.allocation
    .map(row => {
      const store = STORES.find(s => s.id === row.storeId)
      const sku   = SKUS.find(s => s.id === row.skuId) ?? product.skus.find(s => s.id === row.skuId)
      const gap   = row.current - row.demand
      const severity = gap <= -100 ? 'high' : gap < 0 ? 'medium' : 'ok'
      return {
        store:    store?.name ?? row.storeId,
        city:     store?.city ?? '',
        sku:      sku ? `${sku.color} ${sku.storage}` : row.skuId,
        gap,
        severity,
      }
    })
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header title="Dashboard" />
      <div className="px-4 md:px-8 py-6 space-y-6">

        {/* Alert banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-500 text-lg">!</span>
            <span className="text-sm text-red-700 font-medium">
              {product.name} launches in {product.launchDaysOut} days. Supply gap of {product.unitsGap.toLocaleString()} units detected across {product.region}.
            </span>
          </div>
          <Badge variant="destructive" className="text-xs">Action Required</Badge>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {KPI_CARDS.map((card) => (
            <div key={card.label} className={`${card.bg} rounded-lg px-5 py-4 border border-zinc-200`} style={card.style}>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{card.label}</div>
              <div className={`text-3xl font-bold ${card.color}`} style={card.valueStyle}>{card.value}</div>
              <div className="text-xs text-zinc-400 mt-1">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Alerts + Investigate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 bg-white border border-zinc-200 rounded-lg">
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0fdf4' }}>
              <span className="text-sm font-semibold" style={{ color: '#0f5c20' }}>Store Allocation Alerts</span>
              <span className="text-xs text-zinc-400">Live · {new Date().toLocaleDateString('en-PH')}</span>
            </div>
            <div className="divide-y divide-zinc-50">
              {ALERT_ITEMS.map((item) => (
                <div key={item.store + item.sku} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-zinc-800">{item.store}</div>
                    <div className="text-xs text-zinc-400">{item.city} · {item.sku}</div>
                  </div>
                  <div className={`text-sm font-semibold ${item.gap < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {item.gap > 0 ? '+' : ''}{item.gap} units
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ml-4 ${
                    item.severity === 'high'   ? 'bg-red-50 text-red-600 border-red-200' :
                    item.severity === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {item.severity === 'high' ? 'Critical' : item.severity === 'medium' ? 'Review' : 'Surplus'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Investigate panel */}
          <div className="rounded-lg px-5 py-4 flex flex-col gap-4" style={{ background: '#0f5c20', border: '1px solid #1a7a2e' }}>
            <div className="text-xs uppercase tracking-wide" style={{ color: '#8dc63f' }}>Investigate</div>
            {[
              { step: '01', label: 'Why is demand spiking?',    href: '/forecasting', cta: 'View Forecast' },
              { step: '02', label: 'Which stores are exposed?', href: '/allocation',  cta: 'Rebalance Stock' },
              { step: '03', label: 'What can frontliners do?',  href: '/assistant',   cta: 'Ask Assistant' },
            ].map((item) => (
              <a key={item.step} href={item.href}
                className="group block rounded-md px-4 py-3 transition-colors"
                style={{ background: '#1a7a2e' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#226b35')}
                onMouseLeave={e => (e.currentTarget.style.background = '#1a7a2e')}>
                <div className="text-xs mb-1" style={{ color: '#8dc63f' }}>Step {item.step}</div>
                <div className="text-white text-sm font-medium mb-1">{item.label}</div>
                <div className="text-xs" style={{ color: '#6ec6e6' }}>{item.cta} →</div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
