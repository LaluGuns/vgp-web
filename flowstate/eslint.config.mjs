import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      ".next/**",
      "worker/**",
      "scripts/**",
      "public/tracks/**/*.mp3",
      "public/tracks/**/*.wav",
      "public/sounds/**/*.mp3",
      "public/sounds/**/*.wav",
    ],
  },
];
