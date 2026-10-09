/**
 * Glossary terms. The first time a term appears in an article's prose it
 * becomes a tappable word that opens its definition. The full list is
 * published at /learn/glossary.
 *
 * Definitions are plain, short and checkable. No claims the articles do
 * not back up.
 */

import type { BlogArticle } from '../blog-data';

type Category = BlogArticle['category'];

export interface GlossaryEntry {
    id: string;
    term: string;
    /** Spellings to look for in the text. Matched on word boundaries. */
    forms: string[];
    /** Match exactly as written (for acronyms like EQ). */
    caseSensitive?: boolean;
    definition: string;
    /** Article slug that explains the term in depth. */
    article?: string;
    /** Only link the term inside these categories, for words with everyday meanings. */
    only?: Category[];
}

const TECH: Category[] = ['mixing-mastering', 'audio-science', 'sound-design', 'vocal-production', 'production-tips', 'genre-guides'];
const RHYTHM: Category[] = ['arrangement-groove', 'songwriting', 'production-tips', 'genre-guides', 'music-psychology'];
const MUSIC: Category[] = ['songwriting', 'arrangement-groove', 'genre-guides', 'production-tips', 'music-psychology'];

export const glossary: GlossaryEntry[] = [
    // Loudness and level
    {
        id: 'lufs',
        term: 'LUFS',
        forms: ['LUFS'],
        caseSensitive: true,
        definition:
            'Loudness Units relative to Full Scale. A loudness measurement weighted toward how the ear hears. Streaming services use integrated LUFS, an average over the whole track, to match playback level.',
        article: 'why-lufs-is-not-a-magic-number',
    },
    {
        id: 'true-peak',
        term: 'True peak',
        forms: ['true peak', 'true-peak'],
        definition:
            'The highest level a waveform reaches between samples once it is converted to analog or decoded from a lossy file. It can sit above the highest sample value, so meters estimate it by oversampling.',
        article: 'why-true-peak-matters-after-encoding',
    },
    {
        id: 'dbfs',
        term: 'dBFS',
        forms: ['dBFS', 'dBTP'],
        caseSensitive: true,
        definition:
            'Decibels relative to full scale. 0 dBFS is the highest level a digital system can store, so every other level is a negative number. dBTP is the same scale measured as true peak.',
    },
    {
        id: 'inter-sample-peak',
        term: 'Inter-sample peak',
        forms: ['inter-sample peaks', 'inter-sample peak', 'intersample peaks', 'intersample peak'],
        definition:
            'A peak in the reconstructed waveform that falls between two samples, so the highest sample value under-reads it. True-peak meters find it by oversampling.',
        article: 'why-true-peak-matters-after-encoding',
    },
    {
        id: 'lu',
        term: 'LU',
        forms: ['LU'],
        caseSensitive: true,
        definition: 'Loudness Unit: a difference in loudness on the LUFS scale. 1 LU is the same step as 1 dB.',
    },
    {
        id: 'short-term-loudness',
        term: 'Short-term loudness',
        forms: ['short-term loudness'],
        definition: 'Loudness measured over a sliding 3-second window, useful for comparing sections. Momentary loudness uses 400 ms.',
        article: 'why-lufs-is-not-a-magic-number',
    },
    {
        id: 'plr',
        term: 'Peak to loudness ratio',
        forms: ['peak to loudness ratio', 'peak-to-loudness ratio', 'PLR'],
        definition: 'The gap between a master\u2019s true peak and its integrated loudness. Heavy limiting makes it smaller, and normalization makes it the number that decides how punchy a track sounds next to others.',
        article: 'loudness-and-dynamic-range-are-different-readings',
    },
    {
        id: 'loudness-range',
        term: 'Loudness range',
        forms: ['loudness range', 'LRA'],
        definition:
            'LRA, in LU: the spread between the quieter and louder parts of a programme, taken from the 10th to the 95th percentile of its gated short-term loudness (EBU Tech 3342). It tracks section-to-section change, not punch.',
        article: 'loudness-and-dynamic-range-are-different-readings',
    },
    {
        id: 'psr',
        term: 'Peak to short-term loudness ratio',
        forms: ['peak to short-term loudness ratio', 'PSR'],
        definition:
            'The gap between the highest true peak in a 3-second window and the short-term loudness of that window. It follows how far the peaks stand above the music moment by moment.',
        article: 'loudness-and-dynamic-range-are-different-readings',
    },
    {
        id: 'intermodulation',
        term: 'Intermodulation',
        forms: ['intermodulation distortion', 'intermodulation'],
        definition:
            'Distortion that creates new frequencies at sums and differences of the tones going in, such as 1160 and 840 Hz from 1 kHz plus 80 Hz. Unlike harmonics, they are not related to the notes.',
    },
    {
        id: 'headroom',
        term: 'Headroom',
        forms: ['headroom'],
        definition: 'The space between the loudest peak in a signal and the level where it would clip.',
    },
    {
        id: 'normalization',
        term: 'Loudness normalization',
        forms: ['loudness normalization', 'normalization', 'normalisation'],
        definition:
            'A streaming service turning each track up or down so everything plays back at a similar loudness. A louder master is simply turned down further.',
        article: 'the-streaming-loudness-myth-that-refuses-to-die',
        only: TECH,
    },
    {
        id: 'dynamic-range',
        term: 'Dynamic range',
        forms: ['dynamic range'],
        definition: 'The distance between the quiet and loud parts of a signal or a song.',
    },
    {
        id: 'crest-factor',
        term: 'Crest factor',
        forms: ['crest factor'],
        definition: 'The gap between a signal’s peak level and its average level. Heavy limiting makes it smaller.',
    },
    {
        id: 'gain-staging',
        term: 'Gain staging',
        forms: ['gain staging', 'gain-staging'],
        definition:
            'Setting the level at each point in the signal chain so nothing clips and nothing sits so low that noise becomes audible.',
    },
    {
        id: 'noise-floor',
        term: 'Noise floor',
        forms: ['noise floor'],
        definition: 'The level of background noise in a system. Anything quieter than it is lost in the hiss.',
    },

    // Dynamics
    {
        id: 'transient',
        term: 'Transient',
        forms: ['transients', 'transient'],
        definition:
            'The short, sharp start of a sound, like the crack of a snare or a pick hitting a string. It carries a lot of how hard a sound feels and how quickly the ear recognises it.',
    },
    {
        id: 'compressor',
        term: 'Compressor',
        forms: ['compressor', 'compressors'],
        definition:
            'A processor that turns a signal down once it goes above a threshold. The ratio sets how much: at 4:1, every 4 dB over the threshold comes out as 1 dB over.',
        article: 'how-compression-changes-motion-not-level',
    },
    {
        id: 'attack-time',
        term: 'Attack time',
        forms: ['attack time', 'attack times'],
        definition:
            'How quickly a compressor clamps down once the signal crosses the threshold, or how quickly a synth note rises to full level. Usually set in milliseconds.',
    },
    {
        id: 'release-time',
        term: 'Release time',
        forms: ['release time', 'release times'],
        definition: 'How quickly a compressor lets go after the signal falls back below the threshold.',
    },
    {
        id: 'limiter',
        term: 'Limiter',
        forms: ['limiter', 'limiters'],
        definition: 'A very fast compressor with a very high ratio. It stops peaks from going over a set ceiling.',
    },
    {
        id: 'clipping',
        term: 'Clipping',
        forms: ['clipping'],
        definition:
            'Cutting off the top of a waveform at a fixed level. Hard clipping flattens the peaks; soft clipping rounds them, which adds fewer harsh harmonics.',
        article: 'why-clipping-can-be-aesthetic-but-risky',
    },
    {
        id: 'sidechain',
        term: 'Sidechain',
        forms: ['sidechain', 'side-chain', 'sidechaining'],
        definition:
            'Letting one signal control a processor on another, for example the kick triggering a compressor on the bass so the two take turns.',
        article: 'sidechain-is-more-than-kick-ducking-bass',
    },
    {
        id: 'parallel-compression',
        term: 'Parallel compression',
        forms: ['parallel compression', 'New York compression'],
        definition:
            'Blending a heavily compressed copy of a signal under the untouched original. The quiet detail comes up while the loud peaks keep most of their shape.',
        article: 'parallel-compression-is-not-half-compression',
    },
    {
        id: 'bus-compression',
        term: 'Bus compression',
        forms: ['bus compression', 'bus compressor', 'glue compression'],
        definition:
            'A compressor on a group or the mix bus, so every part feeding it shares one gain movement.',
        article: 'what-bus-compression-glue-actually-does',
    },
    {
        id: 'transient-shaper',
        term: 'Transient shaper',
        forms: ['transient shaper', 'transient shapers', 'transient designer'],
        definition:
            'A processor that turns the start of each sound up or down, and its sustain up or down, by comparing a fast and a slow level follower. It has no threshold, so quiet and loud hits are shaped alike.',
        article: 'transient-shaper-vs-compressor-punch-is-a-shape',
    },
    {
        id: 'clip-gain',
        term: 'Clip gain',
        forms: ['clip gain'],
        definition:
            'A gain change applied to a region of audio itself. In most DAWs it acts before the plugins on the track, so unlike the fader it changes what they hear.',
        article: 'clip-gain-and-automation-before-compression',
    },
    {
        id: 'dynamic-eq',
        term: 'Dynamic EQ',
        forms: ['dynamic EQ', 'dynamic EQs'],
        definition:
            'An EQ band that cuts or boosts only while the level in its band, or in a key signal, passes a threshold, and stays flat the rest of the time.',
        article: 'dynamic-eq-vs-multiband-compression',
    },
    {
        id: 'multiband-compression',
        term: 'Multiband compression',
        forms: ['multiband compression', 'multiband compressor', 'multiband compressors'],
        definition:
            'Splitting a signal into frequency bands with crossover filters and compressing each band on its own.',
        article: 'dynamic-eq-vs-multiband-compression',
    },
    {
        id: 'saturation',
        term: 'Saturation',
        forms: ['saturation'],
        definition: 'Gentle distortion that adds harmonics and rounds off peaks, often modelled on tape, tubes or transformers.',
        only: TECH,
    },

    // Frequency
    {
        id: 'eq',
        term: 'EQ',
        forms: ['EQ'],
        caseSensitive: true,
        definition: 'Equalisation: turning chosen frequency ranges up or down.',
        article: 'how-eq-becomes-attention-design',
    },
    {
        id: 'masking',
        term: 'Masking',
        forms: ['masking'],
        definition:
            'One sound making another harder to hear because they share frequencies at the same moment. The quieter sound is still there; the ear stops separating it.',
        article: 'the-masking-problem-producers-hear-as-mud',
    },
    {
        id: 'high-pass',
        term: 'High-pass filter',
        forms: ['high-pass filter', 'highpass filter', 'high-pass filters', 'high-pass'],
        definition: 'A filter that removes energy below a cutoff frequency and lets everything above it through.',
        article: 'filters-are-shape-machines',
    },
    {
        id: 'low-pass',
        term: 'Low-pass filter',
        forms: ['low-pass filter', 'lowpass filter', 'low-pass filters', 'low-pass'],
        definition: 'A filter that removes energy above a cutoff frequency and lets everything below it through.',
        article: 'filters-are-shape-machines',
    },
    {
        id: 'resonance',
        term: 'Resonance',
        forms: ['resonance', 'resonances'],
        definition:
            'A frequency where a system rings or builds up energy. On a filter, the resonance control boosts a narrow band around the cutoff.',
        article: 'why-resonance-can-sing-or-destroy-a-mix',
        only: ['audio-science', 'sound-design', 'mixing-mastering'],
    },
    {
        id: 'harmonics',
        term: 'Harmonics',
        forms: ['harmonics', 'overtones'],
        definition:
            'Frequencies above a note’s fundamental. In pitched sounds they sit at whole-number multiples of it, and their balance is a large part of timbre.',
    },
    {
        id: 'fundamental',
        term: 'Fundamental',
        forms: ['fundamental frequency', 'fundamentals', 'fundamental'],
        only: ['audio-science', 'sound-design', 'mixing-mastering', 'vocal-production', 'genre-guides', 'production-tips'],
        definition: 'The lowest frequency of a pitched sound. It sets the note you hear.',
    },
    {
        id: 'timbre',
        term: 'Timbre',
        forms: ['timbre'],
        definition:
            'What lets you tell two sounds apart at the same pitch and level: the balance of harmonics and noise, and how they change over time.',
        article: 'why-timbre-tells-the-brain-what-this-is',
    },
    {
        id: 'spectrum-analyzer',
        term: 'Spectrum analyzer',
        forms: ['spectrum analyzer', 'spectrum analyzers', 'spectrum analyser'],
        definition: 'A meter that shows how much energy sits at each frequency, usually on a log scale from 20 Hz to 20 kHz.',
        article: 'fourier-turns-sound-into-ingredients',
    },
    {
        id: 'fft',
        term: 'FFT',
        forms: ['FFT'],
        caseSensitive: true,
        definition:
            'Fast Fourier Transform. The algorithm analyzers use to split a short block of audio into frequencies. Longer blocks show frequency more precisely and timing less precisely.',
        article: 'fourier-turns-sound-into-ingredients',
    },
    {
        id: 'fourier',
        term: 'Fourier transform',
        forms: ['Fourier transform'],
        definition: 'Maths that describes any sound as a sum of sine waves, each with its own frequency, level and phase.',
        article: 'fourier-turns-sound-into-ingredients',
    },

    // Time, phase and space
    {
        id: 'phase',
        term: 'Phase',
        forms: ['phase'],
        definition:
            'Where a wave is in its cycle at a given moment. Two copies of a sound that are out of phase partly cancel where one rises while the other falls.',
        article: 'phase-explained-without-panic',
        only: ['audio-science', 'mixing-mastering', 'sound-design', 'vocal-production', 'production-tips'],
    },
    {
        id: 'polarity',
        term: 'Polarity',
        forms: ['polarity'],
        definition:
            'Whether a waveform is upright or flipped. Flipping polarity inverts the wave at every frequency at once. It is not the same as a time delay.',
        article: 'phase-vs-polarity-kick-bass-will-thank-you',
    },
    {
        id: 'comb-filtering',
        term: 'Comb filtering',
        forms: ['comb filtering', 'comb filter', 'comb-filtering'],
        definition:
            'The hollow, notched sound you get when a signal is mixed with a slightly delayed copy of itself. The cancellations fall at evenly spaced frequencies, like the teeth of a comb.',
        article: 'room-reflections-eq-your-vocal-recording',
    },
    {
        id: 'mono-compatibility',
        term: 'Mono compatibility',
        forms: ['mono compatibility', 'mono-compatible', 'mono compatible'],
        definition:
            'How well a mix holds up when left and right are summed into one channel, as on many phone speakers, club systems and smart speakers.',
        article: 'why-mono-reveals-what-stereo-hides',
    },
    {
        id: 'mid-side',
        term: 'Mid/side',
        forms: ['mid/side', 'mid-side'],
        definition:
            'A second way to describe a stereo signal. Mid is what left and right share, side is how they differ. Raising the side widens the image; mid alone is what a mono fold keeps.',
        article: 'mid-side-widening-moves-the-center-too',
    },
    {
        id: 'correlation-meter',
        term: 'Correlation meter',
        forms: ['correlation meter', 'correlation meters', 'phase correlation meter'],
        definition:
            'A meter that shows how alike the left and right channels are, from +1 (identical) through 0 (unrelated) to -1 (one is the other flipped). Readings near -1 warn that the mix will lose level in mono.',
        article: 'what-a-correlation-meter-actually-tells-you',
    },
    {
        id: 'haas',
        term: 'Haas effect',
        forms: ['Haas effect', 'precedence effect'],
        definition:
            'When the same sound reaches you from two places less than about 30 ms apart, you hear one sound, placed toward the one that arrived first. Producers delay one side by a few milliseconds to widen a part, which can turn hollow when summed to mono.',
    },
    {
        id: 'pre-delay',
        term: 'Pre-delay',
        forms: ['pre-delay', 'predelay'],
        definition: 'The gap between the dry sound and the start of its reverb. More pre-delay keeps the source clear and in front.',
        article: 'why-reverb-can-push-emotion-forward-or-backward',
    },
    {
        id: 'early-reflections',
        term: 'Early reflections',
        forms: ['early reflections', 'early reflection'],
        definition:
            'The first echoes from nearby surfaces, arriving in roughly the first 80 ms after the direct sound. They shape clarity and apparent width more than the sense of room size.',
        article: 'early-reflections-place-a-sound-the-tail-sets-the-room',
    },
    {
        id: 'impulse-response',
        term: 'Impulse response',
        forms: ['impulse response', 'impulse responses'],
        definition:
            'A recording of how a room or device answers one very short click. Convolution uses it to place any sound in that space.',
        article: 'what-convolution-reverb-is-doing',
    },
    {
        id: 'convolution',
        term: 'Convolution',
        forms: ['convolution'],
        definition: 'Combining a sound with an impulse response so it takes on the character of that room or device.',
        article: 'what-convolution-reverb-is-doing',
    },
    {
        id: 'group-delay',
        term: 'Group delay',
        forms: ['group delay'],
        definition: 'How long a filter holds back each frequency, in milliseconds. Steep high-pass filters delay the lowest frequencies the most.',
        article: 'filters-are-shape-machines',
    },
    {
        id: 'linear-phase',
        term: 'Linear phase',
        forms: ['linear-phase', 'linear phase'],
        definition:
            'A filter that delays every frequency by the same amount, so the waveform shape is kept. The cost is latency and a little ringing before sharp hits.',
        article: 'filters-are-shape-machines',
    },
    {
        id: 'q',
        term: 'Q',
        forms: ['Q factor', 'quality factor'],
        definition: 'How narrow a filter band or resonance is: centre frequency divided by bandwidth. Higher Q is narrower and rings longer.',
        article: 'why-resonance-can-sing-or-destroy-a-mix',
    },
    {
        id: 'room-mode',
        term: 'Room mode',
        forms: ['room modes', 'room mode', 'standing waves', 'standing wave'],
        definition:
            'A low frequency that fits a whole number of half-wavelengths between two walls, so it piles up in some spots and nearly vanishes in others. The first axial mode is about 343 / (2 × length) Hz.',
        article: 'why-your-low-end-lies-in-a-small-room',
    },
    {
        id: 'window-function',
        term: 'Window function',
        forms: ['window function', 'window functions', 'spectral leakage'],
        definition:
            'A taper applied to each block of audio before an FFT, so the block edges do not smear energy into neighbouring frequencies. That smear is called spectral leakage.',
        article: 'fft-for-producers-how-to-read-spectrum-analyzer',
    },
    {
        id: 'latency',
        term: 'Latency',
        forms: ['latency'],
        definition: 'The delay between doing something, like pressing a key, and hearing the result.',
        article: 'why-latency-changes-performance-feel',
    },
    {
        id: 'buffer-size',
        term: 'Buffer size',
        forms: ['buffer size', 'buffer sizes'],
        definition:
            'How many samples the audio interface handles in one go. Smaller buffers mean less latency and more work for the computer.',
        article: 'why-latency-changes-performance-feel',
    },

    // Digital audio
    {
        id: 'sample-rate',
        term: 'Sample rate',
        forms: ['sample rate', 'sample rates', 'sampling rate'],
        definition: 'How many times per second a digital system measures the waveform. 48 kHz means 48,000 measurements a second.',
        article: 'sampling-is-taking-photos-of-air',
    },
    {
        id: 'nyquist',
        term: 'Nyquist frequency',
        forms: ['Nyquist frequency', 'Nyquist limit', 'Nyquist'],
        caseSensitive: true,
        definition: 'Half the sample rate. It is the highest frequency that sample rate can store correctly.',
        article: 'why-aliasing-is-a-ghost-frequency-problem',
    },
    {
        id: 'aliasing',
        term: 'Aliasing',
        forms: ['aliasing'],
        definition:
            'A frequency above the Nyquist limit being stored as a false, lower frequency that was never in the source. Once it is recorded, it cannot be filtered back out.',
        article: 'why-aliasing-is-a-ghost-frequency-problem',
    },
    {
        id: 'oversampling',
        term: 'Oversampling',
        forms: ['oversampling'],
        definition:
            'Running a process at a multiple of the session sample rate, then filtering and converting back. It gives distortion and clipping room to create high harmonics without folding them back as aliasing.',
    },
    {
        id: 'bit-depth',
        term: 'Bit depth',
        forms: ['bit depth', 'bit-depth'],
        definition:
            'How many bits store each sample. Each bit adds about 6 dB between full scale and the quantisation noise floor: about 96 dB at 16-bit, about 144 dB at 24-bit.',
        article: 'bit-depth-is-about-noise-not-magic-warmth',
    },
    {
        id: 'dither',
        term: 'Dither',
        forms: ['dither', 'dithering'],
        definition:
            'Very low-level noise added before reducing bit depth. It turns quantisation error, which can sound like gritty distortion on quiet sounds, into a steady, smooth hiss.',
        article: 'bit-depth-is-about-noise-not-magic-warmth',
    },
    {
        id: 'floating-point',
        term: '32-bit float',
        forms: ['32-bit float', 'floating point', 'floating-point'],
        definition:
            'A sample format that stores a scale factor with every value, so levels above 0 dBFS inside the DAW are kept instead of clipped. The clip happens only when you export to a fixed format.',
        article: 'architecture-of-infinite-headroom-32-bit-float',
    },

    // Rhythm and arrangement
    {
        id: 'bpm',
        term: 'BPM',
        forms: ['BPM'],
        caseSensitive: true,
        definition: 'Beats per minute: the tempo of a track.',
    },
    {
        id: 'swing',
        term: 'Swing',
        forms: ['swing'],
        definition:
            'Delaying every second subdivision so the rhythm moves long-short instead of evenly. In most DAWs 50% is straight and about 66% is a triplet feel.',
        article: 'swing-explained-without-mystical-language',
        only: RHYTHM,
    },
    {
        id: 'microtiming',
        term: 'Microtiming',
        forms: ['microtiming', 'micro-timing'],
        definition: 'Small timing offsets, from a few to a few tens of milliseconds, that place notes ahead of or behind the grid.',
        article: 'why-tiny-timing-differences-create-human-feel',
    },
    {
        id: 'syncopation',
        term: 'Syncopation',
        forms: ['syncopation'],
        definition: 'Accenting a weak beat or the space between beats, so the rhythm pulls against the pulse.',
        article: 'why-syncopation-wakes-up-the-listener',
    },
    {
        id: 'ghost-note',
        term: 'Ghost note',
        forms: ['ghost notes', 'ghost note'],
        definition: 'A very quiet hit, often on snare or hi-hat, felt more than heard. It fills the groove between the main hits.',
    },
    {
        id: 'downbeat',
        term: 'Downbeat',
        forms: ['downbeat', 'downbeats'],
        definition: 'The first beat of a bar.',
    },
    {
        id: 'pre-chorus',
        term: 'Pre-chorus',
        forms: ['pre-chorus', 'pre-choruses'],
        definition: 'The section that lifts the verse into the chorus. Its job is to build pressure the chorus can release.',
        article: 'why-pre-choruses-are-pressure-cookers',
    },
    {
        id: 'quantize',
        term: 'Quantize',
        forms: ['quantize', 'quantizing', 'quantized'],
        definition: 'Snapping recorded notes to the nearest grid position. Partial quantize moves them only part of the way.',
        only: RHYTHM,
    },

    // Harmony and melody
    {
        id: 'tonic',
        term: 'Tonic',
        forms: ['tonic'],
        definition: 'The home note of a key, and the chord built on it. A phrase that ends on it sounds finished.',
        only: MUSIC,
    },
    {
        id: 'scale-degree',
        term: 'Scale degree',
        forms: ['scale degrees', 'scale degree'],
        definition: 'A note\u2019s position in the key, counted from the tonic: in C major, C is 1, D is 2 and G is 5.',
    },
    {
        id: 'cadence',
        term: 'Cadence',
        forms: ['half cadence', 'cadences', 'cadence'],
        definition:
            'The chord move that ends a phrase. Ending on the tonic, as in V to I, sounds closed. Stopping on the dominant, a half cadence, sounds like a question.',
        only: MUSIC,
    },
    {
        id: 'deceptive-cadence',
        term: 'Deceptive cadence',
        forms: ['deceptive cadence'],
        definition: 'A phrase that sets up a return to the tonic and lands somewhere else instead, most often V to vi.',
    },
    {
        id: 'inversion',
        term: 'Inversion',
        forms: ['inversions', 'inversion'],
        definition: 'A chord with a note other than its root in the bass, such as C major with E at the bottom, written C/E.',
        only: ['songwriting', 'genre-guides', 'production-tips'],
    },
    {
        id: 'voice-leading',
        term: 'Voice leading',
        forms: ['voice leading', 'voice-leading'],
        definition: 'How each note of one chord moves to the next. Small steps and shared notes make chord changes sound smooth.',
    },
    {
        id: 'guide-tones',
        term: 'Guide tones',
        forms: ['guide tones', 'guide tone'],
        definition: 'The third and seventh of a chord, the notes that define its quality. Moving them by small steps carries a progression.',
    },
    {
        id: 'relative-key',
        term: 'Relative key',
        forms: ['relative minor', 'relative major', 'relative key', 'relative keys'],
        definition: 'A major key and a minor key that share the same notes, such as C major and A minor.',
    },
    {
        id: 'prosody',
        term: 'Prosody',
        forms: ['prosody'],
        definition: 'The rhythm, stress and pitch of speech. In a song, good prosody puts musical stress where the words are naturally stressed.',
    },
    {
        id: 'p-centre',
        term: 'P-centre',
        forms: ['perceptual centre', 'perceptual center', 'P-centre', 'P-center'],
        definition: 'The moment a syllable or sound is heard to land. For a sung syllable it sits near the start of the vowel, not at its first consonant.',
    },
    {
        id: 'call-and-response',
        term: 'Call and response',
        forms: ['call and response', 'call-and-response'],
        definition: 'One part plays or sings a phrase and another answers it, like a vocal line followed by a guitar fill.',
    },
    {
        id: 'backbeat',
        term: 'Backbeat',
        forms: ['backbeat', 'backbeats'],
        definition: 'The snare or clap on beats 2 and 4 of a bar in 4/4, the accent most pop, rock and hip-hop grooves are built on.',
    },
    {
        id: 'track-delay',
        term: 'Track delay',
        forms: ['track delay'],
        definition: 'A per-track setting that plays a whole track a few milliseconds early or late without moving its notes on the grid.',
    },
    {
        id: 'half-time',
        term: 'Half-time',
        forms: ['half-time', 'half time'],
        definition: 'A feel where the snare lands once per bar, on beat 3, so a fast tempo feels half as fast. Trap at 140 BPM is usually felt at 70.',
        only: RHYTHM,
    },
    {
        id: 'varispeed',
        term: 'Varispeed',
        forms: ['varispeed', 'vari-speed'],
        definition: 'Changing playback speed so tempo and pitch move together, like tape running faster or slower. About 6% faster is one semitone higher.',
    },

    // Sound design
    {
        id: 'adsr',
        term: 'ADSR',
        forms: ['ADSR'],
        caseSensitive: true,
        definition: 'Attack, decay, sustain, release: the four stages most synth envelopes use to shape a note over time.',
        article: 'why-attack-time-changes-emotional-intent',
    },
    {
        id: 'oscillator',
        term: 'Oscillator',
        forms: ['oscillator', 'oscillators'],
        definition: 'The part of a synth that generates the raw waveform, such as a sine, saw or square.',
    },
    {
        id: 'detune',
        term: 'Detune',
        forms: ['detune', 'detuning', 'detuned'],
        definition: 'Setting copies of an oscillator slightly off pitch from each other so they drift against each other and sound wider.',
    },

    // Vocals
    {
        id: 'proximity-effect',
        term: 'Proximity effect',
        forms: ['proximity effect'],
        definition: 'The bass boost a directional microphone adds as the source moves closer to it.',
        article: 'why-proximity-effect-is-friend-and-trap',
    },
    {
        id: 'comping',
        term: 'Comping',
        forms: ['comping'],
        definition: 'Building one final take from the best parts of several recorded takes.',
        article: 'the-vocal-comp-mistake-that-kills-humanity',
    },
    {
        id: 'double-tracking',
        term: 'Double-tracking',
        forms: ['double-tracking', 'double tracking', 'vocal doubling'],
        definition: 'Recording the same part twice and playing both. Small differences in timing and pitch make it sound thicker.',
        article: 'why-doubling-works-when-listeners-do-not-notice',
        only: ['vocal-production', 'mixing-mastering', 'production-tips'],
    },
    {
        id: 'sibilance',
        term: 'Sibilance',
        forms: ['sibilance', 'sibilants'],
        definition: 'The hiss of s, sh and similar sounds in a vocal, usually strongest somewhere between about 5 and 10 kHz.',
    },
    {
        id: 'de-esser',
        term: 'De-esser',
        forms: ['de-esser', 'de-essing', 'de-essers'],
        definition: 'A compressor that only reacts to sibilant frequencies, so harsh s sounds come down while the rest of the vocal stays put.',
    },
    {
        id: 'formant',
        term: 'Formant',
        forms: ['formants', 'formant'],
        definition:
            'Resonant peaks shaped by the throat and mouth that make a voice sound like itself. Shifting them changes how large the voice seems.',
    },

    // Mixing practice and psychology
    {
        id: 'reference-track',
        term: 'Reference track',
        forms: ['reference tracks', 'reference track'],
        definition: 'A finished record you compare your mix against to check balance, tone and loudness on the same speakers.',
        article: 'why-reference-tracks-are-calibration-not-imitation',
    },
    {
        id: 'ear-fatigue',
        term: 'Ear fatigue',
        forms: ['ear fatigue', 'listening fatigue', 'auditory fatigue'],
        definition: 'Hearing that has adapted after a long or loud session, so judgments about level and brightness drift.',
        article: 'why-fresh-ears-are-a-real-production-tool',
    },
    {
        id: 'equal-loudness-contours',
        term: 'Equal-loudness contours',
        forms: ['equal-loudness contours', 'equal-loudness contour', 'equal loudness contours', 'Fletcher-Munson'],
        definition:
            'Curves showing the level each frequency needs to sound as loud as a 1 kHz tone (ISO 226). They are steepest in the bass at low levels, so quiet monitoring hides low end.',
        article: 'monitoring-level-changes-the-balance-you-hear',
    },
    {
        id: 'auditory-scene-analysis',
        term: 'Auditory scene analysis',
        forms: ['auditory scene analysis', 'Auditory Scene Analysis'],
        definition: 'How the brain sorts a mixture of sound into separate sources, such as a voice, a kick and a pad.',
    },
    {
        id: 'habituation',
        term: 'Habituation',
        forms: ['habituation'],
        definition: 'The brain responding less and less to a sound that repeats without change.',
        article: 'why-sonic-contrast-resets-fatigue',
    },
    {
        id: 'forward-masking',
        term: 'Forward masking',
        forms: ['forward masking'],
        definition:
            'A loud sound making a quieter sound that follows it harder to hear for a short time afterwards, up to roughly a couple of hundred milliseconds.',
    },
    {
        id: 'prediction-error',
        term: 'Prediction error',
        forms: ['prediction error', 'prediction errors'],
        definition:
            'The gap between what the brain expected to hear and what arrived. Small surprises that make sense in hindsight tend to feel rewarding.',
        article: 'why-expectation-drives-musical-emotion',
    },
    {
        id: 'mere-exposure',
        term: 'Mere exposure effect',
        forms: ['mere exposure effect', 'mere-exposure effect', 'mere exposure'],
        definition: 'People tend to like something more the more often they have encountered it, even without noticing. It is one reason a demo you have looped for weeks can sound right when it is not.',
    },
    {
        id: 'attention-residue',
        term: 'Attention residue',
        forms: ['attention residue'],
        definition: 'Thoughts about a previous task that linger after you switch, so part of your attention is still elsewhere.',
    },
    {
        id: 'stems',
        term: 'Stems',
        forms: ['stems'],
        definition: 'Grouped exports of a song, such as drums, bass, music and vocals, used for mixing, mastering, remixing or licensing.',
    },

    // Licensing
    {
        id: 'non-exclusive',
        term: 'Non-exclusive license',
        forms: ['non-exclusive license', 'non-exclusive licence', 'non-exclusive'],
        definition:
            'Permission to use a beat or track within set limits, while the producer keeps ownership and can license the same work to other people.',
        only: ['licensing-guide', 'production-tips', 'genre-guides'],
    },
    {
        id: 'exclusive',
        term: 'Exclusive license',
        forms: ['exclusive license', 'exclusive licence', 'exclusive rights'],
        definition:
            'A license that stops the producer from licensing the same work to anyone else from then on. What it covers, including earlier licenses, depends on the contract.',
        only: ['licensing-guide', 'production-tips', 'genre-guides'],
    },
];

