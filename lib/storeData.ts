// Per-store dataset for the Store dashboard.
// Derived from the prototype's 6 stores and 2 SKUs (iPhone 17 Pro · Samsung S25 Ultra).
// PoC values, deterministic per store. In production these bind to the live store feed.

export interface StoreSku { prod: string; variant: string; sv: string; price: number; stock: number; soldToday: number; soldMtd: number; days: number; status: string; color: string; run: number }
export interface StoreData {
  name: string; city: string
  todaySales: number; mtdSales: number; currentInv: number; lowAlerts: number; incomingStock: number
  skus: StoreSku[]
  daily: number[]
  topSku: { sv: string; prod: string; sold: number }
  sellThrough: number
  reorder: { sv: string; prod: string; qty: number; reason: string; color: string }[]
  incoming: { frm: string; sv: string; qty: number; eta: string; status: string }[]
  outgoing: { to: string; sv: string; qty: number; status: string }[]
  cycle: { pct: number; last: string; next: string; openVar: number }
  variance: { sv: string; system: number; counted: number; diff: number }[]
  movement: { time: string; type: string; color: string; sv: string; qty: number }[]
  topList: { sv: string; prod: string; sold: number }[]
}

export const storeOrder: string[] = ["PH-GLO", "PH-GRH", "PH-AYA", "PH-RBP", "PH-RKW", "PH-CNC"]

export const storeOptions: { id: string; name: string }[] = [{"id": "PH-GLO", "name": "Glorietta"}, {"id": "PH-GRH", "name": "Greenhills"}, {"id": "PH-AYA", "name": "Ayala Avenue"}, {"id": "PH-RBP", "name": "Robinsons Place"}, {"id": "PH-RKW", "name": "Rockwell"}, {"id": "PH-CNC", "name": "Cash and Carry"}]

