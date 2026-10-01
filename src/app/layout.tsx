import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Dystopify",
    template: "%s · Dystopify",
  },
  description:
    "How much of today's headlines sit inside ten dystopian pressures. A phrase count on a curve, not a forecast.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <div className="h-1.5 bg-primary" aria-hidden="true" />
        <div className="mx-auto flex min-h-[calc(100vh-0.375rem)] w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-12">
          <header className="mb-8 border-b border-border pb-6">
            <p className="font-heading text-3xl italic tracking-tight text-foreground">
              <Link href="/" className="rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                Dystopify
              </Link>
            </p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              A daily meter of ten dystopian pressures, read from public headlines.
            </p>
          </header>
          <div className="flex-1">{children}</div>
          <footer className="mt-12 border-t border-border pt-4 text-sm leading-6 text-muted-foreground">
            Public RSS from BBC News, NPR, The Guardian, Al Jazeera, France 24, and DW. Titles only. The page
            reads a local file and does not fetch news.
            Model fees $0. Items from BBC feeds are marked BBC News.
          </footer>
        </div>
      </body>
    </html>
  );
}
