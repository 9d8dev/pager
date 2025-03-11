import { getSession } from "@/lib/auth/server";
import { SignOut } from "@/components/auth/signout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="p-6 font-[family-name:var(--font-geist-sans)]">
      <section className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-medium font-mono">app dashboard</h1>
        <Button>Page Me!</Button>
        {session && (
          <>
            <p>Signed in as {session.user.email}</p>
            <SignOut />
          </>
        )}
        {!session && (
          <div className="flex flex-col gap-2">
            <p>Sign in to get started</p>
            <Link href="/login" className="underline">
              Login
            </Link>
            <Link href="/signup" className="underline">
              Sign Up
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