export const storeData: Record<string, StoreData> = {
  "PH-GLO": {
    "name": "Glorietta",
    "city": "Makati",
    "todaySales": 1223860,
    "mtdSales": 34362100,
    "currentInv": 160,
    "lowAlerts": 5,
    "incomingStock": 231,
    "skus": [
      {
        "prod": "iPhone 17 Pro",
        "variant": "Natural Titanium 256GB",
        "sv": "Natural Ti 256",
        "price": 79990,
        "stock": 20,
        "soldToday": 3,
        "soldMtd": 59,
        "days": 10,
        "status": "Low",
        "color": "#f59e0b",
        "run": 1.97
      },
      {
        "prod": "iPhone 17 Pro",
        "variant": "Black Titanium 128GB",
        "sv": "Black Ti 128",
        "price": 92990,
        "stock": 45,
        "soldToday": 2,
        "soldMtd": 103,
        "days": 13,
        "status": "Low",
        "color": "#f59e0b",
        "run": 3.43
      },
      {
        "prod": "iPhone 17 Pro",
        "variant": "Desert Titanium 256GB",
        "sv": "Desert Ti 256",
        "price": 79990,
        "stock": 23,
        "soldToday": 3,
        "soldMtd": 57,
        "days": 12,
        "status": "Low",
        "color": "#f59e0b",
        "run": 1.9
      },
      {
        "prod": "Samsung S25 Ultra",
        "variant": "Titanium Black 256GB",
        "sv": "Ti Black 256",
        "price": 84990,
        "stock": 37,
        "soldToday": 2,
        "soldMtd": 90,
        "days": 12,
        "status": "Low",
        "color": "#f59e0b",
        "run": 3.0
      },
      {
        "prod": "Samsung S25 Ultra",
        "variant": "Titanium Blue 512GB",
        "sv": "Ti Blue 512",
        "price": 96990,
        "stock": 35,
        "soldToday": 4,
        "soldMtd": 81,
        "days": 13,
        "status": "Low",
        "color": "#f59e0b",
        "run": 2.7
      }
    ],
    "daily": [
      8,
      9,
      12,
      13,
      14,
      14,
      11,
      15,
      16,
      13,
      14,
      15,
      13,
      19
    ],
    "topSku": {
      "sv": "Black Ti 128",
      "prod": "iPhone 17 Pro",
      "sold": 103
    },
    "sellThrough": 71,
    "reorder": [
      {
        "sv": "Natural Ti 256",
        "prod": "iPhone 17 Pro",
        "qty": 39,
        "reason": "Low cover",
        "color": "#f59e0b"
      },
      {
        "sv": "Black Ti 128",
        "prod": "iPhone 17 Pro",
        "qty": 58,
        "reason": "Low cover",
        "color": "#f59e0b"
      },
      {
        "sv": "Desert Ti 256",
        "prod": "iPhone 17 Pro",
        "qty": 34,
        "reason": "Low cover",
        "color": "#f59e0b"
      },
      {
        "sv": "Ti Black 256",
        "prod": "Samsung S25 Ultra",
        "qty": 53,
        "reason": "Low cover",
        "color": "#f59e0b"
      },
      {
        "sv": "Ti Blue 512",
        "prod": "Samsung S25 Ultra",
        "qty": 46,
        "reason": "Low cover",
        "color": "#f59e0b"
      }
    ],
    "incoming": [
      {
        "frm": "Cash and Carry",
        "sv": "Black Ti 128",
        "qty": 136,
        "eta": "Jun 16",
        "status": "Confirmed"
      },
      {
        "frm": "Rockwell",
        "sv": "Desert Ti 256",
        "qty": 95,
        "eta": "Jun 16",
        "status": "Confirmed"
      }
    ],
    "outgoing": [],
    "cycle": {
      "pct": 45,
      "last": "Jun 11",
      "next": "Jun 18",
      "openVar": 2
    },
    "variance": [
      {
        "sv": "Ti Blue 512",
        "system": 35,
        "counted": 37,
        "diff": 2
      },
      {
        "sv": "Desert Ti 256",
        "system": 23,
        "counted": 22,
        "diff": -1
      }
    ],
    "movement": [
      {
        "time": "09:42",
        "type": "Adjustment",
        "color": "#a1a1aa",
        "sv": "Ti Blue 512",
        "qty": 52
      },
      {
        "time": "10:15",
        "type": "Transfer In",
        "color": "#3aaa9e",
        "sv": "Ti Black 256",
        "qty": 48
      },
      {
        "time": "11:03",
        "type": "Receipt",
        "color": "#1a7a2e",
        "sv": "Ti Blue 512",
        "qty": 16
      },
      {
        "time": "12:30",
        "type": "Transfer Out",
        "color": "#6ec6e6",
        "sv": "Black Ti 128",
        "qty": -16
      },
      {
        "time": "Yesterday",
        "type": "Adjustment",
        "color": "#a1a1aa",
        "sv": "Desert Ti 256",
        "qty": 21
      },
      {
        "time": "Yesterday",
        "type": "Transfer Out",
        "color": "#6ec6e6",
        "sv": "Ti Black 256",
        "qty": -21
      }
    ],
    "topList": [
      {
        "sv": "Black Ti 128",
        "prod": "iPhone 17 Pro",
        "sold": 103
      },
      {
        "sv": "Ti Black 256",
        "prod": "Samsung S25 Ultra",
        "sold": 90
      },
      {
        "sv": "Ti Blue 512",
        "prod": "Samsung S25 Ultra",
        "sold": 81
      },
      {
        "sv": "Natural Ti 256",
        "prod": "iPhone 17 Pro",
        "sold": 59
      },
      {
        "sv": "Desert Ti 256",
        "prod": "iPhone 17 Pro",
        "sold": 57
      }
    ]
  },
  "PH-GRH": {
    "name": "Greenhills",
    "city": "San Juan",
    "todaySales": 1029880,
    "mtdSales": 38027660,
    "currentInv": 190,
    "lowAlerts": 5,
    "incomingStock": 189,
    "skus": [
      {
        "prod": "iPhone 17 Pro",
        "variant": "Natural Titanium 256GB",
        "sv": "Natural Ti 256",
        "price": 79990,
        "stock": 35,
        "soldToday": 3,
        "soldMtd": 74,
        "days": 14,
        "status": "Low",
        "color": "#f59e0b",
        "run": 2.47
      },
      {
        "prod": "iPhone 17 Pro",
        "variant": "Black Titanium 128GB",
        "sv": "Black Ti 128",
        "price": 92990,
        "stock": 32,
        "soldToday": 2,
        "soldMtd": 76,
        "days": 13,
        "status": "Low",
        "color": "#f59e0b",
        "run": 2.53
      },
      {
        "prod": "iPhone 17 Pro",
        "variant": "Desert Titanium 256GB",
        "sv": "Desert Ti 256",
        "price": 79990,
        "stock": 41,
        "soldToday": 3,
        "soldMtd": 88,
        "days": 14,
        "status": "Low",
        "color": "#f59e0b",
        "run": 2.93
      },
      {
        "prod": "Samsung S25 Ultra",
        "variant": "Titanium Black 256GB",
        "sv": "Ti Black 256",
        "price": 84990,
        "stock": 34,
        "soldToday": 2,
        "soldMtd": 84,
        "days": 12,
        "status": "Low",
        "color": "#f59e0b",
        "run": 2.8
      },
      {
        "prod": "Samsung S25 Ultra",
        "variant": "Titanium Blue 512GB",
        "sv": "Ti Blue 512",
        "price": 96990,
        "stock": 48,
        "soldToday": 2,
        "soldMtd": 112,
        "days": 13,
        "status": "Low",
        "color": "#f59e0b",
        "run": 3.73
      }
    ],
    "daily": [
      11,
      9,
      14,
      15,
      15,
      12,
      13,
      14,
      13,
      15,
      17,
      20,
      16,
      21
    ],
    "topSku": {
      "sv": "Ti Blue 512",
      "prod": "Samsung S25 Ultra",
      "sold": 112
    },
    "sellThrough": 70,
    "reorder": [
      {
        "sv": "Natural Ti 256",
        "prod": "iPhone 17 Pro",
        "qty": 39,
        "reason": "Low cover",
        "color": "#f59e0b"
      },
      {
        "sv": "Black Ti 128",
        "prod": "iPhone 17 Pro",
        "qty": 44,
        "reason": "Low cover",
        "color": "#f59e0b"
      },
      {
        "sv": "Desert Ti 256",
        "prod": "iPhone 17 Pro",
        "qty": 47,
        "reason": "Low cover",
        "color": "#f59e0b"
      },
      {
        "sv": "Ti Black 256",
        "prod": "Samsung S25 Ultra",
        "qty": 50,
        "reason": "Low cover",
        "color": "#f59e0b"
      },
      {
        "sv": "Ti Blue 512",
        "prod": "Samsung S25 Ultra",
        "qty": 64,
        "reason": "Low cover",
        "color": "#f59e0b"
      }
    ],
    "incoming": [
      {
        "frm": "Rockwell",
        "sv": "Black Ti 128",
        "qty": 92,
        "eta": "Jun 15",
        "status": "In transit"
      },
      {
        "frm": "Cash and Carry",
        "sv": "Black Ti 128",
        "qty": 97,
        "eta": "Jun 14",
        "status": "In transit"
      }
    ],
    "outgoing": [],
    "cycle": {
      "pct": 88,
      "last": "Jun 11",
      "next": "Jun 18",
      "openVar": 2
    },
    "variance": [
      {
        "sv": "Desert Ti 256",
        "system": 41,
        "counted": 39,
        "diff": -2
      },
      {
        "sv": "Black Ti 128",
        "system": 32,
        "counted": 31,
        "diff": -1
      }
    ],
    "movement": [
      {
        "time": "09:42",
        "type": "Transfer In",
        "color": "#3aaa9e",
        "sv": "Black Ti 128",
        "qty": 57
      },
      {
        "time": "10:15",
        "type": "Transfer Out",
        "color": "#6ec6e6",
        "sv": "Black Ti 128",
        "qty": -5
      },
      {
        "time": "11:03",
        "type": "Adjustment",
        "color": "#a1a1aa",
        "sv": "Desert Ti 256",
        "qty": 52
      },
      {
        "time": "12:30",
        "type": "Transfer In",
        "color": "#3aaa9e",
        "sv": "Natural Ti 256",
        "qty": 34
      },
      {
        "time": "Yesterday",
        "type": "Receipt",
        "color": "#1a7a2e",
        "sv": "Black Ti 128",
        "qty": 18
      },
      {
        "time": "Yesterday",
        "type": "Receipt",
        "color": "#1a7a2e",
        "sv": "Ti Blue 512",
        "qty": 33
      }
    ],
    "topList": [
      {
        "sv": "Ti Blue 512",
        "prod": "Samsung S25 Ultra",
        "sold": 112
      },
      {
        "sv": "Desert Ti 256",
        "prod": "iPhone 17 Pro",
        "sold": 88
      },
      {
        "sv": "Ti Black 256",
        "prod": "Samsung S25 Ultra",
        "sold": 84
      },
      {
        "sv": "Black Ti 128",
        "prod": "iPhone 17 Pro",
        "sold": 76
      },
      {
        "sv": "Natural Ti 256",
        "prod": "iPhone 17 Pro",
        "sold": 74
      }
    ]
  },
  "PH-AYA": {
    "name": "Ayala Avenue",
    "city": "Makati",
    "todaySales": 1016880,
    "mtdSales": 29303600,
    "currentInv": 158,
    "lowAlerts": 5,
    "incomingStock": 206,
    "skus": [
      {
        "prod": "iPhone 17 Pro",
        "variant": "Natural Titanium 256GB",
        "sv": "Natural Ti 256",
        "price": 79990,
        "stock": 46,
        "soldToday": 4,
        "soldMtd": 90,
        "days": 15,
        "status": "Low",
        "color": "#f59e0b",
        "run": 3.0
      },
      {
        "prod": "iPhone 17 Pro",
        "variant": "Black Titanium 128GB",
        "sv": "Black Ti 128",
        "price": 92990,
        "stock": 34,
        "soldToday": 1,
        "soldMtd": 64,
        "days": 16,
        "status": "Low",
        "color": "#f59e0b",
        "run": 2.13
      },
      {
        "prod": "iPhone 17 Pro",
        "variant": "Desert Titanium 256GB",
        "sv": "Desert Ti 256",
        "price": 79990,
        "stock": 32,
        "soldToday": 3,
        "soldMtd": 75,
        "days": 13,
        "status": "Low",
        "color": "#f59e0b",
        "run": 2.5
      },
      {
        "prod": "Samsung S25 Ultra",
        "variant": "Titanium Black 256GB",
        "sv": "Ti Black 256",
        "price": 84990,
        "stock": 21,
        "soldToday": 2,
        "soldMtd": 51,
        "days": 12,
        "status": "Low",
        "color": "#f59e0b",
        "run": 1.7
      },
      {
        "prod": "Samsung S25 Ultra",
        "variant": "Titanium Blue 512GB",
        "sv": "Ti Blue 512",
        "price": 96990,
        "stock": 25,
        "soldToday": 2,
        "soldMtd": 60,
        "days": 12,
        "status": "Low",
        "color": "#f59e0b",
        "run": 2.0
      }
    ],
    "daily": [
      8,
      9,
      11,
      10,
      12,
      10,
      11,
      10,
      10,
      14,
      15,
      14,
      14,
      16
    ],
    "topSku": {
      "sv": "Natural Ti 256",
      "prod": "iPhone 17 Pro",
      "sold": 90
    },
    "sellThrough": 68,
    "reorder": [
      {
        "sv": "Natural Ti 256",
        "prod": "iPhone 17 Pro",
        "qty": 44,
        "reason": "Low cover",
        "color": "#f59e0b"
      },
      {
        "sv": "Black Ti 128",
        "prod": "iPhone 17 Pro",
        "qty": 30,
        "reason": "Low cover",
        "color": "#f59e0b"
      },
      {
        "sv": "Desert Ti 256",
        "prod": "iPhone 17 Pro",
        "qty": 43,
        "reason": "Low cover",
        "color": "#f59e0b"
      },
      {
        "sv": "Ti Black 256",
        "prod": "Samsung S25 Ultra",
        "qty": 30,
        "reason": "Low cover",
        "color": "#f59e0b"
      },
      {
        "sv": "Ti Blue 512",
        "prod": "Samsung S25 Ultra",
        "qty": 35,
        "reason": "Low cover",
        "color": "#f59e0b"
      }
    ],
    "incoming": [
      {
        "frm": "Cash and Carry",
        "sv": "Natural Ti 256",
        "qty": 86,
        "eta": "Jun 16",
        "status": "Confirmed"
      },
      {
        "frm": "Rockwell",
        "sv": "Desert Ti 256",
        "qty": 120,
        "eta": "Jun 15",
        "status": "Confirmed"
      }
    ],
    "outgoing": [],
    "cycle": {
      "pct": 72,
      "last": "Jun 11",
      "next": "Jun 18",
      "openVar": 2
    },
    "variance": [
      {
        "sv": "Desert Ti 256",
        "system": 32,
        "counted": 34,
        "diff": 2
      },
      {
        "sv": "Black Ti 128",
        "system": 34,
        "counted": 32,
        "diff": -2
      }
    ],
    "movement": [
      {
        "time": "09:42",
        "type": "Transfer In",
        "color": "#3aaa9e",
        "sv": "Ti Blue 512",
        "qty": 53
      },
      {
        "time": "10:15",
        "type": "Adjustment",
        "color": "#a1a1aa",
        "sv": "Desert Ti 256",
        "qty": 38
      },
      {
        "time": "11:03",
        "type": "Adjustment",
        "color": "#a1a1aa",
        "sv": "Ti Blue 512",
        "qty": 25
      },
      {
        "time": "12:30",
        "type": "Transfer Out",
        "color": "#6ec6e6",
        "sv": "Ti Blue 512",
        "qty": -36
      },
      {
        "time": "Yesterday",
        "type": "Transfer In",
        "color": "#3aaa9e",
        "sv": "Black Ti 128",
        "qty": 46
      },
      {
        "time": "Yesterday",
        "type": "Transfer In",
        "color": "#3aaa9e",
        "sv": "Natural Ti 256",
        "qty": 42
      }
    ],
    "topList": [
      {
        "sv": "Natural Ti 256",
        "prod": "iPhone 17 Pro",
        "sold": 90
      },
      {
        "sv": "Desert Ti 256",
        "prod": "iPhone 17 Pro",
        "sold": 75
      },
      {
        "sv": "Black Ti 128",
        "prod": "iPhone 17 Pro",
        "sold": 64
      },
      {
        "sv": "Ti Blue 512",
        "prod": "Samsung S25 Ultra",
        "sold": 60
      },
      {
        "sv": "Ti Black 256",
        "prod": "Samsung S25 Ultra",
        "sold": 51
      }
    ]
  },
  "PH-RBP": {
    "name": "Robinsons Place",
    "city": "Manila",
    "todaySales": 1735800,
    "mtdSales": 41014240,
    "currentInv": 345,
    "lowAlerts": 0,
    "incomingStock": 0,
    "skus": [
      {
        "prod": "iPhone 17 Pro",
        "variant": "Natural Titanium 256GB",
        "sv": "Natural Ti 256",
        "price": 79990,
        "stock": 51,
        "soldToday": 3,
        "soldMtd": 73,
        "days": 21,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 2.43
      },
      {
        "prod": "iPhone 17 Pro",
        "variant": "Black Titanium 128GB",
        "sv": "Black Ti 128",
        "price": 92990,
        "stock": 75,
        "soldToday": 5,
        "soldMtd": 111,
        "days": 20,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 3.7
      },
      {
        "prod": "iPhone 17 Pro",
        "variant": "Desert Titanium 256GB",
        "sv": "Desert Ti 256",
        "price": 79990,
        "stock": 103,
        "soldToday": 5,
        "soldMtd": 144,
        "days": 21,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 4.8
      },
      {
        "prod": "Samsung S25 Ultra",
        "variant": "Titanium Black 256GB",
        "sv": "Ti Black 256",
        "price": 84990,
        "stock": 71,
        "soldToday": 4,
        "soldMtd": 85,
        "days": 25,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 2.83
      },
      {
        "prod": "Samsung S25 Ultra",
        "variant": "Titanium Blue 512GB",
        "sv": "Ti Blue 512",
        "price": 96990,
        "stock": 45,
        "soldToday": 3,
        "soldMtd": 63,
        "days": 21,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 2.1
      }
    ],
    "daily": [
      10,
      12,
      11,
      13,
      15,
      18,
      18,
      15,
      19,
      17,
      15,
      17,
      18,
      19
    ],
    "topSku": {
      "sv": "Desert Ti 256",
      "prod": "iPhone 17 Pro",
      "sold": 144
    },
    "sellThrough": 58,
    "reorder": [],
    "incoming": [],
    "outgoing": [],
    "cycle": {
      "pct": 88,
      "last": "Jun 11",
      "next": "Jun 18",
      "openVar": 3
    },
    "variance": [
      {
        "sv": "Natural Ti 256",
        "system": 51,
        "counted": 49,
        "diff": -2
      },
      {
        "sv": "Desert Ti 256",
        "system": 103,
        "counted": 102,
        "diff": -1
      },
      {
        "sv": "Ti Black 256",
        "system": 71,
        "counted": 69,
        "diff": -2
      }
    ],
    "movement": [
      {
        "time": "09:42",
        "type": "Transfer Out",
        "color": "#6ec6e6",
        "sv": "Ti Black 256",
        "qty": -9
      },
      {
        "time": "10:15",
        "type": "Sale",
        "color": "#ef4444",
        "sv": "Natural Ti 256",
        "qty": -1
      },
      {
        "time": "11:03",
        "type": "Transfer Out",
        "color": "#6ec6e6",
        "sv": "Ti Black 256",
        "qty": -55
      },
      {
        "time": "12:30",
        "type": "Sale",
        "color": "#ef4444",
        "sv": "Ti Black 256",
        "qty": -1
      },
      {
        "time": "Yesterday",
        "type": "Transfer Out",
        "color": "#6ec6e6",
        "sv": "Desert Ti 256",
        "qty": -20
      },
      {
        "time": "Yesterday",
        "type": "Transfer In",
        "color": "#3aaa9e",
        "sv": "Black Ti 128",
        "qty": 56
      }
    ],
    "topList": [
      {
        "sv": "Desert Ti 256",
        "prod": "iPhone 17 Pro",
        "sold": 144
      },
      {
        "sv": "Black Ti 128",
        "prod": "iPhone 17 Pro",
        "sold": 111
      },
      {
        "sv": "Ti Black 256",
        "prod": "Samsung S25 Ultra",
        "sold": 85
      },
      {
        "sv": "Natural Ti 256",
        "prod": "iPhone 17 Pro",
        "sold": 73
      },
      {
        "sv": "Ti Blue 512",
        "prod": "Samsung S25 Ultra",
        "sold": 63
      }
    ]
  },
  "PH-RKW": {
    "name": "Rockwell",
    "city": "Makati",
    "todaySales": 2157750,
    "mtdSales": 53583780,
    "currentInv": 661,
    "lowAlerts": 0,
    "incomingStock": 0,
    "skus": [
      {
        "prod": "iPhone 17 Pro",
        "variant": "Natural Titanium 256GB",
        "sv": "Natural Ti 256",
        "price": 79990,
        "stock": 151,
        "soldToday": 7,
        "soldMtd": 150,
        "days": 30,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 5.0
      },
      {
        "prod": "iPhone 17 Pro",
        "variant": "Black Titanium 128GB",
        "sv": "Black Ti 128",
        "price": 92990,
        "stock": 130,
        "soldToday": 5,
        "soldMtd": 116,
        "days": 34,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 3.87
      },
      {
        "prod": "iPhone 17 Pro",
        "variant": "Desert Titanium 256GB",
        "sv": "Desert Ti 256",
        "price": 79990,
        "stock": 143,
        "soldToday": 4,
        "soldMtd": 134,
        "days": 32,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 4.47
      },
      {
        "prod": "Samsung S25 Ultra",
        "variant": "Titanium Black 256GB",
        "sv": "Ti Black 256",
        "price": 84990,
        "stock": 135,
        "soldToday": 5,
        "soldMtd": 121,
        "days": 33,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 4.03
      },
      {
        "prod": "Samsung S25 Ultra",
        "variant": "Titanium Blue 512GB",
        "sv": "Ti Blue 512",
        "price": 96990,
        "stock": 102,
        "soldToday": 4,
        "soldMtd": 101,
        "days": 30,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 3.37
      }
    ],
    "daily": [
      16,
      19,
      16,
      15,
      20,
      22,
      20,
      23,
      18,
      18,
      20,
      22,
      30,
      30
    ],
    "topSku": {
      "sv": "Natural Ti 256",
      "prod": "iPhone 17 Pro",
      "sold": 150
    },
    "sellThrough": 48,
    "reorder": [],
    "incoming": [],
    "outgoing": [
      {
        "to": "Greenhills",
        "sv": "Ti Black 256",
        "qty": 95,
        "status": "Dispatched"
      },
      {
        "to": "Glorietta",
        "sv": "Desert Ti 256",
        "qty": 52,
        "status": "Dispatched"
      }
    ],
    "cycle": {
      "pct": 60,
      "last": "Jun 11",
      "next": "Jun 18",
      "openVar": 3
    },
    "variance": [
      {
        "sv": "Desert Ti 256",
        "system": 143,
        "counted": 140,
        "diff": -3
      },
      {
        "sv": "Black Ti 128",
        "system": 130,
        "counted": 129,
        "diff": -1
      },
      {
        "sv": "Ti Blue 512",
        "system": 102,
        "counted": 100,
        "diff": -2
      }
    ],
    "movement": [
      {
        "time": "09:42",
        "type": "Transfer Out",
        "color": "#6ec6e6",
        "sv": "Desert Ti 256",
        "qty": -24
      },
      {
        "time": "10:15",
        "type": "Transfer Out",
        "color": "#6ec6e6",
        "sv": "Ti Blue 512",
        "qty": -51
      },
      {
        "time": "11:03",
        "type": "Adjustment",
        "color": "#a1a1aa",
        "sv": "Ti Black 256",
        "qty": 56
      },
      {
        "time": "12:30",
        "type": "Transfer Out",
        "color": "#6ec6e6",
        "sv": "Ti Blue 512",
        "qty": -28
      },
      {
        "time": "Yesterday",
        "type": "Adjustment",
        "color": "#a1a1aa",
        "sv": "Natural Ti 256",
        "qty": 42
      },
      {
        "time": "Yesterday",
        "type": "Receipt",
        "color": "#1a7a2e",
        "sv": "Natural Ti 256",
        "qty": 5
      }
    ],
    "topList": [
      {
        "sv": "Natural Ti 256",
        "prod": "iPhone 17 Pro",
        "sold": 150
      },
      {
        "sv": "Desert Ti 256",
        "prod": "iPhone 17 Pro",
        "sold": 134
      },
      {
        "sv": "Ti Black 256",
        "prod": "Samsung S25 Ultra",
        "sold": 121
      },
      {
        "sv": "Black Ti 128",
        "prod": "iPhone 17 Pro",
        "sold": 116
      },
      {
        "sv": "Ti Blue 512",
        "prod": "Samsung S25 Ultra",
        "sold": 101
      }
    ]
  },
  "PH-CNC": {
    "name": "Cash and Carry",
    "city": "Makati",
    "todaySales": 2935660,
    "mtdSales": 77027150,
    "currentInv": 1044,
    "lowAlerts": 0,
    "incomingStock": 0,
    "skus": [
      {
        "prod": "iPhone 17 Pro",
        "variant": "Natural Titanium 256GB",
        "sv": "Natural Ti 256",
        "price": 79990,
        "stock": 185,
        "soldToday": 7,
        "soldMtd": 159,
        "days": 35,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 5.3
      },
      {
        "prod": "iPhone 17 Pro",
        "variant": "Black Titanium 128GB",
        "sv": "Black Ti 128",
        "price": 92990,
        "stock": 137,
        "soldToday": 4,
        "soldMtd": 119,
        "days": 35,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 3.97
      },
      {
        "prod": "iPhone 17 Pro",
        "variant": "Desert Titanium 256GB",
        "sv": "Desert Ti 256",
        "price": 79990,
        "stock": 209,
        "soldToday": 7,
        "soldMtd": 178,
        "days": 35,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 5.93
      },
      {
        "prod": "Samsung S25 Ultra",
        "variant": "Titanium Black 256GB",
        "sv": "Ti Black 256",
        "price": 84990,
        "stock": 262,
        "soldToday": 9,
        "soldMtd": 217,
        "days": 36,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 7.23
      },
      {
        "prod": "Samsung S25 Ultra",
        "variant": "Titanium Blue 512GB",
        "sv": "Ti Blue 512",
        "price": 96990,
        "stock": 251,
        "soldToday": 7,
        "soldMtd": 212,
        "days": 36,
        "status": "Healthy",
        "color": "#22c55e",
        "run": 7.07
      }
    ],
    "daily": [
      22,
      22,
      27,
      22,
      31,
      27,
      29,
      31,
      28,
      29,
      34,
      29,
      32,
      38
    ],
    "topSku": {
      "sv": "Ti Black 256",
      "prod": "Samsung S25 Ultra",
      "sold": 217
    },
    "sellThrough": 46,
    "reorder": [],
    "incoming": [],
    "outgoing": [
      {
        "to": "Greenhills",
        "sv": "Desert Ti 256",
        "qty": 100,
        "status": "Dispatched"
      },
      {
        "to": "Ayala Avenue",
        "sv": "Natural Ti 256",
        "qty": 103,
        "status": "Picking"
      }
    ],
    "cycle": {
      "pct": 88,
      "last": "Jun 11",
      "next": "Jun 18",
      "openVar": 3
    },
    "variance": [
      {
        "sv": "Ti Black 256",
        "system": 262,
        "counted": 264,
        "diff": 2
      },
      {
        "sv": "Ti Blue 512",
        "system": 251,
        "counted": 248,
        "diff": -3
      },
      {
        "sv": "Natural Ti 256",
        "system": 185,
        "counted": 187,
        "diff": 2
      }
    ],
    "movement": [
      {
        "time": "09:42",
        "type": "Transfer In",
        "color": "#3aaa9e",
        "sv": "Natural Ti 256",
        "qty": 37
      },
      {
        "time": "10:15",
        "type": "Transfer In",
        "color": "#3aaa9e",
        "sv": "Desert Ti 256",
        "qty": 54
      },
      {
        "time": "11:03",
        "type": "Sale",
        "color": "#ef4444",
        "sv": "Ti Black 256",
        "qty": -1
      },
      {
        "time": "12:30",
        "type": "Transfer Out",
        "color": "#6ec6e6",
        "sv": "Ti Blue 512",
        "qty": -6
      },
      {
        "time": "Yesterday",
        "type": "Sale",
        "color": "#ef4444",
        "sv": "Ti Black 256",
        "qty": -1
      },
      {
        "time": "Yesterday",
        "type": "Transfer Out",
        "color": "#6ec6e6",
        "sv": "Ti Blue 512",
        "qty": -28
      }
    ],
    "topList": [
      {
        "sv": "Ti Black 256",
        "prod": "Samsung S25 Ultra",
        "sold": 217
      },
      {
        "sv": "Ti Blue 512",
        "prod": "Samsung S25 Ultra",
        "sold": 212
      },
      {
        "sv": "Desert Ti 256",
        "prod": "iPhone 17 Pro",
        "sold": 178
      },
      {
        "sv": "Natural Ti 256",
        "prod": "iPhone 17 Pro",
        "sold": 159
      },
      {
        "sv": "Black Ti 128",
        "prod": "iPhone 17 Pro",
        "sold": 119
      }
    ]
  }
}