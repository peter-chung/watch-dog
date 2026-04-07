import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/layout/app-header";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Watchdog",
  description: "Track webpage changes and get alerted.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="min-h-screen">
          <AppHeader />
          <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
