# Captain's Order

Build the **BillerPe Captain App** — a phone-first prototype for table-side order taking by

restaurant captains (waiters). This is a companion app to BillerPe's existing Web POS product, not

a standalone restaurant app — assume it talks to the same restaurant's live table/menu/order data.

IMPORTANT: This is a DESIGN + IMPLEMENTATION task, frontend-only, mock data, no real backend.

## CRITICAL SCOPE RULE

This app is **table-side ordering only**. It is deliberately NOT a full POS. Do not build payment

collection/settlement, reports, expenses, inventory, menu management, user management, or system

settings. Where those would naturally appear (e.g. a bill total), show the information read-only

and treat the action ("Settle Bill") as a clear hand-off point to a cashier/Web POS, never a

working payment flow. Full exclusion list is below.

## DESIGN DIRECTION

- Phone-first (captain carries this in one hand); make it also usable on a small tablet, but do

  not design tablet-first.

- One-handed reachability for the highest-frequency actions: add item to cart, fire KOT, back to

  table grid.

- Big tap targets, minimal typing. Quantity steppers, chips and toggles over text forms wherever

  the data allows it.

- Order-building uses a persistent bottom cart bar / bottom sheet pattern — never make the captain

  lose table context by navigating fully away from the menu while building an order.

- A slim always-visible connection-status strip (online/offline/syncing/sync-error/conflict/

  local-server-down/offline-limit-exceeded) at the top of every screen; only the local-server-down

  and offline-limit-exceeded states get a full blocking modal, matching how offline is treated as

  a core BillerPe differentiator, not an afterthought.

- Distinct, consistent status colors for table/order/KOT state used identically everywhere:

  Free, Held, Running, Bill Generated, Reserved (tables); Pending, Printed, Accepted, Preparing,

  Ready, Served, Cancelled (KOT).

- Brand: restrained light-first palette, BillerPe brand red as the primary action color, Lucide

  icons, subtle Framer Motion for state changes and confirmations only — never slow the flow down.

- Build a real design system first (buttons, inputs, chips, cards, bottom sheets, modals, toasts,

  status badges, empty/loading/error states) and reuse it consistently — do not design each screen

  as a one-off.

## SCREENS

Build all of the following. Preserve each screen's stated purpose and interactions.

### 1. Login

Password / OTP / PIN as three tabs or segmented options (all three are real, confirmed login

methods for this system — do not drop any). PIN is the fast path for a shared device mid-shift:

short numeric pad, remembers which captain last used this device for quick re-selection. Show

which hotel/outlet this device belongs to. Forgot-password path for the Password tab. No device

registration flow needed here (that belongs to Web POS terminals, not a personal captain handset).

### 2. Table Grid (Home)

The default landing screen after login. Category tabs across the top (by table area — e.g. AC

Hall, Garden, Rooftop). A responsive grid of table cards, each showing: table name, seats,

status color, guest count and elapsed time if occupied, and a small reserved-today indicator if

applicable. Search box for finding a table fast. Status filter chips (All/Free/Running/Bill

Generated/Reserved) — not "my tables," since there is no per-table staff assignment in this

system; every captain can act on every table. Tapping a Free table starts a new order; tapping an

occupied table opens its running order. Pull-to-refresh. Connection-status strip pinned above the

grid.

### 3. Start Order (new table)

Triggered from tapping a Free table. Quick guest-count stepper (and optional customer name for

larger parties), then proceeds straight into the Order & Menu screen for that table. Keep this to

one short step — do not turn it into a form.

### 4. Order & Menu

The core screen. Category rail (left on tablet, horizontal scroll on phone) plus a searchable item

grid/list. Each item card shows name, price, veg/non-veg indicator dot, favourite star, and an

image if present. Tapping a simple item increments a quantity stepper inline; tapping an item that

has variants/addons opens the Variant/Addon Selector sheet instead. A persistent bottom cart bar

shows running item count and subtotal and expands into the Cart Review sheet. Table name, guest

count and elapsed time stay visible in the header throughout.

### 5. Variant/Addon Selector (bottom sheet)

For items with variants and/or addon groups: radio selection for variant, addon groups rendered

