// Central Distribution Center dataset for the Warehouse dashboard.
// Derived from the prototype's 6 stores and 2 SKUs (iPhone 17 Pro · Samsung S25 Ultra).
// PoC values, deterministic. In production these bind to the WMS / live DC feed.

// Single central DC feeding the 6 launch stores.
export const warehouse = { name: 'Central', city: 'Parañaque', code: 'PH-DC1' }

export interface WhSku {
  prod: string
  variant: string
  sv: string
  price: number
  onHand: number      // units physically in the DC
  allocated: number   // units already reserved for store dispatch
  inbound: number      // units on inbound POs
  daysCover: number   // cover at current dispatch run-rate
  status: string
  color: string
}

// available = onHand - allocated (can go negative = over-committed, covered by inbound)
export const whSkus: WhSku[] = [
  { prod: 'iPhone 17 Pro',    variant: 'Natural Titanium 256GB', sv: 'Natural Ti 256', price: 79990, onHand: 620, allocated: 380, inbound: 300, daysCover: 18, status: 'Healthy',  color: '#22c55e' },
  { prod: 'iPhone 17 Pro',    variant: 'Black Titanium 128GB',   sv: 'Black Ti 128',   price: 92990, onHand: 540, allocated: 300, inbound: 250, daysCover: 16, status: 'Healthy',  color: '#22c55e' },
  { prod: 'iPhone 17 Pro',    variant: 'Desert Titanium 256GB',  sv: 'Desert Ti 256',  price: 79990, onHand: 300, allocated: 260, inbound: 200, daysCover: 6,  status: 'Low',      color: '#f59e0b' },
  { prod: 'Samsung S25 Ultra', variant: 'Titanium Black 256GB',  sv: 'Ti Black 256',   price: 84990, onHand: 510, allocated: 340, inbound: 180, daysCover: 14, status: 'Healthy',  color: '#22c55e' },
  { prod: 'Samsung S25 Ultra', variant: 'Titanium Blue 512GB',   sv: 'Ti Blue 512',    price: 96990, onHand: 190, allocated: 290, inbound: 220, daysCover: 3,  status: 'Critical', color: '#ef4444' },
]

// DC-wide operational rates (would be computed from WMS events in production)
export const capacityUsed = 78    // % cubic occupancy
export const fulfillmentRate = 96.2 // % of dispatch lines shipped on time, last 7 days

// Purchase recommendations — SKU-level breakdown of the launch "recommended additional buy".
// Per-product quantities sum to that product's supply gap on Products/Forecasting
// (iPhone 17 Pro 1,260 + Samsung S25 Ultra 900 = 2,160 units), so the buy recommendation
// ties across Forecasting → Warehouse → Management. Prices match storeData.ts.
export type PurchaseRec = {
  sv: string
  prod: string
  qty: number
  price: number
  supplier: string
  lead: string
  reason: string
  severity: 'critical' | 'low' | 'plan'
  color: string
}

export const purchaseRecs: PurchaseRec[] = [
  { sv: 'Ti Blue 512',   prod: 'Samsung S25 Ultra', qty: 480, price: 96990, supplier: 'Samsung PH',  lead: '6-day lead', reason: 'Over-committed · 3-day cover',      severity: 'critical', color: '#ef4444' },
  { sv: 'Desert Ti 256', prod: 'iPhone 17 Pro',     qty: 260, price: 79990, supplier: 'Apple PH DC', lead: '4-day lead', reason: 'Below safety stock · 6-day cover',    severity: 'low',      color: '#f59e0b' },
  { sv: 'Black Ti 128',  prod: 'iPhone 17 Pro',     qty: 620, price: 92990, supplier: 'Apple PH DC', lead: '4-day lead', reason: 'Largest forecast shortfall at launch', severity: 'plan',     color: '#22c55e' },
  { sv: 'Ti Black 256',  prod: 'Samsung S25 Ultra', qty: 420, price: 84990, supplier: 'Samsung PH',  lead: '6-day lead', reason: 'Safety-stock top-up',                 severity: 'plan',     color: '#22c55e' },
  { sv: 'Natural Ti 256', prod: 'iPhone 17 Pro',    qty: 380, price: 79990, supplier: 'Apple PH DC', lead: '4-day lead', reason: 'Demand trending +12% pre-launch',      severity: 'plan',     color: '#22c55e' },
]

