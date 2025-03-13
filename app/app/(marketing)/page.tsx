import Pager from "@/public/pager.webp";
import Logo2 from "@/public/logo-2.svg";
import Logo from "@/public/logo.svg";
import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main>
      <Hero />
      <section className="p-12">
        <h3>What is pager?</h3>
      </section>
    </main>
  );
}

const Hero = () => {
  return (
    <section className="w-screen h-screen relative text-center uppercase font-mono border-b">
      <div className="absolute top-6 left-6 space-y-4">
        <h1 className="sr-only">Pager</h1>
        <Image src={Logo} alt="Logo" width={180} className="dark:hidden" />
        <Image
          src={Logo2}
          alt="Logo"
          width={180}
          className="hidden dark:block"
        />
        <h2>Notifications for developers</h2>
      </div>
      <div className="absolute top-6 right-6">
        <Button asChild>
          <Link href="/dashboard" className="hover:font-semibold">
            Go to app
          </Link>
        </Button>
      </div>
      <p className="absolute bottom-6 left-6 flex items-center gap-2">
        Learn More <ArrowDown size={16} />
      </p>
      <ThemeToggle className="absolute bottom-6 right-6" />
      <Image
        src={Pager}
        alt="Pager"
        className="object-cover h-screen absolute dark:invert -z-10"
      />
    </section>
  );
};
