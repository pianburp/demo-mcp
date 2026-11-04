# WhatsApp orders demo — Polish pass (Phase 3b)

> Make the demo look real and calm. The chat must feel like WhatsApp on a phone. The dashboard must feel like a quiet work tool, not a template.

Status: Plan (4 Nov 2026)
Owner: Ahmad
Builds on: `whatsapp-orders-demo-plan.md`. All its rules still hold.
Time limit: **about 3 hours.** If it grows past this, stop and report.

---

## 0. Read this first (for Claude Code)

1. Do not change `src/core/` logic, the prompt, or the `zod` schema unless a step below says "ask Ahmad". This pass is about looks and wording.
2. All integration tests must still pass. Do not add new tests for looks. The screenshot loop (section 1) is the check.
3. Do not use the generic "frontend design" approach. Follow the specs and the ban list here. When this file and your taste disagree, this file wins.
4. If a reference screenshot and this file disagree, **the screenshot wins**.
5. One commit per part (A, B, C). Run `npm run typecheck && npm test` before each.

---

## 1. How you check your work (do this every round)

1. Ahmad puts reference screenshots in `design/ref/`:
   - `wa-chat.png`: a real WhatsApp chat with a business, on his phone.
   - `wa-input.png`: the same chat with text typed in the box (send button showing).
2. **Before you write code**, look at the reference images. Write a short list of what you see: colours, font sizes, bubble shape, spacing, header layout, icons. Show Ahmad this list.
3. Add Playwright as a dev dependency. Write `scripts/shots.ts`. It saves screenshots to `design/shots/`:
   - `/chat` at 390 × 844 (phone)
   - `/dashboard` at 1440 × 900 (laptop)
4. After each change: take shots. Open the reference and your shot. List the 5 biggest differences. Fix them.
5. Stop after 3 rounds, or when you cannot find a clear difference. Show Ahmad the final shots next to the references.

---

## 2. Ban list (applies to both pages)

Do not use any of these:

- Coloured left borders on cards.
- Pill badges for status or warnings.
- A separate card for each order.
- Coloured numbers in a row of stats.
- Green "live" dots.
- Warning triangle icons.
- Gradients, glow, or more than one soft shadow level.
- Large corner rounding everywhere (`rounded-2xl`, `rounded-3xl`).
- More than one accent colour.
- Decorative patterns that are not in the reference.
- An icon next to every label.
- Huge padding and empty space around small content.
- Display or "rounded geometric" fonts.

---

## Part A — Chat page (`/chat`)

### What to remove

- The phone frame (black bezel).
- The fake status bar (time, signal, battery). It also clashes with the message times.
- The "Lihat sebagai" dropdown.
- The fake wallpaper pattern (diamonds, stars).

### Layout

- On a phone: the chat fills the whole screen. It should look like the real app.
- On a laptop: one column, 420 px wide, full height, centred. Plain grey page behind it. No bezel.
- Choose the customer with a URL: `/chat?as=ani`, `/chat?as=badrul`, `/chat?as=siti`. Add a plain page at `/` with three links, plus a link to `/dashboard`.
- Run the dev server on the local network (`next dev -H 0.0.0.0`) so Ahmad can open `/chat` on his real phone during the demo. Print the phone URL in the terminal.

### Look (copy the reference first; use these only as a fallback)

| Part | Spec |
| :- | :- |
| Font | System font stack: `-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. Nothing else. |
| Chat background | `#EFEAE2`, plain. No pattern. |
| Customer bubble (sent, right) | `#D9FDD3` |
| Shop bubble (received, left) | `#FFFFFF` |
| Bubble shape | Corner radius about 7.5 px. Max width about 80%. Small shadow: `0 1px 0.5px rgba(11,20,26,.13)`. |
| Bubble tail | Only on the **first** bubble in a group from the same sender. |
| Spacing | 2 px between bubbles in a group. About 10 px between groups. |
| Time in bubble | 11 px, `#667781`, bottom right, sits on the last text line when it fits. |
| Ticks | Grey double tick when sent. Blue (`#53BDEB`) when the order has been opened on the dashboard. |
| Date chip | Small, centred, "Hari ini". Match the reference. |
| Header and input bar | Match the reference exactly: layout, icon size, colours. |

### Behaviour

- The mic button turns into a send arrow when the box has text. Enter sends.
- After the owner taps Lulus, show "sedang menaip…" under the shop name for about 1 second. Then show the reply bubble.
- Times use the real clock, in the same format as the reference.
- Do not show the WhatsApp logo or the word "WhatsApp" anywhere. Keep the demo banner (see Part C).

---

## Part B — Dashboard (`/dashboard`)

