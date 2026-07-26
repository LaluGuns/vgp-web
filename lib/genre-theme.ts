export type GenreTheme = {
    card: string;
    tag: string;
    dot: string;
    filter: string;
    edge: string;
    world: string;
    surface: string;
    accentHex: string;
    secondaryHex: string;
};

const defaultTheme: GenreTheme = {
    card: 'border-sky-200/20 hover:border-sky-200/45 hover:shadow-[0_24px_55px_rgba(14,165,233,0.12)]',
    tag: 'text-sky-200/75',
    dot: 'bg-sky-300',
    filter: 'border-sky-200/60 bg-sky-300/20 text-sky-100',
    edge: 'before:bg-sky-300/65',
    world: 'bg-[radial-gradient(circle_at_18%_12%,rgba(14,165,233,0.2),transparent_28%),radial-gradient(circle_at_86%_72%,rgba(45,212,191,0.09),transparent_34%),linear-gradient(180deg,#06141e,#02080d)]',
    surface: 'border-sky-200/20 bg-sky-300/[0.055]',
    accentHex: '#7dd3fc',
    secondaryHex: '#2dd4bf',
};

const genreThemes: Record<string, GenreTheme> = {
    'Cyberpunk Trap': {
        card: 'border-violet-300/20 hover:border-violet-300/50 hover:shadow-[0_24px_55px_rgba(168,85,247,0.14)]',
        tag: 'text-violet-200/85',
        dot: 'bg-violet-300',
        filter: 'border-violet-300/60 bg-violet-300/15 text-violet-100',
        edge: 'before:bg-violet-300/75',
        world: 'bg-[radial-gradient(circle_at_18%_12%,rgba(139,92,246,0.27),transparent_30%),radial-gradient(circle_at_88%_72%,rgba(34,211,238,0.12),transparent_34%),linear-gradient(180deg,#0d1022,#03070d)]',
        surface: 'border-violet-300/20 bg-violet-300/[0.06]',
        accentHex: '#c4b5fd',
        secondaryHex: '#67e8f9',
    },
    'Cyberpunk Phonk': {
        card: 'border-fuchsia-300/20 hover:border-fuchsia-300/50 hover:shadow-[0_24px_55px_rgba(232,121,249,0.14)]',
        tag: 'text-fuchsia-200/85',
        dot: 'bg-fuchsia-300',
        filter: 'border-fuchsia-300/60 bg-fuchsia-300/15 text-fuchsia-100',
        edge: 'before:bg-fuchsia-300/75',
        world: 'bg-[radial-gradient(circle_at_18%_12%,rgba(217,70,239,0.25),transparent_30%),radial-gradient(circle_at_88%_72%,rgba(239,68,68,0.1),transparent_34%),linear-gradient(180deg,#16091c,#03070d)]',
        surface: 'border-fuchsia-300/20 bg-fuchsia-300/[0.06]',
        accentHex: '#f0abfc',
        secondaryHex: '#fb7185',
    },
    'Synthwave Trap': {
        card: 'border-pink-300/20 hover:border-pink-300/50 hover:shadow-[0_24px_55px_rgba(244,114,182,0.14)]',
        tag: 'text-pink-200/85',
        dot: 'bg-pink-300',
        filter: 'border-pink-300/60 bg-pink-300/15 text-pink-100',
        edge: 'before:bg-pink-300/75',
        world: 'bg-[radial-gradient(circle_at_18%_12%,rgba(236,72,153,0.23),transparent_30%),radial-gradient(circle_at_88%_72%,rgba(139,92,246,0.14),transparent_34%),linear-gradient(180deg,#160c20,#03070d)]',
        surface: 'border-pink-300/20 bg-pink-300/[0.06]',
        accentHex: '#f9a8d4',
        secondaryHex: '#c4b5fd',
    },
    House: {
        card: 'border-cyan-300/20 hover:border-cyan-300/50 hover:shadow-[0_24px_55px_rgba(34,211,238,0.12)]',
        tag: 'text-cyan-200/85',
        dot: 'bg-cyan-300',
        filter: 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100',
        edge: 'before:bg-cyan-300/75',
        world: 'bg-[radial-gradient(circle_at_18%_12%,rgba(6,182,212,0.24),transparent_30%),radial-gradient(circle_at_88%_72%,rgba(45,212,191,0.12),transparent_34%),linear-gradient(180deg,#06191d,#02080d)]',
        surface: 'border-cyan-300/20 bg-cyan-300/[0.06]',
        accentHex: '#67e8f9',
        secondaryHex: '#5eead4',
    },
    Drill: {
        card: 'border-amber-300/20 hover:border-amber-300/50 hover:shadow-[0_24px_55px_rgba(251,191,36,0.12)]',
        tag: 'text-amber-200/85',
        dot: 'bg-amber-300',
        filter: 'border-amber-300/60 bg-amber-300/15 text-amber-100',
        edge: 'before:bg-amber-300/75',
        world: 'bg-[radial-gradient(circle_at_18%_12%,rgba(245,158,11,0.22),transparent_30%),radial-gradient(circle_at_88%_72%,rgba(239,68,68,0.1),transparent_34%),linear-gradient(180deg,#171209,#03070d)]',
        surface: 'border-amber-300/20 bg-amber-300/[0.055]',
        accentHex: '#fcd34d',
        secondaryHex: '#fb7185',
    },
    'Lo-fi': {
        card: 'border-emerald-300/20 hover:border-emerald-300/50 hover:shadow-[0_24px_55px_rgba(52,211,153,0.12)]',
        tag: 'text-emerald-200/85',
        dot: 'bg-emerald-300',
        filter: 'border-emerald-300/60 bg-emerald-300/15 text-emerald-100',
        edge: 'before:bg-emerald-300/75',
        world: 'bg-[radial-gradient(circle_at_18%_12%,rgba(16,185,129,0.2),transparent_30%),radial-gradient(circle_at_88%_72%,rgba(132,204,22,0.09),transparent_34%),linear-gradient(180deg,#071a16,#02080d)]',
        surface: 'border-emerald-300/20 bg-emerald-300/[0.055]',
        accentHex: '#6ee7b7',
        secondaryHex: '#bef264',
    },
    'R&B': {
        card: 'border-rose-300/20 hover:border-rose-300/50 hover:shadow-[0_24px_55px_rgba(251,113,133,0.12)]',
        tag: 'text-rose-200/85',
        dot: 'bg-rose-300',
        filter: 'border-rose-300/60 bg-rose-300/15 text-rose-100',
        edge: 'before:bg-rose-300/75',
        world: 'bg-[radial-gradient(circle_at_18%_12%,rgba(244,63,94,0.2),transparent_30%),radial-gradient(circle_at_88%_72%,rgba(168,85,247,0.1),transparent_34%),linear-gradient(180deg,#180b14,#03070d)]',
        surface: 'border-rose-300/20 bg-rose-300/[0.055]',
        accentHex: '#fda4af',
        secondaryHex: '#d8b4fe',
    },
};

export function getGenreTheme(genre: string): GenreTheme {
    if (genreThemes[genre]) return genreThemes[genre];

    const normalized = genre.toLowerCase();
    if (normalized.includes('phonk')) return genreThemes['Cyberpunk Phonk'];
    if (normalized.includes('synth') || normalized.includes('80s')) return genreThemes['Synthwave Trap'];
    if (normalized.includes('house') || normalized.includes('club') || normalized.includes('electronic')) return genreThemes.House;
    if (normalized.includes('drill') || normalized.includes('grime')) return genreThemes.Drill;
    if (normalized.includes('lo-fi') || normalized.includes('lofi') || normalized.includes('chill')) return genreThemes['Lo-fi'];
    if (normalized.includes('r&b') || normalized.includes('soul')) return genreThemes['R&B'];
    if (normalized.includes('trap') || normalized.includes('hip hop')) return genreThemes['Cyberpunk Trap'];

    return defaultTheme;
}
