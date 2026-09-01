import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Bell, CalendarClock, LayoutGrid, RefreshCw, Search, ShoppingBag, Users } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/captain/AppShell";
import { Chip, ChipRow } from "@/components/captain/Chip";
import { EmptyState } from "@/components/captain/States";
import { StatusBadge, tableStatusMeta } from "@/components/captain/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { elapsed, inr } from "@/lib/captain/format";
import { orderTotals, useCaptain } from "@/lib/captain/store";
import type { TableStatus } from "@/lib/captain/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Table Grid — BillerPe Captain" },
      {
        name: "description",
        content:
          "Every table in the outlet with live status, guest count and elapsed time — tap to start or open an order.",
      },
      { property: "og:title", content: "Table Grid — BillerPe Captain" },
      {
        property: "og:description",
        content: "Live floor view for restaurant captains: free, running, held, billed and reserved tables.",
      },
    ],
  }),
  component: TableGrid,
});

const filters: ("all" | TableStatus)[] = ["all", "free", "running", "billed", "reserved"];

function TableGrid() {
  const { tables, areas, orderForTable, captain, unreadCount, blocked } = useCaptain();
  const navigate = useNavigate();
  const [area, setArea] = useState<string>("all");
  const [filter, setFilter] = useState<"all" | TableStatus>("all");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const shown = tables.filter((t) => {
    if (area !== "all" && t.areaId !== area) return false;
    if (filter !== "all" && t.status !== filter) return false;
    if (query && !t.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const openTable = (tableId: string) => {
    if (blocked) return;
    const order = orderForTable(tableId);
    if (order) navigate({ to: "/order/$orderId", params: { orderId: order.id } });
    else navigate({ to: "/start-order/$tableId", params: { tableId } });
  };

  return (
    <AppShell
      header={
        <ScreenHeader
          title="Tables"
          subtitle={captain ? `${captain.name} · ${captain.role}` : "BillerPe Demo Restaurant"}
          right={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="relative h-10 w-10"
                onClick={() => navigate({ to: "/notifications" })}
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[9px] font-bold text-brand-foreground">
                    {unreadCount}
                  </span>
                ) : null}
              </Button>
              <Button className="h-10" onClick={() => navigate({ to: "/takeaway" })}>
                <ShoppingBag className="mr-1.5 h-4 w-4" /> Take Away
              </Button>
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
          placeholder="Search table (A1, G3…)"
          className="h-12 pl-9"
          inputMode="search"
        />
      </div>

      <ChipRow className="mt-3">
        <Chip active={area === "all"} onClick={() => setArea("all")}>
          All areas
        </Chip>
        {areas.map((a) => (
          <Chip key={a.id} active={area === a.id} onClick={() => setArea(a.id)}>
            {a.name}
          </Chip>
        ))}
      </ChipRow>

      <ChipRow>
        {filters.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : tableStatusMeta[f].label}
          </Chip>
        ))}
      </ChipRow>

      <button
        type="button"
        onClick={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
            toast.success("Floor refreshed from local server");
          }, 700);
        }}
        className="mt-1 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
        {refreshing ? "Refreshing…" : "Pull to refresh"}
      </button>

      {shown.length === 0 ? (
        <EmptyState icon={LayoutGrid} title="No tables match" body="Try another area or filter." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shown.map((t) => {
            const order = orderForTable(t.id);
            const meta = tableStatusMeta[t.status];
            const totals = order ? orderTotals(order) : null;
            return (
              <motion.button
                key={t.id}
                layout
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => openTable(t.id)}
                className={cn(
                  "min-h-28 rounded-2xl border bg-card p-3 text-left",
                  order ? "border-transparent shadow-sm" : "border-border",
                )}
                style={{ borderLeftColor: `var(--st-${t.status})`, borderLeftWidth: order ? 4 : 1 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold">{t.name}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Users className="h-3 w-3" /> {order ? `${order.guests}/${t.seats}` : t.seats}
                    </p>
                  </div>
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", meta.dot)} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={t.status} />
                  {order ? (
                    <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                      {elapsed(order.openedAt)}
                    </span>
                  ) : null}
                </div>
                {totals ? (
                  <p className="mt-1.5 text-xs font-semibold tabular-nums">{inr(totals.total)}</p>
                ) : null}
                {t.reservedToday ? (
                  <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-st-reserved">
                    <CalendarClock className="h-3 w-3" /> Reserved {t.reservedToday}
                  </p>
                ) : null}
              </motion.button>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
