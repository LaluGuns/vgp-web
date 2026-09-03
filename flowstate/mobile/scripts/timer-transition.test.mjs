import assert from "node:assert/strict";
import test from "node:test";

import { phaseAfter, phaseSeconds } from "../../lib/stores/timer-transitions.ts";

const preset = {
  mode: "pomodoro",
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartFocus: false,
};

test("manual focus skip never advances completed-session cadence", () => {
  assert.equal(phaseAfter("focus", 3, preset, false), "short_break");
});

test("elapsed fourth focus block advances to long break", () => {
  assert.equal(phaseAfter("focus", 3, preset, true), "long_break");
});

test("break completion always returns to focus", () => {
  assert.equal(phaseAfter("short_break", 3, preset, false), "focus");
  assert.equal(phaseAfter("long_break", 4, preset, false), "focus");
});

test("phase duration is derived from the active preset", () => {
  assert.equal(phaseSeconds(preset, "focus"), 1500);
  assert.equal(phaseSeconds(preset, "short_break"), 300);
  assert.equal(phaseSeconds(preset, "long_break"), 900);
});