const byId = new Map(glossary.map((entry) => [entry.id, entry]));

export function getGlossaryEntry(id: string) {
    return byId.get(id);
}

/** Entries that may be linked inside an article of this category. */
export function glossaryFor(category: Category): GlossaryEntry[] {
    return glossary.filter((entry) => !entry.only || entry.only.includes(category));
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const patterns = new Map<string, RegExp>();
function patternFor(entry: GlossaryEntry): RegExp {
    let re = patterns.get(entry.id);
    if (!re) {
        const forms = [...entry.forms].sort((a, b) => b.length - a.length).map(escapeRegExp).join('|');
        re = new RegExp(`(?<![\\w-])(?:${forms})(?![\\w-])`, entry.caseSensitive ? '' : 'i');
        patterns.set(entry.id, re);
    }
    return re;
}

/** Glossary entries that occur in a text, for the lesson search index. */
export function termsIn(text: string, category: Category): GlossaryEntry[] {
    return glossaryFor(category).filter((entry) => patternFor(entry).test(text));
}

/**
 * Replaces the first match of each pending term in a run of plain text.
 * `wrap` is called once per term and must remove it from `pending`.
 */
export function findTerms(
    text: string,
    pending: Map<string, GlossaryEntry>,
    wrap: (entry: GlossaryEntry, match: string) => string,
): string {
    let out = '';
    let rest = text;
    for (;;) {
        let best: { entry: GlossaryEntry; index: number; match: string } | null = null;
        for (const entry of pending.values()) {
            const m = patternFor(entry).exec(rest);
            if (m && (!best || m.index < best.index || (m.index === best.index && m[0].length > best.match.length))) {
                best = { entry, index: m.index, match: m[0] };
            }
        }
        if (!best) return out + rest;
        out += rest.slice(0, best.index) + wrap(best.entry, best.match);
        rest = rest.slice(best.index + best.match.length);
    }
}
