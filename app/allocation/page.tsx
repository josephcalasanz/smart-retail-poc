'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/layout/Header'
import { STORES, SKUS } from '@/data/mock'
import { useProduct } from '@/context/ProductContext'
import { Switch } from '@/components/ui/switch'

type AllocationRow = {
  storeId: string
  skuId: string
  current: number
  recommended: number
  demand: number
  rebalanced?: boolean
}

function rowKey(r: { storeId: string; skuId: string }) {
  return `${r.storeId}-${r.skuId}`
}

function getGapBadge(gap: number) {
  if (gap <= -100) return { label: 'Critical',  class: 'bg-red-50 text-red-600 border-red-200' }
  if (gap < 0)     return { label: 'Shortfall', class: 'bg-amber-50 text-amber-600 border-amber-200' }
  return             { label: 'Surplus',   class: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
}

// Heat map helpers
const MAX_GAP = 190

function getHeatBg(gap: number): string {
  const i = Math.min(Math.abs(gap) / MAX_GAP, 1)
  if (gap <= -100) return 'rgba(220,38,38,' + (0.08 + i * 0.14).toFixed(2) + ')'
  if (gap < 0)     return 'rgba(217,119,6,' + (0.06 + i * 0.10).toFixed(2) + ')'
  if (gap > 50)    return 'rgba(22,163,74,' + (0.06 + i * 0.12).toFixed(2) + ')'
  if (gap > 0)     return 'rgba(22,163,74,0.06)'
  return 'transparent'
}

function getHeatBarColor(gap: number): string {
  if (gap <= -100) return 'linear-gradient(90deg,#fca5a5,#ef4444)'
  if (gap < 0)     return 'linear-gradient(90deg,#fcd34d,#f59e0b)'
  if (gap > 0)     return 'linear-gradient(90deg,#86efac,#22c55e)'
  return 'transparent'
}

function getHeatBarWidth(gap: number): string {
  return Math.min((Math.abs(gap) / MAX_GAP) * 100, 100) + '%'
}

function getHeatTextColor(gap: number): string {
  if (gap <= -100) return '#b91c1c'
  if (gap < 0)     return '#b45309'
  if (gap > 0)     return '#15803d'
  return '#52525b'
}

function getRowTint(gap: number): string {
  if (gap <= -100) return 'rgba(220,38,38,0.025)'
  if (gap > 50)    return 'rgba(22,163,74,0.025)'
  return 'transparent'
}

export default function AllocationPage() {
  const { product } = useProduct()
  const ALLOCATION_TABLE = product.allocation
  const [rows, setRows]             = useState<AllocationRow[]>(product.allocation)
  const [rebalanced, setRebalanced] = useState(false)
  const [showAiOnly, setShowAiOnly] = useState(false)
  const [selected, setSelected]     = useState<Set<string>>(new Set())

  const displayRows = showAiOnly
    ? rows.filter(r => r.recommended !== r.current)
    : rows

  const displayKeys   = useMemo(() => displayRows.map(rowKey), [displayRows])
  const allChecked    = displayKeys.length > 0 && displayKeys.every(k => selected.has(k))
  const someChecked   = displayKeys.some(k => selected.has(k)) && !allChecked
  const selectedCount = displayKeys.filter(k => selected.has(k)).length

  function toggleSelectAll() {
    if (allChecked) {
      setSelected(prev => { const next = new Set(prev); displayKeys.forEach(k => next.delete(k)); return next })
    } else {
      setSelected(prev => { const next = new Set(prev); displayKeys.forEach(k => next.add(k)); return next })
    }
  }

  function toggleRow(key: string) {
    setSelected(prev => { const next = new Set(prev); if (next.has(key)) { next.delete(key) } else { next.add(key) }; return next })
  }

  const totalCurrentGap   = rows.reduce((sum, r) => sum + (r.demand - r.current), 0)
  const totalRebalanceGap = rows.reduce((sum, r) => sum + (r.demand - r.recommended), 0)
  const affectedRows      = rows.filter(r => r.recommended !== r.current).length

  function handleRebalance() {
    setRows(prev => prev.map(r => {
      if (!selected.has(rowKey(r))) return r
      return { ...r, current: r.recommended, rebalanced: true }
    }))
    setRebalanced(true)
    setSelected(new Set())
  }

  function handleReset() {
    setRows(ALLOCATION_TABLE)
    setRebalanced(false)
    setSelected(new Set())
  }

  const applyDisabled = selectedCount === 0

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header title="Allocation" />
      <div className="px-4 md:px-8 py-6 space-y-6">

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-lg px-3 md:px-5 py-3 md:py-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Stores</div>
            <div className="text-3xl font-bold text-zinc-800">{STORES.length}</div>
            <div className="text-xs text-zinc-400 mt-1">Makati, Manila &amp; San Juan</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-lg px-3 md:px-5 py-3 md:py-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">SKUs Tracked</div>
            <div className="text-3xl font-bold text-zinc-800">{SKUS.length}</div>
            <div className="text-xs text-zinc-400 mt-1">{product.name} variants</div>
          </div>
          <div className={`border rounded-lg px-3 md:px-5 py-3 md:py-4 ${rebalanced ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Supply Gap</div>
            <div className={`text-3xl font-bold ${rebalanced ? 'text-emerald-600' : 'text-red-600'}`}>
              {rebalanced ? `+${Math.abs(totalRebalanceGap)}` : totalCurrentGap}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {rebalanced ? 'units optimised' : 'allocation gap across tracked SKU-store pairs'}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 md:px-5 py-3 md:py-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">AI Recommendations</div>
            <div className="text-3xl font-bold text-amber-600">{affectedRows}</div>
            <div className="text-xs text-zinc-400 mt-1">store x SKU adjustments</div>
          </div>
        </div>

        {/* Action bar */}
        <div className="bg-white border border-zinc-200 rounded-lg px-4 md:px-5 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={showAiOnly} onCheckedChange={setShowAiOnly} />
              <span className="text-xs text-zinc-600">Show AI-flagged rows only</span>
            </div>
            <span className="text-xs text-zinc-400">
              {displayRows.length} of {rows.length} rows shown
            </span>
            {selectedCount > 0 && (
              <span className="text-xs font-medium text-[#1a7a2e]">
                {selectedCount} row{selectedCount > 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {rebalanced && (
              <button onClick={handleReset} className="text-xs text-zinc-500 hover:text-zinc-800 underline transition-colors">
                Reset to original
              </button>
            )}
            <button
              onClick={applyDisabled ? undefined : handleRebalance}
              disabled={applyDisabled}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                applyDisabled
                  ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                  : 'bg-zinc-900 text-white hover:bg-zinc-700'
              }`}
            >
              {selectedCount === 0
                ? 'Select rows to rebalance'
                : `Apply AI Rebalance (${selectedCount} selected)`
              }
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => { if (el) el.indeterminate = someChecked }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-zinc-300 accent-[#1a7a2e] cursor-pointer"
                  />
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Store</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">SKU</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Demand</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Current</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">AI Recommended</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Gap vs Demand</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {displayRows.map((row) => {
                const key       = rowKey(row)
                const store     = STORES.find(s => s.id === row.storeId)
                const sku       = SKUS.find(s => s.id === row.skuId)
                const gap       = row.current - row.demand
                const badge     = getGapBadge(gap)
                const delta     = row.recommended - row.current
                const isChanged = row.recommended !== ALLOCATION_TABLE.find(
                  r => r.storeId === row.storeId && r.skuId === row.skuId
                )?.current
                const isSelected = selected.has(key)

                return (
                  <tr
                    key={key}
                    onClick={() => !rebalanced && toggleRow(key)}
                    className="transition-colors cursor-pointer"
                    style={{
                      background: isSelected
                        ? 'rgba(26,122,46,0.06)'
                        : row.rebalanced && isChanged
                        ? 'rgba(220,252,231,0.6)'
                        : getRowTint(gap)
                    }}
                  >
                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(key)}
                        disabled={row.rebalanced === true}
                        className="w-4 h-4 rounded border-zinc-300 accent-[#1a7a2e] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-zinc-800">{store?.name ?? row.storeId}</div>
                      <div className="text-xs text-zinc-400">{store?.city}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-zinc-800">{sku?.color ?? row.skuId}</div>
                      <div className="text-xs text-zinc-400">{sku?.storage}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-zinc-800">
                      {row.demand.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right text-zinc-600">
                      {row.current.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-medium text-zinc-800">{row.recommended.toLocaleString()}</span>
                      {delta !== 0 && (
                        <span className={`ml-2 text-xs ${delta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {delta > 0 ? '+' : ''}{delta}
                        </span>
                      )}
                    </td>
                    <td
                      className="px-5 py-3.5 text-right font-bold relative"
                      style={{ color: getHeatTextColor(gap), background: getHeatBg(gap) }}
                    >
                      {gap > 0 ? '+' : ''}{gap.toLocaleString()}
                      <div className="absolute bottom-0 left-0 right-0 h-[3px]">
                        <div className="h-full"
                             style={{
                               width: getHeatBarWidth(gap),
                               background: getHeatBarColor(gap),
                               float: gap < 0 ? 'right' : 'left'
                             }} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge.class}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-200 bg-zinc-50">
                <td />
                <td colSpan={3} className="px-5 py-3 text-xs font-medium text-zinc-500">
                  Total across all store x SKU combinations
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold text-zinc-800">
                  {rows.reduce((s, r) => s + r.current, 0).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold text-zinc-800">
                  {rows.reduce((s, r) => s + r.recommended, 0).toLocaleString()}
                </td>
                <td className={`px-5 py-3 text-right text-sm font-bold ${rebalanced ? 'text-emerald-600' : 'text-red-600'}`}>
                  {rebalanced
                    ? `+${Math.abs(totalRebalanceGap)}`
                    : totalCurrentGap > 0 ? `+${totalCurrentGap}` : totalCurrentGap
                  }
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
          </div>
          {/* Heat map legend */}
          <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-zinc-100 bg-zinc-50">
            <span className="text-xs text-zinc-400 uppercase tracking-wide">Intensity:</span>
            {[
              { color: 'rgba(220,38,38,0.18)', label: 'Critical shortfall' },
              { color: 'rgba(217,119,6,0.12)',  label: 'Shortfall' },
              { color: 'rgba(244,244,245,0.8)', label: 'Neutral' },
              { color: 'rgba(22,163,74,0.16)',  label: 'Surplus' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm border border-zinc-200" style={{ background: item.color }} />
                <span className="text-xs text-zinc-500">{item.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-6 h-[3px] rounded-sm" style={{ background: 'linear-gradient(90deg,#fca5a5,#ef4444)' }} />
              <span className="text-xs text-zinc-500">Gap intensity bar</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
