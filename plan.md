# WhatsApp orders — Saturday demo plan

> A customer types an order in a fake WhatsApp chat. The AI reads it. A row appears on the owner's dashboard with a draft reply. The owner edits it and taps Approve. Only then does the reply appear in the chat.

Status: Plan (4 Nov 2026)
Owner: Ahmad
Goal: a working demo to show Rizal (Inovetez) on Saturday 7 Nov 2026.
Time limit: **about 6–8 hours in total.** If it grows past this, stop and report.

This is a **demo**, not the real system. The real system is in `whatsapp-orders-plan.md`. Only the order reader (Phase 1 here) is meant to carry over.

This is a new project. It is not part of c-saver or c-check.

---

## 0. Read this first (for Claude Code)

1. Build **one phase at a time** (section 5). Stop at each phase's "Done when". Show the output. Then stop and report to Ahmad.
2. **If you are unsure, ask Ahmad.** Write the question, give 2–3 options with your pick, and wait.
3. Stack: TypeScript, Next.js (App Router), Tailwind, `zod`. One Next.js app. No database server, no queue, no Docker.
4. **Never call a real AI model in tests.** Use the fake model. A real-model run costs money: **ask Ahmad before every run**, and say how many messages it will send.
5. Prefer **integration tests** through the full path. Add a unit test only when an integration test cannot reach the case. Do not add tests that are not needed.
6. Before you say a phase is done, run `npm run typecheck && npm test`. One commit per phase, with a clear message.
7. Rules in section 3 are marked **safety** (keep forever) or **habit** (may retire later). Never weaken a safety rule to make a test pass. Ask Ahmad.
8. Keep the order reader free of Next.js imports. It must move to the real system's `packages/core` later with no changes.

---

## 1. What we are building

```
/chat (fake WhatsApp)          server                        /dashboard (owner)
┌──────────────────┐   send   ┌──────────────────────┐       ┌──────────────────────┐
│ customer types   │ ───────► │ order reader (AI)    │ ────► │ row: pending         │
│ "2 bekas tart    │          │ → zod check          │       │ items, qty, date     │
│  nenas, ambil    │          │ → save to store      │       │ draft reply (edit)   │
│  25hb"           │          └──────────────────────┘       │ [Approve]            │
│                  │                                          └──────────┬───────────┘
│ reply bubble ◄───┼────────────── only after Approve ───────────────────┘
└──────────────────┘
```

Two pages:
- `/chat` — looks like a WhatsApp chat. One fake customer at a time (pick from a short list).
- `/dashboard` — a table with the same columns as the real Sheet. The owner edits the draft and taps Approve.

## 2. Out of scope (do not build)

- Meta Cloud API, webhooks, signup, coexistence.
- Google Sheets.
- PostgreSQL, Redis, BullMQ, Docker, deploy.
- Login and user accounts.
- The 24-hour reply window.
- Payments, invoices, reports.

If something here starts to feel needed, stop and ask Ahmad.

---

## 3. Rules

| # | Rule | Kind |
| :- | :- | :- |
| S1 | Never show a reply in the chat unless Approve was tapped for that order. No auto-send. | safety |
| S2 | Validate the AI output with `zod` before saving. Bad output → row with "Check this" set and an empty draft. | safety |
| S3 | Fake data only. No real customer names, phone numbers or chats anywhere in the repo. | safety |
| S4 | Never log message text, names or phone numbers. Log IDs, counts, status and timings only. | safety |
| S5 | Never commit secrets. `.env.example` lists names only. | safety |
| S6 | Ask Ahmad before any paid real-model run. | safety |
| H1 | Keep AI prompts in `prompts/*.md`, not inline in code. | habit |
| H2 | Draft replies in the customer's own language mix (Malay, English, or both). | habit |
| H3 | Dashboard labels in Malay. | habit |
| H4 | One phase at a time, then stop and report. | habit |
| H5 | Integration tests first. Unit tests only where needed. | habit |

