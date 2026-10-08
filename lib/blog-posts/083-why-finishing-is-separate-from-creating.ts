import { BlogArticle } from '../blog-data';

export const post083: BlogArticle = {
    slug: 'why-finishing-is-separate-from-creating',
    title: 'Why finishing needs its own session',
    excerpt: 'Writing asks you to accept rough sounds. Finishing asks you to judge them. Try to do both in the same minute and the song stays a four-bar loop.',
    category: 'producer-psychology',
    publishedAt: '2026-06-11',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Creative work cycles between making rough material and judging it, and every switch between the two costs time and accuracy.',
        'In a writing session, judge only keep or replace. In a finishing session, write nothing new.',
        'Finish in passes: listen once, write three fixes, make only those and bounce.',
    ],
    figures: {
        stall: {
            type: 'flow',
            caption: 'How a song stays at four bars. Every stop to fix a sound costs the next idea, so the loop gets more polished and never gets longer.',
            alt: 'Four steps with an arrow from the last back to the first: write four bars, hear a flaw and stop to fix it, lose the next idea, loop the same four bars again.',
            steps: [
                { label: 'Write four bars' },
                { label: 'Hear a flaw, stop to fix it', note: 'Sweep an EQ on the kick' },
                { label: 'Lose the next idea', note: 'The verse melody is gone' },
                { label: 'Loop the same four bars' },
            ],
            loop: { to: 0, label: 'Next night' },
        },
        cycle: {
            type: 'flow',
            caption:
                'Creative work alternates between generating rough material and exploring what it could become (Finke, Ward and Smith, 1992). It goes wrong when you judge every sound in the middle of making it.',
            alt: 'Three steps with an arrow from the last back to the first: generate rough parts, explore what they are and what they need, decide to keep, cut or change, then generate again.',
            steps: [
                { label: 'Generate rough parts' },
                { label: 'Explore', note: 'What is this? What does it need?' },
                { label: 'Decide: keep, cut or change' },
            ],
            loop: { to: 0, label: 'Next idea' },
        },
    },
    quiz: [
        {
            q: 'Why does stopping mid-idea to EQ the kick hurt the writing?',
            options: [
                'A heavy EQ eats CPU, so the session lags while you write',
                'Willpower drains with each EQ choice, leaving none for the verse',
                'EQ moves made on a soloed kick rarely hold up in the full mix',
                'Each switch costs time and accuracy, and the idea slips away',
            ],
            answer: 3,
            why: 'Responses are slower and more error-prone right after a task switch. In a writing session, the thing you lose is the next idea, which existed only in your head.',
        },
        {
            q: 'During the three-fix pass you notice a fourth problem. What do you do?',
            options: [
                'Fix it now while you still remember it',
                'Write it on the list for the next pass',
                'Swap it in for the smallest of the three',
                'Add a new layer that covers the problem',
            ],
            answer: 1,
            why: 'The limit is what turns the pass into a finished bounce. The fourth problem goes on the next list, where it competes with everything else for a place.',
        },
        {
            q: 'Which session plan fits the way creative work cycles?',
            options: [
                'Write rough parts, then judge them in a separate pass',
                'Judge each sound the moment you make it, then move on',
                'Mix the first eight bars fully before writing more',
                'Hold off all judgment until the master is finished',
            ],
            answer: 0,
            why: 'Generating and judging both matter. Batching them keeps each one from interrupting the other.',
        },
    ],
    content: `## Hook: the four-bar loop that never grows

You are writing a new track. There is a good four-bar chord progression on a pad and a basic drum loop. Instead of writing the verse melody, you stop. You open an EQ, solo the kick and spend twenty minutes sweeping a narrow band to find the mud. Then you put a delay on the pad, tweak the feedback and go looking for a vocal sample. Two hours later you are still listening to the same four bars, the spark is gone and the project joins the folder of unfinished beats.

The problem is that you were doing two jobs at once. Making new material and finishing it ask for different things from you, and doing both in the same minute keeps a song stuck in the loop.

## Why it matters: two jobs that pull against each other

Generating ideas works best when you accept rough sounds so you can keep moving. Placeholder drums and a preset pad are fine, because the question is whether the part is worth having. Finishing asks the opposite: a critical ear that makes hard calls about balance, structure and detail.

When you mix both, each interrupts the other. You polish eight bars that may not survive the arrangement, and you lose the ideas that would have told you what the arrangement is. A finished song is a trail of decisions made in order: what the parts are, then where they go, then how they sound.

::figure stall

## Science model: generate, explore, and pay for every switch

Creativity researchers describe the same two jobs. In the Geneplore model, Finke, Ward and Smith (1992) split creative thinking into a generative phase, which produces rough, half-formed structures, and an exploratory phase, which examines them and works out what they could become. The phases alternate, and both are needed.

Brain imaging points the same way. Ellamil and colleagues (2012) scanned art students while they designed book covers, alternating between generating ideas and evaluating them. Generating leaned on regions in the medial temporal lobe, which support memory retrieval. Evaluating recruited executive and default network regions together. The two modes use the brain differently, so moving between them is a real change of gear.

Changing gear has a price. In task-switching experiments, people are slower and make more errors right after a switch, and preparing in advance reduces that cost without removing it (Monsell, 2003). In a lab the cost is measured on simple tasks. In a writing session it shows up as the verse melody you were about to find before you opened the EQ.

The practical answer is to batch the modes. Write in one pass, where the only judgment is keep or replace. Finish in another, where new parts are off the table.

::figure cycle

## DAW experiment: the three-fix pass

Use a project that already runs from intro to outro but feels unfinished.

1. Play the song once from start to end with your hands off the mouse. Do not stop to change anything.
2. Write exactly three fixes on paper, each one specific enough to check: "lead vocal up 1 to 2 dB in chorus 2", "shorten the snare decay", "high-pass the pad at 150 Hz".
3. Make only those three fixes. No new tracks, no new sounds and no new effects.
4. Write any other problem you notice on the next page of the notepad and leave it alone.
5. Bounce the song as soon as the third fix is done, with the date in the file name.
6. At the start of the next session, repeat from step 1 with a new list of three.

Each pass ends with a complete, better bounce. Over a few passes the fixes on your list get smaller. When the three fixes are changes you can no longer pick in a blind, level-matched comparison, the song is finished.

## Common mistake: mixing while writing

The most common version of this trap is loading compressors and EQs on every channel while you are still looking for the bass line. Every processed sound feels like a commitment, and you start defending parts because of the time you spent on them.

Placeholder sounds and a closed mixer are the fastest way to get the skeleton of a song down. Shape a sound during writing only when the sound itself is the idea, such as a bass patch the whole song is built around.

## Producer takeaway: define the finish line before you open the session

Before you open a project, decide which kind of session it is and write it in the project notes. In a writing session, keep going even when a sound is rough. In a finishing session, do not write new parts. Decide in advance what finished means for this song, for example "three fixes in a row that I cannot hear blind", and stop when you get there.

## References

- Ellamil, M., Dobson, C., Beeman, M., & Christoff, K. (2012). Evaluative and generative modes of thought during the creative process. *NeuroImage*, 59, 1783-1794.
- Finke, R. A., Ward, T. B., & Smith, S. M. (1992). *Creative Cognition: Theory, Research, and Applications*. MIT Press.
- Monsell, S. (2003). Task switching. *Trends in Cognitive Sciences*, 7(3), 134-140.
`,
    seo: {
        title: 'Why finishing needs its own session | VGP Studio',
        description: 'Why switching between writing and mixing stalls songs, what research on creative cognition and task switching shows, and a three-fix pass to finish tracks.',
        keywords: ['finishing music', 'task switching', 'creative workflow', 'music production psychology', 'arrangement workflow'],
    },
};
