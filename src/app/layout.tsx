import "./globals.css";

export const metadata = { title: "Demo pesanan" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body className="flex h-dvh flex-col bg-white font-sans text-ink antialiased">
        <div role="note" className="flex h-7 shrink-0 items-center justify-center bg-[#3b4a54] text-xs text-white">
          DEMO — data palsu
        </div>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </body>
    </html>
  );
}
