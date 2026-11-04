// Scores the order reader on the fake messages in evals/messages/.
//   npm run eval            -> FakeModel (free)
//   npm run eval -- --real  -> RealModel (costs money: ask Ahmad first, S6)
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MENU } from "../src/core/menu.js";
import { FakeModel, RealModel, type Model } from "../src/core/model.js";
import type { Order } from "../src/core/order-schema.js";
import { readOrder } from "../src/core/read-order.js";

// The messages were written as if sent on this day ("Sabtu ni" = 2026-11-07).
const TODAY = "2026-11-04";
const DIR = fileURLToPath(new URL("./messages/", import.meta.url));

type Case = { file: string; message: string; expected: Order };
const cases: Case[] = readdirSync(DIR)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((file) => ({ file, ...JSON.parse(readFileSync(DIR + file, "utf8")) }));

const real = process.argv.includes("--real");
const model: Model = real
  ? new RealModel()
  : new FakeModel(Object.fromEntries(cases.map((c) => [c.message, JSON.stringify(c.expected)])));
if (real) console.warn(`RealModel: sending ${cases.length} messages. This costs money.`);

const itemsKey = (o: Order) =>
  o.items.map((i) => `${i.name.toLowerCase()}x${i.quantity}`).sort().join(",");

const FIELDS = ["valid", "isOrder", "items", "pickupDate", "confidence", "notes", "draftReply"] as const;
type Field = (typeof FIELDS)[number];

function score(expected: Order, got: Order | null): Record<Field, boolean> {
  if (!got) return Object.fromEntries(FIELDS.map((f) => [f, false])) as Record<Field, boolean>;
  return {
    valid: true,
    isOrder: got.isOrder === expected.isOrder,
    items: itemsKey(got) === itemsKey(expected),
    pickupDate: got.pickupDate === expected.pickupDate,
    confidence: got.confidence === expected.confidence,
    // Free text: only check that a note is there when one is expected, and not otherwise.
    notes: (got.notes.trim() !== "") === (expected.notes.trim() !== ""),
    draftReply: got.draftReply.trim() !== "",
  };
}

const rows: Record<string, string>[] = [];
const totals = Object.fromEntries(FIELDS.map((f) => [f, 0])) as Record<Field, number>;

for (const c of cases) {
  const started = Date.now();
  const result = await readOrder(c.message, MENU, model, TODAY);
  const s = score(c.expected, result.ok ? result.order : null);
  for (const f of FIELDS) if (s[f]) totals[f]++;
  rows.push({
    case: c.file.replace(".json", ""),
    ...Object.fromEntries(FIELDS.map((f) => [f, s[f] ? "ok" : "FAIL"])),
    error: result.ok ? "" : result.reason,
    ms: String(Date.now() - started),
  });
}

console.table(rows);
const n = cases.length;
console.log(
  `Score (${real ? "RealModel" : "FakeModel"}): ` +
    FIELDS.map((f) => `${f} ${totals[f]}/${n}`).join(" | "),
);
