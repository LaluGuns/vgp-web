"use client";

// Background Ambient Glow Container
export function AmbientBackground() {
  return (
    <>
      {/* .ambient-blob: theme-token colored; suppressed (display:none) in the
          flat editorial + terminal themes via globals.css */}
      <div className="ambient-blob absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-[130px] pointer-events-none z-0" />
      <div className="ambient-blob absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/15 blur-[150px] pointer-events-none z-0" />
      <div className="ambient-blob absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-primary/04 blur-[100px] pointer-events-none z-0" />
    </>
  );
}
