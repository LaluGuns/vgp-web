# Sources

Every number shown in a carousel or short comes from the lesson it promotes,
which carries its own references, or from a calculation listed here.

## Short: attack and release (lesson 057)

- Gain computer: `shared/compressor.mjs` (Giannoulis, Massberg and Reiss
  2012, cited in lesson 057), run at 48 kHz on the real drum bus.
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
  (`shorts/attack-release/vo-cues.json` records the choice), cued with `shorts/attack-release/cue_vo.py`.

## Short: bass on phones, the missing fundamental (lesson 036)

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
- The pluck: Karplus-Strong at G#1, plucked on "notes" and ringing 6.2 s, a triangle excitation (plucked at 13%),
  0.2% loss per period, low-passed at 900 Hz; drawn with its fundamental 3
  dB under the sub's, mixed 10 dB lower under the voice.
- Delivery: -16 LUFS integrated, true peak at most -2.2 dBTP on the master
  WAV and -1.5 dBTP after AAC, measured with ffmpeg `ebur128`.
- Narration: ElevenLabs `eleven_v4`, Michael C. Vincent, take 1 of 4, played
  10% slower (Rubber Band, formants preserved); cued per sentence on the
  slowed file with `shorts/bass-on-phones/cue_vo.py`.
- Every measured number is logged by `npm run short:bass-on-phones` in
  `out/shorts/bass-on-phones/VERIFY.md`.

## Short: gap before the drop (lesson 030)

- Claims on screen and in the narration come from lesson 030 ("A gap before
  the drop makes the downbeat hit harder") and its two references, both books:
  Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th
  ed.). Emerald (forward masking fades within 100 to 200 ms; the auditory
  nerve fires hardest at an onset and recovers in silence). Huron, D. (2006).
  *Sweet Anticipation: Music and the Psychology of Expectation*. MIT Press
  (listeners predict the next event; an accurate arrival is rewarding).
- Gap lengths at 128 BPM: a beat is 60/128 = 468.8 ms, an 8th 234.4 ms, a
  16th 117.2 ms, a 32nd 58.6 ms (lesson 030's figure "window").
- The A/B (`shorts/gap-before-drop/drop.mjs`): Cymatics samples at 128 BPM in D# minor, two
  build bars and the drop. Version 2 mutes every build source and the build's
  reverb return 234.4 ms before the downbeat with 8 ms fades. Both versions go
  through one look-ahead limiter (ceiling -1 dBFS, 5 ms look-ahead, 150 ms
  release) and are matched at the K-weighted loudness of the drop bar
  (downbeat plus one bar, BS.1770 gating). VERIFY.md logs every value.
- Claim 1: limiter gain reduction, mean over the first kick's first 20 ms.
- Claim 2: energy of the kick stem in 2-6 kHz (4th-order Butterworth band)
  over the energy of everything else in that band, first 20 ms after the
  downbeat, both after the shared limiter gain.
- Claim 3: claims 1 and 2 again after a 200 Hz, 24 dB/oct high-pass (phone
  check); claim 1 as the kick's level in the delivered A/B.
- Claim 4: the kick stem's K-weighted level over its first 50 ms minus the
  drop bar's loudness, at matched loudness.
- Picture models, labelled "model" on screen: forward masking is the build's
  level (0 to 1 over 40 dB below the kick's peak) carried forward with a
  weight that falls on a log-time curve to zero at 200 ms. Adaptation: drive is
  the mix level over 40 dB; adaptation follows it within 40 ms and recovers
  over 150 ms; the drawn response is drive times (1 - 0.75 x adaptation).
  Both are illustrations of the mechanisms Moore (2012) describes, not
  measurements of hearing.
- The limiter faders draw the limiter's own gain from the render, slowed down.
- Delivery: -16 LUFS integrated, true peak at most -2.2 dBTP on the master WAV
  and -1.5 dBTP after AAC, measured with ffmpeg `ebur128`.
- Narration (script v13, `shorts/gap-before-drop/script.txt`): a temporary guide track from
  Kokoro-82M (`kokoro-onnx` v1.0, voice `am_michael`, speed 1.0; weights
  Apache-2.0; `assets/vo/`, not in git), cued with `shorts/gap-before-drop/cue_vo.py`. Rounds
  up to 22 used Piper TTS (`en_US-ryan-high`, length scale 1.27). It holds the timings
  until the final voice is generated (ElevenLabs `eleven_v4`, voice Michael C.
  Vincent, `shorts/gap-before-drop/narration-prompt.txt`). A synthetic voice needs the
  platforms' AI-generated label. The founder's earlier phone takes of script
  v2 are kept in `assets/vo/` but no longer match the script.
- Picture, cross-section of the ear: outer ear, canal, eardrum, the three
  small bones, cochlea and hearing nerve, drawn as an illustration (not to
  scale). Its fog and the hair cells' tiredness follow the two models above,
  slowed down.
- Sound effects: pop, tick, grab and whoosh are recorded one-shots from the
  founder's licensed packs (Cymatics Secret Percussion Shot Bubble Pop and
  Sweet Click, Cymatics FX Essentials Downlifter 21), placed by the same
  timeline cues as before; the kick and the button note are the A/B's own
  samples.
