// Full path through the API route handlers: chat -> order reader -> store -> dashboard -> approve -> chat.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as approveRoute } from "../app/api/approve/route";
import { GET as chatRoute } from "../app/api/chat/route";
import { POST as messagesRoute } from "../app/api/messages/route";
import { GET as ordersRoute } from "../app/api/orders/route";
import { FakeModel } from "../core/model";
import { JsonFileOrderStore, type StoredOrder } from "../core/order-store";
import { createApp, setApp, type Bubble } from "./app";
import { CUSTOMERS } from "./customers";

const ORDER_MSG = "2 bekas tart nenas, ambil 25hb";
const BAD_MSG = "nak order kuih";
const DRAFT = "Terima kasih! 2 bekas tart nenas, RM50. Ambil 25 Nov ya.";

const model = new FakeModel({
  [ORDER_MSG]: JSON.stringify({
    isOrder: true,
    items: [{ name: "Tart nenas", quantity: 2 }],
    pickupDate: "2026-11-25",
    notes: "",
    confidence: "high",
    draftReply: DRAFT,
  }),
  [BAD_MSG]: "Sure! Here is the order: {",
});

const post = (body: unknown) =>
  new Request("http://test/api", { method: "POST", body: JSON.stringify(body) });

async function send(text: string, customerId = "c1") {
  const res = await messagesRoute(post({ customerId, text }));
  expect(res.status).toBe(201);
  return ((await res.json()) as { id: string }).id;
}
const orders = async () => (await (await ordersRoute()).json()) as StoredOrder[];
const chat = async (customerId = "c1") =>
  (await (await chatRoute(new Request(`http://test/api/chat?customerId=${customerId}`))).json()) as Bubble[];
const approve = (id: string, reply: string) => approveRoute(post({ id, reply }));
const shopReplies = async (customerId = "c1") =>
  (await chat(customerId)).filter((b) => b.from === "shop").map((b) => b.text);

beforeEach(() => {
  let t = Date.parse("2026-11-04T02:00:00Z");
  const file = join(mkdtempSync(join(tmpdir(), "orders-")), "orders.json");
  setApp(createApp(new JsonFileOrderStore(file), model, () => new Date((t += 1000))));
});

afterEach(() => vi.restoreAllMocks());

describe("chat -> dashboard -> approve", () => {
  it("message makes a pending row; approve puts the reply in the chat", async () => {
    const id = await send(ORDER_MSG);

    const [row] = await orders();
    expect(row).toMatchObject({
      id,
      customerName: CUSTOMERS[0].name,
      items: [{ name: "Tart nenas", quantity: 2 }],
      pickupDate: "2026-11-25",
      checkThis: false,
      draftReply: DRAFT,
      status: "pending",
    });

    expect((await approve(id, DRAFT)).status).toBe(200);
    expect((await orders())[0].status).toBe("sent");
    expect((await chat()).map((b) => [b.from, b.text])).toEqual([
      ["customer", ORDER_MSG],
      ["shop", DRAFT],
    ]);
    // Only to that customer.
    expect(await shopReplies("c2")).toEqual([]);
  });

  // S1
  it("no approve -> no reply in the chat", async () => {
    await send(ORDER_MSG);
    expect(await shopReplies()).toEqual([]);
  });

  it("the owner's edited draft is what the customer sees", async () => {
    const id = await send(ORDER_MSG);
    await approve(id, "Boleh! Siap 25hb, RM50 ya kak.");
    expect(await shopReplies()).toEqual(["Boleh! Siap 25hb, RM50 ya kak."]);
  });

  it("cannot approve twice or with an empty reply", async () => {
    const id = await send(ORDER_MSG);
    expect((await approve(id, "  ")).status).toBe(400);
    expect((await approve(id, DRAFT)).status).toBe(200);
    expect((await approve(id, "lagi sekali")).status).toBe(409);
    expect(await shopReplies()).toEqual([DRAFT]);
  });

  // S2
  it("bad AI output -> Semak ini, empty draft, no reply", async () => {
    await send(BAD_MSG);
    const [row] = await orders();
    expect(row).toMatchObject({ checkThis: true, draftReply: "", items: [], status: "pending" });
    expect(await shopReplies()).toEqual([]);
  });

  // S4
  it("logs have no message text or names", async () => {
    const lines: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => void lines.push(args.join(" ")));
    vi.spyOn(console, "error").mockImplementation((...args) => void lines.push(args.join(" ")));

    const id = await send(ORDER_MSG);
    await send(BAD_MSG, "c2");
    await approve(id, "Boleh kak Ani, siap 25hb.");

    const logged = lines.join("\n");
    expect(lines.length).toBeGreaterThan(0);
    for (const secret of [ORDER_MSG, BAD_MSG, DRAFT, "Boleh kak Ani", "tart nenas", ...CUSTOMERS.map((c) => c.name)]) {
      expect(logged.toLowerCase()).not.toContain(secret.toLowerCase());
    }
  });
});
