/**
 * The listening demos an article can place with `::demo <id>`. Titles and
 * blurbs render on the server; the controls load in the browser only when
 * the demo scrolls near. Every sound is synthesised in the browser, except
 * the real mix that eleven of them can play instead (their Source choice,
 * components/blog/demos/realmix.tsx), which loads only when a reader picks it.
 *
 * `height` is the height in px of the demo's controls (the box under its
 * blurb) on a lesson page before anyone touches them, the tallest in each
 * range of window widths: under 360 px, 360 to 374, 375 to 389, 390 to 392,
 * 393 to 411, 412 to 427, 428 to 639, 640 to 735, 736 to 1023, 1024 to 1103
 * (the lesson's outline column narrows the text there) and 1104 up. The
 * common phones start a range each, so little space is left over. The server
 * reserves it, so the article does not move when the controls arrive.
 * Re-measure it whenever a demo's layout or copy changes.
 *
 * `level` is the demo's playback trim in dB (0 if absent), on top of the
 * engine's house level (components/blog/demos/engine.ts). It puts the demo's
 * default setting at the house loudness, -29 LUFS at 100 % volume (BS.1770
 * K-weighting, both channels, ungated, over whole loops: the drop demo over
 * its four bars of build and drop), where the drum-loop demos play with no
 * trim. At that level every demo's loudest setting peaks under -7 dBFS. Two
 * are set by ear around it: the bass-only phase demo sits 1.5 LU higher and
 * the latency clicks lower. The normalization demo's dynamic master is at
 * the house loudness and its loud master about 6 LU above it, on purpose;
 * in the blind loudness test the two sides sit 0.5 LU either side of it.
 * A real mix plays at the same house loudness and peak rule: each demo with a
 * Source choice sets the loudness its loop goes in at (`*_REAL_IN` in its
 * module), and its height holds with either source picked. Re-measure it
 * whenever a demo's sound changes.
 */

