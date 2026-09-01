import type {
  AddonGroup,
  AppNotification,
  Captain,
  MenuCategory,
  MenuItem,
  Order,
  Reservation,
  RestaurantTable,
  TableArea,
} from "./types";

export const OUTLET = {
  name: "BillerPe Demo Restaurant",
  outlet: "Satellite Branch, Ahmedabad",
  deviceName: "Captain Handset #04",
};

export const areas: TableArea[] = [
  { id: "ac", name: "AC Hall" },
  { id: "garden", name: "Garden" },
  { id: "rooftop", name: "Rooftop" },
];

export const captains: Captain[] = [
  { id: "c1", name: "Rahul Mehta", role: "Captain", pin: "1234" },
  { id: "c2", name: "Priya Shah", role: "Captain", pin: "2345" },
  { id: "c3", name: "Imran Qureshi", role: "Senior Captain", pin: "3456" },
];

export const tables: RestaurantTable[] = [
  { id: "t1", name: "A1", areaId: "ac", seats: 4, status: "running" },
  { id: "t2", name: "A2", areaId: "ac", seats: 4, status: "free" },
  { id: "t3", name: "A3", areaId: "ac", seats: 2, status: "running" },
  { id: "t4", name: "A4", areaId: "ac", seats: 6, status: "billed" },
  { id: "t5", name: "A5", areaId: "ac", seats: 4, status: "free", reservedToday: "20:30" },
  { id: "t6", name: "A6", areaId: "ac", seats: 8, status: "held" },
  { id: "t7", name: "G1", areaId: "garden", seats: 4, status: "running" },
  { id: "t8", name: "G2", areaId: "garden", seats: 4, status: "free" },
  { id: "t9", name: "G3", areaId: "garden", seats: 2, status: "free" },
  { id: "t10", name: "G4", areaId: "garden", seats: 6, status: "reserved", reservedToday: "21:00" },
  { id: "t11", name: "G5", areaId: "garden", seats: 4, status: "free" },
  { id: "t12", name: "R1", areaId: "rooftop", seats: 4, status: "running" },
  { id: "t13", name: "R2", areaId: "rooftop", seats: 4, status: "free" },
  { id: "t14", name: "R3", areaId: "rooftop", seats: 2, status: "free" },
  { id: "t15", name: "R4", areaId: "rooftop", seats: 10, status: "free" },
  { id: "t16", name: "R5", areaId: "rooftop", seats: 4, status: "free" },
];

export const categories: MenuCategory[] = [
  { id: "starters", name: "Starters" },
  { id: "punjabi", name: "Punjabi Main" },
  { id: "gujarati", name: "Gujarati Thali" },
  { id: "breads", name: "Breads" },
  { id: "rice", name: "Rice & Biryani" },
  { id: "beverages", name: "Beverages" },
  { id: "desserts", name: "Desserts" },
];

const spiceGroup: AddonGroup = {
  id: "g-spice",
  name: "Spice Level",
  min: 1,
  max: 1,
  multiple: false,
  options: [
    { id: "mild", name: "Mild", price: 0 },
    { id: "medium", name: "Medium", price: 0 },
    { id: "spicy", name: "Extra Spicy", price: 0 },
  ],
};

const extrasGroup: AddonGroup = {
    id: "g-extras",
    name: "Extras",
    min: 0,
    max: 3,
    multiple: true,
    options: [
      { id: "butter", name: "Extra Butter", price: 25 },
      { id: "cheese", name: "Cheese Topping", price: 45 },
      { id: "cream", name: "Malai Swirl", price: 30 },
    ],
};

const spiceNote: AddonGroup[] = [spiceGroup, extrasGroup];

