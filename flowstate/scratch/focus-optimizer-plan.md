# Flowstate Focus Optimizer — $100/mo-value, PWYW, $0 server cost

**Goal:** keep Pay-What-You-Want pricing, but deliver value a serious professional would happily pay ~$100/mo for — with zero gimmicks (every mechanism is research-backed) and $0 marginal server cost.

**Thesis in one line:** *Consolidate the "focus stack" (5 separate subscriptions people already stack) into one product, back every feature with peer-reviewed science, anchor the value at ~$100/mo, and let people pay what they want.*

---

## 1. The value-equivalence argument (why this is worth ~$100/mo)

### 1a. Tool-stack consolidation (verified 2026 prices)
A serious focus-seeker today stacks separate tools:

| Job | Tool | Price/mo |
|---|---|---|
| Focus music | Brain.fm | $14.99 |
| Time/focus analytics | RescueTime | $6.50 |
| Distraction blocking | Freedom | $8.99 |
| Accountability / body-doubling | Focusmate | $12 |
| Daily planning + shutdown ritual | Sunsama | $20–25 |
| **Stack total** | | **~$62–67/mo** |

Flowstate does the **jobs** of all five in one place → that alone is ~$65/mo of replaced subscriptions. *(Sources at bottom.)*

### 1b. ROI argument (the real $100 justification — no gimmick)
- One interruption costs **~23 min** to fully refocus (Gloria Mark, UC Irvine). Average knowledge worker is interrupted many times/day.
- If Flowstate protects even **30 focused minutes/day** for someone who values their time at $50/hr → **~$25/day ≈ $500/mo** of recovered output.
- At that value, **$100/mo is a ~5× ROI** — and PWYW means they can start at $1. The price is never the barrier; the value is the anchor.

**Conclusion:** We don't *charge* $100. We *deliver* $100+ of value and let reciprocity + fairness drive what people pay. High anchored value + PWYW = low friction to try, high willingness to pay once value is felt.

---

## 2. The problems → evidence → $0 features

Every feature maps to a documented problem and a peer-reviewed mechanism. All run client-side (browser APIs + local compute); persistence is tiny rows in Supabase free tier.

### Problem 1 — Covert procrastination / fidgeting
*Spending the first 10 min mixing sounds, swapping tracks, tweaking instead of working.*
- **Feature: Friction Audit.** Passively count control interactions (track changes, volume, mixer, scene) while the timer runs, **with timestamps**. End-of-session report: *"18 adjustments in your first 10 min — your longest focus came when you left the mixer alone for 45 min."*
- **Evidence:** attention residue + task-switching cost (Leroy 2009) — every micro-switch leaves residue that degrades focus.

