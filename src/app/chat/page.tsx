"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Bubble } from "../../demo/app";
import { CUSTOMERS } from "../../demo/customers";

// 12-hour time like the phone shows ("2:48 PTG").
const time = (iso: string) => new Date(iso).toLocaleTimeString("ms-MY", { hour: "numeric", minute: "2-digit" });
const ymd = (d: Date) => d.toLocaleDateString("en-CA");

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (ymd(d) === ymd(today)) return "Hari ini";
  if (ymd(d) === ymd(yesterday)) return "Semalam";
  return d.toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" });
}

const Icon = ({ d, className = "" }: { d: string; className?: string }) => (
  <svg aria-hidden viewBox="0 0 24 24" className={`size-6 shrink-0 fill-current ${className}`}>
    <path d={d} />
  </svg>
);

// Outline icons drawn to match design/ref/wa-input.png.
const ICONS = {
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z",
  call: "M6.54 5c.06.89.21 1.76.45 2.59l-1.2 1.2c-.41-1.2-.67-2.47-.76-3.79h1.51m9.86 12.02c.85.24 1.72.39 2.6.45v1.49c-1.32-.09-2.59-.35-3.8-.75l1.2-1.19M7.5 3H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.49c0-.55-.45-1-1-1-1.24 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.07 15.07 0 0 1-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1z",
  shop: "M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4zm-6.96-6 .6-3h12.72l.6 3H5.04z",
  dots: "M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  emoji: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 16c-1.48 0-2.75-.81-3.45-2H6.88a5.5 5.5 0 0 0 10.24 0h-1.67c-.7 1.19-1.97 2-3.45 2z",
  clip: "M16.5 6v11.5a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v10.5a1 1 0 0 1-2 0V6H10v9.5a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v12.5a5.5 5.5 0 0 0 11 0V6h-1.5z",
  camera: "M14.12 4l1.83 2H20v12H4V6h4.05l1.83-2h4.24M15 2H9L7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.17L15 2zm-3 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6m0-2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
  mic: "M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z",
  send: "M2.01 21 23 12 2.01 3 2 10l15 2-15 2z",
};

const SHADOW = "shadow-[0_1px_0.5px_rgba(11,20,26,.13)]";

// Double tick. Blue once the shop has replied after this message.
const Ticks = ({ read }: { read: boolean }) => (
  <svg role="img" aria-label={read ? "Dibaca" : "Dihantar"} viewBox="0 0 16 11" className={`h-[11px] w-4 fill-current ${read ? "text-wa-tick" : "text-wa-hint"}`}>
    <path d="M11.1.6 4.8 7.9 2.1 5.3 1 6.4l3.9 3.8L12.2 1.6zM15 .6 8.7 7.9l-.9-.9-1.1 1.1 2 2.1L16.1 1.6z" />
  </svg>
);

const dateChip = (label: string) => (
  <p className="mb-2.5 text-center">
    <span className={`inline-block rounded-[7.5px] bg-white px-3 py-1 text-[12.5px] text-wa-icon ${SHADOW}`}>{label}</span>
  </p>
);

// Sits under the first date chip, where the real app puts its business notice.
const NOTICE = (
  <p className="mx-auto mb-2.5 max-w-[88%] rounded-[7.5px] bg-[#d5f5e6] px-3 py-1.5 text-center text-[12.5px] leading-snug text-wa-icon">
    Chat demo. Mesej anda dibaca oleh AI dan disemak tuan kedai sebelum dibalas.
  </p>
);

const shopCount = (list: Bubble[]) => list.filter((b) => b.from === "shop").length;

