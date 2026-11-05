"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { EcoScoreGrade } from "@/types/telemetry";

export interface WebGLSoapBubbleProps {
  grade: EcoScoreGrade;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  interactive?: boolean;
  className?: string;
  wobbleSpeed?: number;
  wobbleStrength?: number;
}

const SIZE_PX_MAP = {
  sm: 130,
  md: 180,
  lg: 240,
  xl: 300,
  hero: 360,
};

const GRADE_COLORS: Record<EcoScoreGrade, { primary: string; caustic: string; hex: number }> = {
  "A+": { primary: "#cbff00", caustic: "#9ecc00", hex: 0xcbff00 },
  A: { primary: "#cbff00", caustic: "#9ecc00", hex: 0xcbff00 },
  B: { primary: "#38bdf8", caustic: "#0284c7", hex: 0x38bdf8 },
  C: { primary: "#fbbf24", caustic: "#d97706", hex: 0xfbbf24 },
  D: { primary: "#f97316", caustic: "#ea580c", hex: 0xf97316 },
  F: { primary: "#ef4444", caustic: "#dc2626", hex: 0xef4444 },
};

// GLSL Simplex 3D Noise Shader code (Standard Stefan Gustavson / Ashima Arts)
const NOISE_GLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERTEX_SHADER = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uWobbleStrength;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

${NOISE_GLSL}

