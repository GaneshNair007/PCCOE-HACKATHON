"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";

interface CarbonGlobe3DProps {
  activeRegion?: string;
  gridIntensity?: number;
  isGreen?: boolean;
  hasAuditedTarget?: boolean;
  className?: string;
}

// Global Cloud Datacenter Coordinates for Telemetry Points & Arcs
const DATACENTER_NODES = [
  { id: "us-east", name: "US-East (N. Virginia)", lat: 39.04, lon: -77.48, grid: 379 },
  { id: "us-west", name: "US-West (Oregon)", lat: 45.84, lon: -119.70, grid: 120 },
  { id: "eu-central", name: "EU-Central (Frankfurt)", lat: 50.11, lon: 8.68, grid: 348 },
  { id: "eu-west", name: "EU-West (Ireland)", lat: 53.35, lon: -6.26, grid: 288 },
  { id: "ap-south", name: "AP-South (Mumbai)", lat: 19.07, lon: 72.87, grid: 632 },
  { id: "ap-northeast", name: "AP-Northeast (Tokyo)", lat: 35.68, lon: 139.69, grid: 455 },
  { id: "ap-southeast", name: "AP-Southeast (Singapore)", lat: 1.35, lon: 103.82, grid: 392 },
  { id: "sa-east", name: "SA-East (São Paulo)", lat: -23.55, lon: -46.63, grid: 105 },
  { id: "au-southeast", name: "AU-Southeast (Sydney)", lat: -33.87, lon: 151.21, grid: 540 },
];

// Great-Circle Arc Connections between Datacenter Pairs
const DATACENTER_ARCS = [
  { from: "us-east", to: "eu-central" },
  { from: "us-east", to: "us-west" },
  { from: "eu-central", to: "ap-south" },
  { from: "us-west", to: "ap-northeast" },
  { from: "ap-south", to: "ap-southeast" },
  { from: "ap-northeast", to: "ap-southeast" },
  { from: "eu-west", to: "us-east" },
  { from: "us-east", to: "sa-east" },
];

const COUNTRY_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  US: { lat: 37.09, lon: -95.71, name: "United States" },
  USA: { lat: 37.09, lon: -95.71, name: "United States" },
  IN: { lat: 20.59, lon: 78.96, name: "India" },
  IND: { lat: 20.59, lon: 78.96, name: "India" },
  DE: { lat: 51.16, lon: 10.45, name: "Germany" },
  DEU: { lat: 51.16, lon: 10.45, name: "Germany" },
  SE: { lat: 60.12, lon: 18.64, name: "Sweden" },
  SWE: { lat: 60.12, lon: 18.64, name: "Sweden" },
  JP: { lat: 36.20, lon: 138.25, name: "Japan" },
  JPN: { lat: 36.20, lon: 138.25, name: "Japan" },
  GB: { lat: 55.37, lon: -3.43, name: "United Kingdom" },
  GBR: { lat: 55.37, lon: -3.43, name: "United Kingdom" },
  FR: { lat: 46.22, lon: 2.21, name: "France" },
  FRA: { lat: 46.22, lon: 2.21, name: "France" },
  SG: { lat: 1.35, lon: 103.81, name: "Singapore" },
  AU: { lat: -25.27, lon: 133.77, name: "Australia" },
  CA: { lat: 56.13, lon: -106.34, name: "Canada" },
  NL: { lat: 52.13, lon: 5.29, name: "Netherlands" },
  IE: { lat: 53.14, lon: -7.69, name: "Ireland" },
};

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Great Circle Arc Generator for 3D globe
function createGreatCircleArc(
  v1: THREE.Vector3,
  v2: THREE.Vector3,
  maxAltitude: number = 18,
  segments: number = 48
): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Slerp interpolation on unit sphere
    const p = new THREE.Vector3().lerpVectors(v1, v2, t);
    const altitude = Math.sin(Math.PI * t) * maxAltitude;
    p.normalize().multiplyScalar(v1.length() + altitude);
    points.push(p);
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

