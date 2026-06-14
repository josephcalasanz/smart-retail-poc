// Leadership Management dashboard dataset.
// Derived from the prototype's 6 stores and 2 SKUs (iPhone 17 Pro · Samsung S25 Ultra).
// PoC values — in production these would bind to the shared mock-data / live layer.

export const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']

export const demandSeries = [
  { week: 'W1', forecast: 3200, actual: 3150 },
  { week: 'W2', forecast: 3600, actual: 3520 },
  { week: 'W3', forecast: 4100, actual: 4250 },
  { week: 'W4', forecast: 4500, actual: 4480 },
  { week: 'W5', forecast: 4800, actual: 4950 },
  { week: 'W6', forecast: 5100, actual: 5350 },
  { week: 'W7', forecast: 5400, actual: 5750 },
  { week: 'W8', forecast: 5600, actual: 6050 },
]

export const salesSeries = [
  { week: 'W1', iphone: 820, galaxy: 540 },
  { week: 'W2', iphone: 910, galaxy: 600 },
  { week: 'W3', iphone: 1050, galaxy: 680 },
  { week: 'W4', iphone: 1180, galaxy: 720 },
  { week: 'W5', iphone: 1320, galaxy: 810 },
  { week: 'W6', iphone: 1450, galaxy: 870 },
  { week: 'W7', iphone: 1600, galaxy: 940 },
  { week: 'W8', iphone: 1720, galaxy: 1010 },
]

export type MgmtStore = {
  name: string
  city: string
  iphone: number
  galaxy: number
  daysCover: number
  invValue: number // PHP millions
}

export const mgmtStores: MgmtStore[] = [
  { name: 'Glorietta',       city: 'Makati',   iphone: 510, galaxy: 320, daysCover: 4,  invValue: 11.2 },
  { name: 'Greenhills',      city: 'San Juan', iphone: 430, galaxy: 310, daysCover: 5,  invValue: 8.3 },
  { name: 'Ayala Avenue',    city: 'Makati',   iphone: 470, galaxy: 300, daysCover: 6,  invValue: 10.6 },
  { name: 'Robinsons Place', city: 'Manila',   iphone: 360, galaxy: 240, daysCover: 9,  invValue: 8.4 },
  { name: 'Rockwell',        city: 'Makati',   iphone: 280, galaxy: 210, daysCover: 16, invValue: 9.8 },
  { name: 'Cash and Carry',  city: 'Makati',   iphone: 250, galaxy: 190, daysCover: 22, invValue: 10.1 },
]

export const aging = [
  { label: '0-30 days', pct: 64, color: '#1a7a2e' },
  { label: '31-60',     pct: 25, color: '#5ab22e' },
  { label: '61-90',     pct: 8,  color: '#f59e0b' },
  { label: '90+',       pct: 3,  color: '#ef4444' },
]

export const stockouts = [
  { store: 'Glorietta',       sku: 'iPhone 17 Pro',    risk: 'High',   days: 4, color: '#ef4444' },
  { store: 'Greenhills',      sku: 'Samsung S25 Ultra', risk: 'High',   days: 5, color: '#ef4444' },
  { store: 'Ayala Avenue',    sku: 'iPhone 17 Pro',    risk: 'High',   days: 6, color: '#ef4444' },
  { store: 'Robinsons Place', sku: 'iPhone 17 Pro',    risk: 'Medium', days: 9, color: '#f59e0b' },
]

export const kpis = [
  { label: 'Inventory Value',   value: '₱58.4M',  delta: '▲ 3.2% wk',        color: '#16a34a' },
  { label: 'Weeks of Supply',   value: '4.2 wks', delta: '▼ 0.6 tightening', color: '#dc2626' },
  { label: 'Forecast Accuracy', value: '82.4%',   delta: '▲ 1.1%',           color: '#16a34a' },
  { label: 'Service Level',     value: '94.6%',   delta: '▼ 0.8%',           color: '#dc2626' },
  { label: 'Excess Inventory',  value: '₱6.4M',   delta: '11% of stock',     color: '#b45309' },
]