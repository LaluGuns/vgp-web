"use client";

import { useEffect, useRef, useState } from "react";
import { X, Download, Copy, Check, Loader2, Share2, Smartphone, Monitor, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import QRCode from "qrcode";

// Custom premium brand icon for X (formerly Twitter)
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Custom premium brand icon for WhatsApp
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// Custom premium brand icon for Telegram
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-.97.53-1.35.52-.42-.01-1.24-.24-1.84-.44-.74-.24-1.33-.37-1.28-.79.03-.22.33-.44.9-.67 3.52-1.53 5.87-2.54 7.05-3.03 3.35-1.39 4.05-1.63 4.5-.14.28.32.33.68.32 1.06z" />
  </svg>
);

// Custom premium brand icon for LinkedIn
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

// Custom premium brand icon for Instagram
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

// Custom premium brand icon for Facebook
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.738-.9 10.126-5.864 10.126-11.854z" />
  </svg>
);

// Custom premium brand icon for Reddit
const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

// Email/Mail icon
const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusMinutes: number;
  fidgetCount: number;
  // Per-session context
  completed?: boolean;
  firstTenFidgets?: number;
  // Weekly-summary context
  isSummary?: boolean;
  sessionCount?: number;
  completionRate?: number;
}

// Helper to asynchronously load image for canvas
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is undefined"));
      return;
    }
    const img = new window.Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

// Draw the rounded rectangle helper for canvas
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Generate a real scannable QR code and draw it onto the canvas
async function drawRealQRCode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  primaryColor: string
) {
  try {
    // Generate QR code on a temporary canvas
    const tempCanvas = document.createElement("canvas");
    await QRCode.toCanvas(tempCanvas, "https://flow.virzyguns.com", {
      width: size,
      margin: 1,
      color: {
        dark: "#ffffff",
        light: "#00000000", // transparent background
      },
      errorCorrectionLevel: "M",
    });

    // Draw rounded background behind QR
    const pad = 8;
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    drawRoundedRect(ctx, x - pad, y - pad, size + pad * 2, size + pad * 2, 12);
    ctx.fill();

    // Draw the real QR code
    ctx.drawImage(tempCanvas, x, y, size, size);

    // Draw scan brackets around the QR
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2.5;
    const len = Math.round(size * 0.16);

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x - pad, y - pad + len); ctx.lineTo(x - pad, y - pad); ctx.lineTo(x - pad + len, y - pad);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + size + pad - len, y - pad); ctx.lineTo(x + size + pad, y - pad); ctx.lineTo(x + size + pad, y - pad + len);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x - pad, y + size + pad - len); ctx.lineTo(x - pad, y + size + pad); ctx.lineTo(x - pad + len, y + size + pad);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + size + pad - len, y + size + pad); ctx.lineTo(x + size + pad, y + size + pad); ctx.lineTo(x + size + pad, y + size + pad - len);
    ctx.stroke();
  } catch (err) {
    console.error("QR code generation failed", err);
  }
}

