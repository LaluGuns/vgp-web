export type HookVariant = "playlist" | "paywall" | "pov";

export type FlowPromoProps = {
  hookVariant: HookVariant;
  musicEnabled: boolean;
  showFrictionLine: boolean;
};

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 600,
} as const;

export const TIMING = {
  hook: { from: 0, duration: 54 },
  agitation: { from: 54, duration: 51 },
  reveal: { from: 105, duration: 60 },
  focus: { from: 165, duration: 95 },
  tasks: { from: 260, duration: 90 },
  atmosphere: { from: 350, duration: 105 },
  payoff: { from: 455, duration: 55 },
  endCard: { from: 510, duration: 90 },
} as const;

export const COPY = {
  playlist: {
    hook: "Your playlist is killing your focus.",
    support: "You know exactly which tab opens next.",
  },
  paywall: {
    hook: "$70 a year. To listen to rain.",
    support: "Focus got monetized. Flow stayed free.",
  },
  pov: {
    hook: "POV: 47 tabs. Zero work done.",
    support: "You opened one tab to find focus music.",
  },
  payoff: "One place. Zero rabbit holes.",
  productLine: "Music. Timer. Tasks. Atmosphere.",
  brandLine: "Open. Play. Focus. Free.",
  descriptor: "Deep Work Music & Pomodoro Timer",
  url: "flow.virzyguns.com",
  friction: "No account needed to press play.",
} as const;

export const TOKENS = {
  background: "#060216",
  backgroundBlue: "#0b1326",
  primary: "#58C4FF",
  cyan: "#00E5FF",
  cyanDeep: "#00A3FF",
  text: "#F3F7FF",
  muted: "rgba(238, 245, 255, 0.52)",
  faint: "rgba(238, 245, 255, 0.28)",
  glass: "rgba(255, 255, 255, 0.055)",
  glassStrong: "rgba(15, 22, 48, 0.72)",
  glassBorder: "rgba(255, 255, 255, 0.13)",
  glassHighlight: "rgba(255, 255, 255, 0.23)",
  radius: 24,
  shadow: "rgba(0, 0, 0, 0.42)",
} as const;

export const LOCAL_AUDIO = {
  soundtrack: "tracks/lofi-chill/lofi-chill-006.mp3",
} as const;

