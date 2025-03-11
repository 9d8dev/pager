import { getSession } from "@/lib/auth/server";
import { SignOut } from "@/components/auth/signout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPager } from "@/lib/data/pager";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const pager = await getPager();

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

        {pager && (
          <div className="flex flex-col gap-2">
            <p>Pager token:</p>
            <pre>{pager.token}</pre>
            <div className="mt-4 p-4 rounded-lg">
              <h3 className="font-medium mb-2">API Usage</h3>
              <p className="mb-2">
                Send POST request to{" "}
                <code className="px-1 rounded">https://pager.dev/api/v1</code>
              </p>

              <div className="mb-4">
                <p className="font-medium">Headers:</p>
                <pre className="p-2 rounded mt-1">
                  {`Content-Type: application/json
Authorization: Bearer ${pager.token}`}
                </pre>
              </div>

              <div>
                <p className="font-medium">Example Request:</p>
                <pre className="p-2 rounded mt-1">
                  {`await fetch("https://pager.dev/api/v1", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${token}\`,
  },
  body: JSON.stringify({
    message: "Your notification message",
    slack: "https://slack.com", // Enable Slack webhook
    discord: "https://discord.com", // Enable Discord webhook
    notif: true, // Enable web notifications
    email: true, // Enable email notifications
  }),
});`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
