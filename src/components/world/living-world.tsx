"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SylvaHero } from "@designcodeio/threeui";
import { usePathname } from "next/navigation";
import { Pause, Play, RotateCcw } from "lucide-react";

type Pose = { x: number; y: number; zoom: number; turn: number };
const poses: Record<string, Pose> = {
  arrival: { x: 0, y: 0, zoom: 1, turn: 0 },
  measure: { x: -.58, y: -.2, zoom: 1.2, turn: -.12 },
  roots: { x: .62, y: -.42, zoom: 1.32, turn: .16 },
  canopy: { x: -.45, y: .16, zoom: 1.07, turn: -.16 },
  clearing: { x: .55, y: -.28, zoom: 1.14, turn: .08 },
  resolve: { x: .08, y: -.2, zoom: .88, turn: .06 },
};
const routeWorlds: Record<string, { number: string; label: string; shot: string }> = {
  "/": { number: "01", label: "The living web", shot: "arrival" },
  "/dashboard": { number: "02", label: "A connected ecosystem", shot: "canopy" },
  "/savings-lab": { number: "03", label: "Room to grow", shot: "roots" },
  "/evidence": { number: "04", label: "Proof in the details", shot: "clearing" },
  "/simulator": { number: "05", label: "A possible future", shot: "measure" },
  "/forecasts": { number: "06", label: "Beyond the horizon", shot: "canopy" },
  "/fix-hub": { number: "07", label: "Small changes, lasting impact", shot: "roots" },
  "/shield": { number: "08", label: "Protect what matters", shot: "clearing" },
  "/demo/event": { number: "09", label: "A place to begin", shot: "measure" },
};
const WorldContext = createContext({ scan: () => {}, reducedMotion: false });
export const useLivingWorld = () => useContext(WorldContext);

// Configuration requested by the ThreeUI source brief. Living-green is Sylva's authored variant.
const sylvaConfiguration = {
  variant: "living-green", headingFont: "lexend", bodyFont: "lexend",
  headingWeight: "300", bodyWeight: "300", primaryColor: "#ffffff",
  headingSize: 63, bodySize: 16.5, headingLetterSpacing: -0.006,
};

export function LivingWorld({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const world = routeWorlds[pathname] || routeWorlds["/"];
  const frameRoot = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState<string>();
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const settings = useRef({ active: true, pose: poses.arrival });

  const send = useCallback((data: Record<string, unknown>) => {
    frameRoot.current?.querySelector("iframe")?.contentWindow?.postMessage({ type: "carbonterra:world", ...data }, location.origin);
  }, []);
  const scan = useCallback(() => send({ scan: true }), [send]);
  const context = useMemo(() => ({ scan, reducedMotion }), [scan, reducedMotion]);

  useEffect(() => {
    const request = new AbortController();
    fetch("/landing-pages/carbonterra-world.html", { signal: request.signal })
      .then(response => { if (!response.ok) throw new Error("World source unavailable"); return response.text(); })
      .then(html => { setSource(html); setFailed(false); })
      .catch(error => { if (error.name !== "AbortError") setFailed(true); });
    return () => request.abort();
  }, [attempt]);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReducedMotion(media.matches);
      settings.current.active = !media.matches && !paused && !document.hidden;
      send({ ...settings.current });
    };
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frameRoot.current?.querySelector("iframe")?.contentWindow) return;
      if (event.data?.type === "carbonterra:world-ready") {
        const frame = frameRoot.current?.querySelector("iframe");
        frame?.setAttribute("tabindex", "-1");
        frame?.setAttribute("aria-hidden", "true");
        sync();
      }
      if (event.data?.type === "carbonterra:world-error") setFailed(true);
    };
    sync();
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("message", receive);
    return () => {
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("message", receive);
    };
  }, [paused, source, send]);

  useEffect(() => {
    let frame = 0;
    let pointerAt = 0;
    const update = () => {
      frame = 0;
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-world-shot]"));
      let shot = world.shot;
      let distance = Infinity;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top > innerHeight * .8 || rect.bottom < innerHeight * .2) continue;
        const next = Math.abs(rect.top + Math.min(rect.height, innerHeight) * .35 - innerHeight * .35);
        if (next < distance) { distance = next; shot = section.dataset.worldShot || shot; }
      }
      const base = poses[shot] || poses[world.shot];
      const progress = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
      settings.current.pose = { ...base, y: base.y - progress * .1 };
      send({ ...settings.current });
      progressRef.current?.style.setProperty("--journey-progress", String(progress));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !settings.current.active || performance.now() - pointerAt < 40) return;
      pointerAt = performance.now();
      send({ pointer: { x: event.clientX / innerWidth * 2 - 1, y: event.clientY / innerHeight * 2 - 1 } });
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("pointermove", pointer, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", pointer);
    };
  }, [pathname, world.shot, source, send]);

  return <WorldContext.Provider value={context}>
    <div className="living-world" data-world-route={pathname} data-world-paused={paused || reducedMotion}>
      <div className="world-environment" aria-hidden="true" ref={frameRoot}>
        <div className="world-atmosphere" />
        {source && !failed && <SylvaHero key={attempt} {...sylvaConfiguration} srcDoc={source} className="shader-frame" style={{ height: "100%", width: "100%", background: "#4a4d44" }} />}
        <div className="world-lens" />
      </div>
      <div className="world-location" aria-hidden="true"><span>CARBONTERRA</span><i /><span>{world.number} / {world.label}</span></div>
      <div className="world-motion-controls no-print">
        {failed ? <button onClick={() => { setSource(undefined); setFailed(false); setAttempt(value => value + 1); }}><RotateCcw size={13} /> Restore living scene</button> :
          <button onClick={() => setPaused(value => !value)} aria-pressed={paused} disabled={reducedMotion}>
            {paused || reducedMotion ? <Play size={13} /> : <Pause size={13} />}
            {reducedMotion ? "Still world" : paused ? "Resume world" : "Pause world"}
          </button>}
      </div>
      <div className="world-journey" ref={progressRef} aria-hidden="true"><span>{world.number}</span><i /><span>Explore</span></div>
      {children}
    </div>
  </WorldContext.Provider>;
}
