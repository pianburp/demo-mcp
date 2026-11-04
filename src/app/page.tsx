import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8 space-x-4">
      <Link className="text-blue-700 underline" href="/chat">Chat pelanggan</Link>
      <Link className="text-blue-700 underline" href="/dashboard">Papan pemilik</Link>
    </main>
  );
}