per their min/max/single-or-multiple rule, quantity stepper, optional note field (e.g. "less

spicy"), Add to Cart action. Price updates live as selections change.

### 6. Cart Review (bottom sheet or full screen)

Lines grouped by KOT round: already-fired rounds are visually locked (grayed, no delete/qty

controls — editing a fired line is a permission-gated action in the real system, so the default

prototype state is "locked"), the current un-fired round is fully editable (qty, remove, note).

Running subtotal/tax/service-charge preview. Actions: Hold Order (save without firing), Send KOT

(fire the current round to the kitchen), Add More Items (back to menu).

### 7. KOT Sent Confirmation

Brief success state after firing a KOT round — round number, item count, station(s) it routed to.

Auto-dismisses back to the Order & Menu or Table Grid. This is a toast/animation moment, not a

full page the captain has to dismiss manually.

### 8. Order Status Tracker

A live list of all currently active orders/tables (again, not "mine only") with a per-KOT-round

status chip (Pending → Accepted → Preparing → Ready → Served) so a captain can tell at a glance

which tables have food ready to run out, without walking to the kitchen display. Read-only

visibility into kitchen state — this is not a full KDS and has no "mark ready" action here (that

belongs to kitchen staff).

### 9. Bill Preview / Request Bill

Read-only running total for a table's order: subtotal, tax, service charge, any discount already

applied, grand total. A single "Request Bill / Notify Cashier" action that flags the order for

settlement (updates order status toward Bill Generated) — it does **not** collect payment. Make

the hand-off explicit in the UI copy (e.g. "Cashier will settle this bill") so it reads as

intentional scope, not a missing feature.

### 10. Table Actions

Reachable from a table's order screen: Merge Table, Transfer Table, Edit Guest Count, Cancel

Order. Merge/Transfer must behave like the confirmed Web POS rules — combining or moving the

order's lines correctly, not just relabeling a table. No Split Table action anywhere in this app.

### 11. Take Away / Pickup

A separate quick-order entry point from the Table Grid (e.g. a persistent "+ Take Away" action)

that skips table selection entirely: capture customer name and mobile, then go straight into the

same Order & Menu / Cart / KOT flow used for dine-in.

### 12. My Orders / Today's Orders

A simple list of today's orders (dine-in and take-away), with table/customer, item count, amount,

and current status. Tapping one opens a read-only order detail (no editing from history — active

orders are edited via their live table, not from this list).

### 13. Reservations (read-only)

Today's upcoming table bookings: customer name, party size, table(s), time. View-only — creating

or editing a reservation is Web POS's job, not this app's.

### 14. Notifications

Item-ready pings, KOT accepted confirmations, a reservation arriving soon, and connection/sync

alerts. Simple read/unread list, tap to jump to the relevant table/order where applicable.

### 15. Profile

Captain's name and role, change-PIN action, logout, app version, and a lightweight Help/Support

entry (contact/FAQ, not a full ticketing system).

## OFFLINE / CONNECTION STATES

Support and visually distinguish all of: online, offline, syncing, sync-error, conflict,

local-server-down, offline-limit-exceeded. Only local-server-down and offline-limit-exceeded

should block new order actions with a clear modal explaining why (matching the system's real

3-day max-offline-duration policy) — every other state is a passive status strip, never a

blocking interruption.

## MOCK DATA

Centralized mock-data/service layer (one module other screens read/write through), not per-screen

hardcoded values. Restaurant: BillerPe Demo Restaurant, Indian cuisine (Gujarati/Punjabi/

North-Indian leaning), ₹ INR, DD/MM/YYYY dates. Seed 10-20 tables across 2-3 categories, a real

multi-category menu with variants and addon groups, several orders already at different KOT

stages (some fully served, some mid-round, one Ready-to-run), a couple of today's reservations,

and enough connected realism that the Table Grid, Order Status Tracker and My Orders screen all

tell the same consistent story. Actions must produce real mock-state changes: firing a KOT updates

that table's status and the Order Status Tracker together; requesting a bill moves the table

toward Bill Generated; merging tables actually combines their order lines.

## EXPLICIT EXCLUSIONS — do not build

Payment/settlement collection (cash/card/UPI/due, split payment), e-bill sending, reports,

dashboards/analytics, expenses, inventory, purchases, recipes, menu management (item/category/

variant/addon CRUD), user & permissions management, operations/system settings, printer settings,

audit log, sync-center administration, device management, reservation create/edit, Split Table,

Wallet, Gift Card, Loyalty, Membership, QR self-ordering, AI features, Multi-Outlet, Central

Kitchen, per-table staff assignment, Owner App, BillerPe POS Mobile. If in doubt, leave it out —

this is a focused ordering companion, not a second full POS.

## IMPLEMENTATION ORDER

1. Design system + app shell (bottom nav or equivalent phone-first navigation, connection strip)

2. Centralized mock data + mock services

3. Table Grid + Start Order

4. Order & Menu + Variant/Addon Selector + Cart Review + KOT firing

5. Order Status Tracker + Bill Preview/Request Bill + Table Actions (merge/transfer)

6. Take Away flow, My Orders, Reservations (read-only), Notifications, Profile

7. Cross-screen state sync (firing a KOT, merging a table, etc. reflects everywhere immediately)

8. Responsive polish (phone primary, small-tablet secondary)

9. Animation/micro-interaction and accessibility/contrast pass

10. Final consistency/QA pass

Do not stop after only the shell or a couple of representative screens — build the complete flow

in one pass.

## FINAL QUALITY BAR

Before considering this done, verify: all 15 screens exist and route correctly; every button does

a real mock action; mock data is connected and consistent across screens; firing a KOT, merging/

transferring a table, and requesting a bill all propagate visible state changes; offline states

render correctly; the app is genuinely usable one-handed on a phone; no excluded feature was

accidentally built; the design system is consistent screen-to-screen, not a pile of one-offs.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2135587b-1670-4963-b4c1-c7df0334ac3d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
