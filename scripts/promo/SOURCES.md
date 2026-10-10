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
