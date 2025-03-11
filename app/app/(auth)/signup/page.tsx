import { SignUpForm } from "@/components/auth/signup-form";
import { getSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <main>
      <h1>Sign Up</h1>
      <SignUpForm />
    </main>
  );
}
