"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

interface CarbonGlobe3DProps {
  activeRegion?: string;
  gridIntensity?: number;
  isGreen?: boolean;
  hasAuditedTarget?: boolean;
  className?: string;
}

// Approximate country center coordinates for country-level telemetry visualization
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

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 600;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

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

    const GLOBE_RADIUS = 75;

    // 1. Inner Wireframe / Dot Sphere
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 36, 36);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x0f382a,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphere);

    // 2. Continental Landmass Point Cloud (1200 points distributed across earth geometry)
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(0x3a7d5a);
    const limeHighlight = new THREE.Color(0xcbff00);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = GLOBE_RADIUS * 1.008;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const c = Math.random() > 0.85 ? limeHighlight : baseColor;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particles);

    // 3. Dynamic Country Marker Node (Rendered ONLY if an actual audited site region exists)
    const targetNodeGroup = new THREE.Group();
    targetNodeRef.current = targetNodeGroup;
    globeGroup.add(targetNodeGroup);

    // 4. Orbital Cyber Rings (Rotating in 3D around globe)
    const orbitRingGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.32, GLOBE_RADIUS * 1.335, 64);
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: 0xcbff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const orbitRing1 = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRing1.rotation.x = Math.PI / 3;
    globeGroup.add(orbitRing1);

    const orbitRing2 = new THREE.Mesh(orbitRingGeo, orbitRingMat.clone());
    orbitRing2.rotation.x = -Math.PI / 4;
    orbitRing2.rotation.y = Math.PI / 6;
    globeGroup.add(orbitRing2);

    // Initial Globe Tilt
    globeGroup.rotation.x = 0.35;
    globeGroup.rotation.y = -0.6;

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.35;
    let targetRotationY = -0.6;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 2;
      mouseY = y * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Render loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth idle rotation
      globeGroup.rotation.y += 0.003;

      // Mouse parallax lerp
      targetRotationY = globeGroup.rotation.y + mouseX * 0.35;
      targetRotationX = 0.35 + mouseY * 0.3;

      globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, targetRotationX, 0.05);

      orbitRing1.rotation.z += 0.003;
      orbitRing2.rotation.z -= 0.002;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      orbitRingGeo.dispose();
      orbitRingMat.dispose();
    };
  }, []);

  // Update country marker dynamically based on real audit result
  useEffect(() => {
    if (!targetNodeRef.current || !globeGroupRef.current) return;
    const group = targetNodeRef.current;

    // Clear previous children
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    if (!hasAuditedTarget || !activeRegion) return;

    // Resolve country coordinate
    const regionUpper = activeRegion.toUpperCase().trim();
    let coords = COUNTRY_COORDINATES[regionUpper];
    if (!coords) {
      for (const [k, v] of Object.entries(COUNTRY_COORDINATES)) {
        if (v.name.toUpperCase().includes(regionUpper) || regionUpper.includes(v.name.toUpperCase())) {
          coords = v;
          break;
        }
      }
    }

    if (coords) {
      const pos = latLonToVector3(coords.lat, coords.lon, 75 * 1.02);
      const pinColor = isGreen ? 0xcbff00 : 0xe3b341;

      // Country marker pin
      const pinGeo = new THREE.SphereGeometry(2.5, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(pos);
      group.add(pin);

      // Outer pulsing ring
      const ringGeo = new THREE.RingGeometry(3.0, 5.0, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos.clone().multiplyScalar(1.01));
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      group.add(ring);

      gsap.to(ring.scale, {
        x: 2.0,
        y: 2.0,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Smoothly rotate globe to face the audited country
      const targetPhi = (90 - coords.lat) * (Math.PI / 180);
      const targetTheta = (coords.lon + 180) * (Math.PI / 180);
      gsap.to(globeGroupRef.current.rotation, {
        y: -targetTheta + Math.PI / 2,
        duration: 1.2,
        ease: "power2.out",
      });
    }
  }, [activeRegion, hasAuditedTarget, isGreen]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none select-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Trustworthy Explanatory Telemetry Overlay */}
      {hasAuditedTarget ? (
        <>
          <div className="absolute bottom-4 left-4 glass-panel px-3 py-1.5 rounded-lg border border-lime/30 font-mono text-[11px] text-lime flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
            <span>
              GRID TELEMETRY (Country-level): {activeRegion || "Resolved Host"} • {gridIntensity} gCO2e/kWh
            </span>
          </div>

          <div className="absolute top-4 right-4 glass-panel px-3 py-1.5 rounded-lg border border-surface-border font-mono text-[11px] text-cream/70 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isGreen ? "bg-lime" : "bg-amber-400"}`} />
            <span>ENERGY STATUS: {isGreen ? "VERIFIED RENEWABLE" : "STANDARD REGIONAL GRID"}</span>
          </div>
        </>
      ) : (
        <div className="absolute bottom-4 left-4 glass-panel px-3 py-1.5 rounded-lg border border-surface-border font-mono text-[11px] text-sage/70 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sage/40" />
          <span>STANDBY: Ready for target URL input</span>
        </div>
      )}
    </div>
  );
}
