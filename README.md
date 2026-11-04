# WhatsApp orders — demo

A customer types an order in a fake WhatsApp chat. The AI reads it. A row appears on the owner's dashboard with a draft reply. The owner edits it and taps Lulus (Approve). Only then does the reply appear in the chat.

**This is a demo with fake data.** The plan is in `plan.md`.

## What is real and what is fake

| Part | Real or fake |
| :- | :- |
| Order reader (`src/core/`, `prompts/read-order.md`) | **Real.** Moves to the real system as is. |
| AI model | `FakeModel` by default (fixed answers, free). `RealModel` calls Gemini (`gemini-3.8-flash`) and costs money. |
| Chat (`/chat`) | Fake. Looks like WhatsApp; no WhatsApp connection. |
| Store | Fake. One JSON file in `data/` (git-ignored). The real system uses PostgreSQL. |
| Customers and messages | Fake. No real names, phone numbers or chats. |

`FakeModel` knows only the 10 messages in `evals/messages/`. Any other message becomes a "Semak ini" row with an empty draft.

## Run

```
npm install
npm run seed        # replaces data/orders.json with 5 example orders
npm run dev         # FakeModel, free. Open /chat and /dashboard
npm run demo:real   # RealModel. Costs money per message. Needs GEMINI_API_KEY
```

The 3-minute walkthrough is in `docs/demo-script.md`.

## Check

```
npm run typecheck && npm test   # FakeModel only, never a paid call
npm run eval                    # order reader score table, FakeModel
npm run eval -- --real          # same, RealModel: 10 paid calls
```
