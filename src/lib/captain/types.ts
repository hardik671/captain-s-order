export type TableStatus = "free" | "held" | "running" | "billed" | "reserved";
export type KotStatus =
  | "pending"
  | "printed"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";
export type ConnectionState =
  | "online"
  | "offline"
  | "syncing"
  | "sync-error"
  | "conflict"
  | "local-server-down"
  | "offline-limit-exceeded";

export type TableArea = { id: string; name: string };

export type RestaurantTable = {
  id: string;
  name: string;
  areaId: string;
  seats: number;
  status: TableStatus;
  reservedToday?: string | undefined;
  mergedInto?: string | undefined;
};

export type AddonOption = { id: string; name: string; price: number };
export type AddonGroup = {
  id: string;
  name: string;
  min: number;
  max: number;
  multiple: boolean;
  options: AddonOption[];
};
export type Variant = { id: string; name: string; price: number };

export type MenuCategory = { id: string; name: string };

export type MenuItem = {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  veg: boolean;
  favourite?: boolean | undefined;
  station: string;
  variants?: Variant[] | undefined;
  addonGroups?: AddonGroup[] | undefined;
};

export type OrderLine = {
  id: string;
  itemId: string;
  name: string;
  variantName?: string | undefined;
  addons: { name: string; price: number }[];
  note?: string | undefined;
  qty: number;
  unitPrice: number;
  station: string;
};

export type KotRound = {
  no: number;
  firedAt?: string | undefined;
  status: KotStatus;
  stations: string[];
  lines: OrderLine[];
};

export type Order = {
  id: string;
  type: "dine-in" | "takeaway";
  tableIds: string[];
  customerName?: string | undefined;
  mobile?: string | undefined;
  guests: number;
  openedAt: string;
  status: "running" | "held" | "billed" | "cancelled" | "settled";
  discount: number;
  rounds: KotRound[];
  billRequestedAt?: string | undefined;
};

export type Reservation = {
  id: string;
  customerName: string;
  partySize: number;
  tableIds: string[];
  time: string;
  mobile: string;
};

export type AppNotification = {
  id: string;
  kind: "item-ready" | "kot-accepted" | "reservation" | "sync";
  title: string;
  body: string;
  time: string;
  read: boolean;
  orderId?: string | undefined;
};

export type Captain = { id: string; name: string; role: string; pin: string };
