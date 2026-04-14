import type { Metadata } from "next";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "RT Course",
  description: "Real-Time Systems Course",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <header className="sticky top-0 z-10 border-b border-sand-200 bg-sand-50/80 backdrop-blur-md">
            <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sand-900 transition-colors hover:text-terracotta-600"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand-900 text-sm font-bold text-sand-50">
                  RT
                </span>
                <span className="text-base font-semibold tracking-tight">
                  Course
                </span>
              </Link>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
            {children}
          </main>
          <footer className="border-t border-sand-200 py-6 text-center text-xs text-sand-500">
            Built for learning, one module at a time.
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
