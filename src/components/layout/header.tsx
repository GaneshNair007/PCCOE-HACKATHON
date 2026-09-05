"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Activity, Sliders, LineChart, Cpu, ShieldCheck, Menu, X } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "SCANNER", href: "/", icon: Zap },
    { label: "DASHBOARD", href: "/dashboard", icon: Activity },
    { label: "CARBON LAB", href: "/simulator", icon: Sliders },
    { label: "FORECASTS", href: "/forecasts", icon: LineChart },
    { label: "AI FIX HUB", href: "/fix-hub", icon: Cpu },
    { label: "REGRESSION SHIELD", href: "/shield", icon: ShieldCheck },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-40 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between">
      {/* Brand Logo */}
      <Link
        href="/"
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full glass-panel-elevated group transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-lime text-forest-950 flex items-center justify-center font-bold text-xs shadow-lime group-hover:rotate-12 transition-transform">
          ⚡
        </div>
        <span className="font-display tracking-widest text-cream text-base sm:text-lg">
          CARBONERRA
        </span>
      </Link>

      {/* Desktop Navigation Pill */}
      <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel shadow-glass">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2",
                isActive
                  ? "text-forest-950 font-extrabold"
                  : "text-sage hover:text-cream hover:bg-surface-elevated/60"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavPill"
                  className="absolute inset-0 rounded-full bg-lime shadow-lime"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Right Budget Status Pill & Mobile Menu Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-lime/30 text-[11px] font-mono tracking-wider font-semibold text-cream">
          <span className="text-sage">BUDGET:</span>
          <span className="text-lime font-bold">0.24G</span>
          <span className="text-sage/60">/ 0.50G</span>
          <span className="text-xs">✅</span>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2.5 rounded-full glass-panel text-cream hover:bg-surface-elevated"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-16 left-4 right-4 p-5 rounded-3xl glass-panel-elevated shadow-2xl flex flex-col gap-2 z-50"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm font-mono tracking-wider flex items-center gap-3 transition-colors",
                    isActive
                      ? "bg-lime text-forest-950 font-extrabold shadow-lime"
                      : "text-sage hover:text-cream hover:bg-surface-elevated"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 pt-3 border-t border-surface-border flex items-center justify-between text-xs font-mono text-sage">
              <span>BUDGET CEILING:</span>
              <span className="text-lime font-bold">0.24G / 0.50G CO2</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
