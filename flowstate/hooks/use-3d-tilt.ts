"use client";

import { useRef } from "react";

/**
 * Lightweight 3D parallax tilt. Writes the transform DIRECTLY to the element via
 * a ref (rAF-throttled) — no React state, so it never re-renders the component
 * tree on mouse move (critical for keeping the app light with long lists).
 * Respects prefers-reduced-motion.
 *
 * Apple-style: very subtle, controlled tilt with smooth easing.
 * Max tilt capped at 1.5° default for immersive-but-not-excessive feel.
 */
export function use3dTilt(maxTilt = 1.5) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (y / (rect.height / 2)) * -maxTilt;
    const rotateY = (x / (rect.width / 2)) * maxTilt;
    
    // Relative coordinates for cursor-tracking specular sheens
    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;

    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`;
      el.style.transition = "transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      el.style.setProperty("--mouse-x", `${pctX.toFixed(2)}%`);
      el.style.setProperty("--mouse-y", `${pctY.toFixed(2)}%`);
    });
  }

  function onMouseLeave() {
    const el = ref.current;
    if (!el) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    el.style.transition = "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
  }

  return { tiltProps: { ref, onMouseMove, onMouseLeave } };
}
