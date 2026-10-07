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
    card: 'border-white/10 hover:border-white/25',
    tag: 'text-sky-200/75',
    dot: 'bg-sky-300',
    filter: 'border-white/70 bg-white/[0.06] text-white',
    edge: 'before:bg-white/10',
    world: 'bg-[#0a0e12]',
    surface: 'border-white/10 bg-[#0a0e12]',
    accentHex: '#7dd3fc',
    secondaryHex: '#2dd4bf',
};

const genreThemes: Record<string, GenreTheme> = {
    'Cyberpunk Trap': {
        card: 'border-white/10 hover:border-white/25',
        tag: 'text-violet-200/85',
        dot: 'bg-violet-300',
        filter: 'border-white/70 bg-white/[0.06] text-white',
        edge: 'before:bg-white/10',
        world: 'bg-[#0a0e12]',
        surface: 'border-white/10 bg-[#0a0e12]',
        accentHex: '#c4b5fd',
        secondaryHex: '#67e8f9',
    },
    'Cyberpunk Phonk': {
        card: 'border-white/10 hover:border-white/25',
        tag: 'text-fuchsia-200/85',
        dot: 'bg-fuchsia-300',
        filter: 'border-white/70 bg-white/[0.06] text-white',
        edge: 'before:bg-white/10',
        world: 'bg-[#0a0e12]',
        surface: 'border-white/10 bg-[#0a0e12]',
        accentHex: '#f0abfc',
        secondaryHex: '#fb7185',
    },
    'Synthwave Trap': {
        card: 'border-white/10 hover:border-white/25',
        tag: 'text-pink-200/85',
        dot: 'bg-pink-300',
        filter: 'border-white/70 bg-white/[0.06] text-white',
        edge: 'before:bg-white/10',
        world: 'bg-[#0a0e12]',
        surface: 'border-white/10 bg-[#0a0e12]',
        accentHex: '#f9a8d4',
        secondaryHex: '#c4b5fd',
    },
    House: {
        card: 'border-white/10 hover:border-white/25',
        tag: 'text-cyan-200/85',
        dot: 'bg-cyan-300',
        filter: 'border-white/70 bg-white/[0.06] text-white',
        edge: 'before:bg-white/10',
        world: 'bg-[#0a0e12]',
        surface: 'border-white/10 bg-[#0a0e12]',
        accentHex: '#67e8f9',
        secondaryHex: '#5eead4',
    },
    Drill: {
        card: 'border-white/10 hover:border-white/25',
        tag: 'text-amber-200/85',
        dot: 'bg-amber-300',
        filter: 'border-white/70 bg-white/[0.06] text-white',
        edge: 'before:bg-white/10',
        world: 'bg-[#0a0e12]',
        surface: 'border-white/10 bg-[#0a0e12]',
        accentHex: '#fcd34d',
        secondaryHex: '#fb7185',
    },
    'Lo-fi': {
        card: 'border-white/10 hover:border-white/25',
        tag: 'text-emerald-200/85',
        dot: 'bg-emerald-300',
        filter: 'border-white/70 bg-white/[0.06] text-white',
        edge: 'before:bg-white/10',
        world: 'bg-[#0a0e12]',
        surface: 'border-white/10 bg-[#0a0e12]',
        accentHex: '#6ee7b7',
        secondaryHex: '#bef264',
    },
    'R&B': {
        card: 'border-white/10 hover:border-white/25',
        tag: 'text-rose-200/85',
        dot: 'bg-rose-300',
        filter: 'border-white/70 bg-white/[0.06] text-white',
        edge: 'before:bg-white/10',
        world: 'bg-[#0a0e12]',
        surface: 'border-white/10 bg-[#0a0e12]',
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
