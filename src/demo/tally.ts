import type { StoredOrder } from "../core/order-store";

export type TallyDay = { date: string; items: { name: string; quantity: number }[] };

// "Untuk dibuat": item totals per pickup date, earliest date first.
// Counts waiting and sent orders, since both still need baking. Orders with no date are left out.
// shortcut: past dates stay in the list, filter them once the demo runs over several days.
export function tally(orders: StoredOrder[]): TallyDay[] {
  const days = new Map<string, Map<string, number>>();
  for (const o of orders) {
    if (!o.pickupDate) continue;
    const day = days.get(o.pickupDate) ?? new Map<string, number>();
    for (const i of o.items) day.set(i.name, (day.get(i.name) ?? 0) + i.quantity);
    if (day.size) days.set(o.pickupDate, day);
  }
  return [...days]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({ date, items: [...items].map(([name, quantity]) => ({ name, quantity })) }));
}
