import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Delete, KeyRound, Lock, Smartphone, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lastCaptainId, useCaptain } from "@/lib/captain/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConnectionStrip } from "@/components/captain/ConnectionStrip";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Captain Login — BillerPe Captain" },
      {
        name: "description",
        content: "Sign in to BillerPe Captain with password, OTP or a quick PIN on a shared handset.",
      },
      { property: "og:title", content: "Captain Login — BillerPe Captain" },
      { property: "og:description", content: "Password, OTP or PIN login for restaurant captains." },
    ],
  }),
  component: LoginScreen,
});

type Mode = "pin" | "password" | "otp";

function LoginScreen() {
  const { captains, captain, login, outlet } = useCaptain();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("pin");
  const [selectedId, setSelectedId] = useState(captains[0]!.id);
  const [pin, setPin] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const last = lastCaptainId();
    if (last && captains.some((c) => c.id === last)) setSelectedId(last);
  }, [captains]);

  useEffect(() => {
    if (captain) navigate({ to: "/", replace: true });
  }, [captain, navigate]);

  const selected = captains.find((c) => c.id === selectedId)!;

  const finish = (who = selected) => {
    login(who);
    toast.success(`Welcome, ${who.name}`);
    navigate({ to: "/", replace: true });
  };

  const press = (digit: string) => {
    const next = (pin + digit).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      if (next === selected.pin) finish();
      else {
        toast.error("Wrong PIN — try again");
        setTimeout(() => setPin(""), 250);
      }
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <ConnectionStrip />
      <div className="flex flex-1 flex-col px-5 pt-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-lg font-bold text-brand-foreground">
            Bp
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold">BillerPe Captain</h1>
            <p className="truncate text-xs text-muted-foreground">Table-side ordering</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-border bg-card p-3">
          <Store className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div className="min-w-0 text-xs">
            <p className="truncate font-semibold">{outlet.name}</p>
            <p className="truncate text-muted-foreground">
              {outlet.outlet} · {outlet.deviceName}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-1 rounded-full bg-secondary p-1">
          {(
            [
              ["pin", "PIN", KeyRound],
              ["password", "Password", Lock],
              ["otp", "OTP", Smartphone],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold transition",
                mode === value ? "bg-card text-brand shadow-sm" : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {mode === "pin" ? (
          <div className="mt-5 flex flex-1 flex-col">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Who's on shift?
            </p>
            <div className="no-scrollbar -mx-5 mt-2 flex gap-2 overflow-x-auto px-5">
              {captains.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(c.id);
                    setPin("");
                  }}
                  className={cn(
                    "shrink-0 rounded-2xl border px-3 py-2 text-left",
                    selectedId === c.id ? "border-brand bg-brand-soft" : "border-border bg-card",
                  )}
                >
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {c.role}
                    {lastCaptainId() === c.id ? " · last used" : ""}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  animate={{ scale: pin.length === i + 1 ? [1, 1.25, 1] : 1 }}
                  className={cn(
                    "h-3.5 w-3.5 rounded-full",
                    i < pin.length ? "bg-brand" : "bg-border",
                  )}
                />
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Demo PIN for {selected.name}: {selected.pin}
            </p>

            <div className="mx-auto mt-6 grid w-full max-w-xs grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <PadKey key={d} onClick={() => press(d)}>
                  {d}
                </PadKey>
              ))}
              <PadKey onClick={() => setPin("")} muted>
                Clear
              </PadKey>
              <PadKey onClick={() => press("0")}>0</PadKey>
              <PadKey onClick={() => setPin(pin.slice(0, -1))} muted>
                <Delete className="h-5 w-5" />
              </PadKey>
            </div>
          </div>
        ) : null}

        {mode === "password" ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              finish();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="mobile">Mobile / Username</Label>
              <Input id="mobile" className="h-12" defaultValue="rahul.mehta" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" className="h-12" defaultValue="demo1234" />
            </div>
            <Button type="submit" className="h-13 w-full text-base">
              Sign in
            </Button>
            <button
              type="button"
              className="w-full text-center text-sm font-medium text-brand"
              onClick={() => toast.info("Reset link sent to the registered mobile number")}
            >
              Forgot password?
            </button>
          </form>
        ) : null}

        {mode === "otp" ? (
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="otp-mobile">Mobile number</Label>
              <Input id="otp-mobile" className="h-12" defaultValue="+91 98250 11223" />
            </div>
            {otpSent ? (
              <div className="space-y-1.5">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input id="otp" className="h-12 tracking-[0.4em]" defaultValue="1234" />
              </div>
            ) : null}
            <Button
              className="h-13 w-full text-base"
              onClick={() => (otpSent ? finish() : (setOtpSent(true), toast.success("OTP sent")))}
            >
              {otpSent ? "Verify & sign in" : "Send OTP"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PadKey({
  children,
  onClick,
  muted,
}: {
  children: React.ReactNode;
  onClick: () => void;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid h-16 place-items-center rounded-2xl border border-border text-xl font-semibold transition active:scale-95",
        muted ? "bg-secondary text-sm text-muted-foreground" : "bg-card",
      )}
    >
      {children}
    </button>
  );
}