export const menu: MenuItem[] = [
  {
    id: "m1",
    name: "Paneer Tikka",
    categoryId: "starters",
    price: 280,
    veg: true,
    favourite: true,
    station: "Tandoor",
    variants: [
      { id: "half", name: "Half (6 pc)", price: 280 },
      { id: "full", name: "Full (10 pc)", price: 420 },
    ],
    addonGroups: spiceNote,
  },
  {
    id: "m2",
    name: "Hara Bhara Kebab",
    categoryId: "starters",
    price: 240,
    veg: true,
    station: "Tandoor",
  },
  {
    id: "m3",
    name: "Chilli Paneer Dry",
    categoryId: "starters",
    price: 260,
    veg: true,
    station: "Chinese",
    addonGroups: [spiceGroup],
  },
  {
    id: "m4",
    name: "Chicken Tikka",
    categoryId: "starters",
    price: 330,
    veg: false,
    station: "Tandoor",
    variants: [
      { id: "half", name: "Half (6 pc)", price: 330 },
      { id: "full", name: "Full (10 pc)", price: 520 },
    ],
  },
  {
    id: "m5",
    name: "Paneer Butter Masala",
    categoryId: "punjabi",
    price: 320,
    veg: true,
    favourite: true,
    station: "Main Kitchen",
    addonGroups: spiceNote,
  },
  {
    id: "m6",
    name: "Dal Makhani",
    categoryId: "punjabi",
    price: 260,
    veg: true,
    station: "Main Kitchen",
    addonGroups: [extrasGroup],
  },
  {
    id: "m7",
    name: "Kadai Vegetable",
    categoryId: "punjabi",
    price: 290,
    veg: true,
    station: "Main Kitchen",
  },
  {
    id: "m8",
    name: "Butter Chicken",
    categoryId: "punjabi",
    price: 420,
    veg: false,
    station: "Main Kitchen",
    variants: [
      { id: "half", name: "Half", price: 420 },
      { id: "full", name: "Full", price: 620 },
    ],
    addonGroups: spiceNote,
  },
  {
    id: "m9",
    name: "Gujarati Unlimited Thali",
    categoryId: "gujarati",
    price: 360,
    veg: true,
    favourite: true,
    station: "Thali Counter",
    variants: [
      { id: "reg", name: "Regular", price: 360 },
      { id: "spl", name: "Special (with sweet)", price: 450 },
    ],
  },
  {
    id: "m10",
    name: "Kathiyawadi Thali",
    categoryId: "gujarati",
    price: 390,
    veg: true,
    station: "Thali Counter",
  },
  { id: "m11", name: "Undhiyu (Seasonal)", categoryId: "gujarati", price: 280, veg: true, station: "Thali Counter" },
  { id: "m12", name: "Tandoori Roti", categoryId: "breads", price: 35, veg: true, station: "Tandoor" },
  {
    id: "m13",
    name: "Butter Naan",
    categoryId: "breads",
    price: 60,
    veg: true,
    favourite: true,
    station: "Tandoor",
  },
  { id: "m14", name: "Garlic Naan", categoryId: "breads", price: 75, veg: true, station: "Tandoor" },
  { id: "m15", name: "Missi Roti", categoryId: "breads", price: 50, veg: true, station: "Tandoor" },
  {
    id: "m16",
    name: "Veg Biryani",
    categoryId: "rice",
    price: 290,
    veg: true,
    station: "Main Kitchen",
    addonGroups: [spiceGroup],
  },
  { id: "m17", name: "Jeera Rice", categoryId: "rice", price: 180, veg: true, station: "Main Kitchen" },
  {
    id: "m18",
    name: "Hyderabadi Chicken Biryani",
    categoryId: "rice",
    price: 380,
    veg: false,
    station: "Main Kitchen",
    variants: [
      { id: "half", name: "Half", price: 380 },
      { id: "full", name: "Full", price: 560 },
    ],
  },
  {
    id: "m19",
    name: "Masala Chaas",
    categoryId: "beverages",
    price: 60,
    veg: true,
    favourite: true,
    station: "Beverage",
  },
  {
    id: "m20",
    name: "Sweet Lassi",
    categoryId: "beverages",
    price: 90,
    veg: true,
    station: "Beverage",
    variants: [
      { id: "glass", name: "Glass", price: 90 },
      { id: "jug", name: "Jug", price: 240 },
    ],
  },
  { id: "m21", name: "Masala Soda", categoryId: "beverages", price: 70, veg: true, station: "Beverage" },
  { id: "m22", name: "Filter Coffee", categoryId: "beverages", price: 80, veg: true, station: "Beverage" },
  { id: "m23", name: "Gulab Jamun (2 pc)", categoryId: "desserts", price: 110, veg: true, station: "Dessert" },
  { id: "m24", name: "Shrikhand", categoryId: "desserts", price: 130, veg: true, station: "Dessert" },
  {
    id: "m25",
    name: "Gajar Halwa",
    categoryId: "desserts",
    price: 150,
    veg: true,
    station: "Dessert",
    addonGroups: [
      {
        id: "g-scoop",
        name: "Add Ice Cream",
        min: 0,
        max: 1,
        multiple: false,
        options: [{ id: "vanilla", name: "Vanilla Scoop", price: 60 }],
      },
    ],
  },
];

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

