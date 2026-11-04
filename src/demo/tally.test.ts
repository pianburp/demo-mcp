import { expect, it } from "vitest";
import type { StoredOrder } from "../core/order-store";
import { tally } from "./tally";

const order = (pickupDate: string | null, items: StoredOrder["items"]) => ({ pickupDate, items }) as StoredOrder;

it("sums items per pickup date, earliest first, and skips orders with no date", () => {
  expect(
    tally([
      order("2026-12-12", [{ name: "Kek lapis Sarawak", quantity: 2 }]),
      order("2026-11-07", [
        { name: "Kuih bangkit", quantity: 3 },
        { name: "Kek lapis Sarawak", quantity: 1 },
      ]),
      order("2026-11-07", [{ name: "Kuih bangkit", quantity: 2 }]),
      order(null, [{ name: "Tart nenas", quantity: 1 }]),
      order("2026-11-09", []),
    ]),
  ).toEqual([
    {
      date: "2026-11-07",
      items: [
        { name: "Kuih bangkit", quantity: 5 },
        { name: "Kek lapis Sarawak", quantity: 1 },
      ],
    },
    { date: "2026-12-12", items: [{ name: "Kek lapis Sarawak", quantity: 2 }] },
  ]);
});
