import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.cwd());
const cli = resolve(root, "node_modules", "@remotion", "cli", "remotion-cli.js");
const outDir = resolve(root, "remotion", "out", "qa");
const frames = [30, 135, 210, 305, 395, 555];

mkdirSync(outDir, { recursive: true });

for (const frame of frames) {
  const output = resolve(outDir, `frame-${String(frame).padStart(3, "0")}.png`);
  const result = spawnSync(process.execPath, [cli, "still", "remotion/index.ts", "FlowPromoPortrait", output, `--frame=${frame}`], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });
  if (result.status !== 0 || !existsSync(output)) {
    process.exit(result.status ?? 1);
  }
}