// Received vs dispatched, last 14 days (batchy inbound, climbing outbound into launch)
export const throughput = [
  { label: 'D1',    received: 60,  dispatched: 120 },
  { label: 'D2',    received: 40,  dispatched: 140 },
  { label: 'D3',    received: 250, dispatched: 160 },
  { label: 'D4',    received: 30,  dispatched: 150 },
  { label: 'D5',    received: 20,  dispatched: 180 },
  { label: 'D6',    received: 300, dispatched: 210 },
  { label: 'D7',    received: 40,  dispatched: 190 },
  { label: 'D8',    received: 200, dispatched: 220 },
  { label: 'D9',    received: 30,  dispatched: 240 },
  { label: 'D10',   received: 20,  dispatched: 230 },
  { label: 'D11',   received: 250, dispatched: 260 },
  { label: 'D12',   received: 40,  dispatched: 280 },
  { label: 'D13',   received: 300, dispatched: 300 },
  { label: 'Today', received: 220, dispatched: 340 },
]

// Inbound POs arriving from vendor DCs
export const inbound = [
  { src: 'Apple PH DC',  sv: 'Natural Ti 256', qty: 300, eta: 'Jun 15', status: 'In transit' },
  { src: 'Apple PH DC',  sv: 'Black Ti 128',   qty: 250, eta: 'Jun 16', status: 'Confirmed' },
  { src: 'Samsung PH',   sv: 'Ti Blue 512',    qty: 220, eta: 'Jun 17', status: 'Confirmed' },
  { src: 'Apple PH DC',  sv: 'Desert Ti 256',  qty: 200, eta: 'Jun 18', status: 'Scheduled' },
]

// Outbound dispatch queue (today) — the DC fulfilling store replenishment needs.
// Each row is the "warehouse replenishment" backstop the Assistant references, and
// its qty traces to that store's own reorder recommendation in storeData.ts
// (Ayala Natural Ti 256 +44 · Greenhills Ti Blue 512 +64 · Glorietta Natural Ti 256 +39).
// Distinct from store-to-store transfers (sourced from Rockwell / Cash and Carry).
export const outbound = [
  { to: 'Ayala Avenue', sv: 'Natural Ti 256', qty: 44, priority: 'High',   status: 'Packed',     color: '#ef4444' },
  { to: 'Greenhills',   sv: 'Ti Blue 512',    qty: 64, priority: 'High',   status: 'Picking',    color: '#ef4444' },
  { to: 'Glorietta',    sv: 'Natural Ti 256', qty: 39, priority: 'Medium', status: 'Dispatched', color: '#f59e0b' },
]

// Replenishment recommendations — stores running short, sourced from DC available stock
export const replenishment = [
  { store: 'Ayala Avenue', sv: 'Natural Ti 256', qty: 44, reason: 'Critical cover', color: '#ef4444' },
  { store: 'Greenhills',   sv: 'Ti Blue 512',    qty: 64, reason: 'Low cover',      color: '#f59e0b' },
  { store: 'Glorietta',    sv: 'Natural Ti 256', qty: 39, reason: 'Low cover',      color: '#f59e0b' },
]

// Pick & pack progress for today's dispatch queue
export const pickPack = { pct: 62, picked: 24, queued: 15, breaches: 0 }

// Storage zone occupancy
export const zones = [
  { zone: 'Receiving',        cap: 400,  used: 310 },
  { zone: 'Bulk Reserve',     cap: 1200, used: 1010 },
  { zone: 'Pick Face',        cap: 600,  used: 470 },
  { zone: 'Dispatch Staging', cap: 300,  used: 180 },
]

// Recent stock movement log
export const movement = [
  { time: '09:38',     type: 'Receipt',    color: '#1a7a2e', sv: 'Natural Ti 256', qty: 300 },
  { time: '10:12',     type: 'Dispatch',   color: '#6ec6e6', sv: 'Black Ti 128',   qty: -136 },
  { time: '10:55',     type: 'Putaway',    color: '#3aaa9e', sv: 'Ti Blue 512',    qty: 220 },
  { time: '11:40',     type: 'Dispatch',   color: '#6ec6e6', sv: 'Natural Ti 256', qty: -103 },
  { time: '12:20',     type: 'Adjustment', color: '#a1a1aa', sv: 'Desert Ti 256',  qty: -4 },
  { time: 'Yesterday', type: 'Receipt',    color: '#1a7a2e', sv: 'Ti Black 256',   qty: 180 },
]