---

## 4. Ask Ahmad before deciding

Ask each one when its phase starts. Do not ask all at once.

1. Repo name. Keep it in Ahmad's own GitHub. No Inovetez name and no licence file yet. (Phase 1)
2. AI provider and model for the real run. Give 2–3 options with the cost for 10 messages. (Phase 1)
3. The menu for the fake shop: 5–8 kuih raya items with prices in MYR. Suggest one; Ahmad confirms. (Phase 1)

---

## 5. Build plan: 3 small phases

### Phase 1 — Order reader (carries over to the real system)

- Folder `src/core/` with no Next.js imports:
  - `order-schema.ts`: a `zod` schema. Fields: `isOrder` (boolean), `items` (name, quantity), `pickupDate` (string or null), `notes`, `confidence` (`high` / `low`), `draftReply`.
  - `model.ts`: a model interface with two versions — `FakeModel` (returns fixed answers by message) and `RealModel` (provider from section 4, key from env).
  - `read-order.ts`: message + menu → model → `zod` check → result. Bad output → `checkThis: true`, empty draft (S2).
- `prompts/read-order.md`: the prompt. It gets the menu and the message.
- `evals/messages/`: 10 **fake** messages with expected JSON. Mix Malay, English, short forms ("2 bekas tart nenas, ambil 25hb"), a typo, and two non-orders ("berapa harga?", "assalamualaikum").
- `evals/run.ts`: scores field by field and prints a table. Defaults to `FakeModel`. `--real` uses `RealModel`.
- Integration tests with `FakeModel`: good output → order result; bad JSON → "Check this" set, empty draft.

**Done when:** tests pass, and `evals/run.ts` runs with the fake model. **Then ask Ahmad** before one real run with `--real` (10 messages). Report the score table to him as it is. Do not tune the prompt after that run unless Ahmad says so.

### Phase 2 — Fake chat and dashboard

- `OrderStore` interface in `src/core/` with one version that saves to a JSON file in `data/` (git-ignored). The real system will swap this for PostgreSQL.
- `/chat`: WhatsApp-style bubbles. A dropdown to pick one of 3 fake customers. Sending a message calls the order reader and saves an order with status `pending`.
- `/dashboard`: a table with columns: Order ID, Diterima pada, Nama pelanggan, Barang dan kuantiti, Tarikh ambil, Nota, Semak ini, Draf balasan (editable), Lulus (button), Status.
- Approve: saves the edited draft, sets status `sent`, and the reply bubble appears in `/chat` for that customer (S1).
- Non-orders ("berapa harga?") get a row with "Semak ini" set, so the owner decides.
- The dashboard refreshes every few seconds. No websockets.
- Integration tests through the full path with `FakeModel`:
  - message → pending row → approve → reply appears in chat;
  - no approve → no reply in chat;
  - owner edits the draft → the edited text is what appears;
  - bad AI output → "Semak ini" set, empty draft, no reply;
  - log output has no message text or names (S4).

**Done when:** these tests pass, and Ahmad can do the full flow by hand in the browser with `FakeModel`.

### Phase 3 — Demo ready

- A clear banner on both pages: "DEMO — data palsu".
- `npm run seed`: loads 5 example orders in different states (pending, sent, Semak ini).
- `npm run demo:real`: starts the app with `RealModel`. Print a warning that this costs money.
- `docs/demo-script.md`: a 3-minute walkthrough in plain Malay for Rizal. Cover: customer sends an order, row appears, owner edits, Approve, reply appears. End with one slide-style list: "Yang demo ni tak buat lagi" (Meta WhatsApp, Google Sheet, multiple shops, hosting).
- `README.md`: what is real (the order reader) and what is fake (chat, store, no WhatsApp).

**Done when:** Ahmad runs the 3-minute walkthrough end to end, once with `FakeModel` and once with `RealModel` (after he says go).