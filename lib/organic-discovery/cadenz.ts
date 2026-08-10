import type { EvidenceTier } from "./types";

export const CADENZ_BPM_COVERAGE = [130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180] as const;
export type CadenzBpm = (typeof CADENZ_BPM_COVERAGE)[number];

export const CADENZ_INDEXABLE_BPMS = [180, 170, 165, 175, 160, 150] as const satisfies readonly CadenzBpm[];

export const CADENZ_HUB_PATH = "/cadenz/running-music";

export const CADENZ_BPM_TITLES: Record<CadenzBpm, readonly string[]> = {
  130: ["Launch Sequence (130 BPM)", "Horizon Line (130 BPM)", "Leg Flush 130 SPM Running Cadence Active Recovery"],
  135: ["Rusted Walk (135 SPM Running Cadence)", "Cosmic Cruise (135 SPM Running/Cycling Cadence) - Zone 2: Easy Run", "Shadow Kinetic (135 SPM Warm Up Jog)"],
  140: ["Asphalt Grid (140 SPM Running/Cycling Cadence) - Zone 2: Endurance Base", "Grid Navigation (140 SPM Running/Cycling Cadence) - Zone 2: Endurance", "Zone Two 140 SPM Running Cadence Easy Aerobic"],
  145: ["Digital Drift (145 SPM Running/Cycling Cadence) - Zone 2: Base Pace", "145 SPM Running Cadence: Zone 2 Warm-up", "Muscle Decay (145 SPM Running Cadence)"],
  150: ["150 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "Neon Pulse (150 SPM Running/Cycling Cadence) - Zone 3: Tempo", "150 SPM Running Cadence"],
  155: ["Circuit Breaker (155 SPM Running/Cycling Cadence) - Zone 3: Steady State", "155 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "155 SPM Running Cadence: Aerobic Base Builder"],
  160: ["160 SPM Running Cadence: Marathon Rhythm", "160 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "160 SPM Running Cadence"],
  165: ["165 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "165 SPM Running Cadence: Tempo Run Foundation", "165 SPM Running Cadence"],
  170: ["170 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "170 SPM Running Cadence: Lactate Threshold Pacer", "170 SPM Running Cadence"],
  175: ["175 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "175 SPM Running Cadence", "175 SPM Running Cadence: High-Performance Stride"],
  180: ["180 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "Apex Break (180 BPM)", "180 SPM Running Cadence: Peak Efficiency (Golden Cadence)"],
};

export const CADENZ_BPM_EVIDENCE: Record<CadenzBpm, { tier: EvidenceTier; indexable: boolean; note: string }> = {
  130: { tier: "C", indexable: false, note: "Coverage retained in the hub; standalone demand and asset utility need more first-party evidence." },
  135: { tier: "C", indexable: false, note: "Coverage retained in the hub; standalone demand and asset utility need more first-party evidence." },
  140: { tier: "C", indexable: false, note: "Coverage retained in the hub; standalone demand and asset utility need more first-party evidence." },
  145: { tier: "C", indexable: false, note: "Coverage retained in the hub; standalone demand and asset utility need more first-party evidence." },
  150: { tier: "B", indexable: true, note: "Direct CADENZ fit with H1 royalty evidence and measurable running-music search proxy." },
  155: { tier: "C", indexable: false, note: "Coverage retained in the hub; standalone demand and asset utility need more first-party evidence." },
  160: { tier: "B", indexable: true, note: "Direct CADENZ fit with H1 royalty evidence and measurable running-music search proxy." },
  165: { tier: "B", indexable: true, note: "Direct CADENZ fit with strong H1 royalty evidence and owner-observed search signal pending GSC confirmation." },
  170: { tier: "B", indexable: true, note: "Direct CADENZ fit with strong H1 royalty evidence and measurable running-music search proxy." },
  175: { tier: "B", indexable: true, note: "Direct CADENZ fit with meaningful H1 royalty evidence despite sparse exact-query proxy data." },
  180: { tier: "B", indexable: true, note: "Direct CADENZ fit with the strongest supplied exact-query and royalty evidence." },
};

export function isCadenzBpm(value: number): value is CadenzBpm {
  return (CADENZ_BPM_COVERAGE as readonly number[]).includes(value);
}

export function isCadenzIndexableBpm(value: number): value is (typeof CADENZ_INDEXABLE_BPMS)[number] {
  return (CADENZ_INDEXABLE_BPMS as readonly number[]).includes(value);
}

export function cadenzBpmPath(bpm: CadenzBpm) {
  return `${CADENZ_HUB_PATH}/${bpm}-bpm`;
}
