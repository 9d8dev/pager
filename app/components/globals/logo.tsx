import DarkLogo from "@/public/logo-2.svg";
import MainLogo from "@/public/logo.svg";
import Image from "next/image";

export const Logo = ({ width = 180 }: { width?: number }) => {
  return (
    <>
      <Image
        src={MainLogo}
        alt="Pager Logo"
        width={width}
        className="dark:hidden"
      />
      <Image
        src={DarkLogo}
        alt="Pager Logo"
        width={width}
        className="hidden dark:block"
      />
    </>
  );
};