### Direction

A quiet work tool. Think of the Google Sheet the owner will get later, made clean. Dense, readable, calm. The story for Rizal: **messy chat in, clean order list out.**

### Layout (laptop)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Kedai Kuih Raya · Pesanan                       Dikemas kini 3:06 PTG     │
│ 4 menunggu kelulusan                                                      │
├───────────────────────────────────────────────┬───────────────────────────┤
│ Masa   Pelanggan   Pesanan          Ambil  RM │  Kak Ani                  │
│ 10:05  Kak Ani     3 × Kuih bangkit Sab 7  105│  "Hi, nak order 3 bekas…" │
│                    1 × Kek lapis              │                           │
│ 10:45  Kak Ani     Soalan harga     —      —  │  Dibaca AI                │
│ 10:50  En. Badrul  Tak pasti:       —      —  │  3 × Kuih bangkit  RM60   │
│                    "yang biasa"               │  1 × Kek lapis     RM45   │
│ ...                                           │  Ambil: Sabtu 7 Nov       │
│                                               │                           │
│                                               │  Draf balasan             │
│                                               │  [ editable text      ]   │
│                                               │  [ Lulus & hantar ]       │
└───────────────────────────────────────────────┴───────────────────────────┘
```

- **Left: one table.** One row per order. Columns: Masa, Pelanggan, Pesanan, Ambil, Jumlah (RM), Status.
  - Items on separate lines: `3 × Kuih bangkit`.
  - Numbers and times use tabular figures (`font-variant-numeric: tabular-nums`). RM is right-aligned.
  - Rows that need a decision come first. Sent rows go below, in grey.
  - Click a row to open it in the right panel. The selected row has a light grey background.
- **Right: detail panel**, fixed width about 420 px.
  - The customer's message as plain quoted text. No bubble, no pattern.
  - What the AI read: items with line prices, pickup date, notes.
  - The draft reply in a text box.
  - One button: "Lulus & hantar". If the draft is empty, the button is disabled and a line of grey text says why: "Tulis balasan dulu."
- **Top: one line of summary.** Only "X menunggu kelulusan". No other stats. Last update time in small grey text on the right.

### Wording for "check this" rows

Replace the "Semak ini" pill with a short reason in plain text, in the Pesanan cell:

- Not an order → "Soalan, bukan pesanan".
- Low confidence → "Tak pasti: …" plus the unclear words.
- AI output failed → "AI gagal baca. Sila semak mesej."

Use the amber colour **only for this text**. No amber backgrounds.

### Look

| Part | Spec |
| :- | :- |
| Font | Same system font stack as the chat. |
| Size | Table 14 px. Labels 12 px grey. Page title 20 px, weight 600. |
| Colours | White and greys. One accent: green `#008069`, only for the main button and the "Dihantar" status text. Amber `#B26B00` only for "Tak pasti" text. |
| Lines | 1 px `#E9EDEF` row lines. No card borders, no shadows on rows. |
| Corners | 6 px on buttons and text boxes. Nothing rounder. |
| Status | Plain text: "Menunggu" (grey), "Dihantar" (green). No pills. |

### Ask Ahmad before doing these (they change `src/core/` or the prompt)

1. **Reason field.** Add an optional `reason` string to the order schema, so "Tak pasti: 'yang biasa'" comes from the AI. Without it, show the generic reason only.
2. **Clarifying drafts.** When the AI is unsure (for example "yang biasa tu satu ya"), it should draft a short question back ("Yang biasa tu kuih apa ya kak?") instead of leaving the draft empty. This changes the prompt.
3. **Tally box (optional).** A small box under the table: "Untuk dibuat", grouped by pickup date, with totals per item. Example: "Sabtu 7 Nov: Kuih bangkit 3 bekas, Kek lapis 1 biji." This is the owner's real daily pain. It costs about 30–45 minutes.

---

## Part C — Small fixes on both pages

- Demo banner: one slim line, about 28 px tall, dark grey background, white 12 px text: "DEMO — data palsu". Not bright red.
- Fake customer names lose the "(palsu)" suffix. The banner already says the data is fake.
- "Tiada barang dikesan dalam mesej ini" → "—" in the table.
- "Belum pasti" → "—".
- All dashboard labels stay in Malay.

---

## Done when

1. `npm run typecheck && npm test` pass.
2. `design/shots/` has the final phone chat shot and laptop dashboard shot.
3. Ahmad has seen them next to `design/ref/` and says the chat looks like real WhatsApp.
4. Nothing from the ban list (section 2) appears on either page.
5. Ahmad has opened `/chat` on his real phone and sent one order that showed up on the laptop dashboard.