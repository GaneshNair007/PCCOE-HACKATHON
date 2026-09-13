import type { Metadata } from "next";
import { Suspense } from "react";
import "@flowstack-ui/brick/styles.css";
import "@designcodeio/threeui/style.css";
import "./globals.css";
import "../../public/inner-green-assets/sylva.css";
import "./living-world.css";
import { LivingWorld } from "@/components/world/living-world";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AgenticChat } from "@/components/chat/agentic-chat";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";

import { MainWrapper } from "@/components/layout/main-wrapper";

export const metadata: Metadata = {
  title: "CarbonTerra — Digital sustainability workspace",
  description:
    "Executive-grade digital sustainability telemetry and 3D predictive carbon optimization platform. SWDM v4 verified with real datacenter grid telemetry.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col relative selection:bg-lime selection:text-black">
        {/* Accessible Skip Link for Keyboard & Screen Reader Users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-lime focus:text-black font-mono font-bold text-xs rounded-xl shadow-[0_0_25px_rgba(203,255,0,0.6)] transition-all"
        >
          Skip to main content
        </a>
        <SmoothScrollProvider>
          <LivingWorld>
          <Header />
          <MainWrapper>{children}</MainWrapper>
          <Footer />
          <Suspense fallback={null}><AgenticChat /></Suspense>
          </LivingWorld>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
