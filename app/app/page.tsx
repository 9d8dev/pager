import { PagerButton } from "@/components/pager-button";

export default function Home() {
  return (
    <main className="p-6 font-[family-name:var(--font-geist-sans)]">
      <section className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-medium font-mono">Welcome to Pager</h1>
        <PagerButton />
      </section>
    </main>
  );
}
