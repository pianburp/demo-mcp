import { describe, expect, it } from "vitest";
import { MENU } from "./menu.js";
import { FakeModel } from "./model.js";
import { readOrder } from "./read-order.js";

const TODAY = "2026-11-04";
const MSG = "2 bekas tart nenas, ambil 25hb";

const goodOrder = {
  isOrder: true,
  items: [{ name: "Tart nenas", quantity: 2 }],
  pickupDate: "2026-11-25",
  notes: "",
  confidence: "high",
  draftReply: "Terima kasih! 2 bekas tart nenas, RM50. Ambil 25 Nov ya.",
};

const run = (answer: string) => readOrder(MSG, MENU, new FakeModel({ [MSG]: answer }), TODAY);

describe("readOrder", () => {
  it("turns good model output into an order", async () => {
    expect(await run(JSON.stringify(goodOrder))).toEqual({ ok: true, order: goodOrder, checkThis: false });
  });

  it("flags non-orders and low confidence for the owner", async () => {
    const r1 = await run(JSON.stringify({ ...goodOrder, isOrder: false, items: [] }));
    const r2 = await run(JSON.stringify({ ...goodOrder, confidence: "low" }));
    expect(r1.checkThis).toBe(true);
    expect(r2.checkThis).toBe(true);
  });

  // S2: bad output -> "Check this" set, empty draft, no order.
  it.each([
    ["bad_json", "not json {"],
    ["bad_shape", JSON.stringify({ ...goodOrder, items: [{ name: "Tart nenas", quantity: "dua" }] })],
    ["bad_shape", JSON.stringify({ ...goodOrder, pickupDate: "25hb" })],
  ])("returns %s with empty draft for bad output", async (reason, answer) => {
    expect(await run(answer)).toEqual({ ok: false, checkThis: true, draftReply: "", reason });
  });

  it("returns model_error when the model fails", async () => {
    const r = await readOrder("unknown message", MENU, new FakeModel({}), TODAY);
    expect(r).toEqual({ ok: false, checkThis: true, draftReply: "", reason: "model_error" });
  });
});
