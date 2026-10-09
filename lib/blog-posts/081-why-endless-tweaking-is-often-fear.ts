import { BlogArticle } from '../blog-data';

export const post081: BlogArticle = {
    slug: 'why-endless-tweaking-is-often-fear',
    title: 'Endless tweaking is often fear of committing',
    excerpt: 'Moving a fader 0.2 dB back and forth for an hour is usually a decision you are avoiding, and a blind, level-matched test ends the loop.',
    category: 'producer-psychology',
    publishedAt: '2026-06-11',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Tiny changes judged by flicking bypass rarely settle anything, because the louder side tends to win.',
        'Ego depletion, the idea that every choice drains a willpower battery, came out near zero in two large preregistered replications.',
        'Give each change a blind, level-matched test and keep it only if it wins every round.',
    ],
    figures: {
        loop: {
            type: 'flow',
            caption: 'The tweak loop. No step in it asks whether the change can be heard at matched level, so nothing in it can end the loop.',
            alt: 'Four steps with an arrow from the last back to the first: hear a doubt, nudge a setting, flick bypass without matching level, get no clear answer, then doubt again.',
            steps: [
                { label: 'Hear a doubt about the vocal' },
                { label: 'Nudge a setting', note: 'A fraction of a dB, a hair of threshold' },
                { label: 'Flick bypass', focus: true, note: 'No level match, no blind test' },
                { label: 'No clear answer, or louder wins' },
            ],
            loop: { to: 0, label: 'Again' },
        },
        depletion: {
            type: 'bars',
            caption:
                'Effect sizes from the two largest preregistered tests of ego depletion. Both landed far below d = 0.30, the effect the 2021 team expected, and the 2021 result was not significant.',
            alt: 'Three horizontal bars of Cohen\'s d. The effect the 2021 team expected is 0.30. The 2016 result across 23 labs is 0.04 and the 2021 result across 36 labs is 0.06.',
            min: 0,
            max: 0.35,
            bars: [
                { label: 'Expected, 2021 test', value: 0.3, display: 'd = 0.30', dim: true },
                { label: 'Found, 2016 (23 labs)', value: 0.04, display: 'd = 0.04' },
                { label: 'Found, 2021 (36 labs)', value: 0.06, display: 'd = 0.06' },
            ],
        },
    },
    quiz: [
        {
            q: 'Your tweak won three of five blind, level-matched rounds. What should you do?',
            options: [
                'Delete it, keep the earlier mix and move on',
                'Keep it, since it won more often than not',
                'Run more rounds with the tweak turned up a bit',
                'Add a second tweak so the gap is easier to hear',
            ],
            answer: 0,
            why: 'Guessing alone gives either version three or more wins half the time. A change you cannot pick reliably at matched level is not doing anything you can hear.',
        },
        {
            q: 'Six hours into a mix you are still nudging one fader, and you put it down to decision fatigue. Which reading fits the large preregistered replications?',
            options: [
                'Each choice drains a limited supply, so you have simply run out',
                'The drain is real but slow, so it only matters after midnight',
                'Depletion came out near zero, so put the change to a blind test',
                'Depletion is strongest in creative tasks like mixing and writing',
            ],
            answer: 2,
            why: 'Twenty-three labs found d = 0.04, and thirty-six labs found no evidence in the preregistered test. Tiredness is real, but a drained battery does not explain six hours on one fader, and a blind, level-matched test gives the change a way to pass or fail.',
        },
        {
            q: 'Why does flicking bypass without matching level keep the loop going?',
            options: [
                'The plugin resets its settings each time bypass is pressed',
                'Meters freeze while a plugin is bypassed, so you lose track',
                'Bypass also mutes the track\'s sends, so the reverb jumps',
                'A slightly louder side sounds better, so you reward level',
            ],
            answer: 3,
            why: 'A change that adds a fraction of a decibel tends to win an unmatched A/B. Matching level first is the only way to hear whether the decision itself helped.',
        },
    ],
    content: `## Hook: the 0.2 dB loop

It is 3 a.m. and the session has been open for six hours. You nudge the lead vocal up 0.2 dB, then down 0.3 dB, then back again. You add a compressor, move the threshold a hair, bypass it, turn it back on and delete it. Nothing you do makes the song better or worse, and you keep going anyway.

Those six hours are a way to avoid finishing. While every setting is still moving, nobody can judge the mix, including you. Calling it perfectionism makes it sound like care. Most of the time it is a decision you are afraid to make.

## Why it matters: tweaks you cannot hear still cost you

Small moves on one track inside a busy mix are hard to hear reliably, and the way you check them is rarely fair. Toggle a change on and off and the version that comes out a fraction louder tends to sound fuller and clearer, so the loop keeps rewarding level instead of better choices. The lesson on [loudness bias](/blog/why-louder-is-not-always-bigger) explains why that happens.

Meanwhile the decisions that matter wait. Two hours spent on a buildup in the pad are two hours not spent asking whether the pad should play in the verse at all. Hours on the same eight bars also wear down your sense of balance, which is why the morning listen so often disagrees with the night before (see the [lesson on fresh ears](/blog/why-fresh-ears-are-a-real-production-tool)).

::figure loop

## Science model: fear of the wrong call, not a flat battery

The popular explanation is decision fatigue: willpower runs on a limited daily supply, and every choice drains it. That idea, known in psychology as ego depletion, has not held up well. A preregistered replication across 23 labs and 2,141 participants found an effect close to zero, d = 0.04 (Hagger et al., 2016). A second test across 36 labs and 3,531 participants found no evidence for it in its preregistered analysis (Vohs et al., 2021). Being tired is real, and late-night judgments do drift, but a drained battery does not explain six hours of moving one fader back and forth.

::figure depletion

A better fit is the difference between maximizing and satisficing. Schwartz and colleagues (2002) measured how strongly people search for the best possible option instead of one that is good enough. Across seven samples, stronger maximizers reported more regret and more perfectionism. Those are correlations, so they do not prove cause, but the pattern is familiar from the studio. If every setting is a search for the best one, and you never said what "best" means, the search cannot end.

That is where fear comes in. An open setting cannot be wrong. A committed one can. So the loop pays you back: it postpones the moment a finished mix gets judged. The way out is to give each change a test it can pass or fail.

## DAW experiment: the blind tweak test

Use the tweak you are stuck on right now.

1. Bounce the mix as it is and name the file "A".
2. Make the one change you keep going back and forth on, for example the lead vocal up 0.5 dB, and bounce it as "B".
3. Import both files onto two new tracks, lined up at the same start and routed straight to your outputs with no master bus processing.
4. Measure the integrated loudness of each file with a loudness meter and turn the louder one down until they match within 0.1 LU.
5. Ask someone to switch between the two tracks in a random order while you listen with your eyes closed, or load both files into a blind A/B plugin. Listen to eight bars of each and pick the one you prefer before you look. Write down the winner.
6. Run five rounds. Guessing alone gives the same winner all five times about 6 percent of the time (2 in 32).
7. Keep B only if it won every round. Otherwise delete it, keep A and move on to the biggest problem in the song.

Most tiny tweaks fail this test. The ones that pass are real decisions, and you can commit to them without a second thought.

## Common mistake: mistaking motion for detail

The belief behind the loop is that professional mixes are built from thousands of microscopic moves. Most of what a listener hears is the balance: how loud each part is against the others. Senior (2011) builds a mix from the balance first and treats detailed processing as something you add once the balance works. If the levels are wrong, no amount of compressor fine-tuning saves the song.

The second mistake is judging every change by flicking bypass at whatever level the plugin puts out. Without matching level you are testing loudness, and the louder side usually wins.

## Producer takeaway: make decisions that can fail

Before you touch a control, say what should change and how you would hear it: "the vocal should sit in front of the snare in the chorus." Make the move, check it level-matched and keep it or undo it. Put a timer on mixing sessions so the end is something you chose in advance, not something you negotiate at 3 a.m.

Commitment is cheaper than it feels. Save a new version, print the mix and start the next song. If the mix really needs more work, tomorrow's ears will tell you, and the old version will still be there.

## References

- Hagger, M. S., Chatzisarantis, N. L. D., et al. (2016). A multilab preregistered replication of the ego-depletion effect. *Perspectives on Psychological Science*, 11(4), 546-573.
- Schwartz, B., Ward, A., Monterosso, J., Lyubomirsky, S., White, K., & Lehman, D. R. (2002). Maximizing versus satisficing: Happiness is a matter of choice. *Journal of Personality and Social Psychology*, 83(5), 1178-1197.
- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
- Vohs, K. D., Schmeichel, B. J., et al. (2021). A multisite preregistered paradigmatic test of the ego-depletion effect. *Psychological Science*, 32(10), 1566-1581.
`,
    seo: {
        title: 'Endless tweaking is often fear of committing | VGP Studio',
        description: 'Why producers get stuck in endless mix tweaks, what the ego-depletion research really found, and a blind level-matched test that ends the loop.',
        keywords: ['producer perfectionism', 'endless tweaking', 'decision fatigue', 'blind A/B test', 'level matching', 'mixing workflow'],
    },
};
