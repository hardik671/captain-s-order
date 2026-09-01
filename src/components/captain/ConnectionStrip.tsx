import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Check,
  CloudOff,
  GitMerge,
  RefreshCw,
  ServerCrash,
  Timer,
  Wifi,
} from "lucide-react";
import { useCaptain } from "@/lib/captain/store";
import type { ConnectionState } from "@/lib/captain/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

const meta: Record<
  ConnectionState,
  { label: string; detail: string; icon: LucideIcon; cls: string }
> = {
  online: {
    label: "Online",
    detail: "Live with local server",
    icon: Wifi,
    cls: "bg-conn-online/12 text-conn-online",
  },
  offline: {
    label: "Offline",
    detail: "Orders saved on this device",
    icon: CloudOff,
    cls: "bg-conn-offline/12 text-conn-offline",
  },
  syncing: {
    label: "Syncing",
    detail: "Pushing pending actions",
    icon: RefreshCw,
    cls: "bg-conn-sync/15 text-conn-sync",
  },
  "sync-error": {
    label: "Sync error",
    detail: "Retrying — orders still safe",
    icon: AlertTriangle,
    cls: "bg-conn-error/12 text-conn-error",
  },
  conflict: {
    label: "Conflict",
    detail: "One order edited on another device",
    icon: GitMerge,
    cls: "bg-conn-sync/15 text-conn-sync",
  },
  "local-server-down": {
    label: "Local server down",
    detail: "New orders blocked",
    icon: ServerCrash,
    cls: "bg-conn-error/15 text-conn-error",
  },
  "offline-limit-exceeded": {
    label: "Offline limit reached",
    detail: "3-day offline maximum hit",
    icon: Timer,
    cls: "bg-conn-error/15 text-conn-error",
  },
};

const cycle: ConnectionState[] = [
  "online",
  "offline",
  "syncing",
  "sync-error",
  "conflict",
  "local-server-down",
  "offline-limit-exceeded",
];

export function ConnectionStrip() {
  const { connection, setConnection } = useCaptain();
  const m = meta[connection];
  const Icon = m.icon;

  return (
    <button
      type="button"
      onClick={() => setConnection(cycle[(cycle.indexOf(connection) + 1) % cycle.length]!)}
      className={cn(
        "flex w-full items-center gap-2 px-4 py-1.5 text-left text-[11px] font-medium",
        m.cls,
      )}
      aria-label={`Connection: ${m.label}. Tap to simulate next state.`}
    >
      <Icon className={cn("h-3.5 w-3.5 shrink-0", connection === "syncing" && "animate-spin")} />
      <span className="font-semibold">{m.label}</span>
      <span className="min-w-0 truncate opacity-80">· {m.detail}</span>
      <span className="ml-auto shrink-0 opacity-60">demo</span>
    </button>
  );
}

export function BlockingConnectionModal() {
  const { connection, setConnection, blocked } = useCaptain();
  const m = meta[connection];

  return (
    <AnimatePresence>
      {blocked ? (
        <Dialog open>
          <DialogContent className="max-w-sm rounded-3xl">
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <DialogHeader>
                <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
                  <m.icon className="h-6 w-6" />
                </div>
                <DialogTitle className="text-center">{m.label}</DialogTitle>
                <DialogDescription className="text-center">
                  {connection === "local-server-down"
                    ? "This handset can't reach the outlet's local BillerPe server, so new orders and KOTs are paused. Existing orders stay safe on the device."
                    : "This device has been offline past the 3-day maximum offline duration. Reconnect to the outlet network to sync before taking new orders."}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-2">
                <Button className="h-12 w-full" onClick={() => setConnection("syncing")}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Retry connection
                </Button>
                <Button
                  variant="ghost"
                  className="h-11 w-full"
                  onClick={() => setConnection("online")}
                >
                  <Check className="mr-2 h-4 w-4" /> Simulate recovery
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      ) : null}
    </AnimatePresence>
  );
}
