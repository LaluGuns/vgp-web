"use client";

import { cn } from "@/lib/utils";

/**
 * Authentic 7-segment LED display, drawn as SVG.
 *
 * Real hardware shows the UNLIT segments faintly (ghost segments) and the lit
 * ones glow — that ghosting is what sells the realism, so we render every
 * segment and just drop the opacity of the ones that are off. Colour comes from
 * `currentColor`, so scoping `color`/`--primary` re-lamps the whole readout.
 *
 * Used by the Analog Studio tape deck. Pure geometry, no fonts, no deps.
 */

// Which segments (a–g) are lit for each digit.
//   aaa
//  f   b
//  f   b
//   ggg
//  e   c
//  e   c
//   ddd
const DIGIT_SEGMENTS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgedc",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
};

// Digit cell geometry.
const W = 24;
const H = 44;
const P = 3.5; // padding
const TH = 4.5; // segment thickness

function hSeg(cx: number, cy: number, len: number): string {
  const hl = len / 2;
  const ht = TH / 2;
  return `${cx - hl},${cy} ${cx - hl + ht},${cy - ht} ${cx + hl - ht},${cy - ht} ${cx + hl},${cy} ${cx + hl - ht},${cy + ht} ${cx - hl + ht},${cy + ht}`;
}
function vSeg(cx: number, cy: number, len: number): string {
  const hl = len / 2;
  const ht = TH / 2;
  return `${cx},${cy - hl} ${cx + ht},${cy - hl + ht} ${cx + ht},${cy + hl - ht} ${cx},${cy + hl} ${cx - ht},${cy + hl - ht} ${cx - ht},${cy - hl + ht}`;
}

const hLen = W - 2 * P - TH; // horizontal segment length
const vLen = H / 2 - P - TH; // vertical segment length
const cxL = P + TH / 2;
const cxR = W - P - TH / 2;
const cyTop = P + TH / 2;
const cyMid = H / 2;
const cyBot = H - P - TH / 2;
const cyUpper = (cyTop + cyMid) / 2;
const cyLower = (cyMid + cyBot) / 2;

const SEG_POINTS: Record<string, string> = {
  a: hSeg(W / 2, cyTop, hLen),
  b: vSeg(cxR, cyUpper, vLen),
  c: vSeg(cxR, cyLower, vLen),
  d: hSeg(W / 2, cyBot, hLen),
  e: vSeg(cxL, cyLower, vLen),
  f: vSeg(cxL, cyUpper, vLen),
  g: hSeg(W / 2, cyMid, hLen),
};
const ALL_SEGS = ["a", "b", "c", "d", "e", "f", "g"];

function Digit({ char }: { char: string }) {
  const on = DIGIT_SEGMENTS[char] ?? "";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-auto" style={{ overflow: "visible" }}>
      {ALL_SEGS.map((s) => {
        const lit = on.includes(s);
        return (
          <polygon
            key={s}
            points={SEG_POINTS[s]}
            fill="currentColor"
            opacity={lit ? 1 : 0.07}
            style={lit ? { filter: "drop-shadow(0 0 3px currentColor)" } : undefined}
          />
        );
      })}
    </svg>
  );
}

function Colon({ blink }: { blink?: boolean }) {
  return (
    <svg viewBox={`0 0 10 ${H}`} className={cn("h-full w-auto", blink && "animate-pulse")} style={{ overflow: "visible" }}>
      {[H * 0.34, H * 0.66].map((cy) => (
        <circle
          key={cy}
          cx="5"
          cy={cy}
          r={TH / 2}
          fill="currentColor"
          style={{ filter: "drop-shadow(0 0 3px currentColor)" }}
        />
      ))}
    </svg>
  );
}

export function SevenSegment({
  value,
  height = 56,
  blinkColon = false,
  className,
  style,
}: {
  value: string;
  height?: number;
  blinkColon?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("inline-flex items-stretch gap-[3px]", className)}
      style={{ height, transform: "skewX(-5deg)", ...style }}
      aria-label={value}
      role="img"
    >
      {value.split("").map((ch, i) =>
        ch === ":" ? (
          <Colon key={i} blink={blinkColon} />
        ) : (
          <Digit key={i} char={ch} />
        )
      )}
    </div>
  );
}
