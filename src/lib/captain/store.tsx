import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  areas,
  captains,
  categories,
  menu,
  notifications as seedNotifications,
  orders as seedOrders,
  reservations,
  tables as seedTables,
  OUTLET,
} from "./seed";
import type {
  AppNotification,
  Captain,
  ConnectionState,
  KotStatus,
  Order,
  OrderLine,
  RestaurantTable,
  TableStatus,
} from "./types";

export const TAX_RATE = 0.05;
export const SERVICE_RATE = 0.05;

export type NewLineInput = {
  itemId: string;
  qty: number;
  variantName?: string | undefined;
  unitPrice: number;
  addons: { name: string; price: number }[];
  note?: string | undefined;
};

type State = {
  captain: Captain | null;
  restored: boolean;
  connection: ConnectionState;
  tables: RestaurantTable[];
  orders: Order[];
  notifications: AppNotification[];
};

type Ctx = State & {
  areas: typeof areas;
  categories: typeof categories;
  menu: typeof menu;
  reservations: typeof reservations;
  outlet: typeof OUTLET;
  captains: Captain[];
  login: (captain: Captain) => void;
  logout: () => void;
  setConnection: (c: ConnectionState) => void;
  blocked: boolean;
  orderForTable: (tableId: string) => Order | undefined;
  orderById: (id: string) => Order | undefined;
  tableById: (id: string) => RestaurantTable | undefined;
  startOrder: (input: { tableId: string; guests: number; customerName?: string }) => Order;
  startTakeaway: (input: { customerName: string; mobile: string }) => Order;
  addLine: (orderId: string, line: NewLineInput) => void;
  updateLineQty: (orderId: string, lineId: string, qty: number) => void;
  setLineNote: (orderId: string, lineId: string, note: string) => void;
  fireKot: (orderId: string) => { round: number; items: number; stations: string[] } | null;
  holdOrder: (orderId: string) => void;
  requestBill: (orderId: string) => void;
  setGuests: (orderId: string, guests: number) => void;
  cancelOrder: (orderId: string) => void;
  mergeTables: (sourceOrderId: string, targetTableId: string) => boolean;
  transferTable: (orderId: string, targetTableId: string) => boolean;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;
};

const CaptainContext = createContext<Ctx | null>(null);

const SESSION_KEY = "billerpe.captain.session";
const LAST_CAPTAIN_KEY = "billerpe.captain.last";

let uid = 1000;
const nextId = (prefix: string) => `${prefix}${++uid}`;

const statusForOrder = (order: Order): TableStatus => {
  if (order.status === "held") return "held";
  if (order.status === "billed") return "billed";
  return "running";
};