const line = (
  id: string,
  itemId: string,
  qty: number,
  extras: Partial<Order["rounds"][number]["lines"][number]> = {},
) => {
  const item = menu.find((m) => m.id === itemId)!;
  return {
    id,
    itemId,
    name: item.name,
    addons: [],
    qty,
    unitPrice: item.price,
    station: item.station,
    ...extras,
  };
};

export const orders: Order[] = [
  {
    id: "o1",
    type: "dine-in",
    tableIds: ["t1"],
    guests: 4,
    openedAt: minutesAgo(52),
    status: "running",
    discount: 0,
    rounds: [
      {
        no: 1,
        firedAt: minutesAgo(50),
        status: "served",
        stations: ["Tandoor", "Beverage"],
        lines: [line("l1", "m1", 1, { variantName: "Full (10 pc)", unitPrice: 420 }), line("l2", "m19", 4)],
      },
      {
        no: 2,
        firedAt: minutesAgo(14),
        status: "ready",
        stations: ["Main Kitchen", "Tandoor"],
        lines: [line("l3", "m5", 1), line("l4", "m13", 4), line("l5", "m6", 1)],
      },
    ],
  },
  {
    id: "o2",
    type: "dine-in",
    tableIds: ["t3"],
    guests: 2,
    openedAt: minutesAgo(23),
    status: "running",
    discount: 0,
    rounds: [
      {
        no: 1,
        firedAt: minutesAgo(20),
        status: "preparing",
        stations: ["Thali Counter"],
        lines: [line("l6", "m9", 2, { variantName: "Special (with sweet)", unitPrice: 450 })],
      },
    ],
  },
  {
    id: "o3",
    type: "dine-in",
    tableIds: ["t4"],
    guests: 6,
    openedAt: minutesAgo(96),
    status: "billed",
    discount: 100,
    billRequestedAt: minutesAgo(6),
    rounds: [
      {
        no: 1,
        firedAt: minutesAgo(92),
        status: "served",
        stations: ["Main Kitchen", "Tandoor"],
        lines: [line("l7", "m8", 1, { variantName: "Full", unitPrice: 620 }), line("l8", "m13", 6)],
      },
      {
        no: 2,
        firedAt: minutesAgo(40),
        status: "served",
        stations: ["Dessert"],
        lines: [line("l9", "m23", 3), line("l10", "m24", 2)],
      },
    ],
  },
  {
    id: "o4",
    type: "dine-in",
    tableIds: ["t6"],
    guests: 8,
    openedAt: minutesAgo(9),
    status: "held",
    discount: 0,
    rounds: [
      {
        no: 1,
        status: "pending",
        stations: [],
        lines: [line("l11", "m2", 2), line("l12", "m20", 2, { variantName: "Jug", unitPrice: 240 })],
      },
    ],
  },
  {
    id: "o5",
    type: "dine-in",
    tableIds: ["t7"],
    guests: 3,
    openedAt: minutesAgo(31),
    status: "running",
    discount: 0,
    rounds: [
      {
        no: 1,
        firedAt: minutesAgo(29),
        status: "served",
        stations: ["Chinese"],
        lines: [line("l13", "m3", 1)],
      },
      {
        no: 2,
        firedAt: minutesAgo(4),
        status: "accepted",
        stations: ["Main Kitchen"],
        lines: [line("l14", "m16", 2), line("l15", "m17", 1)],
      },
    ],
  },
  {
    id: "o6",
    type: "dine-in",
    tableIds: ["t12"],
    guests: 4,
    openedAt: minutesAgo(17),
    status: "running",
    discount: 0,
    rounds: [
      {
        no: 1,
        firedAt: minutesAgo(15),
        status: "preparing",
        stations: ["Tandoor", "Main Kitchen"],
        lines: [line("l16", "m4", 1, { variantName: "Half (6 pc)", unitPrice: 330 }), line("l17", "m18", 1, { variantName: "Full", unitPrice: 560 })],
      },
    ],
  },
  {
    id: "o7",
    type: "takeaway",
    tableIds: [],
    customerName: "Nirav Patel",
    mobile: "98250 41122",
    guests: 1,
    openedAt: minutesAgo(65),
    status: "settled",
    discount: 0,
    rounds: [
      {
        no: 1,
        firedAt: minutesAgo(63),
        status: "served",
        stations: ["Thali Counter"],
        lines: [line("l18", "m10", 2)],
      },
    ],
  },
  {
    id: "o8",
    type: "takeaway",
    tableIds: [],
    customerName: "Sneha Joshi",
    mobile: "99099 33221",
    guests: 1,
    openedAt: minutesAgo(11),
    status: "running",
    discount: 0,
    rounds: [
      {
        no: 1,
        firedAt: minutesAgo(10),
        status: "ready",
        stations: ["Tandoor", "Main Kitchen"],
        lines: [line("l19", "m5", 1), line("l20", "m14", 2)],
      },
    ],
  },
];