function Chat() {
  const as = useSearchParams().get("as");
  const customerId = (CUSTOMERS.find((c) => c.slug === as) ?? CUSTOMERS[0]).id;
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const shown = useRef<Bubble[]>([]);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the newest bubble in view, like a phone chat.
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [bubbles.length, typing]);

  const show = (next: Bubble[]) => {
    shown.current = next;
    setBubbles(next);
  };

  const load = () =>
    fetch(`/api/chat?customerId=${customerId}`)
      .then((r) => r.json())
      .then((next: Bubble[]) => {
        if (hold.current) return; // a reply is already on its way
        // A new shop reply: show "sedang menaip…" for a moment first, like a person typing.
        if (shown.current.length && shopCount(next) > shopCount(shown.current)) {
          setTyping(true);
          hold.current = setTimeout(() => {
            hold.current = null;
            setTyping(false);
            show(next);
          }, 1000);
        } else show(next);
      })
      .catch(() => {}); // next poll tries again

  // Poll so the shop reply shows up after the owner approves.
  useEffect(() => {
    shown.current = [];
    load();
    const t = setInterval(load, 3000);
    return () => {
      clearInterval(t);
      if (hold.current) clearTimeout(hold.current);
      hold.current = null;
      setTyping(false);
    };
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

  const lastShopAt = bubbles.filter((b) => b.from === "shop").at(-1)?.at ?? "";
  const typed = text.trim().length > 0;

  return (
    <main className="h-full bg-[#d1d7db] sm:flex sm:justify-center">
      <div className="flex h-full w-full flex-col text-ink sm:w-[420px]">
        <header className="flex h-14 shrink-0 items-center gap-1 bg-white pr-2 pl-1">
          <Link href="/" aria-label="Kembali" className="grid size-10 place-items-center rounded-full">
            <Icon d={ICONS.back} />
          </Link>
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f6e7c8] text-sm font-semibold text-[#7a5410]">
            KR
          </span>
          <div className="ml-2 min-w-0 flex-1">
            <p className="truncate text-[17px] leading-tight font-medium">Kedai Kuih Raya</p>
            {typing && <p className="truncate text-[13px] leading-tight text-wa-icon">sedang menaip…</p>}
          </div>
          <span className="flex items-center gap-6 pr-2">
            <Icon d={ICONS.call} />
            <Icon d={ICONS.shop} />
            <Icon d={ICONS.dots} />
          </span>
        </header>

        <ol ref={list} aria-label="Perbualan" className="min-h-0 flex-1 overflow-y-auto bg-wa-bg px-4 pt-3 pb-2">
          {!bubbles.length && <li>{dateChip("Hari ini")}{NOTICE}</li>}
          {bubbles.map((b, i) => {
            const prev = bubbles[i - 1];
            const newDay = !prev || dayLabel(prev.at) !== dayLabel(b.at);
            const first = newDay || prev.from !== b.from;
            const out = b.from === "customer";
            return (
              <li key={i} className={first ? "mt-2.5" : "mt-0.5"}>
                {newDay && dateChip(dayLabel(b.at))}
                {i === 0 && NOTICE}
                <div className={`flex ${out ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flow-root max-w-[80%] rounded-[7.5px] px-2 pt-1.5 pb-1 text-[16px] leading-[21px] break-words whitespace-pre-wrap ${SHADOW} ${
                      out ? "bg-wa-out" : "arrive bg-white"
                    } ${first ? (out ? "tail-out rounded-tr-none" : "tail-in rounded-tl-none") : ""}`}
                  >
                    {b.text}
                    <span className="float-right mt-2 ml-3 -mb-1 inline-flex items-center gap-1 text-[11px] leading-none text-wa-icon tabular-nums">
                      {time(b.at)}
                      {out && <Ticks read={b.at <= lastShopAt} />}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <form onSubmit={send} className="flex shrink-0 items-end gap-1.5 bg-wa-bg px-1.5 pt-1 pb-2">
          <div className={`flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-3xl bg-white pr-3 pl-3 text-wa-icon ${SHADOW}`}>
            <Icon d={ICONS.emoji} />
            <input
              aria-label="Mesej"
              className="min-w-0 flex-1 bg-transparent py-3 text-[17px] text-ink outline-none placeholder:text-wa-hint"
              placeholder="Mesej"
              enterKeyHint="send"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Icon d={ICONS.clip} className="-rotate-45" />
            {!typed && <Icon d={ICONS.camera} />}
          </div>
          <button
            type={typed ? "submit" : "button"}
            aria-label={typed ? "Hantar" : "Rakam suara"}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-wa-green text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wa-green"
          >
            <Icon d={typed ? ICONS.send : ICONS.mic} className={sending ? "opacity-50" : ""} />
          </button>
        </form>
      </div>
    </main>
  );
}

// useSearchParams needs a Suspense boundary in a client page.
export default function ChatPage() {
  return (
    <Suspense>
      <Chat />
    </Suspense>
  );
}