void main() {
  vNormal = normalize(normalMatrix * normal);
  
  // Real soap bubble surface tension: large, low-frequency liquid breathing
  vec3 pos = position;
  float t = uTime * 0.65;
  float n1 = snoise(pos * 0.75 + vec3(0.0, t * 0.4, 0.0));
  float n2 = snoise(pos * 1.3 - vec3(t * 0.3, 0.0, t * 0.2));
  float disp = (n1 * 0.75 + n2 * 0.25) * (uWobbleStrength * 0.45);

  // Gentle cursor pressure ripple
  float mouseDist = length(pos.xy - uMouse * 1.2);
  disp += sin(mouseDist * 4.5 - uTime * 2.5) * 0.018 * (1.0 - smoothstep(0.0, 1.3, mouseDist));

  vec3 newPosition = position + normal * disp;

  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  vPosition = newPosition;

  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT_SHADER = `
uniform float uTime;
uniform vec3 uGradeColor;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

// Delicate pastel rainbow iridescence palette
vec3 getIridescence(float phase) {
  vec3 a = vec3(0.55, 0.55, 0.55);
  vec3 b = vec3(0.45, 0.45, 0.45);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.33, 0.67);
  return a + b * cos(6.283185 * (c * phase + d));
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewPosition);

  // Fresnel viewing angle: 0 at center, 1 at rim
  float NdotV = max(0.0, dot(N, V));
  float fresnel = pow(1.0 - NdotV, 2.5);
  float rimHalo = pow(1.0 - NdotV, 4.8);

  // Smooth thin-film interference thickness flowing across surface
  float flow = uTime * 0.35;
  float wave1 = sin(vPosition.x * 1.8 + vPosition.y * 1.4 + flow);
  float wave2 = cos(vPosition.y * 2.1 - vPosition.z * 1.2 + flow * 0.8);
  float phase = (1.0 - NdotV) * 2.2 + (wave1 + wave2) * 0.28 + vPosition.y * 0.25;
  vec3 iridColor = getIridescence(phase);

  // Blend iridescent oil-slick sheen with brand grade color
  vec3 filmColor = mix(iridColor, uGradeColor, 0.42);

  // Elegant curved studio light reflections (crescent arcs along curvature, NEVER circular dots)
  // Top-left curved reflection arc
  float r = length(vPosition.xy) / 1.35;
  float arc1 = smoothstep(0.18, 0.0, abs(r - 0.76)) * smoothstep(0.1, 0.85, dot(normalize(vPosition.xy), vec2(-0.65, 0.75))) * smoothstep(0.0, 0.5, N.z);
  float curvedGleam1 = arc1 * 1.7;

  // Secondary soft ambient fill curve along opposite rim
  float arc2 = smoothstep(0.14, 0.0, abs(r - 0.82)) * smoothstep(0.4, 0.95, dot(normalize(vPosition.xy), vec2(0.75, -0.65))) * smoothstep(0.0, 0.5, N.z);
  float curvedGleam2 = arc2 * 0.65;

  // Color composition:
  // Delicate iridescent sheen across the face that blooms into vibrant rainbow reflection at the rim
  vec3 finalColor = filmColor * (fresnel * 0.75 + 0.28);
  finalColor += uGradeColor * rimHalo * 0.85;
  finalColor += vec3(1.0, 1.0, 1.0) * (curvedGleam1 + curvedGleam2);

  // Translucent glass face so it catches light and feels tangible,
  // while the 3D typography inside shines through brightly
  float alpha = clamp(fresnel * 0.6 + 0.22 + curvedGleam1 * 0.8 + curvedGleam2 * 0.4 + rimHalo * 0.5, 0.12, 0.95) * uOpacity;

  gl_FragColor = vec4(finalColor, alpha);
}
`;

export function WebGLSoapBubble({
  grade,
  size = "md",
  interactive = true,
  className = "",
  wobbleSpeed = 1.0,
  wobbleStrength = 0.09,
}: WebGLSoapBubbleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isDown: false, lastX: 0, lastY: 0 });
  const rotationRef = useRef({ x: 0, y: 0, velX: 0, velY: 0 });
  const [webGlSupported, setWebGlSupported] = useState(true);

  const dimension = SIZE_PX_MAP[size] || SIZE_PX_MAP.md;
  const gradePalette = GRADE_COLORS[grade] || GRADE_COLORS.A;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect WebGL capability
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const width = dimension;
    const height = dimension;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn("WebGL initialization failed, falling back to 3D CSS sphere:", e);
      setWebGlSupported(false);
      return;
    }

    // Bubble Mesh with Custom ShaderMaterial (Single Ultra-Clean Front Glass Layer)
    const geometry = new THREE.SphereGeometry(1.4, 96, 96);

    const gradeColorVec = new THREE.Color(gradePalette.primary);

    const bubbleMaterial = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uWobbleStrength: { value: wobbleStrength },
        uGradeColor: { value: gradeColorVec },
        uOpacity: { value: 0.95 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      blending: THREE.NormalBlending,
    });

    const bubbleMesh = new THREE.Mesh(geometry, bubbleMaterial);
    bubbleMesh.renderOrder = 2;
    scene.add(bubbleMesh);

    // Floating Holographic 3D Grade Glyph Disc inside the Bubble
    const glyphCanvas = document.createElement("canvas");
    glyphCanvas.width = 512;
    glyphCanvas.height = 512;
    const ctx = glyphCanvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, 512, 512);

      // Subtle radial backdrop glow
      const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 210);
      grad.addColorStop(0, `${gradePalette.primary}35`);
      grad.addColorStop(0.5, `${gradePalette.primary}12`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(256, 256, 210, 0, Math.PI * 2);
      ctx.fill();

      // Grade Letter typography
      const fontSize = grade.length > 1 ? 190 : 230;
      ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Atmospheric Grade Color Drop Glow
      ctx.shadowColor = gradePalette.primary;
      ctx.shadowBlur = 38;
      ctx.fillStyle = gradePalette.primary;
      ctx.fillText(grade, 256, 258);

      // Crisp White High-Contrast Core Text Overlay
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(grade, 256, 258);
    }

    const glyphTexture = new THREE.CanvasTexture(glyphCanvas);
    glyphTexture.minFilter = THREE.LinearFilter;
    glyphTexture.magFilter = THREE.LinearFilter;

    const glyphGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const glyphMat = new THREE.MeshBasicMaterial({
      map: glyphTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      opacity: 0.95,
    });
    const glyphMesh = new THREE.Mesh(glyphGeo, glyphMat);
    glyphMesh.renderOrder = 1;
    scene.add(glyphMesh);

    // Interactive event listeners
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;

      if (mouseRef.current.isDown) {
        const deltaX = e.clientX - mouseRef.current.lastX;
        const deltaY = e.clientY - mouseRef.current.lastY;
        rotationRef.current.velY += deltaX * 0.005;
        rotationRef.current.velX += deltaY * 0.005;
        mouseRef.current.lastX = e.clientX;
        mouseRef.current.lastY = e.clientY;
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      mouseRef.current.isDown = true;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
    };

    const handlePointerUp = () => {
      mouseRef.current.isDown = false;
    };

    const handlePointerLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.isDown = false;
    };

    if (interactive) {
      container.addEventListener("mousemove", handlePointerMove);
      container.addEventListener("mousedown", handlePointerDown);
      window.addEventListener("mouseup", handlePointerUp);
      container.addEventListener("mouseleave", handlePointerLeave);
    }

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime() * wobbleSpeed;

      // Update uniforms
      bubbleMaterial.uniforms.uTime.value = elapsedTime;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
      bubbleMaterial.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

      // Inertial rotation damping
      rotationRef.current.x += rotationRef.current.velX;
      rotationRef.current.y += rotationRef.current.velY;
      rotationRef.current.velX *= 0.92;
      rotationRef.current.velY *= 0.92;

      // Gentle auto-bobbing & counter-rotation
      const bobY = Math.sin(elapsedTime * 1.2) * 0.06;
      const rotY = rotationRef.current.y + elapsedTime * 0.2;
      const rotX = rotationRef.current.x + Math.sin(elapsedTime * 0.7) * 0.06;

      bubbleMesh.position.y = bobY;
      bubbleMesh.rotation.y = rotY;
      bubbleMesh.rotation.x = rotX;

      // Glyph follows bubble center with subtle tilt and 3D billboard look
      glyphMesh.position.y = bobY;
      glyphMesh.rotation.y = Math.sin(elapsedTime * 0.9) * 0.12 + mouseRef.current.x * 0.18;
      glyphMesh.rotation.x = -mouseRef.current.y * 0.18;

      try {
        renderer.render(scene, camera);
      } catch (renderErr) {
        console.warn("WebGL render error, using fallback:", renderErr);
        setWebGlSupported(false);
      }
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        container.removeEventListener("mousemove", handlePointerMove);
        container.removeEventListener("mousedown", handlePointerDown);
        window.removeEventListener("mouseup", handlePointerUp);
        container.removeEventListener("mouseleave", handlePointerLeave);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      bubbleMaterial.dispose();
      glyphGeo.dispose();
      glyphMat.dispose();
      glyphTexture.dispose();
      renderer.dispose();
    };
  }, [dimension, grade, interactive, wobbleSpeed, wobbleStrength, gradePalette]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{
        width: dimension,
        height: dimension,
      }}
      role="img"
      aria-label={`Interactive 3D WebGL Soap Bubble Grade ${grade}`}
    >
      {/* High-Fidelity 3D Fallback when WebGL is unavailable */}
      {!webGlSupported && (
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center select-none overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 40%, rgba(0,0,0,0.3) 75%, transparent 100%)",
            boxShadow: `
              inset 0 0 24px rgba(255,255,255,0.25),
              inset 0 0 14px ${gradePalette.primary}66,
              0 14px 34px -8px rgba(0, 0, 0, 0.75),
              0 0 28px -4px ${gradePalette.primary}44
            `,
            border: "1.5px solid rgba(255, 255, 255, 0.35)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          {/* Iridescent Rainbow Sheen */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-85"
            style={{
              background: `
                conic-gradient(
                  from 135deg at 50% 50%,
                  rgba(203, 255, 0, 0.35) 0deg,
                  rgba(56, 189, 248, 0.45) 60deg,
                  rgba(236, 72, 153, 0.4) 130deg,
                  rgba(168, 85, 247, 0.4) 200deg,
                  rgba(52, 211, 153, 0.4) 270deg,
                  rgba(203, 255, 0, 0.35) 360deg
                )
              `,
              maskImage: "radial-gradient(circle, transparent 55%, black 72%, black 97%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 55%, black 72%, black 97%, transparent 100%)",
              mixBlendMode: "screen",
            }}
          />

          {/* Floating Grade Typography */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <span
              className="font-display font-black tracking-tight"
              style={{
                fontSize: dimension * 0.42,
                color: "#ffffff",
                textShadow: `0 0 24px ${gradePalette.primary}cc, 0 0 45px ${gradePalette.primary}66`,
              }}
            >
              {grade}
            </span>
          </div>

          {/* Curved Studio Gleam Reflection (Crescent arc along curvature, NEVER circular dots) */}
          <div
            className="absolute inset-[8%] rounded-full pointer-events-none"
            style={{
              borderTop: "3px solid rgba(255, 255, 255, 0.9)",
              borderLeft: "2px solid rgba(255, 255, 255, 0.45)",
              borderRight: "transparent",
              borderBottom: "transparent",
              filter: "blur(1.2px)",
              transform: "rotate(-25deg)",
              maskImage: "radial-gradient(circle at 35% 25%, black 40%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(circle at 35% 25%, black 40%, transparent 75%)",
            }}
          />
          <div
            className="absolute inset-[10%] rounded-full pointer-events-none opacity-50"
            style={{
              borderBottom: "2px solid rgba(203, 255, 0, 0.6)",
              borderRight: "1.5px solid rgba(56, 189, 248, 0.4)",
              borderLeft: "transparent",
              borderTop: "transparent",
              filter: "blur(2px)",
              transform: "rotate(-20deg)",
            }}
          />
        </div>
      )}
    </div>
  );
}
