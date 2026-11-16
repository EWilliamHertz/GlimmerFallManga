import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GlimmerFall — The Fractured Nexus | Universe, Manga & OST",
  description:
    "Welcome to the universe of GlimmerFall. Watch the trailer, listen to the built-in OST, explore the four factions, and co-create the Fractured Nexus manga.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#05060b] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