export function CaptainProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    captain: null,
    restored: false,
    connection: "online",
    tables: seedTables,
    orders: seedOrders,
    notifications: seedNotifications,
  });

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(SESSION_KEY) : null;
    if (raw) {
      const found = captains.find((c) => c.id === raw);
      if (found) {
        setState((s) => ({ ...s, captain: found, restored: true }));
        return;
      }
    }
    setState((s) => ({ ...s, restored: true }));
  }, []);

  const patch = useCallback((fn: (s: State) => State) => setState(fn), []);

  const syncTables = (tables: RestaurantTable[], orders: Order[]): RestaurantTable[] =>
    tables.map((t) => {
      const order = orders.find(
        (o) => o.tableIds.includes(t.id) && ["running", "held", "billed"].includes(o.status),
      );
      if (order) return { ...t, status: statusForOrder(order) };
      if (t.status === "reserved") return t;
      return { ...t, status: t.status === "free" ? "free" : "free" };
    });

  const value: Ctx = useMemo(() => {
    const orderForTable = (tableId: string) =>
      state.orders.find(
        (o) => o.tableIds.includes(tableId) && ["running", "held", "billed"].includes(o.status),
      );

    const updateOrders = (fn: (orders: Order[]) => Order[]) =>
      patch((s) => {
        const orders = fn(s.orders);
        return { ...s, orders, tables: syncTables(s.tables, orders) };
      });

    const currentRound = (order: Order) => order.rounds.find((r) => !r.firedAt);

    const withCurrentRound = (order: Order): Order => {
      if (currentRound(order)) return order;
      const no = order.rounds.length + 1;
      return {
        ...order,
        rounds: [...order.rounds, { no, status: "pending", stations: [], lines: [] }],
      };
    };

    return {
      ...state,
      areas,
      categories,
      menu,
      reservations,
      outlet: OUTLET,
      captains,
      blocked: state.connection === "local-server-down" || state.connection === "offline-limit-exceeded",
      login: (captain) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(SESSION_KEY, captain.id);
          window.localStorage.setItem(LAST_CAPTAIN_KEY, captain.id);
        }
        patch((s) => ({ ...s, captain }));
      },
      logout: () => {
        if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
        patch((s) => ({ ...s, captain: null }));
      },
      setConnection: (connection) => patch((s) => ({ ...s, connection })),
      orderForTable,
      orderById: (id) => state.orders.find((o) => o.id === id),
      tableById: (id) => state.tables.find((t) => t.id === id),
      startOrder: ({ tableId, guests, customerName }) => {
        const existing = orderForTable(tableId);
        if (existing) return existing;
        const order: Order = {
          id: nextId("o"),
          type: "dine-in",
          tableIds: [tableId],
          guests,
          customerName,
          openedAt: new Date().toISOString(),
          status: "running",
          discount: 0,
          rounds: [{ no: 1, status: "pending", stations: [], lines: [] }],
        };
        updateOrders((orders) => [...orders, order]);
        return order;
      },
      startTakeaway: ({ customerName, mobile }) => {
        const order: Order = {
          id: nextId("o"),
          type: "takeaway",
          tableIds: [],
          customerName,
          mobile,
          guests: 1,
          openedAt: new Date().toISOString(),
          status: "running",
          discount: 0,
          rounds: [{ no: 1, status: "pending", stations: [], lines: [] }],
        };
        updateOrders((orders) => [...orders, order]);
        return order;
      },
      addLine: (orderId, input) =>
        updateOrders((orders) =>
          orders.map((o) => {
            if (o.id !== orderId) return o;
            const prepared = withCurrentRound(o);
            const item = menu.find((m) => m.id === input.itemId)!;
            const signature = `${input.itemId}|${input.variantName ?? ""}|${input.addons
              .map((a) => a.name)
              .join(",")}|${input.note ?? ""}`;
            return {
              ...prepared,
              status: prepared.status === "held" ? "running" : prepared.status,
              rounds: prepared.rounds.map((r) => {
                if (r.firedAt) return r;
                const match = r.lines.find(
                  (l) =>
                    `${l.itemId}|${l.variantName ?? ""}|${l.addons.map((a) => a.name).join(",")}|${l.note ?? ""}` ===
                    signature,
                );
                if (match) {
                  return {
                    ...r,
                    lines: r.lines.map((l) => (l.id === match.id ? { ...l, qty: l.qty + input.qty } : l)),
                  };
                }
                const line: OrderLine = {
                  id: nextId("l"),
                  itemId: input.itemId,
                  name: item.name,
                  variantName: input.variantName,
                  addons: input.addons,
                  note: input.note,
                  qty: input.qty,
                  unitPrice: input.unitPrice + input.addons.reduce((sum, a) => sum + a.price, 0),
                  station: item.station,
                };
                return { ...r, lines: [...r.lines, line] };
              }),
            };
          }),
        ),
      updateLineQty: (orderId, lineId, qty) =>
        updateOrders((orders) =>
          orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  rounds: o.rounds.map((r) =>
                    r.firedAt
                      ? r
                      : {
                          ...r,
                          lines:
                            qty <= 0
                              ? r.lines.filter((l) => l.id !== lineId)
                              : r.lines.map((l) => (l.id === lineId ? { ...l, qty } : l)),
                        },
                  ),
                }
              : o,
          ),
        ),
      setLineNote: (orderId, lineId, note) =>
        updateOrders((orders) =>
          orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  rounds: o.rounds.map((r) =>
                    r.firedAt
                      ? r
                      : { ...r, lines: r.lines.map((l) => (l.id === lineId ? { ...l, note } : l)) },
                  ),
                }
              : o,
          ),
        ),
      fireKot: (orderId) => {
        const order = state.orders.find((o) => o.id === orderId);
        const round = order && currentRound(order);
        if (!order || !round || round.lines.length === 0) return null;
        const stations = Array.from(new Set(round.lines.map((l) => l.station)));
        const items = round.lines.reduce((sum, l) => sum + l.qty, 0);
        updateOrders((orders) =>
          orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "running",
                  rounds: o.rounds.map((r) =>
                    r.no === round.no
                      ? { ...r, firedAt: new Date().toISOString(), status: "printed" as KotStatus, stations }
                      : r,
                  ),
                }
              : o,
          ),
        );
        patch((s) => ({
          ...s,
          notifications: [
            {
              id: nextId("n"),
              kind: "kot-accepted",
              title: `KOT round ${round.no} sent`,
              body: `${items} item(s) routed to ${stations.join(", ")}.`,
              time: new Date().toISOString(),
              read: false,
              orderId,
            },
            ...s.notifications,
          ],
        }));
        return { round: round.no, items, stations };
      },
      holdOrder: (orderId) =>
        updateOrders((orders) => orders.map((o) => (o.id === orderId ? { ...o, status: "held" } : o))),
      requestBill: (orderId) =>
        updateOrders((orders) =>
          orders.map((o) =>
            o.id === orderId ? { ...o, status: "billed", billRequestedAt: new Date().toISOString() } : o,
          ),
        ),
      setGuests: (orderId, guests) =>
        updateOrders((orders) =>
          orders.map((o) => (o.id === orderId ? { ...o, guests: Math.max(1, guests) } : o)),
        ),
      cancelOrder: (orderId) =>
        updateOrders((orders) => orders.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))),
      mergeTables: (sourceOrderId, targetTableId) => {
        const source = state.orders.find((o) => o.id === sourceOrderId);
        const target = orderForTable(targetTableId);
        if (!source || !target || source.id === target.id) return false;
        updateOrders((orders) =>
          orders
            .map((o) => {
              if (o.id !== source.id) return o;
              const mergedRounds = [...o.rounds];
              target.rounds.forEach((tr) => {
                if (!tr.firedAt) {
                  const open = mergedRounds.find((r) => !r.firedAt);
                  if (open) {
                    open.lines = [...open.lines, ...tr.lines];
                    return;
                  }
                }
                mergedRounds.push({ ...tr, no: mergedRounds.length + 1 });
              });
              return {
                ...o,
                guests: o.guests + target.guests,
                tableIds: Array.from(new Set([...o.tableIds, ...target.tableIds])),
                rounds: mergedRounds.map((r, i) => ({ ...r, no: i + 1 })),
              };
            })
            .filter((o) => o.id !== target.id),
        );
        return true;
      },
      transferTable: (orderId, targetTableId) => {
        if (orderForTable(targetTableId)) return false;
        updateOrders((orders) =>
          orders.map((o) => (o.id === orderId ? { ...o, tableIds: [targetTableId] } : o)),
        );
        return true;
      },
      markNotificationRead: (id) =>
        patch((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsRead: () =>
        patch((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      unreadCount: state.notifications.filter((n) => !n.read).length,
    };
  }, [state, patch]);

  return <CaptainContext.Provider value={value}>{children}</CaptainContext.Provider>;
}

export function useCaptain() {
  const ctx = useContext(CaptainContext);
  if (!ctx) throw new Error("useCaptain must be used inside CaptainProvider");
  return ctx;
}

export function lastCaptainId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_CAPTAIN_KEY);
}

export function lineTotal(line: OrderLine) {
  return line.unitPrice * line.qty;
}

export function orderTotals(order: Order) {
  const subtotal = order.rounds.reduce(
    (sum, r) => sum + r.lines.reduce((s, l) => s + lineTotal(l), 0),
    0,
  );
  const tax = Math.round(subtotal * TAX_RATE);
  const service = Math.round(subtotal * SERVICE_RATE);
  const total = subtotal + tax + service - order.discount;
  const items = order.rounds.reduce((sum, r) => sum + r.lines.reduce((s, l) => s + l.qty, 0), 0);
  return { subtotal, tax, service, discount: order.discount, total, items };
}

export function currentRoundOf(order: Order) {
  return order.rounds.find((r) => !r.firedAt);
}
