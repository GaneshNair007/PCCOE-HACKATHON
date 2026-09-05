import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carbonerra Mission Control — Digital Carbon AI Companion",
  description: "Tell it what you want to improve. Follow the evidence. Isolated AI companion service for digital sustainability engineering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-forest-950 text-cream-50 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
