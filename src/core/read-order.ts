import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { MenuItem } from "./menu.js";
import type { Model } from "./model.js";
import { OrderSchema, type Order } from "./order-schema.js";

export type ReadOrderResult =
  | { ok: true; order: Order; checkThis: boolean }
  // S2: bad or missing AI output never becomes an order or a draft.
  | { ok: false; checkThis: true; draftReply: ""; reason: "model_error" | "bad_json" | "bad_shape" };

const PROMPT_PATH = fileURLToPath(new URL("../../prompts/read-order.md", import.meta.url));

export function buildPrompt(menu: MenuItem[], today: string): string {
  const menuText = menu.map((m) => `- ${m.name} (RM${m.priceRm} / ${m.unit})`).join("\n");
  return readFileSync(PROMPT_PATH, "utf8").replace("{{menu}}", menuText).replace("{{today}}", today);
}

// today is YYYY-MM-DD, so "25hb" or "Sabtu ni" can be turned into a real date.
export async function readOrder(
  message: string,
  menu: MenuItem[],
  model: Model,
  today: string,
): Promise<ReadOrderResult> {
  const bad = (reason: "model_error" | "bad_json" | "bad_shape") =>
    ({ ok: false, checkThis: true, draftReply: "", reason }) as const;

  let raw: string;
  try {
    raw = await model.complete({ system: buildPrompt(menu, today), message });
  } catch {
    return bad("model_error");
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return bad("bad_json");
  }

  const parsed = OrderSchema.safeParse(json);
  if (!parsed.success) return bad("bad_shape");

  const order = parsed.data;
  // Non-orders and unsure readings go to the owner to decide.
  return { ok: true, order, checkThis: !order.isOrder || order.confidence === "low" };
}
