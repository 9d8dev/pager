import { PagerProvider } from "pager";

export const metadata = {
  title: "Pager Example - Next.js App Router",
  description: "Example of using Pager with Next.js App Router",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PagerProvider>{children}</PagerProvider>
      </body>
    </html>
  );
}