export const demoCatalog = {
    compressor: {
        title: 'Hear compression change the shape of a hit',
        blurb: 'A drum loop, or a real mix, through a compressor, level-matched so you compare movement, not volume. Change the attack and listen to the snare.',
        height: [920, 876, 876, 876, 876, 816, 816, 604, 604, 604, 604],
        level: -1.6,
    },
    aliasing: {
        title: 'Hear a frequency fold back down',
        blurb: 'A tone sweeps up from 500 Hz to 15 kHz. At a 16 kHz sample rate everything above 8 kHz is stored as a falling ghost tone, the same fold a saturator causes when its harmonics pass the Nyquist limit.',
        height: [540, 540, 540, 540, 540, 540, 540, 424, 424, 424, 424],
        level: -4.1,
    },
    swing: {
        title: 'Hear swing move the off-beats',
        blurb: 'One bar of drums. Drag the swing amount and watch every second 16th slide later while the downbeats stay put.',
        height: [438, 418, 418, 366, 366, 366, 366, 366, 366, 366, 366],
    },
    'late-snare': {
        title: 'Move the snare off the grid',
        blurb: 'The same beat with the snare pushed early or late by a few milliseconds. Listen for weight and lean, not for an obvious mistake.',
        height: [298, 298, 298, 298, 298, 298, 298, 278, 278, 278, 278],
    },
    tempo: {
        title: 'Change only the tempo',
        blurb: 'The same pattern and the same sounds from 60 to 160 BPM. Notice where the beat stops feeling heavy and starts feeling urgent.',
        height: [298, 298, 298, 278, 278, 278, 278, 278, 278, 278, 278],
    },
    humanize: {
        title: 'From quantized to played',
        blurb: 'Add timing drift to the hats and snare. A few milliseconds of consistent drift sounds like a drummer. Past a point it sounds loose.',
        height: [298, 298, 298, 298, 298, 298, 298, 278, 278, 278, 278],
    },
    syncopation: {
        title: 'Move the accents off the beat',
        blurb: 'Switch between a pattern that lands on the beat and one that accents the spaces between. The tempo and the sounds do not change.',
        height: [260, 260, 260, 260, 260, 260, 260, 260, 260, 260, 260],
    },
    drop: {
        title: 'Make the drop land harder',
        blurb: 'Two bars of build into two bars of drop. Remove layers or leave one beat of silence before the drop and compare how hard it hits.',
        height: [341, 269, 269, 269, 269, 269, 269, 217, 217, 217, 217],
        level: -4.1,
    },
    mono: {
        title: 'Fold the mix to mono',
        blurb: 'Kick, bass and snare in the middle, and a pluck made wide with a stereo trick. Switch to mono and hear which one survives.',
        height: [616, 532, 532, 532, 532, 508, 508, 412, 388, 412, 388],
        level: -1.4,
    },
    phase: {
        title: 'Hear two copies of a bass cancel',
        blurb: 'The same bass note on two layers. Delay one by a few milliseconds or flip its polarity and the low end thins out, then disappears.',
        height: [370, 350, 290, 290, 274, 274, 274, 274, 254, 254, 254],
        level: -6,
    },
    reverb: {
        title: 'Push a sound forward or back with reverb',
        blurb: 'A short melody in a generated room. Pre-delay, decay and level each change how far away the notes feel.',
        height: [614, 570, 570, 570, 570, 570, 570, 350, 350, 350, 350],
        level: -0.9,
    },
    filter: {
        title: 'Shape a sound with a filter',
        blurb: 'Chords and soft noise, or a real mix, through one filter, with the spectrum drawn live. Sweep the cutoff and raise the resonance.',
        height: [680, 660, 660, 660, 660, 608, 608, 442, 442, 442, 442],
        level: -0.1,
    },
    'eq-sweep': {
        title: 'Find a frequency by ear',
        blurb: 'A narrow boost you can sweep across a synth loop or a real mix. Move it slowly, stop where it sounds worst, then check the number.',
        height: [540, 520, 520, 520, 520, 520, 520, 414, 414, 414, 414],
        level: -1.2,
    },
    envelope: {
        title: 'Same notes, different attack',
        blurb: 'One phrase with an adjustable attack and release. A fast attack speaks and pushes. A slow one swells and sits back.',
        height: [392, 392, 392, 392, 392, 392, 392, 286, 286, 286, 286],
        level: -1.3,
    },
    masking: {
        title: 'Free a lead from a crowded pad',
        blurb: 'A lead and a bright pad share the same range. Cut the pad or duck it under the lead and the lead comes forward without getting louder.',
        height: [496, 496, 444, 444, 444, 420, 420, 368, 368, 368, 368],
        level: -1.8,
    },
    saturation: {
        title: 'Hear saturation add size, not volume',
        blurb: 'Bass and chords, or a real mix, through a waveshaper, level-matched so you hear the harmonics rather than a louder signal. Watch the spectrum fill in.',
        height: [674, 654, 654, 602, 602, 602, 602, 502, 502, 502, 502],
        level: -2.3,
    },
    'bit-depth': {
        title: 'Lower the bit depth',
        blurb: 'A quiet, decaying note, or a real mix played quietly, stored at fewer and fewer bits. Listen to the tails turn gritty, then turn on dither and hear the grit become hiss.',
        height: [510, 474, 474, 454, 454, 454, 454, 414, 414, 414, 414],
        level: -0.8,
    },
    latency: {
        title: 'Play through added latency',
        blurb: 'Tap the pad and the click plays after the delay you set. Tap along to the metronome and notice where timing starts to feel wrong.',
        height: [318, 298, 298, 298, 298, 298, 298, 278, 278, 278, 278],
        level: 5,
    },
    normalization: {
        title: 'Hear what normalization does to a loud master',
        blurb: 'A loop, synth or a real mix, as a dynamic master and a loud, clipped one. Turn on streaming-style normalization and compare them at the same loudness.',
        height: [752, 708, 684, 684, 632, 632, 632, 472, 448, 472, 448],
        level: 1.2,
    },
    'loudness-bias': {
        title: 'Blind test: which one sounds better?',
        blurb: 'The same loop twice, synth or a real mix, with one side 1 dB louder. Pick the one you prefer, then find out which was louder.',
        height: [428, 356, 356, 356, 356, 356, 356, 336, 336, 336, 336],
        level: -0.3,
    },
    cadence: {
        title: 'End a phrase on V or on I',
        blurb: 'The same four-bar phrase, stopping on the dominant or landing on the home chord. Listen for a question against an answer.',
        height: [405, 381, 381, 381, 381, 381, 381, 297, 297, 297, 297],
        level: -1.9,
    },
    parallel: {
        title: 'Blend a crushed copy under the dry drums',
        blurb: 'The dry drums, or a real mix, stay untouched while a heavily compressed copy is blended underneath. Move the blend and hear the quiet detail come up while the hits keep their shape.',
        height: [962, 898, 874, 834, 782, 758, 758, 654, 610, 630, 610],
        level: -0.5,
    },
    transient: {
        title: 'Shape the hit without a threshold',
        blurb: 'A transient shaper turns the start of each hit up or down and the tail up or down, whatever the level. Compare it with a compressor on the same loop.',
        height: [1182, 1074, 1054, 1030, 1030, 978, 954, 696, 696, 696, 696],
        level: -0.3,
    },
    sidechain: {
        title: 'Let the kick push the bass aside',
        blurb: 'A sustained bass ducks each time the kick hits. Change the depth and the release, or duck only the low end, and listen to the groove change.',
        height: [812, 760, 760, 736, 736, 736, 736, 550, 526, 550, 526],
        level: -2.3,
    },
    limiter: {
        title: 'Drive a limiter and listen to the release',
        blurb: 'A drum loop or a real mix driven into a limiter, matched in loudness to the original. Push the drive and change the release to hear the drums and the tone change.',
        height: [1060, 1016, 936, 912, 912, 892, 892, 734, 714, 734, 714],
        level: -1.4,
    },
    'clip-recover': {
        title: 'Turn down a clipped take',
        blurb: 'A phrase recorded too hot clips at the converter. Pull the fader down afterwards and the level drops, but the flattened peaks and their distortion stay.',
        height: [1160, 1082, 1039, 1019, 1019, 1019, 1003, 618, 556, 574, 556],
        level: -3.8,
    },
    width: {
        title: 'Widen the sides and watch the meters',
        blurb: 'A short synth mix, or a real one, split into mid and side. Raise the side level, check it in mono and watch the correlation meter move as the image gets wider.',
        height: [1312, 1192, 1148, 1124, 1124, 1080, 1080, 902, 858, 882, 858],
        level: -3.7,
    },
    'monitor-level': {
        title: 'Judge the same mix at three playback levels',
        blurb: 'One short mix, synth or real, played quiet, medium and loud, with the loudest step kept safe. Listen to how much bass and air you hear at each level.',
        height: [908, 840, 840, 816, 816, 796, 796, 652, 628, 628, 628],
        level: -3.7,
    },
    'reverb-duck': {
        title: 'Keep the reverb out of the next line',
        blurb: 'A short vocal-like phrase into a long reverb. Duck the reverb under the dry phrase, or send only the last syllable of each line to a tempo delay, and hear the next line come through.',
        height: [698, 678, 654, 634, 634, 634, 634, 558, 534, 558, 534],
        level: -3.6,
    },
    'chord-context': {
        title: 'Hear one chord in different contexts',
        blurb: 'The same chord after different progressions, and one melody in major or minor, at different tempos and registers. Notice how much the surroundings change what each seems to say.',
        height: [773, 701, 677, 677, 677, 677, 677, 481, 457, 481, 457],
        level: -1.3,
    },
} satisfies Record<string, { title: string; blurb: string; height: [number, number, number, number, number, number, number, number, number, number, number]; level?: number }>;

export type DemoId = keyof typeof demoCatalog;

export function isDemoId(id: string): id is DemoId {
    return id in demoCatalog;
}
