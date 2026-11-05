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
  B: { primary: "#ffffff", caustic: "#a0b5a2", hex: 0xffffff },
  C: { primary: "#fbbf24", caustic: "#d97706", hex: 0xfbbf24 },
  D: { primary: "#f87171", caustic: "#dc2626", hex: 0xf87171 },
  F: { primary: "#ef4444", caustic: "#991b1b", hex: 0xef4444 },
};

// GLSL Simplex 3D Noise Shader code
const NOISE_GLSL = `
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
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

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(289.0, i);
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
varying float vDisplacement;

${NOISE_GLSL}

void main() {
  vNormal = normalize(normalMatrix * normal);
  
  // Dual-frequency fluid displacement
  vec3 pos = position;
  float t = uTime * 0.85;
  float n1 = snoise(pos * 1.6 + vec3(0.0, t * 0.7, 0.0));
  float n2 = snoise(pos * 3.2 - vec3(t * 0.5, 0.0, t * 0.4));
  float disp = (n1 * 0.65 + n2 * 0.35) * uWobbleStrength;

  // Cursor proximity ripple
  float mouseDist = length(vec2(pos.x, pos.y) - uMouse * 1.4);
  disp += sin(mouseDist * 7.0 - uTime * 4.5) * 0.035 * (1.0 - smoothstep(0.0, 1.2, mouseDist));

  vDisplacement = disp;
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
varying float vDisplacement;

// Iridescent rainbow cosine palette
vec3 getIridescence(float phase) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.05, 0.33, 0.67);
  return a + b * cos(6.283185 * (c * phase + d));
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewPosition);

  // Fresnel viewing angle
  float NdotV = max(0.0, dot(N, V));
  float fresnel = pow(1.0 - NdotV, 2.4);

  // Thin-film interference thickness
  float phase = (1.0 - NdotV) * 1.8 + vDisplacement * 4.2 + sin(uTime * 0.5 + vPosition.y * 2.2) * 0.25;
  vec3 iridColor = getIridescence(phase);

  // Blend iridescent oil-slick sheen with brand grade color
  vec3 filmColor = mix(iridColor, uGradeColor, 0.32);

  // Key Specular reflection 1 (Top-Left key studio softbox)
  vec3 L1 = normalize(vec3(-0.6, 0.85, 0.9));
  vec3 H1 = normalize(L1 + V);
  float spec1 = pow(max(0.0, dot(N, H1)), 90.0);

  // Secondary Specular reflection 2 (Bottom-Right fill bounce)
  vec3 L2 = normalize(vec3(0.7, -0.6, 0.6));
  vec3 H2 = normalize(L2 + V);
  float spec2 = pow(max(0.0, dot(N, H2)), 40.0) * 0.5;

  // Internal glowing perimeter halo
  vec3 innerGlow = uGradeColor * pow(1.0 - NdotV, 3.8) * 0.75;

  // Final composite color
  vec3 finalColor = filmColor * (fresnel * 0.85 + 0.15) + innerGlow;
  finalColor += vec3(1.0, 1.0, 1.0) * (spec1 * 1.8 + spec2 * 0.7);

  // Soap film alpha transparency
  float alpha = clamp(fresnel * 0.8 + spec1 * 0.95 + spec2 * 0.35 + 0.08, 0.0, 1.0) * uOpacity;

  if (!gl_FrontFacing) {
    // Back wall is softer with reduced specular glare
    spec1 = 0.0;
    spec2 = 0.0;
    alpha *= 0.7;
  }

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

    // Bubble Mesh with Custom ShaderMaterial
    const geometry = new THREE.SphereGeometry(1.4, 64, 64);

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
    bubbleMesh.renderOrder = 3;

    // Interior back wall of bubble
    const backMaterial = bubbleMaterial.clone();
    backMaterial.side = THREE.BackSide;
    const backMesh = new THREE.Mesh(geometry, backMaterial);
    backMesh.renderOrder = 1;
    scene.add(backMesh);
    scene.add(bubbleMesh);

    // Floating Holographic 3D Grade Glyph Disc inside the Bubble
    const glyphCanvas = document.createElement("canvas");
    glyphCanvas.width = 512;
    glyphCanvas.height = 512;
    const ctx = glyphCanvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, 512, 512);

      // Subtle radial backdrop glow
      const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 220);
      grad.addColorStop(0, `${gradePalette.primary}33`);
      grad.addColorStop(0.6, `${gradePalette.primary}11`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(256, 256, 220, 0, Math.PI * 2);
      ctx.fill();

      // Grade Letter
      const fontSize = grade.length > 1 ? 190 : 230;
      ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Glow shadow
      ctx.shadowColor = gradePalette.primary;
      ctx.shadowBlur = 45;
      ctx.fillStyle = gradePalette.primary;
      ctx.fillText(grade, 256, 258);

      // Bright white core text overlay for crisp readability
      ctx.shadowBlur = 0;
      ctx.fillStyle = grade === "B" ? "#ffffff" : gradePalette.primary;
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
    glyphMesh.renderOrder = 2;
    scene.add(glyphMesh);

    // Orbiting Micro-Droplet Sparkles (16 tiny particles)
    const particleCount = 16;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);
    const particlePhases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleSpeeds[i] = 0.5 + Math.random() * 0.8;
      particleRadii[i] = 1.65 + Math.random() * 0.35;
      particlePhases[i] = Math.random() * Math.PI * 2;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    // Canvas particle texture
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext("2d");
    if (pCtx) {
      const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      pGrad.addColorStop(0, "#ffffff");
      pGrad.addColorStop(0.4, gradePalette.primary);
      pGrad.addColorStop(1, "transparent");
      pCtx.fillStyle = pGrad;
      pCtx.beginPath();
      pCtx.arc(32, 32, 32, 0, Math.PI * 2);
      pCtx.fill();
    }
    const particleTex = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      map: particleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.75,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    particleSystem.renderOrder = 4;
    scene.add(particleSystem);

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
      backMaterial.uniforms.uTime.value = elapsedTime;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
      bubbleMaterial.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
      backMaterial.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

      // Inertial rotation damping
      rotationRef.current.x += rotationRef.current.velX;
      rotationRef.current.y += rotationRef.current.velY;
      rotationRef.current.velX *= 0.92;
      rotationRef.current.velY *= 0.92;

      // Gentle auto-bobbing & counter-rotation
      const bobY = Math.sin(elapsedTime * 1.4) * 0.08;
      const rotY = rotationRef.current.y + elapsedTime * 0.25;
      const rotX = rotationRef.current.x + Math.sin(elapsedTime * 0.8) * 0.08;

      bubbleMesh.position.y = bobY;
      bubbleMesh.rotation.y = rotY;
      bubbleMesh.rotation.x = rotX;

      backMesh.position.y = bobY;
      backMesh.rotation.y = rotY;
      backMesh.rotation.x = rotX;

      // Glyph follows bubble center with subtle tilt and 3D billboard look
      glyphMesh.position.y = bobY;
      glyphMesh.rotation.y = Math.sin(elapsedTime * 1.2) * 0.15 + mouseRef.current.x * 0.2;
      glyphMesh.rotation.x = -mouseRef.current.y * 0.2;

      // Animate orbiting particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const speed = particleSpeeds[i];
        const radius = particleRadii[i];
        const angle = elapsedTime * speed + particlePhases[i];
        const yOffset = Math.sin(angle * 1.8) * 0.45;

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = bobY + yOffset;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
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
      backMaterial.dispose();
      glyphGeo.dispose();
      glyphMat.dispose();
      glyphTexture.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTex.dispose();
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
                color: grade === "B" ? "#ffffff" : gradePalette.primary,
                textShadow: `0 0 24px ${gradePalette.primary}cc, 0 0 45px ${gradePalette.primary}66`,
              }}
            >
              {grade}
            </span>
          </div>

          {/* Front Specular Flares */}
          <div
            className="absolute top-[10%] left-[15%] w-[32%] h-[22%] rounded-full pointer-events-none transform -rotate-[32deg]"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.45) 50%, transparent 80%)",
              filter: "blur(0.5px)",
              mixBlendMode: "screen",
            }}
          />
          <div
            className="absolute bottom-[14%] right-[16%] w-[24%] h-[15%] rounded-full pointer-events-none transform rotate-[35deg]"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(203,255,0,0.5) 0%, rgba(56,189,248,0.3) 50%, transparent 80%)",
              filter: "blur(1px)",
              mixBlendMode: "screen",
            }}
          />
        </div>
      )}
    </div>
  );
}
