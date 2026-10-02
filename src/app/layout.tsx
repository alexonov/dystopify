import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dystopify",
    template: "%s · Dystopify",
  },
  description:
    "A ranked board of how much of the last seven days of headlines match each book.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-3 py-3 sm:px-5">
          <header className="mb-3 flex items-baseline justify-between gap-3">
            <Link
              href="/"
              className="font-mono text-sm tracking-[0.32em] outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
            >
              DYSTOPIFY
            </Link>
            <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">SITUATION</p>
          </header>
          <div className="flex-1">{children}</div>
          <footer className="mt-6 border-t border-border pt-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
            BBC NPR GUARDIAN AJ F24 DW · TITLES ONLY · MODEL $0
          </footer>
        </div>
      </body>
    </html>
  );
}
