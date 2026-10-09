/**
 * The listening demos an article can place with `::demo <id>`. Titles and
 * blurbs render on the server; the controls load in the browser only when
 * the demo scrolls near. Every sound is synthesised in the browser.
 */

export const demoCatalog = {
    compressor: {
        title: 'Hear compression change the shape of a hit',
        blurb: 'A drum loop through a compressor, level-matched so you compare movement, not volume. Change the attack and listen to the snare.',
    },
    aliasing: {
        title: 'Hear a frequency fold back down',
        blurb: 'A tone sweeps up from 500 Hz to 15 kHz. At a 16 kHz sample rate everything above 8 kHz is stored as a falling ghost tone, the same fold a saturator causes when its harmonics pass the Nyquist limit.',
    },
    swing: {
        title: 'Hear swing move the off-beats',
        blurb: 'One bar of drums. Drag the swing amount and watch every second 16th slide later while the downbeats stay put.',
    },
    'late-snare': {
        title: 'Move the snare off the grid',
        blurb: 'The same beat with the snare pushed early or late by a few milliseconds. Listen for weight and lean, not for an obvious mistake.',
    },
    tempo: {
        title: 'Change only the tempo',
        blurb: 'The same pattern and the same sounds from 60 to 160 BPM. Notice where the beat stops feeling heavy and starts feeling urgent.',
    },
    humanize: {
        title: 'From quantized to played',
        blurb: 'Add timing drift to the hats and snare. A few milliseconds of consistent drift sounds like a drummer. Past a point it sounds loose.',
    },
    syncopation: {
        title: 'Move the accents off the beat',
        blurb: 'Switch between a pattern that lands on the beat and one that accents the spaces between. The tempo and the sounds do not change.',
    },
    drop: {
        title: 'Make the drop land harder',
        blurb: 'Two bars of build into two bars of drop. Remove layers or leave one beat of silence before the drop and compare how hard it hits.',
    },
    mono: {
        title: 'Fold the mix to mono',
        blurb: 'Kick, bass and snare in the middle, and a pluck made wide with a stereo trick. Switch to mono and hear which one survives.',
    },
    phase: {
        title: 'Hear two copies of a bass cancel',
        blurb: 'The same bass note on two layers. Delay one by a few milliseconds or flip its polarity and the low end thins out, then disappears.',
    },
    reverb: {
        title: 'Push a sound forward or back with reverb',
        blurb: 'A short melody in a generated room. Pre-delay, decay and level each change how far away the notes feel.',
    },
    filter: {
        title: 'Shape a sound with a filter',
        blurb: 'Chords and soft noise through one filter, with the spectrum drawn live. Sweep the cutoff and raise the resonance.',
    },
    'eq-sweep': {
        title: 'Find a frequency by ear',
        blurb: 'A narrow boost you can sweep across the spectrum. Move it slowly, stop where it sounds worst, then check the number.',
    },
    envelope: {
        title: 'Same notes, different attack',
        blurb: 'One phrase with an adjustable attack and release. A fast attack speaks and pushes. A slow one swells and sits back.',
    },
    masking: {
        title: 'Free a lead from a crowded pad',
        blurb: 'A lead and a bright pad share the same range. Cut the pad or duck it under the lead and the lead comes forward without getting louder.',
    },
    saturation: {
        title: 'Hear saturation add size, not volume',
        blurb: 'Bass and chords through a waveshaper, level-matched so you hear the harmonics rather than a louder signal. Watch the spectrum fill in.',
    },
    'bit-depth': {
        title: 'Lower the bit depth',
        blurb: 'A quiet, decaying note stored at fewer and fewer bits. Listen to the tail turn gritty, then turn on dither and hear the grit become hiss.',
    },
    latency: {
        title: 'Play through added latency',
        blurb: 'Tap the pad and the click plays after the delay you set. Tap along to the metronome and notice where timing starts to feel wrong.',
    },
    normalization: {
        title: 'Hear what normalization does to a loud master',
        blurb: 'The same loop as a dynamic master and a loud, clipped one. Turn on streaming-style normalization and compare them at the same loudness.',
    },
    'loudness-bias': {
        title: 'Blind test: louder sounds better',
        blurb: 'The same loop twice, one side 1 dB louder. Pick the one you prefer, then find out which was louder.',
    },
    cadence: {
        title: 'End a phrase on V or on I',
        blurb: 'The same four-bar phrase, stopping on the dominant or landing on the home chord. Listen for a question against an answer.',
    },
    parallel: {
        title: 'Blend a crushed copy under the dry drums',
        blurb: 'The dry drum loop stays untouched while a heavily compressed copy is blended underneath. Move the blend and hear the quiet detail come up while the hits keep their shape.',
    },
    transient: {
        title: 'Shape the hit without a threshold',
        blurb: 'A transient shaper turns the start of each hit up or down and the tail up or down, whatever the level. Compare it with a compressor on the same loop.',
    },
    sidechain: {
        title: 'Let the kick push the bass aside',
        blurb: 'A sustained bass ducks each time the kick hits. Change the depth and the release, or duck only the low end, and listen to the groove change.',
    },
    limiter: {
        title: 'Drive a limiter and listen to the release',
        blurb: 'A loop driven into a limiter, matched in loudness to the original. Push the drive and change the release to hear the drums and the tone change.',
    },
    'clip-recover': {
        title: 'Turn down a clipped take',
        blurb: 'A phrase recorded too hot clips at the converter. Pull the fader down afterwards and the level drops, but the flattened peaks and their distortion stay.',
    },
    width: {
        title: 'Widen the sides and watch the meters',
        blurb: 'A stereo mix split into mid and side. Raise the side level, check it in mono and watch the correlation meter move as the image gets wider.',
    },
    'monitor-level': {
        title: 'Judge the same mix at three playback levels',
        blurb: 'One short mix played quiet, medium and loud, with the loudest step kept safe. Listen to how much bass and air you hear at each level.',
    },
    'reverb-duck': {
        title: 'Keep the reverb out of the next line',
        blurb: 'A short vocal-like phrase into a long reverb. Duck the reverb under the dry phrase, or send only the last syllable of each line to a tempo delay, and hear the next line come through.',
    },
    'chord-context': {
        title: 'Hear one chord in different contexts',
        blurb: 'The same chord after different progressions, and one melody in major or minor, at different tempos and registers. Notice how much the surroundings change what each seems to say.',
    },
} satisfies Record<string, { title: string; blurb: string }>;

export type DemoId = keyof typeof demoCatalog;

export function isDemoId(id: string): id is DemoId {
    return id in demoCatalog;
}
