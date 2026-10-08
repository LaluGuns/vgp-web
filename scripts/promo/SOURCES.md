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
