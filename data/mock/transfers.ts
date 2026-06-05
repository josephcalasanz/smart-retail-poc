export const TRANSFER_SUGGESTIONS = [
  {
    trigger: ['stock', 'glorietta', 'black'],
    response: 'Glorietta is 160 units short on Black Titanium 128GB. Recommend transferring 90 units from Rockwell (surplus: 90) and 70 units from Cash and Carry (surplus: 30). ETA: 1 day.',
  },
  {
    trigger: ['stock', 'rockwell', 'black'],
    response: 'Rockwell currently has a surplus of 90 units on Black Titanium 128GB vs demand. No action needed — consider transferring excess to Glorietta or Greenhills which are both critically short.',
  },
  {
    trigger: ['stock', 'robinsons', 'desert'],
    response: 'Robinsons Place is 120 units short on Desert Titanium 256GB. Nearest surplus store is Cash and Carry with 30 units available. Recommend partial transfer of 30 units and escalate remaining 90-unit gap to warehouse replenishment. ETA: 2 days.',
  },
  {
    trigger: ['stock', 'ayala', 'natural'],
    response: 'Ayala Avenue is 150 units short on Natural Titanium 256GB — highest gap across all Manila stores. No single store has sufficient surplus for a full transfer. Recommend splitting: 80 units from Robinsons Place and 70 units from Cash and Carry. ETA: 1 day.',
  },
  {
    trigger: ['stock', 'cash', 'carry'],
    response: 'Cash and Carry has a 30-unit surplus on White Titanium 128GB and is near-balanced on Black Titanium. No critical shortfalls detected. Available for partial transfers to Glorietta or Greenhills.',
  },
  {
    trigger: ['lowest', 'stock', 'launch'],
    response: 'Ayala Avenue has the highest demand-to-supply gap: 150 units short on Natural Titanium 256GB. Greenhills follows with a 120-unit shortfall on Black Titanium 128GB. Recommend prioritising both stores for warehouse replenishment before launch day.',
  },
  {
    trigger: ['confidence', 'forecast'],
    response: 'Overall forecast confidence is 78%. Black Titanium 128GB is the highest-confidence SKU at 84%. Desert Titanium 256GB is lowest at 71% — recommend conservative allocation with a 10% buffer across Robinsons Place and Ayala Avenue.',
  },
  {
    trigger: ['greenhills', 'stock'],
    response: 'Greenhills (San Juan) current status:\n• Black Titanium 128GB: 190 committed vs 310 demand — shortfall of 120 units\n• Desert Titanium 256GB: 150 committed vs 220 demand — shortfall of 70 units\n• White Titanium 128GB: 120 committed vs 130 demand — near balanced\n\nRecommendation: Transfer 120 units Black Titanium from Cash and Carry and 70 units Desert Titanium from Rockwell. ETA: 1 day.',
  },
  {
    trigger: ['greenhills', 'transfer'],
    response: 'Best transfer options for Greenhills: Cash and Carry has a 30-unit surplus on Black Titanium — partial cover only. Recommend escalating to warehouse replenishment for the remaining 90-unit gap before launch day.',
  },
]
