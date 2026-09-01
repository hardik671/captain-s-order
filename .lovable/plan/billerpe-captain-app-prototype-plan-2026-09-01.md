# BillerPe Captain App — Prototype Plan

Phone-first, frontend-only prototype for table-side order taking. Mock data only, no backend, no payment collection.

## Foundation

1. **Design system** — BillerPe red primary on a restrained light palette, semantic tokens in `src/styles.css` (table statuses: Free / Held / Running / Bill Generated / Reserved; KOT statuses: Pending / Printed / Accepted / Preparing / Ready / Served / Cancelled). Reusable pieces: button, chip, quantity stepper, card, status badge, bottom sheet, modal, toast, empty/loading/error states. Lucide icons, restrained Framer Motion (state changes and confirmations only).
2. **App shell** — bottom nav (Tables, Orders, Status, Alerts, Profile), always-visible slim connection strip, safe-area aware, big tap targets, primary actions in the lower thumb zone.
3. **Mock data + services** — one central store module (React context + reducer) all screens read/write through. BillerPe Demo Restaurant, Indian menu, INR, DD/MM/YYYY. 16 tables across AC Hall / Garden / Rooftop, multi-category menu with variants and addon groups, several in-flight orders at different KOT stages (one Ready-to-run), 2 reservations, notifications. Actions mutate this shared state so every screen updates together.

## Screens (all 15)

- **Login** — Password / OTP / PIN segmented tabs, numeric PIN pad remembering the last captain on the device, outlet name shown, forgot-password path.
- **Table Grid (home)** — area tabs, status filter chips, search, pull-to-refresh, per-table seats/guests/elapsed time/reserved-today dot, persistent "+ Take Away" action.
- **Start Order** — single-step guest-count stepper plus optional name, then straight into the menu.
- **Order & Menu** — category rail (horizontal on phone, vertical on tablet), searchable item grid, veg dot, favourite star, inline steppers, persistent bottom cart bar, table context pinned in header.
- **Variant/Addon sheet** — variant radios, addon groups honouring min/max/single-multi rules, qty stepper, note field, live price.
- **Cart Review** — lines grouped by KOT round; fired rounds locked/grayed, current round editable; subtotal/tax/service preview; Hold Order, Send KOT, Add More Items.
- **KOT Sent confirmation** — animated toast with round number, item count, routed stations; auto-dismiss.
- **Order Status Tracker** — all active tables with per-round status chips, read-only (no mark-ready).
- **Bill Preview / Request Bill** — read-only totals, single "Request Bill / Notify Cashier" action moving the table to Bill Generated, copy that makes the cashier hand-off explicit.
- **Table Actions** — Merge Table (actually combines order lines), Transfer Table (moves the order), Edit Guest Count, Cancel Order. No Split Table.
- **Take Away** — name + mobile, then the same menu/cart/KOT flow.
- **My Orders (today)** — dine-in and take-away list with status, tap for read-only detail.
- **Reservations** — today's bookings, view-only.
- **Notifications** — read/unread list, tap through to the relevant table/order.
- **Profile** — name/role, change PIN, logout, version, Help/Support.

## Offline handling

Connection strip renders online / offline / syncing / sync-error / conflict / local-server-down / offline-limit-exceeded. Only the last two block new order actions with an explaining modal (3-day max offline policy); the rest stay passive. A dev-only state switcher lets all states be demoed.

## Out of scope (not built)

Payments/settlement, split payment, e-bill, reports, dashboards, expenses, inventory, menu/user/settings CRUD, printer settings, audit log, device management, reservation create/edit, Split Table, wallet/gift card/loyalty, QR ordering, AI, multi-outlet, per-table staff assignment.

## Technical notes

TanStack Start file routes under `src/routes` (one file per screen, each with its own `head()` metadata); `/` becomes the Table Grid, with an auth-gate redirect to `/login` when no mock session exists. Global state via a context store in `src/lib/captain-store` plus mock service functions; no Cloud/backend enabled. Final pass verifies routing, real mock actions, cross-screen propagation, one-handed reach, contrast, and that no excluded feature slipped in.
