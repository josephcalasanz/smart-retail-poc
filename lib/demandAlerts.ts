import type { Product } from '@/data/mock/products'
import { STORES } from '@/data/mock'

export type DemandAlert = {
  id: string
  severity: 'critical' | 'review' | 'opportunity'
  title: string
  delta?: { label: string; dir: 'up' | 'down' }
  message: string
  time: string
  href: string
}

// Representative 24h pre-order movement used for the PoC demo feed.
const PREORDER_DELTA_PCT = 12
// Planning threshold below which forecast confidence is flagged for review.
const CONFIDENCE_THRESHOLD = 80

export function buildDemandAlerts(product: Product): DemandAlert[] {
  const alerts: DemandAlert[] = []

  // 1. Pre-orders trending above committed supply (critical)
  alerts.push({
    id: `${product.id}-preorder-trend`,
    severity: 'critical',
    title: `${product.name} pre-orders trending up`,
    delta: { label: `${PREORDER_DELTA_PCT}%`, dir: 'up' },
    message: `Now ${product.preOrders.toLocaleString()} — demand running above committed supply. Gap at ${product.unitsGap.toLocaleString()} units.`,
    time: '18 min ago',
    href: '/forecasting',
  })

  // 2. Forecast confidence relative to planning threshold (review)
  if (product.forecastConfidence < CONFIDENCE_THRESHOLD) {
    alerts.push({
      id: `${product.id}-confidence`,
      severity: 'review',
      title: `Forecast confidence at ${product.forecastConfidence}%`,
      message: `New sell-through data updated the model — below the ${CONFIDENCE_THRESHOLD}% planning threshold.`,
      time: '42 min ago',
      href: '/forecasting',
    })
  }

  // 3. Largest per-store demand-over-stock spike (opportunity)
  const top = [...product.allocation].sort(
    (a, b) => b.demand - b.current - (a.demand - a.current)
  )[0]
  if (top && top.demand > top.current) {
    const store = STORES.find((s) => s.id === top.storeId)
    const sku = product.skus.find((s) => s.id === top.skuId)
    const pct = Math.round(((top.demand - top.current) / top.current) * 100)
    alerts.push({
      id: `${product.id}-spike-${top.storeId}`,
      severity: 'opportunity',
      title: `${store?.name ?? top.storeId} demand spike detected`,
      delta: { label: `${pct}%`, dir: 'up' },
      message: `${sku ? `${sku.color} ${sku.storage}` : top.skuId} demand ${pct}% above current stock — consider reallocating inbound units.`,
      time: '1h ago',
      href: '/forecasting',
    })
  }

  return alerts
}