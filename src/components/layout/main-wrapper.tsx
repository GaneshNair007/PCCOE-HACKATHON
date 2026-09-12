"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main
      id="main-content"
      className={cn(
        "flex-1 w-full relative z-10 min-w-0",
        !isHome && "ct-page-shell"
      )}
    >
      {children}
    </main>
  );
}
