import "./globals.css";

export const metadata = { title: "Demo pesanan WhatsApp" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body className="flex h-dvh flex-col bg-gray-100 text-gray-900">
        <div role="note" className="shrink-0 bg-red-600 py-1 text-center text-sm font-bold tracking-wide text-white">
          DEMO — data palsu
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </body>
    </html>
  );
}
