"use client";

import { useEffect, useRef, useState } from "react";
import { useTimerStore } from "@/lib/stores/timer-store";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useAppStore } from "@/lib/stores/app-store";
import { useThemeStore } from "@/lib/stores/theme-store";

type Vec3 = [number, number, number];
interface Palette {
  a: Vec3; // deep base
  b: Vec3; // mid tone
  c: Vec3; // nebula accent
  d: Vec3; // active highlight
}

// Shader palette per visual theme (scene ids from scene-selector).
// Previously the shader colors were hardcoded to the "midnight" look, so
// switching themes changed nothing on the home page.
const SCENE_PALETTES: Record<string, Palette> = {
  midnight: {
    a: [0.015, 0.008, 0.059],
    b: [0.06, 0.16, 0.38],
    c: [0.32, 0.12, 0.58],
    d: [0.0, 0.72, 0.95],
  },
  "rain-window": {
    a: [0.004, 0.035, 0.07],
    b: [0.008, 0.094, 0.169],
    c: [0.0, 0.27, 0.5],
    d: [0.0, 0.85, 1.0],
  },
  synthwave: {
    a: [0.059, 0.0, 0.11],
    b: [0.106, 0.0, 0.188],
    c: [0.85, 0.05, 0.45],
    d: [0.0, 0.88, 1.0],
  },
  forest: {
    a: [0.0, 0.031, 0.012],
    b: [0.004, 0.102, 0.051],
    c: [0.02, 0.35, 0.17],
    d: [0.05, 0.95, 0.5],
  },
  terminal: {
    a: [0.004, 0.008, 0.016],
    b: [0.031, 0.082, 0.122],
    c: [0.08, 0.18, 0.24],
    d: [0.15, 0.9, 0.5],
  },
  sunset: {
    a: [0.09, 0.024, 0.0],
    b: [0.176, 0.051, 0.0],
    c: [0.9, 0.3, 0.02],
    d: [1.0, 0.75, 0.1],
  },
};

// Matching radial-glow overlay (the mix-blend-screen layer above the canvas).
const SCENE_OVERLAYS: Record<string, string> = {
  midnight:
    "radial-gradient(circle at 15% 20%, rgba(30,10,80,0.8) 0%, transparent 60%), radial-gradient(circle at 85% 80%, rgba(10,40,90,0.8) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(20,10,50,0.9) 0%, transparent 70%)",
  "rain-window":
    "radial-gradient(circle at 15% 20%, rgba(4,38,80,0.8) 0%, transparent 60%), radial-gradient(circle at 85% 80%, rgba(0,60,110,0.75) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(3,22,55,0.9) 0%, transparent 70%)",
  synthwave:
    "radial-gradient(circle at 15% 20%, rgba(85,5,60,0.8) 0%, transparent 60%), radial-gradient(circle at 85% 80%, rgba(40,0,95,0.8) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(60,8,50,0.9) 0%, transparent 70%)",
  forest:
    "radial-gradient(circle at 15% 20%, rgba(4,55,28,0.75) 0%, transparent 60%), radial-gradient(circle at 85% 80%, rgba(0,42,24,0.8) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(2,28,14,0.9) 0%, transparent 70%)",
  terminal:
    "radial-gradient(circle at 15% 20%, rgba(14,34,48,0.7) 0%, transparent 60%), radial-gradient(circle at 85% 80%, rgba(9,24,36,0.8) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(7,18,28,0.9) 0%, transparent 70%)",
  sunset:
    "radial-gradient(circle at 15% 20%, rgba(90,28,4,0.8) 0%, transparent 60%), radial-gradient(circle at 85% 80%, rgba(70,20,0,0.75) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(48,14,4,0.9) 0%, transparent 70%)",
};

// UNMASKED_RENDERER_WEBGL values that mean the "GPU" is actually the CPU.
// Booting a full-screen fragment shader on a software rasterizer melts the
// main thread (PageSpeed bots run SwiftShader), so those clients get the
// static CSS backdrop instead.
const SOFTWARE_RENDERER_RE = /swiftshader|llvmpipe|software/i;

// The shader is an organic low-frequency gradient — rendering at half of CSS
// pixels (capped at 1x DPR) and letting CSS upscale is visually identical and
// cuts fragment work by 4x+ on retina screens.
const MAX_RENDER_SCALE = 0.5;

// While idle (no timer running, no music) cap the loop at ~30fps.
const IDLE_FRAME_MS = 33;

