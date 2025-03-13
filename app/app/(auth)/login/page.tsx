import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function Login() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="h-screen w-screen flex items-center justify-center">
      <section className="border p-6">
        <h1>Login</h1>
        <LoginForm />
      </section>
    </main>
  );
}
