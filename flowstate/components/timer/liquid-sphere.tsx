"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface LiquidSphereProps {
  isRunning: boolean;
  color?: string; // Hex color, e.g. "#58c4ff"
}

export function LiquidSphere({ isRunning, color = "#58c4ff" }: LiquidSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);

  // Keep props in refs to avoid rebuilding the WebGL scene when props change
  const isRunningRef = useRef(isRunning);
  const colorRef = useRef(color);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width || container.clientWidth || 250;
    const height = rect.height || container.clientHeight || 250;

    // Create Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    // Create Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance
    
    // Style canvas to prevent layout shift or blocking clicks
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none";

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // High fidelity geometry (dense sphere for smooth noise-based deformations)
    const geometry = new THREE.SphereGeometry(2.1, 64, 64);
    const initialColor = new THREE.Color(colorRef.current);

    // Custom shader material for the organic Liquid Glass look (directly adapted from Stitch spec)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: initialColor },
        u_intensity: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float u_time;
        uniform float u_intensity;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            // Smooth organic sine-wave liquid deformation from Stitch, scaling with intensity
            float wave = sin(position.y * 2.2 + u_time * 2.0) * (0.05 + u_intensity * 0.07);
            vec3 pos = position + normal * wave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 u_color;
        uniform float u_time;
        uniform float u_intensity;
        void main() {
            // Smooth fresnel shading from Stitch
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            vec3 glow = u_color * (fresnel + 0.2 + u_intensity * 0.15);
            float alpha = fresnel * (0.8 + u_intensity * 0.1) + 0.15;
            gl_FragColor = vec4(glow, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Track observer dimensions to resize camera aspect & renderer viewport dynamically
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const w = entry.contentRect.width || container.clientWidth || 250;
      const h = entry.contentRect.height || container.clientHeight || 250;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    
    resizeObserver.observe(container);

    // Keep track of internal animation state
    let lastTime = performance.now();
    let accumulatedTime = 0;
    let currentIntensity = 0;

    const animate = (timestamp: number) => {
      const deltaTime = (timestamp - lastTime) * 0.001;
      lastTime = timestamp;

      // Smooth interpolation of active state intensity
      const targetIntensity = isRunningRef.current ? 1.0 : 0.0;
      currentIntensity += (targetIntensity - currentIntensity) * 0.05;
      
      material.uniforms.u_intensity.value = currentIntensity;

      // Color interpolation: lerps current color uniform to target color smoothly
      const targetColor = new THREE.Color(colorRef.current);
      material.uniforms.u_color.value.lerp(targetColor, 0.05);

      // Accumulate time based on speed multiplier to prevent animation jumping
      const speedMult = 1.0 + currentIntensity * 1.8;
      accumulatedTime += deltaTime * speedMult;
      material.uniforms.u_time.value = accumulatedTime;

      // Rotate the sphere
      sphere.rotation.y += 0.004 * speedMult;
      sphere.rotation.z += 0.002 * speedMult;

      // Subtle scaling pulse
      const scale = 1.0 + Math.sin(accumulatedTime * 2.2) * 0.02 * currentIntensity;
      sphere.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // Complete cleanup on unmount or double-mounting
    return () => {
      resizeObserver.disconnect();
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      rendererRef.current = null;
    };
  }, []); // Run exactly once on mount to establish canvas and scene

  return <div ref={containerRef} className="absolute inset-0 w-full h-full rounded-full overflow-hidden" />;
}
