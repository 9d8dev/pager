import Link from "next/link";

export default function Home() {
  return (
    <main className="w-screen h-screen bg-primary flex items-center justify-center">
      <section>
        <h1 className="text-2xl font-medium font-mono">Welcome to Pager</h1>
        <p>this is the marketing page</p>
        <Link href="/dashboard" className="underline">
          go to app
        </Link>
      </section>
    </main>
  );
}
