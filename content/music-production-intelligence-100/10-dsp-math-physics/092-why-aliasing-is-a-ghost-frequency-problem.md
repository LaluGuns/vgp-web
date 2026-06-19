# 092 - Aliasing is a fake frequency leak

Content ID: 092

Pillar: DSP, math, and physics

Story structure: Producer diagnosis

Hook family: DAW test

Pattern interrupt: alias frequency leaking through a broken sampling grid appears before the full headline, with the alias leak marked in cyan and the problem marked in red.

Open loop: The viewer waits to see which decision makes aliasing clearer in the session.

Retention payoff: The payoff is a practical test: Turn oversampling on and level match the result.

Visual identity: alias frequency leaking through a broken sampling grid; motif: alias leak; camera: clean lab diagram with waveform, spectrum, and one physical object; motion: signal paths draw in real time while the interface stays simple.

Motion plan: 0-3s alias frequency leaking through a broken sampling grid appears before the full headline, with the alias leak marked in cyan and the problem marked in red; 3-9s show the symptom; 9-18s map Nyquist limit; 18-24s run the move, Use oversampling when nonlinear processing makes harsh top end; 24-30s prove it with Turn oversampling on and level match the result and close on Distortion gets cleaner.

CTA: Save this before blaming the plugin.

Image generation guardrail: Keep the plain text `www.virzyguns.com`, and `100% Art. 100% Science.` when listed in Visible text. Do not interpret the name, website, or tagline as a logo request. Do not draw a stylized V, triangular V, initials logo, monogram, icon, emblem, badge, mark, crest, symbol, watermark shape, or decorative brand shape anywhere on the slide.

Slide 1 thumbnail read: Aliasing fake frequency leak

Viral hook: Aliasing is a fake frequency leak




Primary keyword: aliasing

Science anchor: Nyquist limit

Art and taste anchor: Aliasing is math leaving fingerprints.

Claim safety: producer interpretation. Avoid absolute claims. Use this as a production decision guided by sources, not a universal law.

Humanizer status: passed

## Sources
- Smith. Spectral Audio Signal Processing. CCRMA, Stanford.
  - URL: https://ccrma.stanford.edu/~jos/sasp/
  - Type: open textbook
  - Year/access: 2011
  - Use: FFT, STFT, filters, spectral analysis
- Smith. Introduction to Digital Filters with Audio Applications. CCRMA, Stanford.
  - URL: https://ccrma.stanford.edu/~jos/filters/
  - Type: open textbook
  - Year/access: 2007
  - Use: filters, resonance, phase response

## Visual design system

Canvas: 1080 x 1920 px, portrait 9:16.

Safe zones:
- Text safe: x 96-840, y 210-1390
- Right UI danger: x 870-1080 (decorative only)
- Bottom caption danger: y 1540-1920 (no text)
- Top app danger: y 0-170 (background only)
- Footer zone: y 1435-1515, centered horizontally

Typography:
- Headline: SF Pro Display, 100-140px, white. Accent: cyan/electric-blue gradient, 1-4 words max. Warm amber or soft red-orange accent permitted on Slide 1 (THE HOOK) only.
- Support: SF Pro Text, 38-48px. Accent: ice-blue underline or 80% opacity cyan, 1-4 words max
- Fallback fonts: Helvetica Neue or Inter only
- Reference: 18-22px, muted

Core look: Premium dark futuristic Apple editorial. Deep black-blue background with subtle dotted grid. Materials: glass panels, thin cyan strokes, soft bloom. 30% negative space minimum. Slide 1 (THE HOOK) may use up to 40% less negative space for higher visual density and scroll-stop impact. One hero object per slide.

Palette: black-blue, cyan, electric blue, ice blue, white, muted grey. Red reserved for warnings/bad decisions only.

Pillar visual language: DSP, math, and physics: waveform-to-spectrum, sampling grid, phase wheel, filter slope, impulse response, noise floor.

Footer: Render only `www.virzyguns.com` and `100% Art. 100% Science.` as centered plain text in the footer zone. No symbols, logos, stylized V, monogram, icon, emblem, badge, mark, or decorative shape anywhere.

Composition: Slide label top-left. Headline upper-middle with accent. Hero visual in middle. Support line lower-middle with accent. Footer centered in footer zone. Reference line tiny and muted.

Forbidden: Collages, grids, multi-panel, anime, cartoon, grunge, purple/green thumbnails, fake brands, fake numbers, extra words, any logo or symbol shape.

## 10-slide script

### Slide 1: SLIDE 1 | THE HOOK
Headline: [Aliasing] is a fake frequency leak
Support: Digital [clipping] generates harmonic reflections you cannot hear but feel.

### Slide 2: SLIDE 2 | THE TRAP
Headline: The [harsh high-end] accumulation
Support: [Saturation] plugins generate high-frequency harmonics. Without filtering, these exceed the Nyquist frequency and fold back into the audible band as unharmonic noise.

