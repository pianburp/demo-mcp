import Link from "next/link";
import { CUSTOMERS } from "../demo/customers";

export default function Home() {
  return (
    <main className="mx-auto max-w-md px-6 py-10 text-sm">
      <h1 className="text-xl font-semibold">Kedai Kuih Raya</h1>
      <h2 className="mt-6 mb-1 text-xs text-mute">Chat sebagai pelanggan</h2>
      <ul>
        {CUSTOMERS.map((c) => (
          <li key={c.id} className="border-b border-line">
            <Link className="block py-2.5 hover:underline" href={`/chat?as=${c.slug}`}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-6 mb-1 text-xs text-mute">Tuan kedai</h2>
      <Link className="block border-b border-line py-2.5 hover:underline" href="/dashboard">
        Papan pesanan
      </Link>
    </main>
  );
}
