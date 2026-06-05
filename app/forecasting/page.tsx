'use client'

'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { FORECAST_SERIES, STORES } from '@/data/mock'
import { useProduct } from '@/context/ProductContext'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

// Per-store demand weight (must sum to 1.0)
export default function ForecastingPage() {
  const { product } = useProduct()
  const SKUS = product.skus
  const SKU_DEMAND = product.skuDemand
  const SKU_CONFIDENCE = product.skuConfidence
  const STORE_WEIGHT = product.storeWeights
  const [selectedSku, setSelectedSku] = useState(() => product.skus[0].id)
  const [selectedStore, setSelectedStore] = useState('ALL')
  const [showBands, setShowBands] = useState(true)
  const [uplift, setUplift] = useState(0)

  const storeWeight = STORE_WEIGHT[selectedStore] ?? 1
  const baseDemand = Math.round((SKU_DEMAND[selectedSku] ?? 1000) * storeWeight)
  const adjustedDemand = Math.round(baseDemand * (1 + uplift / 100))
  const confidence = SKU_CONFIDENCE[selectedSku] ?? 78

  const chartData = FORECAST_SERIES.map((d) => ({
    ...d,
    forecast: Math.round((d.forecast / 4800) * baseDemand * (1 + uplift / 100)),
    low:      Math.round((d.low / 4800) * baseDemand),
    high:     Math.round((d.high / 4800) * baseDemand * (1 + uplift / 100)),
  }))

  const selectedSkuMeta = SKUS.find(s => s.id === selectedSku)
  const skuLabel = selectedSkuMeta
    ? `${selectedSkuMeta.color} · ${selectedSkuMeta.storage}`
    : selectedSku

  const storeName = selectedStore === 'ALL'
    ? 'All Manila stores'
    : STORES.find(s => s.id === selectedStore)?.name ?? selectedStore

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header title="Forecasting" />

      <div className="px-4 md:px-8 py-6 space-y-6">

        {/* Controls row */}
        <div className="flex flex-col gap-3">
          {/* Row 1 - SKU */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">SKU</span>
            <Tabs value={selectedSku} onValueChange={setSelectedSku}>
              <TabsList className="bg-white border border-zinc-200 overflow-x-auto flex-nowrap max-w-[85vw] md:max-w-none">
                {SKUS.map((sku) => (
                  <TabsTrigger key={sku.id} value={sku.id} className="text-xs">
                    {sku.color.split(' ')[0]} {sku.storage}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          {/* Row 2 - Store + Confidence Bands */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Store</span>
              <Tabs value={selectedStore} onValueChange={setSelectedStore}>
                <TabsList className="bg-white border border-zinc-200 overflow-x-auto flex-nowrap max-w-[85vw] md:max-w-none">
                  <TabsTrigger value="ALL" className="text-xs">All Stores</TabsTrigger>
                  {STORES.map((store) => (
                    <TabsTrigger key={store.id} value={store.id} className="text-xs">
                      {store.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Confidence Bands</span>
              <div className="flex items-center gap-2 h-9">
                <Switch checked={showBands} onCheckedChange={setShowBands} />
                <span className="text-xs text-zinc-500">{showBands ? 'On' : 'Off'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* What-if scenario */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
            <div>
              <span className="text-sm font-semibold text-amber-800">What-if Scenario</span>
              <span className="text-xs text-amber-600 ml-2">Adjust demand uplift for launch-day spike</span>
            </div>
            <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
              {uplift > 0 ? `+${uplift}%` : uplift < 0 ? `${uplift}%` : 'Baseline'}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-amber-600 w-12">-50%</span>
            <Slider
              min={-50} max={50} step={5}
              value={[uplift]}
              onValueChange={([v]) => setUplift(v)}
              className="flex-1"
            />
            <span className="text-xs text-amber-600 w-12 text-right">+50%</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 md:gap-6 text-xs text-amber-700">
            <span>Base demand: <strong>{baseDemand.toLocaleString()} units</strong></span>
            <span>Adjusted: <strong className={uplift !== 0 ? 'text-red-600' : ''}>{adjustedDemand.toLocaleString()} units</strong></span>
            <span>Delta: <strong>{uplift > 0 ? '+' : ''}{(adjustedDemand - baseDemand).toLocaleString()} units</strong></span>
          </div>
        </div>

        {/* Chart + sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div className="col-span-1 md:col-span-3 bg-white border border-zinc-200 rounded-lg px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-zinc-800">
                  Demand Forecast · {skuLabel}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {storeName}
                  {uplift !== 0 && (
                    <span className="ml-2 text-amber-500">
                      · Scenario: {uplift > 0 ? '+' : ''}{uplift}% uplift
                    </span>
                  )}
                </div>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  confidence >= 80 ? 'text-emerald-600 bg-emerald-50' :
                  confidence >= 75 ? 'text-amber-600 bg-amber-50' :
                  'text-red-600 bg-red-50'
                }`}
              >
                {confidence}% confidence
              </Badge>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e4e4e7' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, name: any) => [
                    Number(value)?.toLocaleString() ?? '0',
                    name === 'forecast' ? 'Forecast' :
                    name === 'high' ? 'Upper band' : 'Lower band'
                  ]}
                />
                <ReferenceLine
                  x="D+0" stroke="#ef4444" strokeDasharray="4 4"
                  label={{ value: 'Launch', fontSize: 11, fill: '#ef4444' }}
                />
                {showBands && (
                  <>
                    <Area type="monotone" dataKey="high" stroke="#3b82f6" strokeWidth={0}   fill="url(#bandGrad)" isAnimationActive={true} animationDuration={1800} animationEasing="ease-in-out" />
                    <Area type="monotone" dataKey="low"  stroke="#3b82f6" strokeWidth={0.5} strokeDasharray="3 3" fill="white" isAnimationActive={true} animationDuration={1800} animationEasing="ease-in-out" />
                  </>
                )}
                <Area
                  type="monotone" dataKey="forecast"
                  stroke="#f59e0b" strokeWidth={2}
                  fill="url(#forecastGrad)"
                  dot={{ fill: '#f59e0b', r: 3 }}
                  isAnimationActive={true}
                  animationDuration={1800}
                  animationEasing="ease-in-out"
                  animationBegin={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* SKU sidebar */}
          <div className="bg-white border border-zinc-200 rounded-lg px-4 py-4 flex flex-col gap-3">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">SKU Breakdown</div>
            {SKUS.map((sku) => {
              const rawDemand = SKU_DEMAND[sku.id]
              const demand = Math.round(rawDemand * storeWeight)
              const conf = SKU_CONFIDENCE[sku.id]
              const pct = Math.round((rawDemand / 4800) * 100)
              return (
                <button
                  key={sku.id}
                  onClick={() => setSelectedSku(sku.id)}
                  className={`text-left rounded-md px-3 py-2.5 border transition-colors ${
                    selectedSku === sku.id
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <div className="text-xs font-medium text-zinc-800">{sku.color}</div>
                  <div className="text-xs text-zinc-400">{sku.storage}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-800">{demand.toLocaleString()}</span>
                    <span className={`text-xs ${
                      conf >= 80 ? 'text-emerald-500' :
                      conf >= 75 ? 'text-amber-500' : 'text-red-500'
                    }`}>{conf}%</span>
                  </div>
                  <div className="mt-1.5 h-1 bg-zinc-100 rounded-full">
                    <div className="h-1 bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              )
            })}

            <div className="mt-auto pt-3 border-t border-zinc-100">
              <div className="text-xs text-zinc-400">Total forecast</div>
              <div className="text-lg font-bold text-zinc-800 mt-0.5">
                {Math.round(4800 * storeWeight).toLocaleString()}
              </div>
              <div className="text-xs text-zinc-400">{storeName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
