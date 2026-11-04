// Demo server logic behind the API routes. Not carried over to the real system.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { MENU } from "../core/menu";
import { FakeModel, type Model } from "../core/model";
import { JsonFileOrderStore, type OrderStore } from "../core/order-store";
import { readOrder } from "../core/read-order";
import { CUSTOMERS } from "./customers";

export type Bubble = { from: "customer" | "shop"; text: string; at: string };

export const SendSchema = z.object({
  customerId: z.string().refine((id) => CUSTOMERS.some((c) => c.id === id)),
  text: z.string().trim().min(1).max(1000),
});
export const ApproveSchema = z.object({
  id: z.string().min(1),
  reply: z.string().trim().min(1).max(2000),
});

// S4: IDs, counts, status and timings only. Never message text or names.
const log = (event: string, fields: Record<string, string | number | boolean>) =>
  console.log(JSON.stringify({ event, ...fields }));

const todayInMalaysia = (now: Date) => now.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });

export function createApp(store: OrderStore, model: Model, now = () => new Date()) {
  return {
    async receive({ customerId, text }: z.infer<typeof SendSchema>) {
      const started = Date.now();
      const receivedAt = now();
      const result = await readOrder(text, MENU, model, todayInMalaysia(receivedAt));
      const order = result.ok ? result.order : null;
      const saved = await store.add({
        receivedAt: receivedAt.toISOString(),
        customerId,
        customerName: CUSTOMERS.find((c) => c.id === customerId)!.name,
        message: text,
        items: order?.items ?? [],
        pickupDate: order?.pickupDate ?? null,
        notes: order?.notes ?? "",
        checkThis: result.checkThis,
        draftReply: order?.draftReply ?? "",
      });
      log("message_read", {
        orderId: saved.id,
        customerId,
        ok: result.ok,
        reason: result.ok ? "" : result.reason,
        checkThis: saved.checkThis,
        items: saved.items.length,
        ms: Date.now() - started,
      });
      return saved;
    },

    async approve({ id, reply }: z.infer<typeof ApproveSchema>) {
      const saved = await store.approve(id, reply, now().toISOString());
      log("order_approved", { orderId: id, ok: saved !== null });
      return saved;
    },

    orders: () => store.list(),

    // The customer's view: their messages, plus a reply only for approved orders (S1).
    async chat(customerId: string): Promise<Bubble[]> {
      const mine = (await store.list()).filter((o) => o.customerId === customerId);
      return mine
        .flatMap((o): Bubble[] => [
          { from: "customer", text: o.message, at: o.receivedAt },
          ...(o.status === "sent" && o.sentAt ? [{ from: "shop" as const, text: o.draftReply, at: o.sentAt }] : []),
        ])
        .sort((a, b) => a.at.localeCompare(b.at));
    },
  };
}

export type App = ReturnType<typeof createApp>;

// FakeModel answers the 10 eval messages; any other message gets "Semak ini" with an empty draft.
function fakeModelFromEvals(): Model {
  const dir = join(process.cwd(), "evals", "messages");
  const cases = readdirSync(dir).map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
  return new FakeModel(Object.fromEntries(cases.map((c) => [c.message, JSON.stringify(c.expected)])));
}

let app: App | undefined;

export function getApp(): App {
  app ??= createApp(new JsonFileOrderStore(join(process.cwd(), "data", "orders.json")), fakeModelFromEvals());
  return app;
}

// Tests use this to plug in their own store and model.
export function setApp(next: App) {
  app = next;
}