### Problem 2 — Silent defection (tab/app escape)
*Timer runs, but you're on YouTube in another tab.*
- **Feature: Defection Tracker + Real Focus Ratio.** `visibilitychange` + `window blur/focus` detect leaving the workspace; log time-away. Show *"Real Focus Ratio 68% — 34 effective min of 50."*
- **Evidence:** attention span collapsed to ~47 sec (Mark 2023); measuring the gap is the first step to closing it (RescueTime's whole premise, here built-in).
- **Honest limit:** browser can't see your phone or a 2nd monitor. We measure in-workspace defection, not surveillance.

### Problem 3 — Interruption recovery friction
*After a meeting/interruption it takes ~23 min to get back in.*
- **Feature: Context Bookmark.** On Pause, a minimal prompt: *"What are you working on? One line."* On Resume, that note renders bold in the center of the timer dial to instantly reload cognitive context.
- **Evidence:** Leroy — a **<1 min "where I left off" note measurably cuts attention residue**; Gollwitzer & Sheeran 2006 meta-analysis (d=0.65) — if-then/intention notes improve follow-through. This is the single most research-validated feature.

### Problem 4 — Impulsive quitting
*Bored → reflexively hit Pause/stop.*
- **Feature: Autopilot (Focus Lock).** Locks in-app music/mixer/pause/skip for the block. **Escape hatch required:** a "Give Up" that records the session as *failed* (no true kiosk lock — honest: we remove the easy exit, raising friction to quit; we can't stop OS-level app switching). `beforeunload` nudge if closing mid-lock.
- **Evidence:** pre-commitment / commitment devices (behavioral econ — Ariely, Beeminder/stickK lineage); implementation intentions (Gollwitzer).

---

## 3. The value-multiplier layer (turns 4 features into a $100 product) — all $0

The 4 features are the *mechanism*. These make it a product worth paying premium for:

1. **Longitudinal analytics / Focus Score** — Real Focus Ratio trend, focus minutes, fidget & defection patterns over 7/30/90 days. *Replaces RescueTime.* Computed **client-side** from session rows → $0.
2. **Insights engine (rule-based, NOT AI → $0)** — deterministic rules over the data: *"Your best focus window is 9–11am", "Fidgeting cost you ~12 min today", "Defection spikes on Mondays."* No inference cost, fully explainable.
3. **Weekly Focus Report (email)** — via the **existing Cloudflare Worker cron** reading Supabase. The "coach" feel that justifies recurring payment. *Replaces Sunsama's review ritual.*
4. **Original music + ambient** — already built (498 tracks + 12 ambient). *Replaces Brain.fm,* and it's the moat (self-produced).
5. **In-app distraction friction (Autopilot)** — partial *Freedom/Cold Turkey* replacement (honest: in-app only).
6. **(V2) Focus Rooms / body-doubling** — Supabase Realtime presence (free tier). *Replaces Focusmate.* Still ~$0.

---

## 4. Why $0 server cost genuinely holds

| Component | Cost | Why |
|---|---|---|
| All 4 detection features | $0 | Browser APIs + client compute |
| Analytics & insights | $0 | Computed client-side from rows; rule-based (no AI) |
| Session storage | $0 | Tiny rows in Supabase free tier (a session ≈ <1 KB) |
| Weekly email | $0 | Existing Cloudflare Worker cron |
| Audio | ~$0 | R2 (zero egress) — already set up |
| Music generation | $0 | Founder-produced, no per-stream license |

**No AI inference, no per-user compute.** You only outgrow the free tier at real scale — and that's a revenue-funded problem. Honest threshold: Supabase free tier = 500MB DB + 5GB egress/mo; at ~1KB/session that's ~500k sessions of headroom before paying anything.

---

## 5. PWYW mechanics to capture the value

- **Anchor on the pricing page:** show the value stack — *"Replaces ~$65/mo of Brain.fm + RescueTime + Freedom + Focusmate + Sunsama."* Make the $100 value visible; the slider stays $1→unlimited.
- **Value-first delivery:** give the optimizer + analytics, *then* the ask. Reciprocity drives above-minimum payment.
- **Suggested-amount nudges** (already in the pricing UI) + lifetime option.
- **Tiering recommendation:** Free (timer + music sampler) → **Supporter (PWYW $1+)** unlocks the Focus Optimizer + analytics + weekly report. One clean unlock, not a maze.

---

## 6. Technical architecture ($0, builds on what exists)

- **[MODIFY] Supabase `flowstate_focus_sessions`** (already exists) — add columns: `fidget_count int`, `fidget_timeline jsonb`, `defection_seconds int`, `context_bookmark text`, `real_focus_ratio numeric`. Durable data = powers the "30-day" claims (localStorage alone can't).
- **[NEW] `lib/stores/focus-session-store.ts`** — live session metrics (fidget count, defection accumulator, bookmark, start/end).
- **[NEW] `hooks/use-focus-tracker.ts`** — `visibilitychange` + `window blur/focus`; writes defection to the store; nudge when away > N min. Keeps `page.tsx` clean.
- **Fidget wiring** — increment in mixer/scene/player store actions when `timerStatus === "running"`.
- **[NEW] `components/optimizer/context-modal.tsx`** — liquid-glass Pause prompt.
- **[MODIFY] `timer-display.tsx`** — render bookmark in dial when paused/just-resumed; "Autopilot active" lock badge.
- **[NEW] `app/(app)/insights/` or a Stats panel** — analytics dashboard (client-computed from session rows).
- **[MODIFY] Cloudflare Worker** — weekly report cron (reuse existing pattern).
- **Gating** — existing entitlement (`is_premium`/supporter). Dev flag until checkout is live.

---

## 7. Open questions — answered

1. **Auto-pause on defection >3 min?** Default **NO** — keep the timer running and count defection, otherwise users game the clock by tab-away-to-pause. Add a **nudge** when away too long; in optional Strict/Autopilot mode, mark the session *interrupted*. Honest metrics > gameable ones.
2. **Context bookmark before Break?** **Yes, but optional & 1-tap skippable** — prompting "what will you do after the break?" is an implementation intention (d=0.65). Auto-show, easy skip, so it doesn't become the friction it's meant to remove.

---

## 8. Honest risks / limits

- **In-app blocking ≠ OS blocking** — can't fully replace Freedom/Cold Turkey (those hook the OS). We reduce in-app escape + measure defection; be honest in marketing.
- **Detection blind spots** — phone, 2nd monitor not detectable. Frame as self-honesty tool, not surveillance.
- **PWYW revenue variance** — mitigated by strong anchoring + value-first + lifetime.
- **Analytics value needs consistent use** — onboarding should drive the daily habit.

---

## 9. Roadmap (phased, $0 throughout)

1. **Phase 1 — Core mechanisms:** schema columns + focus-session store + use-focus-tracker (defection+fidget) + Context Bookmark modal/dial + Autopilot lock w/ escape hatch.
2. **Phase 2 — Value layer:** insights dashboard (client-computed) + Real Focus Ratio + Friction Audit report.
3. **Phase 3 — Coach feel:** weekly email report (Cloudflare cron) + pricing-page value stack/anchor.
4. **Phase 4 (later):** Focus Rooms (Supabase Realtime body-doubling).

## 10. Success metrics
- Activation: % users who finish ≥1 session with bookmark/audit viewed.
- Behaviour change: Real Focus Ratio trending up per user over 2–4 weeks (this IS the product proof).
- Monetization: average PWYW amount; % paying above minimum; supporter conversion.

---

## Sources (verified)
- Gloria Mark — ~23 min to refocus; ~47s attention span: https://www.informatics.uci.edu/forbes-brain-based-tips-for-sharpening-your-focus-gloria-mark-cited/
- Sophie Leroy — Attention Residue (2009, Org. Behavior & Human Decision Processes): https://ideas.repec.org/a/eee/jobhdp/v109y2009i2p168-181.html ; UWB: https://www.uwb.edu/business/faculty/sophie-leroy/attention-residue
- Gollwitzer & Sheeran (2006) implementation intentions meta-analysis, d=0.65: https://www.researchgate.net/publication/37367696_Implementation_Intentions_and_Goal_Achievement_A_Meta-Analysis_of_Effects_and_Processes
- Pricing: Brain.fm https://www.brain.fm/pricing · RescueTime https://www.rescuetime.com/pricing · Freedom https://freedom.to/premium · Focusmate https://www.focusmate.com/pricing/ · Sunsama https://www.sunsama.com/pricing · Cold Turkey https://getcoldturkey.com/pricing/