// Generate the beautiful social share image on canvas
export async function drawShareCard(
  canvas: HTMLCanvasElement,
  data: {
    focusMinutes: number;
    fidgetCount: number;
    completed?: boolean;
    firstTenFidgets?: number;
    isSummary?: boolean;
    sessionCount?: number;
    completionRate?: number;
    orientation: "landscape" | "portrait";
  }
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = data.orientation === "landscape" ? 1200 : 1080;
  const height = data.orientation === "landscape" ? 630 : 1920;

  const FONT_FAMILY = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const MONO_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

  // Load target brand logo from icons
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage("/icons/flowstate-logo.png");
  } catch (err) {
    console.error("Failed to load brand logo image, using text fallback", err);
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // 1. Draw cosmic background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#080415"); // Deep space dark blue/black
  bgGrad.addColorStop(0.5, "#12072b"); // Deep purple
  bgGrad.addColorStop(1, "#04020a"); // Ultra dark
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw ambient glow lights
  // Purple glow top-left
  const purpleGlow = ctx.createRadialGradient(width * 0.2, height * 0.2, 50, width * 0.2, height * 0.2, width * 0.4);
  purpleGlow.addColorStop(0, "rgba(111, 0, 190, 0.26)");
  purpleGlow.addColorStop(1, "rgba(111, 0, 190, 0)");
  ctx.fillStyle = purpleGlow;
  ctx.fillRect(0, 0, width, height);

  // Blue glow bottom-right
  const blueGlow = ctx.createRadialGradient(width * 0.8, height * 0.8, 50, width * 0.8, height * 0.8, width * 0.4);
  blueGlow.addColorStop(0, "rgba(88, 196, 255, 0.22)");
  blueGlow.addColorStop(1, "rgba(88, 196, 255, 0)");
  ctx.fillStyle = blueGlow;
  ctx.fillRect(0, 0, width, height);

  // Subtle star field
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  const starCount = data.orientation === "landscape" ? 20 : 45;
  for (let i = 0; i < starCount; i++) {
    const sx = Math.sin(i * 1234.56) * 0.5 + 0.5;
    const sy = Math.cos(i * 789.012) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.arc(sx * width, sy * height, 1.2 + (i % 3) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Setup core layout params
  const heroVal = `${data.focusMinutes}m`;
  const heroColor = data.isSummary ? "#58c4ff" : data.completed ? "#34d399" : "#58c4ff";
  const heroLabel = data.isSummary ? "TOTAL FOCUS TIME" : "DEEP FOCUS TIME";
  const tagline = data.isSummary
    ? "» Deep work, logged."
    : data.completed
      ? "» Session complete."
      : "» Session logged.";
  const stats = data.isSummary
    ? [
        { label: "SESSIONS", val: `${data.sessionCount ?? 0}` },
        { label: "COMPLETION", val: `${data.completionRate ?? 0}%` },
        { label: "FIDGETS", val: `${data.fidgetCount}` },
      ]
    : [
        { label: "STATUS", val: data.completed ? "Completed" : "Skipped" },
        { label: "FIDGETS", val: `${data.fidgetCount}` },
        { label: "FIRST 10 MIN", val: `${data.firstTenFidgets ?? 0}` },
      ];

  if (data.orientation === "landscape") {
    // ════════════════════════════════════════════════════════════
    // LANDSCAPE LAYOUT (1200 x 630)
    // ════════════════════════════════════════════════════════════
    const cardX = 80;
    const cardY = 90;
    const cardW = 1040;
    const cardH = 450;
    const cardR = 24;

    // Semi-transparent glass background
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
    ctx.fill();

    // Specular border
    const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    borderGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
    borderGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.05)");
    borderGrad.addColorStop(0.7, "rgba(255, 255, 255, 0.02)");
    borderGrad.addColorStop(1, "rgba(88, 196, 255, 0.20)");
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw the actual image logo or fallback text
    if (logoImg) {
      // Draw brand logo image
      ctx.drawImage(logoImg, cardX + 60, cardY + 50, 160, 56);
    } else {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold 24px ${FONT_FAMILY}`;
      if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "6px"; }
      ctx.fillText("FLOWSTATE", cardX + 60, cardY + 70);
      if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "normal"; }
    }

    // Header audit tag
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.font = `600 11px ${MONO_FAMILY}`;
    if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "2px"; }
    const typeLabel = data.isSummary ? "WEEKLY PERFORMANCE AUDIT" : "SESSION FOCUS AUDIT";
    ctx.fillText(typeLabel, cardX + 60, cardY + 115);
    if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "normal"; }

    // Divider Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 50, cardY + 140);
    ctx.lineTo(cardX + cardW - 50, cardY + 140);
    ctx.stroke();

    // LEFT SECTION: Large hero number (focus minutes)
    ctx.textAlign = "left";
    ctx.fillStyle = heroColor;
    ctx.font = `bold 120px ${FONT_FAMILY}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(heroVal, cardX + 60, cardY + 295);

    // Focus label below hero
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = `700 13px ${MONO_FAMILY}`;
    if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "2.5px"; }
    ctx.fillText(heroLabel, cardX + 65, cardY + 338);
    if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "normal"; }

    // Custom tag inviting users
    ctx.fillStyle = heroColor;
    ctx.font = `italic 500 14px ${FONT_FAMILY}`;
    ctx.fillText(tagline, cardX + 65, cardY + 390);

    // VERTICAL SEPARATOR
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.beginPath();
    ctx.moveTo(cardX + 520, cardY + 180);
    ctx.lineTo(cardX + 520, cardY + 410);
    ctx.stroke();

    // RIGHT SECTION: Detailed Stats
    const rightColX = cardX + 570;
    const statYs = [cardY + 210, cardY + 295, cardY + 380];

    stats.forEach((st, i) => {
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold 32px ${FONT_FAMILY}`;
      if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "normal"; }
      ctx.fillText(st.val, rightColX, statYs[i]);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = `600 10px ${MONO_FAMILY}`;
      if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "1.5px"; }
      ctx.fillText(st.label, rightColX, statYs[i] + 24);
    });

    if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "normal"; }

    // QR Code & CTA at the bottom right corner of the card
    const qrSize = 75;
    const qrX = cardX + cardW - 130;
    const qrY = cardY + cardH - 120;
    await drawRealQRCode(ctx, qrX, qrY, qrSize, heroColor);
    
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = `bold 11px ${MONO_FAMILY}`;
    if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "1px"; }
    ctx.fillText("SCAN TO FOCUS", qrX - 15, qrY + 30);
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = `500 9px ${MONO_FAMILY}`;
    ctx.fillText("flow.virzyguns.com", qrX - 15, qrY + 48);

  } else {
    // ════════════════════════════════════════════════════════════
    // PORTRAIT / STORIES LAYOUT (1080 x 1920)
    // ════════════════════════════════════════════════════════════
    const cardX = 90;
    const cardY = 160;
    const cardW = 900;
    const cardH = 1600;
    const cardR = 48;

    // Semi-transparent glass background
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
    ctx.fill();

    // Specular border
    const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    borderGrad.addColorStop(0, "rgba(255, 255, 255, 0.30)");
    borderGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.04)");
    borderGrad.addColorStop(0.7, "rgba(255, 255, 255, 0.01)");
    borderGrad.addColorStop(1, "rgba(88, 196, 255, 0.25)");
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw the actual image logo centered or fallback text
    if (logoImg) {
      // Draw brand logo image centered (width: 300, height: 106)
      ctx.drawImage(logoImg, 540 - 150, cardY + 120, 300, 106);
    } else {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold 42px ${FONT_FAMILY}`;
      if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "10px"; }
      ctx.fillText("FLOWSTATE", 540, cardY + 180);
      if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "normal"; }
    }

    // Tag
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = `600 16px ${MONO_FAMILY}`;
    if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "3px"; }
    const typeLabel = data.isSummary ? "WEEKLY PERFORMANCE AUDIT" : "SESSION FOCUS AUDIT";
    ctx.fillText(typeLabel, 540, cardY + 280);
    if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "normal"; }

    // Horizontal Divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.beginPath();
    ctx.moveTo(cardX + 100, cardY + 360);
    ctx.lineTo(cardX + cardW - 100, cardY + 360);
    ctx.stroke();

    // 2. Large hero Indicator (focus minutes)
    ctx.fillStyle = heroColor;
    ctx.font = `bold 190px ${FONT_FAMILY}`;
    ctx.fillText(heroVal, 540, cardY + 540);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = `700 18px ${MONO_FAMILY}`;
    if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "4px"; }
    ctx.fillText(heroLabel, 540, cardY + 660);
    if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "normal"; }

    // 3. Stats list in vertical layout
    const startY = cardY + 750;
    const gapY = 160;

    stats.forEach((st, i) => {
      const y = startY + gapY * i;
      ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
      drawRoundedRect(ctx, cardX + 100, y, 700, 110, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = `bold 36px ${FONT_FAMILY}`;
      if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "normal"; }
      ctx.fillText(st.val, 540, y + 40);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = `600 12px ${MONO_FAMILY}`;
      if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "2px"; }
      ctx.fillText(st.label, 540, y + 75);
      if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "normal"; }
    });

    // 4. QR Code & CTA at the bottom
    const qrSize = 160;
    const qrX = 540 - qrSize / 2;
    const qrY = cardY + 1240;
    await drawRealQRCode(ctx, qrX, qrY, qrSize, heroColor);

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 16px ${MONO_FAMILY}`;
    if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "3px"; }
    ctx.fillText("SCAN TO FOCUS", 540, qrY + 215);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = `500 13px ${MONO_FAMILY}`;
    if ("letterSpacing" in ctx) { (ctx as any).letterSpacing = "1.5px"; }
    ctx.fillText("flow.virzyguns.com", 540, qrY + 245);
    
    ctx.fillStyle = heroColor;
    ctx.font = `italic 500 16px ${FONT_FAMILY}`;
    ctx.fillText("» Every track produced in-house", 540, qrY + 285);
  }
}

export function ShareModal({
  isOpen,
  onClose,
  focusMinutes,
  fidgetCount,
  completed,
  firstTenFidgets,
  isSummary = false,
  sessionCount = 0,
  completionRate = 0,
}: ShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [platformToast, setPlatformToast] = useState<string | null>(null);
  const [rendering, setRendering] = useState(true);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");

  // Generate initial caption pre-filled based on type of data
  useEffect(() => {
    if (isSummary) {
      setCaption(
        `${focusMinutes}m of deep work across ${sessionCount} sessions on Flowstate — ${completionRate}% completion. Every track produced by the person who built it: https://flow.virzyguns.com`
      );
    } else {
      setCaption(
        `${focusMinutes} focused minutes on Flowstate. Music by the person who built the app: https://flow.virzyguns.com`
      );
    }
  }, [isOpen, focusMinutes, fidgetCount, isSummary, sessionCount, completionRate]);

  // Re-draw canvas card when stats or parameters change
  useEffect(() => {
    if (!isOpen) return;

    setRendering(true);
    const timeoutId = setTimeout(async () => {
      const canvas = canvasRef.current;
      if (canvas) {
        await drawShareCard(canvas, {
          focusMinutes,
          fidgetCount,
          completed,
          firstTenFidgets,
          isSummary,
          sessionCount,
          completionRate,
          orientation,
        });
      }
      setRendering(false);
    }, 120);

    return () => clearTimeout(timeoutId);
  }, [isOpen, focusMinutes, fidgetCount, completed, firstTenFidgets, isSummary, sessionCount, completionRate, orientation]);

  if (!isOpen) return null;

  // OS Native Share sheet for mobile devices (resolves "langsung pilih status or chat" request)
  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      if (navigator.share && navigator.canShare) {
        setRendering(true);
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setRendering(false);
            return;
          }
          const file = new File([blob], isSummary ? "weekly-stats.png" : "session-stats.png", { type: "image/png" });
          const shareData = {
            text: caption,
            files: [file],
          };

          if (navigator.canShare(shareData)) {
            try {
              await navigator.share(shareData);
            } catch (shareErr) {
              console.log("Native share dismissed or failed", shareErr);
            }
          } else {
            // Fallback if files sharing is not supported by this browser
            await navigator.share({ text: caption });
          }
          setRendering(false);
        }, "image/png");
      } else {
        // Fallback for desktop: Copy to Clipboard and prompt user
        handleCopy();
      }
    } catch (err) {
      console.error("Native share error", err);
      setRendering(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = isSummary
        ? `flowstate-weekly-stats-${orientation}-${Date.now()}.png`
        : `flowstate-session-stats-${orientation}-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download image", err);
    }
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setRendering(true);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setRendering(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob
            })
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
        } catch (clipErr) {
          console.error("Clipboard image copy failed, falling back to download", clipErr);
          handleDownload();
        }
        setRendering(false);
      }, "image/png");
    } catch (err) {
      console.error("Failed to copy image", err);
      setRendering(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy caption", err);
    }
  };

  // Silently copy image blob to clipboard — returns true on success
  const copyImageToClipboard = async (): Promise<boolean> => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) { resolve(false); return; }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          resolve(true);
        } catch (_err) {
          resolve(false);
        }
      }, "image/png");
    });
  };

  // Universal platform share: open URL immediately (sync, avoids popup blocker),
  // then copy image to clipboard in the background and show toast
  const shareViaPlatform = (
    platformName: string,
    url: string,
    opts?: { download?: boolean }
  ) => {
    // Step 1: IMMEDIATELY open platform URL (must be synchronous from user click to avoid popup blocker)
    if (!opts?.download) {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    // Step 2: Copy image to clipboard / download in background (async, non-blocking)
    if (opts?.download) {
      handleDownload();
    } else {
      copyImageToClipboard();
    }

    // Step 3: Show branded toast
    const msg = opts?.download
      ? `Card saved — open ${platformName} → Upload`
      : `Image copied — paste it in your ${platformName} post`;
    setPlatformToast(msg);
    setTimeout(() => setPlatformToast(null), 3500);
  };

  const handleShareTwitter = () => {
    shareViaPlatform("X", `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`);
  };

  const handleShareWhatsApp = () => {
    shareViaPlatform("WhatsApp", `https://wa.me/?text=${encodeURIComponent(caption)}`);
  };

  const handleShareTelegram = () => {
    shareViaPlatform("Telegram", `https://t.me/share/url?url=${encodeURIComponent("https://flow.virzyguns.com")}&text=${encodeURIComponent(caption)}`);
  };

  const handleShareLinkedIn = () => {
    shareViaPlatform("LinkedIn", `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent("https://flow.virzyguns.com")}&title=${encodeURIComponent("Flowstate focus report")}&summary=${encodeURIComponent(caption)}`);
  };

  const handleShareInstagram = () => {
    shareViaPlatform("Instagram", "https://www.instagram.com/", { download: true });
  };

  const handleShareFacebook = () => {
    shareViaPlatform("Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://flow.virzyguns.com")}&quote=${encodeURIComponent(caption)}`);
  };

  const handleShareReddit = () => {
    shareViaPlatform("Reddit", `https://www.reddit.com/submit?url=${encodeURIComponent("https://flow.virzyguns.com")}&title=${encodeURIComponent(caption.split("\n")[0])}`);
  };

  const handleShareEmail = () => {
    const subject = isSummary ? "My Flowstate weekly focus stats" : "My Flowstate focus session";
    shareViaPlatform("Email", `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(caption)}`);
  };

  const platformBtnClass = "h-9 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] hover:border-white/15 text-white/70 hover:text-white text-[9px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in-0">
      <div className="glass-card w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 relative max-h-[94vh] overflow-y-auto custom-scrollbar select-text">
        {/* Floating Toast Bubbles */}
        {(copied || copiedImage) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#34d399] text-black px-4 py-1.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_20px_rgba(52,211,153,0.4)] animate-in slide-in-from-top-3 fade-in duration-300">
            <Check className="h-3 w-3 stroke-[3]" />
            {copied ? "Caption & link copied" : "Image card copied"}
          </div>
        )}
        {platformToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-primary/90 to-primary text-white px-4 py-1.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_20px_rgba(88,196,255,0.4)] animate-in slide-in-from-top-3 fade-in duration-300 max-w-[90%] text-center">
            <Check className="h-3 w-3 stroke-[3] flex-shrink-0" />
            {platformToast}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
            {isSummary ? "Weekly Metrics Audit" : "Focus Session Audit"}
          </span>
          <button
            onClick={onClose}
            aria-label="Close Share Modal"
            className="text-muted-foreground/60 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Card Format / Orientation Selector Toggle */}
        <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 ml-2">Card Format:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setOrientation("landscape")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200",
                orientation === "landscape"
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <Monitor className="h-3 w-3" /> Landscape (16:9)
            </button>
            <button
              onClick={() => setOrientation("portrait")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200",
                orientation === "portrait"
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <Smartphone className="h-3 w-3" /> Portrait Story (9:16)
            </button>
          </div>
        </div>

        {/* Live Canvas Card Preview */}
        <div className="relative w-full overflow-hidden border border-white/10 bg-black/40 shadow-2xl flex items-center justify-center rounded-xl">
          {rendering && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-2">
              <Loader2 className="h-6 w-6 animate-apple-loader text-primary" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-white/50 animate-pulse">
                Generating layout...
              </span>
            </div>
          )}
          <div className="w-full flex justify-center py-2 bg-gradient-to-b from-transparent to-black/25">
            <canvas
              ref={canvasRef}
              width={orientation === "landscape" ? 1200 : 1080}
              height={orientation === "landscape" ? 630 : 1920}
              className={cn(
                "h-auto object-contain block select-none rounded-lg shadow-lg border border-white/5",
                orientation === "portrait" ? "max-h-[360px] aspect-[1080/1920]" : "w-full aspect-[1200/630]"
              )}
            />
          </div>
        </div>

        {/* Customizable Caption Area */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">
            Edit Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all font-sans leading-relaxed resize-none custom-scrollbar"
            placeholder="Type a custom caption..."
          />
        </div>

        {/* Primary Share Trigger (Direct OS Share Sheet — includes image file automatically on mobile) */}
        <Button
          onClick={handleNativeShare}
          className="w-full h-11 text-[11px] font-mono uppercase tracking-[0.15em] bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(0,229,255,0.25)] transition-all duration-300 hover:scale-[1.01]"
        >
          <Share2 className="h-4 w-4" />
          Share with Image (All Apps)
        </Button>

        {/* Platform Grid — 8 platforms */}
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block text-center">
            Quick Share
          </span>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={handleShareTwitter} className={platformBtnClass}>
              <XIcon /> X
            </button>
            <button onClick={handleShareWhatsApp} className={platformBtnClass}>
              <WhatsAppIcon /> WA
            </button>
            <button onClick={handleShareInstagram} className={platformBtnClass}>
              <InstagramIcon /> IG
            </button>
            <button onClick={handleShareTelegram} className={platformBtnClass}>
              <TelegramIcon /> TG
            </button>
            <button onClick={handleShareFacebook} className={platformBtnClass}>
              <FacebookIcon /> FB
            </button>
            <button onClick={handleShareLinkedIn} className={platformBtnClass}>
              <LinkedInIcon /> LN
            </button>
            <button onClick={handleShareReddit} className={platformBtnClass}>
              <RedditIcon /> Reddit
            </button>
            <button onClick={handleShareEmail} className={platformBtnClass}>
              <MailIcon /> Email
            </button>
          </div>
        </div>

        {/* Tips — ENGLISH */}
        <div className="text-[9px] font-mono text-white/30 leading-relaxed text-center bg-white/[0.01] border border-white/5 rounded-xl p-2.5 space-y-1">
          <p className="flex items-center justify-center gap-1.5"><Lightbulb className="h-3 w-3 shrink-0" /> <span><span className="text-white/60">Desktop:</span> Use <span className="text-primary">Copy Image</span> then paste (<span className="text-white/50">Ctrl+V</span>) directly into any chat or post.</span></p>
          <p className="flex items-center justify-center gap-1.5"><Smartphone className="h-3 w-3 shrink-0" /> <span><span className="text-white/60">Mobile:</span> Tap <span className="text-primary">Share with Image</span> to send card + caption via any app.</span></p>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="h-10 text-[9px] font-mono uppercase tracking-wider border border-white/10 hover:border-white/20 hover:bg-white/[0.04] text-white/80 rounded-xl flex items-center justify-center gap-1.5 px-1"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>

          <Button
            onClick={handleCopyImage}
            variant="outline"
            className="h-10 text-[9px] font-mono uppercase tracking-wider border border-white/10 hover:border-white/20 hover:bg-white/[0.04] text-white/80 rounded-xl flex items-center justify-center gap-1.5 px-1"
          >
            {copiedImage ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#34d399]" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Image
              </>
            )}
          </Button>

          <Button
            onClick={handleCopy}
            variant="outline"
            className="h-10 text-[9px] font-mono uppercase tracking-wider border border-white/10 hover:border-white/20 hover:bg-white/[0.04] text-white/80 rounded-xl flex items-center justify-center gap-1.5 px-1"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#34d399]" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Text
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
