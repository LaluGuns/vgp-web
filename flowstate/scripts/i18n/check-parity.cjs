const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "../..");
const sourcePath = path.join(root, "lib/translations/dictionaries.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: sourcePath,
}).outputText;

const moduleRef = { exports: {} };
vm.runInNewContext(compiled, {
  module: moduleRef,
  exports: moduleRef.exports,
  require,
}, { filename: sourcePath });

const { dictionaries, LANGUAGES } = moduleRef.exports;
const locales = Object.keys(LANGUAGES);
const referenceLocale = "en";

function collectLeaves(value, prefix = "", result = new Map()) {
  if (typeof value === "string") {
    result.set(prefix, value);
    return result;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid translation value at ${prefix || "<root>"}`);
  }

  for (const [key, child] of Object.entries(value)) {
    collectLeaves(child, prefix ? `${prefix}.${key}` : key, result);
  }
  return result;
}

function placeholders(value) {
  return [...value.matchAll(/\{([A-Za-z0-9_]+)\}/g)]
    .map((match) => match[1])
    .sort();
}

const reference = collectLeaves(dictionaries[referenceLocale]);
const failures = [];

function walkSourceFiles(directory, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkSourceFiles(fullPath, result);
    else if (/\.(?:ts|tsx)$/.test(entry.name)) result.push(fullPath);
  }
  return result;
}

const sourceFiles = ["app", "components", "hooks", "lib"]
  .flatMap((directory) => walkSourceFiles(path.join(root, directory)));
const usedKeys = new Set();
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(/\bt\(\s*["']([^"']+)["']/g)) usedKeys.add(match[1]);
  if (file.endsWith(path.join("optimizer", "share-modal.tsx"))) {
    for (const match of content.matchAll(/\bshare\(\s*["']([^"']+)["']/g)) {
      usedKeys.add(`shareModal.${match[1]}`);
    }
  }
}

const missingUsedKeys = [...usedKeys].filter((key) => !reference.has(key)).sort();
if (missingUsedKeys.length) failures.push(`en: UI keys missing from dictionary: ${missingUsedKeys.join(", ")}`);

for (const locale of locales) {
  const current = collectLeaves(dictionaries[locale]);
  const missing = [...reference.keys()].filter((key) => !current.has(key));
  const extra = [...current.keys()].filter((key) => !reference.has(key));

  if (missing.length) failures.push(`${locale}: missing ${missing.join(", ")}`);
  if (extra.length) failures.push(`${locale}: extra ${extra.join(", ")}`);

  for (const [key, referenceValue] of reference) {
    const currentValue = current.get(key);
    if (currentValue === undefined) continue;
    if (!currentValue.trim()) failures.push(`${locale}: empty ${key}`);

    const expected = placeholders(referenceValue);
    const actual = placeholders(currentValue);
    if (expected.join("|") !== actual.join("|")) {
      failures.push(
        `${locale}: placeholder mismatch ${key} (expected ${expected.join(",") || "none"}; got ${actual.join(",") || "none"})`
      );
    }
  }
}

if (failures.length) {
  console.error(`i18n parity failed (${failures.length} issue${failures.length === 1 ? "" : "s"}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`i18n parity passed: ${locales.length} locales, ${reference.size} keys each.`);
