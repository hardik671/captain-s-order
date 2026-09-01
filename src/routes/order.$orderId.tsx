import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ChefHat,
  MoreVertical,
  Receipt,
  Search,
  ShoppingCart,
  Star,
  Timer,
  Users,
} from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/captain/AppShell";
import { Chip, ChipRow } from "@/components/captain/Chip";
import { CartSheet } from "@/components/captain/CartSheet";
import { VariantSheet } from "@/components/captain/VariantSheet";
import { TableActionsSheet } from "@/components/captain/TableActionsSheet";
import { EmptyState } from "@/components/captain/States";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QtyStepper } from "@/components/captain/QtyStepper";
import { elapsed, inr } from "@/lib/captain/format";
import { currentRoundOf, orderTotals, useCaptain } from "@/lib/captain/store";
import type { MenuItem } from "@/lib/captain/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Order & Menu — BillerPe Captain" },
      {
        name: "description",
        content: "Build a table's order from the live menu, pick variants and addons, and fire the KOT round.",
      },
      { property: "og:title", content: "Order & Menu — BillerPe Captain" },
      { property: "og:description", content: "Table-side menu with a persistent cart bar and KOT firing." },
    ],
  }),
  component: OrderMenu,
});

function OrderMenu() {
  const { orderId } = Route.useParams();
  const { orderById, tableById, menu, categories, addLine, updateLineQty, fireKot, holdOrder, blocked } =
    useCaptain();
  const navigate = useNavigate();
  const order = orderById(orderId);
  const [categoryId, setCategoryId] = useState(categories[0]!.id);
  const [query, setQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [kotToast, setKotToast] = useState<{ round: number; items: number; stations: string[] } | null>(
    null,
  );

  const items = useMemo(
    () =>
      menu.filter((m) => {
        if (vegOnly && !m.veg) return false;
        if (query) return m.name.toLowerCase().includes(query.toLowerCase());
        return m.categoryId === categoryId;
      }),
    [menu, categoryId, query, vegOnly],
  );

  if (!order) {
    return (
      <AppShell header={<ScreenHeader title="Order" />}>
        <EmptyState icon={Receipt} title="Order not found" body="It may have been merged or settled." />
      </AppShell>
    );
  }

  const table = order.tableIds[0] ? tableById(order.tableIds[0]) : undefined;
  const round = currentRoundOf(order);
  const totals = orderTotals(order);
  const roundLines = round?.lines ?? [];
  const roundItems = roundLines.reduce((s, l) => s + l.qty, 0);
  const roundValue = roundLines.reduce((s, l) => s + l.qty * l.unitPrice, 0);

  const qtyInRound = (itemId: string) =>
    roundLines.filter((l) => l.itemId === itemId).reduce((s, l) => s + l.qty, 0);

  const tap = (item: MenuItem) => {
    if (blocked) return;
    if (item.variants?.length || item.addonGroups?.length) {
      setSheetItem(item);
      return;
    }
    addLine(order.id, { itemId: item.id, qty: 1, unitPrice: item.price, addons: [] });
  };

  const onFire = () => {
    const res = fireKot(order.id);
    if (!res) {
      toast.error("Add items before sending a KOT");
      return;
    }
    setCartOpen(false);
    setKotToast(res);
    setTimeout(() => setKotToast(null), 2600);
  };

  return (
    <AppShell
      hideNav
      header={
        <ScreenHeader
          title={
            order.type === "takeaway" ? `Take Away · ${order.customerName}` : `Table ${table?.name ?? "—"}`
          }
          subtitle={
            order.type === "takeaway"
              ? `${order.mobile} · ${elapsed(order.openedAt)}`
              : `${order.guests} guests · ${elapsed(order.openedAt)}${
                  order.tableIds.length > 1
                    ? ` · merged ${order.tableIds
                        .map((id) => tableById(id)?.name)
                        .filter(Boolean)
                        .join(" + ")}`
                    : ""
                }`
          }
          back={
            <Link to="/" className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          }
          right={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                aria-label="Bill preview"
                onClick={() => navigate({ to: "/bill/$orderId", params: { orderId: order.id } })}
              >
                <Receipt className="h-4 w-4" />
              </Button>
              {order.type === "dine-in" ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  aria-label="Table actions"
                  onClick={() => setActionsOpen(true)}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          }
        />
      }
    >
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the menu"
          className="h-12 pl-9"
        />
      </div>

      <ChipRow className="mt-3">
        <Chip active={vegOnly} onClick={() => setVegOnly(!vegOnly)}>
          Veg only
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.id}
            active={!query && categoryId === c.id}
            onClick={() => {
              setQuery("");
              setCategoryId(c.id);
            }}
          >
            {c.name}
          </Chip>
        ))}
      </ChipRow>

      <div className="mt-2 grid gap-2 pb-4 sm:grid-cols-2">
        {items.length === 0 ? (
          <div className="sm:col-span-2">
            <EmptyState icon={ChefHat} title="Nothing matches" body="Try another category or search term." />
          </div>
        ) : (
          items.map((item) => {
            const qty = qtyInRound(item.id);
            const configurable = Boolean(item.variants?.length || item.addonGroups?.length);
            return (
              <div
                key={item.id}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-card p-3",
                  qty > 0 ? "border-brand/40" : "border-border",
                )}
              >
                <button
                  type="button"
                  onClick={() => tap(item)}
                  className="min-w-0 text-left"
                  aria-label={`Add ${item.name}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid h-4 w-4 shrink-0 place-items-center rounded-[3px] border-2",
                        item.veg ? "border-veg" : "border-nonveg",
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", item.veg ? "bg-veg" : "bg-nonveg")} />
                    </span>
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    {item.favourite ? (
                      <Star className="h-3.5 w-3.5 shrink-0 fill-st-held text-st-held" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {inr(item.price)}
                    {configurable ? " · options" : ""} · {item.station}
                  </p>
                </button>
                {qty > 0 && !configurable ? (
                  <QtyStepper
                    size="sm"
                    value={qty}
                    onChange={(q) => {
                      const line = roundLines.find((l) => l.itemId === item.id);
                      if (!line) return;
                      if (q > qty)
                        addLine(order.id, { itemId: item.id, qty: 1, unitPrice: item.price, addons: [] });
                      else updateLineQty(order.id, line.id, q);
                    }}
                  />
                ) : (
                  <Button className="h-10" disabled={blocked} onClick={() => tap(item)}>
                    {qty > 0 ? `${qty} · Add` : "Add"}
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {roundItems > 0 ? (
          <motion.button
            type="button"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-3xl -translate-x-1/2 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-brand/20 bg-brand px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-brand-foreground"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-foreground/15">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-semibold">
                Round {round?.no} · {roundItems} item{roundItems === 1 ? "" : "s"}
              </span>
              <span className="block text-xs opacity-90">
                {inr(roundValue)} · order total {inr(totals.total)}
              </span>
            </span>
            <span className="rounded-full bg-brand-foreground/15 px-4 py-2 text-sm font-semibold">
              Review
            </span>
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {kotToast ? (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-16 left-1/2 z-40 w-[min(92vw,26rem)] -translate-x-1/2 rounded-3xl border border-st-free/30 bg-card p-4 text-center shadow-xl"
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-st-free-soft text-st-free">
              <ChefHat className="h-6 w-6" />
            </div>
            <p className="mt-2 font-bold">KOT round {kotToast.round} sent</p>
            <p className="text-sm text-muted-foreground">
              {kotToast.items} item{kotToast.items === 1 ? "" : "s"} routed to {kotToast.stations.join(", ")}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
              <Timer className="h-3 w-3" /> returning to menu
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <VariantSheet
        item={sheetItem}
        onClose={() => setSheetItem(null)}
        onAdd={(line) => addLine(order.id, line)}
      />
      <CartSheet
        order={order}
        open={cartOpen}
        onOpenChange={setCartOpen}
        onFire={onFire}
        onHold={() => {
          holdOrder(order.id);
          setCartOpen(false);
          toast.success("Order held — nothing sent to the kitchen");
          navigate({ to: "/" });
        }}
      />
      {order.type === "dine-in" ? (
        <TableActionsSheet order={order} open={actionsOpen} onOpenChange={setActionsOpen} />
      ) : null}

      {order.type === "dine-in" ? (
        <p className="mb-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
          <Users className="h-3 w-3" /> Any captain can act on any table — no table assignment in BillerPe.
        </p>
      ) : null}
    </AppShell>
  );
}
