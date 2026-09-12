"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
const destinations = [
  { label: "Scanner", href: "/" }, { label: "Savings Lab", href: "/savings-lab" },
  { label: "Evidence", href: "/evidence" }, { label: "Fleet", href: "/dashboard" },
  { label: "Simulator", href: "/simulator" }, { label: "Forecasts", href: "/forecasts" },
  { label: "Fix Hub", href: "/fix-hub" }, { label: "Shield", href: "/shield" },
  { label: "Campus demo", href: "/demo/event" },
];
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", dismiss); document.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <header ref={header} className="ct-navigation">
    <div className="ct-nav-bar">
      <Link href="/" className="ct-brand" aria-label="CarbonTerra home">
        <span className="ct-brand-mark"><Leaf size={20} aria-hidden="true" /></span><span>CarbonTerra</span>
      </Link>
      <nav className="ct-desktop-nav" aria-label="Primary navigation">
        {destinations.slice(0, 5).map(item => <Link key={item.href} href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          className={cn("ct-nav-link", pathname === item.href && "is-active")}>{item.label}</Link>)}
      </nav>
      <button ref={toggle} className="ct-nav-toggle" aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open} aria-controls="all-navigation" onClick={() => setOpen(!open)}>
        <span className="hidden sm:inline">{open ? "Close" : "Explore"}</span>{open ? <X size={19} /> : <Menu size={19} />}
      </button>
    </div>
    {open && <nav id="all-navigation" aria-label="All CarbonTerra tools" className="ct-nav-menu">
      {destinations.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
        aria-current={pathname === item.href ? "page" : undefined}
        className={cn("ct-menu-link", pathname === item.href && "is-active")}>
        {item.label}<ArrowUpRight size={15} aria-hidden="true" />
      </Link>)}
    </nav>}
  </header>;
}
