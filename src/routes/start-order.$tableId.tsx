import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/captain/AppShell";
import { QtyStepper } from "@/components/captain/QtyStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCaptain } from "@/lib/captain/store";
import { EmptyState } from "@/components/captain/States";

export const Route = createFileRoute("/start-order/$tableId")({
  head: () => ({
    meta: [
      { title: "Start Order — BillerPe Captain" },
      { name: "description", content: "Set guest count and open a new dine-in order for a free table." },
      { property: "og:title", content: "Start Order — BillerPe Captain" },
      { property: "og:description", content: "One-step guest count entry before the menu." },
    ],
  }),
  component: StartOrder,
});

function StartOrder() {
  const { tableId } = Route.useParams();
  const { tableById, areas, startOrder, blocked } = useCaptain();
  const navigate = useNavigate();
  const table = tableById(tableId);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");

  if (!table) {
    return (
      <AppShell header={<ScreenHeader title="Start order" />}>
        <EmptyState icon={Users} title="Table not found" />
      </AppShell>
    );
  }

  const area = areas.find((a) => a.id === table.areaId);

  return (
    <AppShell
      hideNav
      header={
        <ScreenHeader
          title={`Table ${table.name}`}
          subtitle={`${area?.name} · ${table.seats} seats`}
          back={
            <Link to="/" className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          }
        />
      }
    >
      <div className="rounded-3xl border border-border bg-card p-5 text-center">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          How many guests?
        </p>
        <div className="mt-4 flex justify-center">
          <QtyStepper value={guests} onChange={setGuests} min={1} size="lg" />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[2, 4, 6, 8].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setGuests(n)}
              className="rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium"
            >
              {n} pax
            </button>
          ))}
        </div>
      </div>

      {guests >= 5 ? (
        <div className="mt-4 space-y-1.5">
          <Label htmlFor="guest-name">Customer name (optional)</Label>
          <Input
            id="guest-name"
            className="h-12"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Shah party"
          />
        </div>
      ) : null}

      <Button
        className="mt-6 h-14 w-full text-base"
        disabled={blocked}
        onClick={() => {
          const order = startOrder({
            tableId,
            guests,
            ...(name.trim() ? { customerName: name.trim() } : {}),
          });
          navigate({ to: "/order/$orderId", params: { orderId: order.id } });
        }}
      >
        Open menu for {guests} guest{guests === 1 ? "" : "s"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </AppShell>
  );
}
