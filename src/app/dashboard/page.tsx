"use client";

import { useEffect, useState } from "react";
import type { StoredOrder } from "../../core/order-store";

const when = (iso: string) => new Date(iso).toLocaleString("ms-MY", { dateStyle: "short", timeStyle: "short" });

export default function DashboardPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  // Owner edits, kept apart from polled data so a refresh never wipes what they are typing.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const load = () =>
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {}); // next poll tries again

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  async function approve(o: StoredOrder) {
    setError("");
    const res = await fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: o.id, reply: drafts[o.id] ?? o.draftReply }),
    });
    if (!res.ok) setError(`Gagal lulus ${o.id}`);
    await load();
  }

  return (
    <main className="p-4">
      <h1 className="mb-3 text-xl font-semibold">Pesanan masuk</h1>
      {error && <p role="alert" className="mb-2 text-red-700">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white text-sm">
          <thead className="bg-gray-200 text-left">
            <tr>
              {["Order ID", "Diterima pada", "Nama pelanggan", "Barang dan kuantiti", "Tarikh ambil", "Nota",
                "Semak ini", "Draf balasan", "Lulus", "Status"].map((h) => (
                <th key={h} className="border p-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...orders].reverse().map((o) => {
              const draft = drafts[o.id] ?? o.draftReply;
              const pending = o.status === "pending";
              return (
                <tr key={o.id} className={o.checkThis && pending ? "bg-yellow-50" : ""}>
                  <td className="border p-2 font-mono">{o.id}</td>
                  <td className="border p-2">{when(o.receivedAt)}</td>
                  <td className="border p-2">{o.customerName}</td>
                  <td className="border p-2">{o.items.map((i) => `${i.name} x${i.quantity}`).join(", ") || "-"}</td>
                  <td className="border p-2">{o.pickupDate ?? "-"}</td>
                  <td className="border p-2">{o.notes || "-"}</td>
                  <td className="border p-2 font-semibold text-amber-700">{o.checkThis ? "Ya" : ""}</td>
                  <td className="border p-2">
                    <textarea
                      aria-label={`Draf balasan ${o.id}`}
                      className="w-72 rounded border p-1 disabled:bg-gray-50"
                      rows={3}
                      value={draft}
                      disabled={!pending}
                      onChange={(e) => setDrafts({ ...drafts, [o.id]: e.target.value })}
                    />
                  </td>
                  <td className="border p-2">
                    {pending && (
                      <button
                        className="rounded bg-green-600 px-3 py-1 text-white disabled:opacity-40"
                        disabled={!draft.trim()}
                        onClick={() => approve(o)}
                      >
                        Lulus
                      </button>
                    )}
                  </td>
                  <td className="border p-2">{pending ? "Menunggu" : "Dihantar"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
