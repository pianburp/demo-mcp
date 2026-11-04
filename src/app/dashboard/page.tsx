"use client";

import { useEffect, useState } from "react";
import { MENU } from "../../core/menu";
import type { StoredOrder } from "../../core/order-store";
import { tally } from "../../demo/tally";

const clock = (iso: string) => new Date(iso).toLocaleTimeString("ms-MY", { hour: "numeric", minute: "2-digit" });
// pickupDate is a plain YYYY-MM-DD; read it as local noon so the weekday never shifts by timezone.
const pickup = (ymd: string, weekday: "short" | "long" = "short") =>
  new Date(`${ymd}T12:00:00`).toLocaleDateString("ms-MY", { weekday, day: "numeric", month: "short" });

const unit = (name: string) => MENU.find((m) => m.name === name)?.unit ?? "";
const price = (name: string) => MENU.find((m) => m.name.toLowerCase() === name.trim().toLowerCase())?.priceRm;
// null when any item is not on the menu, so the owner never sees a wrong total.
function total(o: StoredOrder) {
  if (!o.items.length) return null;
  let sum = 0;
  for (const i of o.items) {
    const p = price(i.name);
    if (p === undefined) return null;
    sum += p * i.quantity;
  }
  return sum;
}

// Why the owner must look at this row. Old rows saved without a flag read as "Tak pasti".
function why(o: StoredOrder) {
  if (!o.checkThis) return "";
  if (o.flag === "not_order") return "Soalan, bukan pesanan";
  if (o.flag === "ai_failed") return "AI gagal baca. Sila semak mesej.";
  return o.reason ? `Tak pasti: “${o.reason}”` : "Tak pasti";
}

const Label = ({ children }: { children: React.ReactNode }) => <h3 className="mt-5 mb-1.5 text-xs text-mute">{children}</h3>;

