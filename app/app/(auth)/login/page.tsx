import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function Login() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main>
      <h1>Login</h1>
      <LoginForm />
    </main>
  );
}
