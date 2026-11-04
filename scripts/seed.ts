// npm run seed: replaces data/orders.json with 6 fake example orders in different states.
import { rmSync } from "node:fs";
import { JsonFileOrderStore, type NewOrder } from "../src/core/order-store";
import { DATA_FILE } from "../src/demo/app";
import { CUSTOMERS } from "../src/demo/customers";

const [c1, c2, c3] = CUSTOMERS;
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const row = (
  c: (typeof CUSTOMERS)[number],
  m: number,
  o: Omit<NewOrder, "customerId" | "customerName" | "receivedAt">,
): NewOrder => ({ customerId: c.id, customerName: c.name, receivedAt: minutesAgo(m), ...o });

const ORDERS: { order: NewOrder; approvedReply?: string }[] = [
  {
    // Sent: owner already approved, with a small edit.
    order: row(c1, 50, {
      message: "Hi, nak order 3 bekas kuih bangkit dan 1 kek lapis sarawak. Ambil sabtu ni boleh?",
      items: [
        { name: "Kuih bangkit", quantity: 3 },
        { name: "Kek lapis Sarawak", quantity: 1 },
      ],
      pickupDate: "2026-11-07",
      notes: "",
      checkThis: false,
      draftReply: "Hi! Boleh. 3 bekas kuih bangkit dan 1 biji kek lapis Sarawak, jumlah RM105. Ambil Sabtu ni, 7 Nov ya.",
    }),
    approvedReply:
      "Hi! Boleh. 3 bekas kuih bangkit dan 1 biji kek lapis Sarawak, jumlah RM105. Ambil Sabtu ni, 7 Nov ya. Terima kasih!",
  },
  {
    // Pending: clean order with a note.
    order: row(c2, 35, {
      message: "Nak 2 kek lapis sarawak, ambil 12 Dis. Tolong letak dalam kotak hadiah ya",
      items: [{ name: "Kek lapis Sarawak", quantity: 2 }],
      pickupDate: "2026-12-12",
      notes: "Letak dalam kotak hadiah.",
      checkThis: false,
      draftReply: "Baik! 2 biji kek lapis Sarawak dalam kotak hadiah, jumlah RM90. Ambil 12 Dis ya.",
    }),
  },
  {
    // Semak ini: the AI is unsure about the date.
    order: row(c3, 20, {
      message: "Sis, 1 bekas dahlia + 1 bekas tart nenas. Tak payah rush, ambil bila2 minggu depan",
      items: [
        { name: "Biskut dahlia", quantity: 1 },
        { name: "Tart nenas", quantity: 1 },
      ],
      pickupDate: null,
      notes: "Tarikh ambil belum pasti: minggu depan.",
      checkThis: true,
      flag: "unsure",
      reason: "bila2 minggu depan",
      draftReply: "Baik sis! 1 bekas dahlia dan 1 bekas tart nenas, jumlah RM47. Sis nak ambil hari apa minggu depan?",
    }),
  },
  {
    // Semak ini: not an order.
    order: row(c1, 10, {
      message: "berapa harga?",
      items: [],
      pickupDate: null,
      notes: "",
      checkThis: true,
      flag: "not_order",
      draftReply:
        "Harga kami: tart nenas RM25, kuih bangkit RM20, biskut suji RM20, semperit RM22, almond London RM28, dahlia RM22 (sebekas), kek lapis Sarawak RM45 sebiji. Nak order apa?",
    }),
  },
  {
    // Semak ini: unsure, so the AI asks a short question back.
    order: row(c2, 5, {
      message: "kak yang biasa tu satu ya",
      items: [],
      pickupDate: null,
      notes: 'Pelanggan minta "yang biasa". Item tidak dinyatakan.',
      checkThis: true,
      flag: "unsure",
      reason: "yang biasa",
      draftReply: "Yang biasa tu kuih apa ya kak?",
    }),
  },
  {
    // Semak ini: the AI output failed the check, so no draft (S2).
    order: row(c3, 2, {
      message: "nak order kuih",
      items: [],
      pickupDate: null,
      notes: "",
      checkThis: true,
      flag: "ai_failed",
      draftReply: "",
    }),
  },
];

rmSync(DATA_FILE, { force: true });
const store = new JsonFileOrderStore(DATA_FILE);
for (const { order, approvedReply } of ORDERS) {
  const saved = await store.add(order);
  if (approvedReply) await store.approve(saved.id, approvedReply, minutesAgo(45));
}
console.log(`Seeded ${ORDERS.length} orders into data/orders.json`);
