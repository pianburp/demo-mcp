import "./globals.css";

export const metadata = { title: "Demo pesanan WhatsApp" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body className="bg-gray-100 text-gray-900">{children}</body>
    </html>
  );
}
