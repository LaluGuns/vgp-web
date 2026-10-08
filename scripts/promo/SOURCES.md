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
