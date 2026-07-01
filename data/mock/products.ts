export type Product = {
  id: string
  name: string
  brand: 'Apple' | 'Samsung'
  launchDaysOut: number
  preOrders: number
  unitsCommitted: number
  unitsGap: number
  forecastConfidence: number
  region: string
  currency: string
  skus: { id: string; color: string; storage: string }[]
  allocation: { storeId: string; skuId: string; current: number; recommended: number; demand: number }[]
  storeWeights: Record<string, number>
  skuDemand: Record<string, number>
  skuConfidence: Record<string, number>
  skuCommitted: Record<string, number>
}

// SKU lineup is kept in sync with the operational layer (storeData.ts / warehouseData.ts):
// iPhone 17 Pro → Black 128 · Natural 256 · Desert 256; Samsung S25 Ultra → Ti Black 256 · Ti Blue 512.
// Aggregates tie out: unitsCommitted = Σ skuCommitted, unitsGap = preOrders − unitsCommitted.
export const PRODUCTS: Product[] = [
  {
    id: 'IPH17P',
    name: 'iPhone 17 Pro',
    brand: 'Apple',
    launchDaysOut: 14,
    preOrders: 3800,
    unitsCommitted: 2540,
    unitsGap: 1260,
    forecastConfidence: 78,
    region: 'Makati, Manila & San Juan',
    currency: 'PHP',
    skus: [
      { id: 'IPH17P-BLK-128', color: 'Black Titanium',   storage: '128GB' },
      { id: 'IPH17P-NAT-256', color: 'Natural Titanium', storage: '256GB' },
      { id: 'IPH17P-DST-256', color: 'Desert Titanium',  storage: '256GB' },
    ],
    storeWeights: {
      ALL: 1.00, 'PH-GLO': 0.25, 'PH-RKW': 0.20,
      'PH-RBP': 0.18, 'PH-CNC': 0.15, 'PH-AYA': 0.12, 'PH-GRH': 0.10,
    },
    skuDemand: {
      'IPH17P-BLK-128': 1820, 'IPH17P-NAT-256': 980, 'IPH17P-DST-256': 760,
    },
    skuConfidence: {
      'IPH17P-BLK-128': 84, 'IPH17P-NAT-256': 76, 'IPH17P-DST-256': 71,
    },
    skuCommitted: {
      'IPH17P-BLK-128': 1210, 'IPH17P-NAT-256': 710, 'IPH17P-DST-256': 620,
    },
    allocation: [
      { storeId: 'PH-GLO', skuId: 'IPH17P-BLK-128', current: 320, recommended: 480, demand: 510 },
      { storeId: 'PH-RKW', skuId: 'IPH17P-BLK-128', current: 400, recommended: 320, demand: 310 },
      { storeId: 'PH-RKW', skuId: 'IPH17P-NAT-256', current: 180, recommended: 260, demand: 280 },
      { storeId: 'PH-RBP', skuId: 'IPH17P-DST-256', current: 220, recommended: 310, demand: 340 },
      { storeId: 'PH-CNC', skuId: 'IPH17P-BLK-128', current: 300, recommended: 280, demand: 270 },
      { storeId: 'PH-AYA', skuId: 'IPH17P-NAT-256', current: 260, recommended: 380, demand: 410 },
      { storeId: 'PH-GRH', skuId: 'IPH17P-BLK-128', current: 190, recommended: 280, demand: 310 },
      { storeId: 'PH-GRH', skuId: 'IPH17P-DST-256', current: 150, recommended: 200, demand: 220 },
    ],
  },
  {
    id: 'SSG-S25U',
    name: 'Samsung S25 Ultra',
    brand: 'Samsung',
    launchDaysOut: 28,
    preOrders: 2400,
    unitsCommitted: 1500,
    unitsGap: 900,
    forecastConfidence: 71,
    region: 'Makati, Manila & San Juan',
    currency: 'PHP',
    skus: [
      { id: 'S25U-BLK-256', color: 'Titanium Black',  storage: '256GB' },
      { id: 'S25U-BLU-512', color: 'Titanium Blue',   storage: '512GB' },
    ],
    storeWeights: {
      ALL: 1.00, 'PH-GLO': 0.22, 'PH-RKW': 0.21,
      'PH-RBP': 0.19, 'PH-CNC': 0.16, 'PH-AYA': 0.13, 'PH-GRH': 0.09,
    },
    skuDemand: {
      'S25U-BLK-256': 1340, 'S25U-BLU-512': 860,
    },
    skuConfidence: {
      'S25U-BLK-256': 79, 'S25U-BLU-512': 68,
    },
    skuCommitted: {
      'S25U-BLK-256': 980, 'S25U-BLU-512': 520,
    },
    allocation: [
      { storeId: 'PH-GLO', skuId: 'S25U-BLK-256', current: 240, recommended: 320, demand: 350 },
      { storeId: 'PH-RKW', skuId: 'S25U-BLK-256', current: 310, recommended: 260, demand: 250 },
      { storeId: 'PH-RKW', skuId: 'S25U-BLU-512', current: 140, recommended: 190, demand: 200 },
      { storeId: 'PH-RBP', skuId: 'S25U-BLU-512', current: 160, recommended: 230, demand: 260 },
      { storeId: 'PH-CNC', skuId: 'S25U-BLK-256', current: 220, recommended: 200, demand: 190 },
      { storeId: 'PH-AYA', skuId: 'S25U-BLU-512', current: 190, recommended: 280, demand: 310 },
      { storeId: 'PH-GRH', skuId: 'S25U-BLK-256', current: 130, recommended: 190, demand: 210 },
      { storeId: 'PH-GRH', skuId: 'S25U-BLU-512', current:  90, recommended: 120, demand: 130 },
    ],
  },
]
