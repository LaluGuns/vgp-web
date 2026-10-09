# Sources

Every number shown in a carousel or film comes from the lesson it promotes,
which carries its own references, or from a calculation listed here.

## Film: compression attack and release (lesson 057)

- Gain computer and attack/release smoothing: Giannoulis, D., Massberg, M.,
  and Reiss, J. D. (2012). Digital dynamic range compressor design: a
  tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6),
  399-408. Cited in lesson 057.
- Attack times shown (1 ms, 30 ms) and the 6:1 ratio match lesson 057,
  figure 1. Release is 60 ms in the attack scenes (see DECISIONS.md), 2.5 s
  in "release too slow" and 90 ms after it. The film's waveforms and its
  sound come from one model (`film/model.mjs`) with the same gain computer
  as the lesson's figures.
- Levels on screen are linear envelope amplitudes of the drum bus, not dBFS.
  Gain reduction is drawn in dB, 0 to 12 dB.
- Loudness target for the soundtrack (-16 LUFS integrated, -1.5 dBTP) is the
  delivery spec in the explainer brief, measured with ffmpeg `ebur128`.

## Film 3: the narrated short (lesson 057)

- Same gain computer as film 2 (`film/model.mjs`, Giannoulis, Massberg and
  Reiss 2012), run at 48 kHz on the real drum bus.
- Detector: RMS over 3 ms of the mono drum bus, centred on each sample (no
  lag), scaled so Snare 4's crack reads 1.0 (0 dB). Threshold 0.12 (-18.4 dB), ratio 6:1. Attack 1 ms and
  30 ms with a 60 ms release; release 2.5 s and 90 ms with a 30 ms attack.
- Crack is the first 20 ms after a kick or snare onset, the part a 30 ms
  attack lets through; body is what follows. Crack-to-body figures in
  DECISIONS.md and VERIFY.md are RMS over 0-15 ms against 25-70 ms of one
  snare, before and after the compressor.
- Makeup gain per demo matches the compressed bar to the plain bar's
  K-weighted loudness (BS.1770 gating), as the lesson says to judge.
- "Slow motion" scenes replay the same numbers: one snare (0-150 ms) for
  attack, and 0.4-1.62 s of the demo bar for release.
- Delivery: -16 LUFS integrated, true peak at most -1.5 dBTP, measured with
  ffmpeg `ebur128` on the delivered file.
- Plots are linear level. "Slowed down" views: level in (outline) and level
  out before makeup (fill). "Listen" views: level out after the demo's
  makeup gain, energy-averaged over 3 ms, as heard.
- Narration: ElevenLabs `eleven_v4`, voice Michael C. Vincent, take 1 of 4
  (`film3/vo-cues.json` records the choice), cued with `film3/cue_vo.py`.

## Film 4: the missing fundamental (lesson 036)

- Missing fundamental and harmonic pitch: Moore, B. C. J. (2012). *An
  Introduction to the Psychology of Hearing* (6th ed.). Bass enhancement
  for small speakers: Larsen, E., and Aarts, R. M. (2002, 2004). Both cited
  in lesson 036.
- Cone travel for equal level: the lesson's p ∝ S·x·f², so x ∝ 1/f²:
  200 Hz 1×, 100 Hz 4×, 50 Hz 16×.
- The phone: the lesson's check filter, a 200 Hz high-pass at 24 dB per
  octave (4th-order Butterworth), on the music bus.
- The sub: a pure sine, 12 ms raised-cosine attack, 0.9 s exponential
  decay, 40 ms release. Notes G#1 51.9 Hz, G1 49.0 Hz, F1 43.7 Hz.
- The saturated copy: tanh(6x + 0.8) - tanh(0.8), a 10 Hz DC blocker, then
  a 120 Hz high-pass (24 dB/oct), blended at 0.5 under the clean sub, the
  sum level-matched to the clean sub's full-range K-weighted loudness
  (BS.1770, gated) over the same two bars: -0.61 dB.
- Claim 1 (fundamental through the phone): FFT of the clean bass at each
  note's steady part, full range against phone-filtered: F1 down 52.9 dB,
  G1 48.8 dB, G#1 46.8 dB (filter theory 52.9, 48.9, 46.9).
- Claim 2 (saturated against clean, through the phone): ungated K-weighted
  level over the same two bars (the clean sub through the phone is under a
  loudness meter's -70 LUFS gate): full range -26.96 both, through the
  phone -73.1 clean and -41.7 saturated, +31.4 dB.
- Claim 3 (the harmonics repeat at the missing note's period): highest
  autocorrelation peak between 2.5 and 30 ms of the phone-filtered
  saturated bass, per note: 22.91, 20.41 and 19.26 ms, within 0.01% of
  1/f0.
- Ladders: amplitude of each harmonic n·f0 (n = 1-10), from an 85 ms Hann
  window centred on the frame (no lag), zero-padded to 16384 points, in dB
  re the clean sub's fundamental at its demo level. Outline: the bass as
  the track carries it; fill: the same after the phone filter. Drawn
  before the voice ducking.
- The pluck: Karplus-Strong at G#1, a triangle excitation (plucked at 13%),
  0.2% loss per period, low-passed at 900 Hz; drawn with its fundamental 3
  dB under the sub's, mixed 8 dB lower under the voice.
- Delivery: -16 LUFS integrated, true peak at most -2.2 dBTP on the master
  WAV and -1.5 dBTP after AAC, measured with ffmpeg `ebur128`.
- Every measured number is logged by `npm run film4` in
  `out/film4/VERIFY.md`.
