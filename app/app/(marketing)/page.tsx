import Logo2 from "@/public/logo-2.svg";
import Logo from "@/public/logo.svg";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <section className="space-y-12 text-center uppercase font-mono">
        <h1 className="sr-only">Pager</h1>

        <Image src={Logo} alt="Logo" width={180} className="dark:hidden" />
        <Image
          src={Logo2}
          alt="Logo"
          width={180}
          className="hidden dark:block"
        />

        <Link href="/dashboard" className="hover:font-semibold">
          go to app
        </Link>
      </section>
    </main>
  );
}