export function CarbonGlobe3D({
  activeRegion,
  gridIntensity = 494,
  isGreen = false,
  hasAuditedTarget = false,
  className = "",
}: CarbonGlobe3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const targetNodeRef = useRef<THREE.Group | null>(null);
  const pulseRingsRef = useRef<THREE.Mesh[]>([]);

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [telemetryCoordinates, setTelemetryCoordinates] = useState("LAT: 39.04° N • LON: 77.48° W");

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 600;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 230;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    const GLOBE_RADIUS = 76;

    // 2. Base Dark Sphere & Wireframe Grid
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 36, 36);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x061810,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphere);

    // Inner dark core to occlude backside particles
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.99, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x040e0a });
    const core = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(core);

    // 3. Continental Landmass Point Cloud
    const particleCount = 1350;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const emeraldMuted = new THREE.Color(0x275a40);
    const limeAccent = new THREE.Color(0xcbff00);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = GLOBE_RADIUS * 1.006;

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      const isHighlight = Math.random() > 0.88;
      const c = isHighlight ? limeAccent : emeraldMuted;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particles);

    // 4. Real Datacenter Pins Layer (globe-gl skill pattern)
    const nodeCoordsMap: Record<string, THREE.Vector3> = {};
    const nodeMeshGroup = new THREE.Group();

    DATACENTER_NODES.forEach((dc) => {
      const pos = latLonToVector3(dc.lat, dc.lon, GLOBE_RADIUS * 1.012);
      nodeCoordsMap[dc.id] = pos;

      // Pin core
      const dotGeo = new THREE.SphereGeometry(1.6, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xcbff00 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      nodeMeshGroup.add(dot);

      // Faint pulse ring
      const ringGeo = new THREE.RingGeometry(2.0, 2.7, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xcbff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(pos.clone().multiplyScalar(2));
      nodeMeshGroup.add(ring);
    });

    globeGroup.add(nodeMeshGroup);

    // 5. Great-Circle Telemetry Arcs (globe-gl skill pattern)
    const arcGroup = new THREE.Group();
    const arcMaterial = new THREE.LineBasicMaterial({
      color: 0x50c878,
      transparent: true,
      opacity: 0.4,
    });

    DATACENTER_ARCS.forEach(({ from, to }) => {
      const v1 = nodeCoordsMap[from];
      const v2 = nodeCoordsMap[to];
      if (v1 && v2) {
        const arcGeo = createGreatCircleArc(v1, v2, 14, 36);
        const arcLine = new THREE.Line(arcGeo, arcMaterial);
        arcGroup.add(arcLine);
      }
    });
    globeGroup.add(arcGroup);

    // 6. Active Audited Region Target Node
    const targetNodeGroup = new THREE.Group();
    targetNodeRef.current = targetNodeGroup;
    globeGroup.add(targetNodeGroup);

    // 7. Ambient Orbital Rings (bright-green-tech-system-webgl)
    const ringGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.28, GLOBE_RADIUS * 1.295, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xcbff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22,
    });

    const orbitRing1 = new THREE.Mesh(ringGeo, ringMat);
    orbitRing1.rotation.x = Math.PI / 3;
    globeGroup.add(orbitRing1);

    const orbitRing2 = new THREE.Mesh(ringGeo, ringMat.clone());
    orbitRing2.rotation.x = -Math.PI / 4;
    orbitRing2.rotation.y = Math.PI / 6;
    globeGroup.add(orbitRing2);

    // Initial Globe Tilt
    globeGroup.rotation.x = 0.28;
    globeGroup.rotation.y = -0.5;

    // Mouse Parallax Interaction (smooth lerp, disabled on reduced motion)
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.28;
    let targetRotationY = -0.5;

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 1.5;
      mouseY = y * 1.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      if (prefersReducedMotion) renderer.render(scene, camera);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    if (prefersReducedMotion) {
      // Single static high-quality frame for users requesting reduced motion
      renderer.render(scene, camera);
    } else {
      let isVisible = true;
      const handleVisibility = () => {
        isVisible = !document.hidden;
      };
      document.addEventListener("visibilitychange", handleVisibility);

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (!isVisible) return;

        const time = clock.getElapsedTime();

        // Idle orbital rotation
        globeGroup.rotation.y += 0.0022;

        // Smooth parallax lerp
        targetRotationY = globeGroup.rotation.y + mouseX * 0.25;
        targetRotationX = 0.28 + mouseY * 0.2;
        globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, targetRotationX, 0.04);

        orbitRing1.rotation.z += 0.002;
        orbitRing2.rotation.z -= 0.0018;

        // Animate pulse rings on audited target if active
        pulseRingsRef.current.forEach((r, idx) => {
          const s = 1 + ((time * 1.5 + idx * 0.6) % 2.5);
          r.scale.set(s, s, s);
          (r.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - s * 0.25);
        });

        renderer.render(scene, camera);
      };

      animate();
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      sphereGeo.dispose();
      particleGeo.dispose();
    };
  }, []);

  // Update Country Marker when activeRegion changes
  useEffect(() => {
    if (!targetNodeRef.current) return;
    const group = targetNodeRef.current;

    // Clear old children
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    pulseRingsRef.current = [];

    if (!hasAuditedTarget) return;

    const code = (activeRegion || "US").toUpperCase().trim();
    const coords = COUNTRY_COORDINATES[code] || COUNTRY_COORDINATES["US"];

    const pos = latLonToVector3(coords.lat, coords.lon, 76 * 1.015);

    // Visual Node
    const nodeGeo = new THREE.SphereGeometry(3.0, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: isGreen ? 0xcbff00 : 0xf87171,
    });
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.copy(pos);
    group.add(node);

    // Pulsating Rings
    for (let i = 0; i < 2; i++) {
      const ringGeo = new THREE.RingGeometry(3.5, 4.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isGreen ? 0xcbff00 : 0xf87171,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(pos.clone().multiplyScalar(2));
      group.add(ring);
      pulseRingsRef.current.push(ring);
    }

    // Telemetry label update
    setTelemetryCoordinates(
      `LAT: ${coords.lat.toFixed(2)}° • LON: ${coords.lon.toFixed(2)}° (${coords.name})`
    );

    // Smoothly rotate globe to center the audited location
    if (globeGroupRef.current) {
      const targetY = -(coords.lon * (Math.PI / 180)) - Math.PI / 2;
      gsap.to(globeGroupRef.current.rotation, {
        y: targetY,
        x: (coords.lat * (Math.PI / 180)) * 0.4,
        duration: 1.8,
        ease: "power3.out",
      });
    }
  }, [activeRegion, hasAuditedTarget, isGreen]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Technical Canvas Overlay (bright-green-tech-system-webgl style) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 font-mono text-[10px] text-lime/80 select-none">
        <div className="flex items-center justify-between border-b border-surface-border/40 pb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-ping" />
            <span>DATACENTER TELEMETRY ENGINE</span>
          </span>
          <span className="text-sage/60">NODE: ACTIVE</span>
        </div>

        <div className="flex items-end justify-between border-t border-surface-border/40 pt-2">
          <div className="space-y-0.5">
            <div className="text-sage/70">{telemetryCoordinates}</div>
            <div className="text-cream text-[9px]">GRID INTENSITY: {gridIntensity} gCO2e/kWh</div>
          </div>
          <div className="text-right">
            <span className="text-lime bg-forest-900/80 px-2 py-0.5 rounded border border-lime/30 text-[9px]">
              {isGreen ? "100% RENEWABLE" : "STANDARD GRID"}
            </span>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