### Slide 3: SLIDE 3 | THE EAR
Headline: [Unharmonic noise] ruins clarity
Support: Unlike musical [harmonics], alias frequencies are not mathematically related to the fundamental pitch. The brain perceives this foldback as harsh digital glare.

### Slide 4: SLIDE 4 | THE SCIENCE
Headline: [Nyquist limit] violations
Support: When non-linear processing creates harmonics above half the sample rate, these signals cannot be represented. They reflect backward across the [Nyquist limit] into the audible spectrum.

### Slide 5: SLIDE 5 | THE ART
Headline: High [frequencies] need clean margins
Support: Some analog emulation plugins add pleasing harmonic warmth but introduce [aliasing]. Balance harmonic content with high-frequency cleanliness.

### Slide 6: SLIDE 6 | THE MOVE
Headline: Enable [oversampling] on non-linear plugins
Support: Turn on 4x or 8x oversampling inside saturators, limiters, and clippers. This raises the [Nyquist limit], allowing anti-aliasing filters to remove high harmonics.

### Slide 7: SLIDE 7 | THE TEST
Headline: The high-[frequency] sweep sweep
Support: Sweep a high-[frequency] sine wave through a saturator. Listen for a tone that moves downward while the input sweep moves upward.

### Slide 8: SLIDE 8 | THE CHECK
Headline: Check the [spectrum analyzer]
Support: Look at the spectrum analyzer at low volumes. Identify if there are unharmonic spikes appearing in the mid-range during high-frequency input [transients].

### Slide 9: SLIDE 9 | THE RULE
Headline: [Filter] before folding
Support: Always use [oversampling] or high-cut filters before non-linear processing to prevent mirror-image frequencies from corrupting your mix.

### Slide 10: SLIDE 10 | THE TAKEAWAY
Headline: [Save this] to prevent digital harshness

Support: [Follow @virzyguns, save] this post, and visit www.virzyguns.com for daily session science.

## 10-slide image prompts

### Prompt 1 - THE HOOK
Archetype: THE HOOK

Visible text:
- SLIDE 1 | THE HOOK
- [Aliasing] is a fake frequency leak
- Digital [clipping] generates harmonic reflections you cannot hear but feel.
- www.virzyguns.com
- 100% Art. 100% Science.

Visual direction: Macro studio photograph of a dark glass UI panel with a subtle dotted grid canvas texture. A spectrum showing high-frequency foldback lines in red mirroring back into the cyan region. Soft ambient side-lighting in dark teal casts dramatic shadows on a matte black textured slate surface. Premium dark Apple editorial aesthetic, 30% negative space.
Headline accent: [Aliasing]
Support accent: [clipping]
Motion cue: Quick zoom on the hero object, then kinetic headline fade-in over 0.5 seconds.
Reference line: Refs: Smith 2007 | MIT OCW 2011

### Prompt 2 - THE TRAP
Archetype: THE TRAP

Visible text:
- SLIDE 2 | THE TRAP
- The [harsh high-end] accumulation
- [Saturation] plugins generate high-frequency harmonics. Without filtering, these exceed the Nyquist frequency and fold back into the audible band as unharmonic noise.
- www.virzyguns.com
- 100% Art. 100% Science.

Visual direction: Macro studio photograph of a saturation curve display showing harmonic overtones exceeding the Nyquist limit, marked with a red warning circle. Curved glass panel, subtle dotted grid canvas texture, premium dark Apple editorial aesthetic, 30% negative space.
Headline accent: [harsh high-end]
Support accent: [Saturation]
Motion cue: Fast A/B wipe. Red problem detail appears for one beat, then cyan guide line pulls the eye back.
Reference line: Refs: Smith 2007 | MIT OCW 2011

### Prompt 3 - THE EAR
Archetype: THE EAR

Visible text:
- SLIDE 3 | THE EAR
- [Unharmonic noise] ruins clarity
- Unlike musical [harmonics], alias frequencies are not mathematically related to the fundamental pitch. The brain perceives this foldback as harsh digital glare.
- www.virzyguns.com
- 100% Art. 100% Science.

Visual direction: Studio product photograph of a clean, sleek glass screen showing a waveform displaying harsh, jagged spikes. Dotted grid canvas texture, dark-blue canvas background, premium dark Apple editorial aesthetic, 30% negative space.
Headline accent: [Unharmonic noise]
Support accent: [harmonics]
Motion cue: Fast wave sweep showing chaotic noise resolving into a clean signal line.
Reference line: Refs: Smith 2007 | MIT OCW 2011

### Prompt 4 - THE SCIENCE
Archetype: THE SCIENCE

Visible text:
- SLIDE 4 | THE SCIENCE
- [Nyquist limit] violations
- When non-linear processing creates harmonics above half the sample rate, these signals cannot be represented. They reflect backward across the [Nyquist limit] into the audible spectrum.
- www.virzyguns.com
- 100% Art. 100% Science.

Visual direction: Schematic diagram of the digital frequency axis showing the half-sample-rate folding point in glowing cyan. Curved glass panel, subtle dotted grid canvas texture, dark-blue canvas background, premium dark Apple editorial aesthetic, 30% negative space.
Headline accent: [Nyquist limit]
Support accent: [Nyquist limit]
Motion cue: Node lines slowly fade to dim grey, leaving only one bright path active.
Reference line: Refs: Smith 2007 | MIT OCW 2011