export function WebGLBackground({ forceScene = false }: { forceScene?: boolean } = {}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set when the WebGL context reports a software rasterizer — we then skip
  // the GL loop entirely and fall back to the static .theme-backdrop div.
  const [softwareRenderer, setSoftwareRenderer] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  const timerStatus = useTimerStore((s) => s.status);
  const isMusicPlaying = usePlayerStore((s) => s.isPlaying);
  const scene = useAppStore((s) => s.scene);
  // Interface theme (skin). The animated WebGL wallpaper belongs to the
  // "glass" identity only — every other theme gets a static CSS backdrop
  // (styled per [data-theme] in globals.css) so it reads as its own product.
  // `forceScene` = always render the cosmic scene regardless of interface
  // theme (used on the marketing/landing surfaces, which are brand territory
  // and must not inherit the in-app skin the visitor happened to pick).
  const theme = useThemeStore((s) => s.theme);
  const isGlass = forceScene || theme === "glass";
  const isCurrentlyActive = timerStatus === "running" || isMusicPlaying;

  const isCurrentlyActiveRef = useRef(isCurrentlyActive);
  // Brand surfaces (forceScene) always use the canonical midnight cosmic palette,
  // never the in-app scene the visitor happened to pick.
  const paletteRef = useRef<Palette>(
    forceScene ? SCENE_PALETTES.midnight : SCENE_PALETTES[scene] ?? SCENE_PALETTES.midnight
  );

  useEffect(() => {
    isCurrentlyActiveRef.current = isCurrentlyActive;
  }, [isCurrentlyActive]);

  useEffect(() => {
    paletteRef.current = forceScene
      ? SCENE_PALETTES.midnight
      : SCENE_PALETTES[scene] ?? SCENE_PALETTES.midnight;
  }, [scene, forceScene]);

  useEffect(() => {
    if (!mounted || softwareRenderer) return;
    // Non-glass themes never boot the GL loop; when the user switches away
    // from glass this effect re-runs and the cleanup below tears the old
    // loop down (RAF cancelled, listeners removed, GL resources freed).
    if (!isGlass) return;
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // Software rasterizer (SwiftShader/llvmpipe/…): don't boot the loop at
    // all — release the context and swap in the static CSS backdrop.
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? "");
      if (SOFTWARE_RENDERER_RE.test(renderer)) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        setSoftwareRenderer(true);
        return;
      }
    }

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = a_position * 0.5 + 0.5;
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_intensity;
      uniform vec3 u_colorA;
      uniform vec3 u_colorB;
      uniform vec3 u_colorC;
      uniform vec3 u_colorD;

      void main() {
          vec2 uv = v_texCoord;
          vec2 p = (uv - 0.5) * 2.0;
          p.x *= u_resolution.x / u_resolution.y;

          float dist = length(p);

          // Domain warping for organic liquid-glass flow
          vec2 warp = vec2(
              sin(p.x * 1.5 + u_time * 0.5) * 0.4 + cos(p.y * 1.2 + u_time * 0.3) * 0.3,
              cos(p.y * 1.5 + u_time * 0.4) * 0.4 + sin(p.x * 1.2 + u_time * 0.6) * 0.3
          );

          vec2 flowCoord = p + warp * (0.5 + u_intensity * 0.5);

          // Multi-layered flow calculation
          float flow1 = sin(length(flowCoord) * 2.2 - u_time * 0.8) * 0.5 + 0.5;
          float flow2 = cos(flowCoord.x * 1.8 - u_time * 0.5) * sin(flowCoord.y * 1.8 + u_time * 0.4) * 0.5 + 0.5;

          // Scene-driven palette (uniforms — themes change these live)
          vec3 colorA = u_colorA;
          vec3 colorB = u_colorB;
          vec3 colorC = u_colorC;
          vec3 colorD = u_colorD;

          // Dynamic fluid blend
          vec3 color = mix(colorA, colorB, flow1 * 0.5);
          color = mix(color, colorC, flow2 * (0.35 + u_intensity * 0.15));

          // Thread-like neon glow highlights when active
          float highlight = smoothstep(0.4, 0.9, flow1 * flow2);
          color = mix(color, colorD, highlight * (0.15 + u_intensity * 0.45));

          // Pulsing center glow (ambient)
          float centerGlow = smoothstep(1.8, 0.0, dist);
          float pulse = sin(u_time * 1.2) * 0.5 + 0.5;
          color += colorB * centerGlow * (0.15 + u_intensity * 0.15) * (0.7 + pulse * 0.3);

          // Ambient specular light reflection to convey a physical glass surface overlay
          vec2 lightDir = normalize(vec2(-1.0, 1.0));
          float spec = max(0.0, dot(normalize(vec3(p, 1.8)), normalize(vec3(lightDir, 1.0))));
          spec = pow(spec, 12.0);
          color += vec3(1.0) * spec * (0.05 + u_intensity * 0.05);

          // Deep vignette edge darkening to frame content
          float edgeDarkening = smoothstep(2.2, 0.5, dist);
          color *= mix(0.35, 1.0, edgeDarkening);

          gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const posAttrib = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const uIntensityLoc = gl.getUniformLocation(program, "u_intensity");
    const uColorLocs = [
      gl.getUniformLocation(program, "u_colorA"),
      gl.getUniformLocation(program, "u_colorB"),
      gl.getUniformLocation(program, "u_colorC"),
      gl.getUniformLocation(program, "u_colorD"),
    ];

    // Current colors lerp toward the active scene palette each frame,
    // giving a smooth cross-fade between themes.
    const init = paletteRef.current;
    const currentColors = new Float32Array([...init.a, ...init.b, ...init.c, ...init.d]);

    const resize = () => {
      if (typeof window === "undefined") return;
      // Render at (at most) half of 1x-DPR resolution; CSS keeps the canvas
      // element itself full-screen and upscales the result.
      const scale = Math.min(window.devicePixelRatio || 1, 1) * MAX_RENDER_SCALE;
      canvas.width = Math.max(1, Math.round(window.innerWidth * scale));
      canvas.height = Math.max(1, Math.round(window.innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
    };

    window.addEventListener("resize", resize);
    resize();

    // Use a ResizeObserver for more reliable dimension changes
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(document.body);

    let lastTime = performance.now();
    let accumulatedTime = 0.0;
    let currentIntensity = 0.0;

    const drawFrame = (deltaTime: number) => {
      // Smooth intensity transition
      const targetIntensity = isCurrentlyActiveRef.current ? 1.0 : 0.0;
      currentIntensity += (targetIntensity - currentIntensity) * 0.05;

      // Transition speed multiplier smoothly to prevent phase jumping
      // Idle speed: 0.35, Active speed: 1.2
      const speedMult = 0.35 + currentIntensity * 0.85;
      accumulatedTime += deltaTime * speedMult;

      gl.useProgram(program);
      gl.uniform1f(uTimeLoc, accumulatedTime);
      gl.uniform1f(uIntensityLoc, currentIntensity);

      // Lerp palette toward the active scene and push to uniforms
      const target = paletteRef.current;
      const chans: Vec3[] = [target.a, target.b, target.c, target.d];
      for (let ci = 0; ci < 4; ci++) {
        for (let ch = 0; ch < 3; ch++) {
          const idx = ci * 3 + ch;
          currentColors[idx] += (chans[ci][ch] - currentColors[idx]) * 0.04;
        }
        gl.uniform3f(
          uColorLocs[ci],
          currentColors[ci * 3],
          currentColors[ci * 3 + 1],
          currentColors[ci * 3 + 2]
        );
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const animate = (timestamp: number) => {
      requestRef.current = requestAnimationFrame(animate);

      const elapsed = timestamp - lastTime;
      // Idle throttle: with nothing active, ~30fps is plenty for a slow
      // ambient gradient — skip the frame if it arrived too early.
      if (!isCurrentlyActiveRef.current && elapsed < IDLE_FRAME_MS) return;
      lastTime = timestamp;

      drawFrame(elapsed * 0.001);
    };

    // Loop gating: paused while the tab is hidden or the canvas is scrolled
    // out of view, and never started under prefers-reduced-motion.
    let pageHidden = document.hidden;
    let offscreen = false;

    const startLoop = () => {
      if (prefersReducedMotion || pageHidden || offscreen) return;
      if (requestRef.current !== null) return; // already running
      lastTime = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    };

    const stopLoop = () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };

    const onVisibilityChange = () => {
      pageHidden = document.hidden;
      if (pageHidden) stopLoop();
      else startLoop();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      offscreen = entry ? !entry.isIntersecting : false;
      if (offscreen) stopLoop();
      else startLoop();
    });
    intersectionObserver.observe(canvas);

    if (prefersReducedMotion) {
      // Reduced motion: paint a single static frame, no animation loop.
      drawFrame(0);
    } else {
      startLoop();
    }

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      stopLoop();

      // Cleanup WebGL resources. Note: we deliberately do NOT force-lose the
      // GL context here (no WEBGL_lose_context.loseContext()). The <canvas>
      // element persists across theme switches (it's not unmounted), and a
      // forced context loss is not auto-restored — the next switch back to
      // "glass" would call canvas.getContext("webgl") again on that same
      // dead context, silently fail to compile/link (COMPILE_STATUS false,
      // info log null), and leave the canvas painting solid white at full
      // opacity — the "UI goes blank white" bug. Deleting the buffer/program/
      // shaders is sufficient cleanup; the context itself stays valid and
      // cheap to sit idle until the loop restarts.
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [mounted, isGlass, softwareRenderer]);

  if (!mounted) return null;

  // Non-glass skins (and software-rendered GL, which never boots the loop):
  // a static, per-theme CSS backdrop occupies the same fixed -z-20 stacking
  // slot the canvas used. All styling lives in globals.css under
  // [data-theme="…"] .theme-backdrop.
  return (
    <>
      {(!isGlass || softwareRenderer) && <div className="theme-backdrop" aria-hidden />}
      {!softwareRenderer && (
        <canvas
          ref={canvasRef}
          // Stays mounted on purpose — the invariant above depends on this
          // canvas surviving theme switches. Outside glass the GL loop never
          // boots, so the element held nothing but could still composite a
          // stale frame at 45% over .theme-backdrop; opacity-0 removes that
          // without unmounting and re-acquiring a context.
          className={`fixed inset-0 w-full h-full -z-20 pointer-events-none transition-opacity duration-700 ${isGlass ? "opacity-100" : "opacity-0"}`}
        />
      )}
      <div
        className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-70 mix-blend-screen transition-[background] duration-1000"
        style={{
          background: SCENE_OVERLAYS[scene] ?? SCENE_OVERLAYS.midnight,
        }}
      />
    </>
  );
}
