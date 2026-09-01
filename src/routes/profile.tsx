import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck, Store, Wifi } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/captain/AppShell";
import { Button } from "@/components/ui/button";
import { orderTotals, useCaptain } from "@/lib/captain/store";
import { inr } from "@/lib/captain/format";
import type { ConnectionState } from "@/lib/captain/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Captain Profile — BillerPe Captain" },
      {
        name: "description",
        content: "Captain shift summary, outlet details, connection simulator and secure logout.",
      },
      { property: "og:title", content: "Captain Profile — BillerPe Captain" },
      { property: "og:description", content: "Shift stats and app settings for the captain on duty." },
    ],
  }),
  component: Profile,
});

const states: { id: ConnectionState; label: string }[] = [
  { id: "online", label: "Online" },
  { id: "syncing", label: "Syncing" },
  { id: "offline", label: "Offline" },
  { id: "sync-error", label: "Sync error" },
  { id: "conflict", label: "Conflict" },
  { id: "local-server-down", label: "Local server down" },
  { id: "offline-limit-exceeded", label: "Offline limit" },
];

function Profile() {
  const { captain, logout, orders, connection, setConnection, outlet } = useCaptain();
  const navigate = useNavigate();

  const mine = orders.filter((o) => o.status !== "cancelled");
  const sales = mine.reduce((s, o) => s + orderTotals(o).total, 0);
  const rounds = mine.reduce((s, o) => s + o.rounds.filter((r) => r.firedAt).length, 0);

  return (
    <AppShell header={<ScreenHeader title="Profile" subtitle="Shift summary and app settings" />}>
      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-lg font-bold text-brand-foreground">
            {captain?.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{captain?.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {captain?.role} · ID {captain?.id}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Orders" value={String(mine.length)} />
          <Stat label="KOT rounds" value={String(rounds)} />
          <Stat label="Sales" value={inr(sales)} />
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Store className="h-4 w-4 text-brand" /> {outlet.name}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{outlet.outlet}</p>
        <p className="mt-1 text-xs text-muted-foreground">Device {outlet.deviceName}</p>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-st-free" /> Menu, tables and bookings sync from the BillerPe
          Web POS.
        </p>
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Wifi className="h-4 w-4 text-brand" /> Connection simulator
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Prototype control to preview every sync and offline state.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {states.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setConnection(s.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                connection === s.id
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-secondary text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="mt-4 h-12 w-full text-destructive"
        onClick={() => {
          logout();
          navigate({ to: "/login" });
        }}
      >
        <LogOut className="mr-2 h-4 w-4" /> Log out
      </Button>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary px-2 py-3">
      <p className="truncate text-sm font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
