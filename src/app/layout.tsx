import type { Metadata } from "next";
import { AppShell } from "@/components/pulse/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse MVP",
  description: "Pulse local MVP shell for social check-ins and challenges.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
