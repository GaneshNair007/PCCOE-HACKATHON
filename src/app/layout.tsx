import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NoiseOverlay } from "@/components/layout/noise-overlay";
import { AgenticChat } from "@/components/chat/agentic-chat";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";
import { CyberGrid3D } from "@/components/3d/cyber-grid-3d";
import { CursorOrb3D } from "@/components/3d/cursor-orb-3d";

export const metadata: Metadata = {
  title: "CARBONERRA — 3D Cyber-Physical Digital Sustainability Telemetry | PCCOE Hackathon",
  description:
    "Executive-grade digital sustainability telemetry and 3D predictive carbon optimization platform. SWDM v4 verified with real datacenter grid telemetry.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#060a08] text-[#ccd5ae] relative overflow-x-hidden selection:bg-lime selection:text-black">
        {/* Accessible Skip Link for Keyboard & Screen Reader Users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-lime focus:text-black font-mono font-bold text-xs rounded-xl shadow-[0_0_25px_rgba(203,255,0,0.6)] transition-all"
        >
          Skip to main content
        </a>
        <SmoothScrollProvider>
          <NoiseOverlay />
          <CyberGrid3D />
          <CursorOrb3D />
          <Header />
          <main id="main-content" className="flex-1 pt-24 px-4 sm:px-8 max-w-7xl mx-auto w-full relative z-10">
            {children}
          </main>
          <Footer />
          <AgenticChat />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