export const reservations: Reservation[] = [
  {
    id: "r1",
    customerName: "Deshmukh Family",
    partySize: 6,
    tableIds: ["t10"],
    time: "21:00",
    mobile: "98795 11223",
  },
  {
    id: "r2",
    customerName: "Ankit Trivedi",
    partySize: 4,
    tableIds: ["t5"],
    time: "20:30",
    mobile: "97250 88112",
  },
  {
    id: "r3",
    customerName: "Shah Anniversary",
    partySize: 10,
    tableIds: ["t15"],
    time: "21:45",
    mobile: "90999 74100",
  },
];

export const notifications: AppNotification[] = [
  {
    id: "n1",
    kind: "item-ready",
    title: "Food ready — Table A1",
    body: "Round 2 (3 items) is ready to run out.",
    time: minutesAgo(2),
    read: false,
    orderId: "o1",
  },
  {
    id: "n2",
    kind: "item-ready",
    title: "Take Away ready — Sneha Joshi",
    body: "Round 1 packed and ready at counter.",
    time: minutesAgo(3),
    read: false,
    orderId: "o8",
  },
  {
    id: "n3",
    kind: "kot-accepted",
    title: "KOT accepted — Table G1",
    body: "Main Kitchen accepted round 2.",
    time: minutesAgo(4),
    read: false,
    orderId: "o5",
  },
  {
    id: "n4",
    kind: "reservation",
    title: "Reservation arriving soon",
    body: "Ankit Trivedi, 4 guests, table A5 at 20:30.",
    time: minutesAgo(18),
    read: true,
  },
  {
    id: "n5",
    kind: "sync",
    title: "Sync completed",
    body: "12 offline actions pushed to the local server.",
    time: minutesAgo(35),
    read: true,
  },
];
