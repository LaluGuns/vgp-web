import { BlogArticle } from '../blog-data';

export const post082: BlogArticle = {
    slug: 'the-brain-cost-of-too-many-plugin-choices',
    title: 'When too many plugin choices stall a mix',
    excerpt: 'Choice overload only shows up under some conditions, and a plugin menu with no clear goal is one of them. Name the job first, then pick from a short list.',
    category: 'producer-psychology',
    publishedAt: '2026-06-11',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'In one famous study a big jam display drew more shoppers but far fewer buyers, yet across 50 experiments the average effect of more choice was close to zero.',
        'Overload shows up most when you do not know what you want, so name the job before you open the plugin menu.',
        'Mix with a short list of tools you know, and test any urge to swap at matched level.',
    ],
    figures: {
        jam: {
            type: 'bars',
            caption:
                'The 2000 jam study. The display with 24 jams drew more shoppers, but far fewer of those who stopped went on to buy. "Then bought" is the share of the people who stopped. It is one striking result, not the average one.',
            alt: 'Four bars. 60 percent of passers-by stopped at 24 jams and 40 percent at 6 jams. Of those who stopped, 3 percent bought at 24 jams and 30 percent at 6 jams.',
            min: 0,
            max: 100,
            unit: '%',
            bars: [
                { label: 'Stopped: 24 jams', value: 60, display: '60%', dim: true },
                { label: 'Stopped: 6 jams', value: 40, display: '40%', dim: true },
                { label: 'Then bought: 24 jams', value: 3, display: '3%' },
                { label: 'Then bought: 6 jams', value: 30, display: '30%' },
            ],
        },
        decide: {
            type: 'flow',
            caption:
                'Choice overload shows up most when your preference is unclear. Naming the job first turns a menu of hundreds into a short list of one or two, and the matched check settles the choice.',
            alt: 'Four steps in a row: name the job, pick a tool from your short list, set it and compare with bypass at matched loudness, then keep or undo and move to the next job.',
            steps: [
                { label: 'Name the job', focus: true, note: 'Cut the boxiness on the vocal' },
                { label: 'Pick from your short list', note: 'One EQ you know well' },
                { label: 'Set it, match level', note: 'Compare with bypass at equal loudness' },
                { label: 'Keep or undo', note: 'Then on to the next job' },
            ],
        },
    },
    quiz: [
        {
            q: 'A meta-analysis of 50 experiments found the average choice-overload effect was close to zero. What does that mean for the jam study?',
            options: [
                'Its result was a statistical fluke that later work explained away',
                'It found one setting where more choice hurt, not a general rule',
                'It shows that more choice tends to help buyers on average',
                'It shows the average effect, since it was the largest study',
            ],
            answer: 1,
            why: 'The studies varied widely, with large effects in both directions. Overload is real under some conditions and absent under others, which is why the conditions matter more than the headline.',
        },
        {
            q: 'When is a huge plugin menu most likely to stall you?',
            options: [
                'When you have no clear idea yet of what the sound needs',
                'When you already know exactly what the sound needs',
                'When most of the plugins in it are free stock versions',
                'When the menu is sorted by developer rather than by type',
            ],
            answer: 0,
            why: 'Chernev and colleagues found that preference uncertainty is one of the conditions that reliably produces overload. With a clear target, a large set hurts much less.',
        },
        {
            q: 'You swap four compressor emulations at their default settings and keep the one that sounds best. What are you mostly comparing?',
            options: [
                'How faithfully each one models the original hardware',
                'The character each one adds once it is set up properly',
                'Their default output levels, not what the track needs',
                'How cleanly each one handles oversampling and aliasing',
            ],
            answer: 2,
            why: 'Defaults differ in level and in how hard they work, and the louder one tends to win. Name the job, set one compressor to do it and judge at matched level.',
        },
    ],
    content: `## Hook: forty minutes in the plugin menu

You open the plugin menu on the lead vocal. Seventy-five equalizers and compressors scroll past: emulations from five developers, four models of classic British consoles and a stack of surgical digital tools. You spend the next forty minutes loading, bypassing and swapping four compressor emulations. By the time you choose one, your ears are tired and you have forgotten what the vocal was supposed to feel like.

That is plugin choice overload. When there is always another tool to try, every processing move feels temporary, and the time goes into testing interfaces instead of listening to the song.

## Why it matters: shopping instead of listening

Each swap resets the comparison. A new plugin arrives with its own default level and curve, so a quick A/B at default settings mostly compares defaults. The louder one tends to win, and none of it tells you what the vocal needed.

Swapping also keeps the decision open. With twenty EQs installed, there is always a twenty-first that might have been smoother, so no choice feels final and the mix stays unfinished. The listener never sees which plugin you used. They hear the balance and the tone you ended up with.

::figure jam

## Science model: choice overload is real, but conditional

The famous evidence comes from a supermarket. Iyengar and Lepper (2000) set up a tasting booth with either 24 or 6 jams. The big display drew more people: 60 percent of passers-by stopped, against 40 percent for the small one. But of the people who stopped, about 3 percent bought a jar after seeing 24 jams, against about 30 percent after seeing 6. In a second study, people who picked a chocolate from 30 options were less satisfied with it than people who picked from 6.

That result became a slogan, and the slogan went further than the data. Scheibehenne, Greifeneder and Todd (2010) pooled 50 experiments with 5,036 participants and found a mean effect of more choice close to zero, with large differences between studies. More options even helped when people had clear preferences before they chose.

A second meta-analysis explains the split. Chernev, Böckenholt and Goodman (2015) analysed 99 observations from earlier studies and found four conditions that reliably make a large set harmful: a complex set of options, a difficult decision, uncertain preferences and a goal of minimizing effort.

A full plugin menu on a vocal you have not diagnosed hits most of those at once. The set is complex, the options differ in small ways that are hard to hear, and "make the vocal better" is an uncertain preference. You cannot easily shrink the market, but you can remove the uncertainty: decide what the sound needs before you choose the tool.

::figure decide

## DAW experiment: one EQ, one compressor, one hour

1. Save a copy of your session as "Short list".
2. Pick one EQ, one compressor and one saturator you already know well. Stock plugins are fine. Put only these in a favourites folder and use nothing else in this session.
3. Before each insert, write the job in one line, for example "cut the boxiness around 400 Hz on the vocal" or "hold the bass within 3 dB".
4. Start a 60-minute timer and mix.
5. When you feel the urge to try a different plugin, write its name and what you expect it to do on a notepad, and keep going with the short list.
6. When the timer ends, bounce. Compare it with your last bounce made with the full plugin folder, the same section at matched loudness.
7. Pick one note from step 5. Load that plugin, set it to do the same job, match its output level and compare it blind against your short-list version.

Listen for whether the short-list mix is any worse. Often it is not, and it took a fraction of the time. Step 7 shows how many of your plugin urges survive a fair test.

## Common mistake: buying character before balance

Loading console and tape emulations on every channel before the levels are set is the classic version of this trap. Their effect is usually a little harmonic colour and a level change, and the level change alone is enough to make them sound better in a quick A/B. If the balance is off, no emulation will fix it.

The other mistake is reaching for a new plugin to solve a problem you have not named. A new tool feels like progress, but a vague problem stays vague in any interface.

## Producer takeaway: decide what you want, then choose the tool

Keep a short list for each job: one or two EQs, one or two compressors, one saturator. Review the list between projects, not in the middle of a mix. When you know exactly what a sound needs, a big menu does little harm. When you do not, a small menu is what keeps you moving. In both cases, name the job first and check the result at matched level.

## References

- Chernev, A., Böckenholt, U., & Goodman, J. (2015). Choice overload: A conceptual review and meta-analysis. *Journal of Consumer Psychology*, 25(2), 333-358.
- Iyengar, S. S., & Lepper, M. R. (2000). When choice is demotivating: Can one desire too much of a good thing? *Journal of Personality and Social Psychology*, 79(6), 995-1006.
- Scheibehenne, B., Greifeneder, R., & Todd, P. M. (2010). Can there ever be too many options? A meta-analytic review of choice overload. *Journal of Consumer Research*, 37(3), 409-425.
`,
    seo: {
        title: 'When too many plugin choices stall a mix | VGP Studio',
        description: 'What choice-overload research shows, from the jam study to two meta-analyses, and how a short plugin list and a named goal speed up your mixes.',
        keywords: ['choice overload', 'plugin choices', 'mixing workflow', 'stock plugins', 'paradox of choice', 'decision making'],
    },
};
