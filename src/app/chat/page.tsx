"use client";

import { useEffect, useState } from "react";
import type { Bubble } from "../../demo/app";
import { CUSTOMERS } from "../../demo/customers";

const time = (iso: string) => new Date(iso).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });

export default function ChatPage() {
  const [customerId, setCustomerId] = useState<string>(CUSTOMERS[0].id);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const load = () =>
    fetch(`/api/chat?customerId=${customerId}`)
      .then((r) => r.json())
      .then(setBubbles)
      .catch(() => {}); // next poll tries again

  // Poll so the shop reply shows up after the owner approves.
  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [customerId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, text }),
      });
      if (res.ok) setText("");
      await load();
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex h-full max-w-md flex-col bg-[#efeae2]">
      <header className="flex items-center gap-2 bg-[#075e54] p-3 text-white">
        <span className="font-semibold">Kedai Kuih Raya (demo)</span>
        <label className="ml-auto text-sm">
          <span className="sr-only">Pelanggan</span>
          <select
            className="rounded bg-white px-2 py-1 text-gray-900"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            {CUSTOMERS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </header>

      <ol className="flex-1 space-y-2 overflow-y-auto p-3">
        {bubbles.map((b, i) => (
          <li
            key={i}
            className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 shadow-sm ${
              b.from === "customer" ? "ml-auto bg-[#d9fdd3]" : "bg-white"
            }`}
          >
            {b.text}
            <span className="ml-2 align-bottom text-[10px] text-gray-500">{time(b.at)}</span>
          </li>
        ))}
      </ol>

      <form onSubmit={send} className="flex gap-2 bg-[#f0f2f5] p-2">
        <input
          aria-label="Mesej"
          className="flex-1 rounded-full bg-white px-4 py-2"
          placeholder="Taip mesej"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="rounded-full bg-[#00a884] px-4 text-white disabled:opacity-50"
          disabled={sending || !text.trim()}
        >
          {sending ? "..." : "Hantar"}
        </button>
      </form>
    </main>
  );
}