export default function DashboardPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  // Owner edits, kept apart from polled data so a refresh never wipes what they are typing.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");
  const [picked, setPicked] = useState<string | null>(null);

  const load = () =>
    fetch("/api/orders")
      .then((r) => r.json())
      .then((list) => {
        setOrders(list);
        setUpdatedAt(new Date().toISOString());
      })
      .catch(() => {}); // next poll tries again

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  // Oldest first, like a sheet. Rows that need a decision on top, sent rows below.
  const waiting = orders.filter((o) => o.status === "pending");
  const sent = orders.filter((o) => o.status === "sent");
  const rows = [...waiting, ...sent];
  const open = rows.find((o) => o.id === picked) ?? waiting[0] ?? null;
  const draft = open ? (drafts[open.id] ?? open.draftReply) : "";

  async function approve(o: StoredOrder) {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: o.id, reply: draft }),
      });
      if (res.ok) setPicked(null); // move on to the next waiting order
      else setError("Gagal hantar. Cuba tekan sekali lagi.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex h-full flex-col text-sm">
      <header className="flex shrink-0 items-baseline justify-between gap-6 border-b border-line px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">Kedai Kuih Raya · Pesanan</h1>
          <p className="mt-0.5 text-mute tabular-nums">{waiting.length} menunggu kelulusan</p>
        </div>
        {updatedAt && <p className="text-xs text-mute tabular-nums">Dikemas kini {clock(updatedAt)}</p>}
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="min-h-0 flex-1 overflow-auto px-6">
          <table className="w-full tabular-nums">
            <thead className="text-left text-xs text-mute">
              <tr className="border-b border-line">
                <th className="w-20 py-2.5 pr-4 font-normal">Masa</th>
                <th className="w-36 py-2.5 pr-4 font-normal">Pelanggan</th>
                <th className="py-2.5 pr-4 font-normal">Pesanan</th>
                <th className="w-28 py-2.5 pr-4 font-normal">Ambil</th>
                <th className="w-16 py-2.5 pr-4 text-right font-normal">RM</th>
                <th className="w-24 py-2.5 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-mute">Belum ada pesanan. Pesanan dari /chat muncul di sini.</td>
                </tr>
              )}
              {rows.map((o) => {
                const sum = total(o);
                const done = o.status === "sent";
                return (
                  <tr
                    key={o.id}
                    tabIndex={0}
                    aria-selected={o.id === open?.id}
                    onClick={() => setPicked(o.id)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setPicked(o.id))}
                    className={`cursor-pointer border-b border-line align-top outline-none focus-visible:bg-pick ${
                      o.id === open?.id ? "bg-pick" : "hover:bg-[#f7f8fa]"
                    } ${done ? "text-mute" : ""}`}
                  >
                    <td className="py-2.5 pr-4">{clock(o.receivedAt)}</td>
                    <td className="py-2.5 pr-4">{o.customerName}</td>
                    <td className="py-2.5 pr-4">
                      {o.items.map((i) => (
                        <div key={i.name}>{i.quantity} × {i.name}</div>
                      ))}
                      {o.checkThis && <div className="text-amber">{why(o)}</div>}
                      {!o.items.length && !o.checkThis && "—"}
                    </td>
                    <td className="py-2.5 pr-4">{o.pickupDate ? pickup(o.pickupDate) : "—"}</td>
                    <td className="py-2.5 pr-4 text-right">{sum ?? "—"}</td>
                    <td className={`py-2.5 ${done ? "text-accent" : "text-mute"}`}>{done ? "Dihantar" : "Menunggu"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {tally(orders).length > 0 && (
            <>
              <h2 className="mt-8 mb-1 text-xs text-mute">Untuk dibuat</h2>
              <table className="mb-6 w-full tabular-nums">
                <tbody>
                  {tally(orders).map((d) => (
                    <tr key={d.date} className="border-b border-line align-top">
                      <td className="w-36 py-2 pr-4 font-semibold">{pickup(d.date, "long")}</td>
                      <td className="py-2">{d.items.map((i) => `${i.name} ${i.quantity} ${unit(i.name)}`.trim()).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>

        <aside className="shrink-0 overflow-auto border-t border-line px-6 py-5 lg:w-[420px] lg:border-t-0 lg:border-l">
          {!open ? (
            <p className="text-mute">Pilih satu pesanan.</p>
          ) : (
            <>
              <h2 className="flex items-baseline justify-between gap-3">
                <span className="text-base font-semibold">{open.customerName}</span>
                <span className="text-xs text-mute tabular-nums">{clock(open.receivedAt)} · {open.id}</span>
              </h2>
              <p className="mt-2 leading-relaxed whitespace-pre-wrap break-words">“{open.message}”</p>

              <Label>Dibaca AI</Label>
              {open.checkThis && <p className="mb-1.5 text-amber">{why(open)}</p>}
              <table className="w-full tabular-nums">
                <tbody>
                  {open.items.map((i) => {
                    const p = price(i.name);
                    return (
                      <tr key={i.name}>
                        <td className="py-0.5">{i.quantity} × {i.name}</td>
                        <td className="py-0.5 text-right">{p === undefined ? "—" : `RM${p * i.quantity}`}</td>
                      </tr>
                    );
                  })}
                  {open.items.length > 1 && total(open) !== null && (
                    <tr className="border-t border-line font-semibold">
                      <td className="pt-1">Jumlah</td>
                      <td className="pt-1 text-right">RM{total(open)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {!open.items.length && <p className="text-mute">—</p>}
              <p className="mt-2">Ambil: {open.pickupDate ? pickup(open.pickupDate, "long") : "—"}</p>
              {open.notes && <p className="mt-1 text-mute">Nota: {open.notes}</p>}

              {open.status === "sent" ? (
                <>
                  <Label>Balasan dihantar {open.sentAt && clock(open.sentAt)}</Label>
                  <p className="leading-relaxed whitespace-pre-wrap">{open.draftReply}</p>
                </>
              ) : (
                <>
                  <Label>
                    <label htmlFor="draf">Draf balasan</label>
                  </Label>
                  <textarea
                    id="draf"
                    className="w-full rounded-[6px] border border-[#d1d7db] p-2.5 leading-relaxed outline-none focus-visible:border-accent"
                    rows={Math.max(4, Math.ceil(draft.length / 48))} // grow with the draft, ~48 chars a line
                    placeholder="Tulis balasan untuk pelanggan"
                    value={draft}
                    onChange={(e) => setDrafts({ ...drafts, [open.id]: e.target.value })}
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      className="rounded-[6px] bg-accent px-4 py-2 font-semibold text-white hover:bg-[#017561] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!draft.trim() || busy}
                      onClick={() => approve(open)}
                    >
                      {busy ? "Menghantar…" : "Lulus & hantar"}
                    </button>
                    {!draft.trim() && <span className="text-mute">Tulis balasan dulu.</span>}
                  </div>
                  {error && <p role="alert" className="mt-2 font-semibold">{error}</p>}
                </>
              )}
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