### Prompt 5 - THE ART
Archetype: THE ART

Visible text:
- SLIDE 5 | THE ART
- High [frequencies] need clean margins
- Some analog emulation plugins add pleasing harmonic warmth but introduce [aliasing]. Balance harmonic content with high-frequency cleanliness.
- www.virzyguns.com
- 100% Art. 100% Science.

Visual direction: Macro photograph of a tube saturation plugin interface with glowing tubes and a cyan oversampling switch. Dotted grid canvas texture, dark-blue background, soft glowing cyan ambient side-lighting, premium dark Apple editorial aesthetic, 30% negative space.
Headline accent: [frequencies]
Support accent: [aliasing]
Motion cue: Glass panel glows as a single dial locks firmly into position.
Reference line: Refs: Smith 2007 | MIT OCW 2011

### Prompt 6 - THE MOVE
Archetype: THE MOVE

Visible text:
- SLIDE 6 | THE MOVE
- Enable [oversampling] on non-linear plugins
- Turn on 4x or 8x oversampling inside saturators, limiters, and clippers. This raises the [Nyquist limit], allowing anti-aliasing filters to remove high harmonics.
- www.virzyguns.com
- 100% Art. 100% Science.

Visual direction: A glass control panel showing 8x oversampling selected in bright cyan. Curved glass panel, subtle dotted grid canvas texture, dark-blue canvas, premium dark Apple editorial aesthetic, 30% negative space.
Headline accent: [oversampling]
Support accent: [Nyquist limit]
Motion cue: A vertical divider line slides across the screen, separating the tracks into neat groups.
Reference line: Refs: Smith 2007 | MIT OCW 2011

### Prompt 7 - THE TEST
Archetype: THE TEST

Visible text:
- SLIDE 7 | THE TEST
- The high-[frequency] sweep sweep
- Sweep a high-[frequency] sine wave through a saturator. Listen for a tone that moves downward while the input sweep moves upward.
- www.virzyguns.com
- 100% Art. 100% Science.

Visual direction: Close-up of a frequency generator swept up to 24 kHz, showing reflected sine waves in red. Subtle dotted grid canvas texture, dark-blue canvas, premium dark Apple editorial aesthetic, 30% negative space.
Headline accent: [frequency]
Support accent: [frequency]
Motion cue: Digital timer countdown flashes once as it hits zero, triggering a glowing bounce progress bar.
Reference line: Refs: Smith 2007 | MIT OCW 2011

### Prompt 8 - THE CHECK
Archetype: THE CHECK

Visible text:
- SLIDE 8 | THE CHECK
- Check the [spectrum analyzer]
- Look at the spectrum analyzer at low volumes. Identify if there are unharmonic spikes appearing in the mid-range during high-frequency input [transients].
- www.virzyguns.com
- 100% Art. 100% Science.

Visual direction: A spectrum analyzer displaying mid-range intermodulation spikes. Subtle dotted grid canvas texture, dark-blue canvas, premium dark Apple editorial aesthetic, 30% negative space.
Headline accent: [spectrum analyzer]
Support accent: [transients]
Motion cue: Pulse animation travels from the studio monitor to the phone and car symbols.
Reference line: Refs: Smith 2007 | MIT OCW 2011

### Prompt 9 - THE RULE
Archetype: THE RULE

Visible text:
- SLIDE 9 | THE RULE
- [Filter] before folding
- Always use [oversampling] or high-cut filters before non-linear processing to prevent mirror-image frequencies from corrupting your mix.
- www.virzyguns.com
- 100% Art. 100% Science.

Visual direction: A clean schematic showing a high-cut filter slope on a dark grid attenuating the ultra-high spectrum. Curved glass panel, subtle dotted grid canvas texture, dark-blue canvas background, glowing cyan accents, premium dark Apple editorial aesthetic, 30% negative space.
Headline accent: [Filter]
Support accent: [oversampling]
Motion cue: Lock symbol blinks and glows solid cyan.
Reference line: Refs: Smith 2007 | MIT OCW 2011

### Prompt 10 - THE TAKEAWAY
Archetype: THE TAKEAWAY

Visible text:
- SLIDE 10 | THE TAKEAWAY
- [Save this] to prevent digital harshness
- [Follow @virzyguns, save] this post, and visit www.virzyguns.com for daily session science.
- www.virzyguns.com
- 100% Art. 100% Science.

Visual direction: Studio photograph of a dark glass UI panel displaying the call to action in large white typography. Subtle dotted grid canvas texture, dark-blue canvas background, soft glowing cyan ambient side-lighting, premium dark Apple editorial aesthetic, 30% negative space.
Headline accent: [Save this]
Support accent: [Follow @virzyguns, save]
Motion cue: Glowing pulse fades in around the CTA text.
Reference line: Refs: Smith 2007 | MIT OCW 2011
