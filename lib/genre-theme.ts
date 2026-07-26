export type GenreTheme = {
    card: string;
    tag: string;
    dot: string;
    filter: string;
    edge: string;
};

const defaultTheme: GenreTheme = {
    card: 'border-sky-200/20 hover:border-sky-200/45 hover:shadow-[0_24px_55px_rgba(14,165,233,0.12)]',
    tag: 'text-sky-200/75',
    dot: 'bg-sky-300',
    filter: 'border-sky-200/60 bg-sky-300/20 text-sky-100',
    edge: 'before:bg-sky-300/65',
};

const genreThemes: Record<string, GenreTheme> = {
    'Cyberpunk Trap': {
        card: 'border-violet-300/20 hover:border-violet-300/50 hover:shadow-[0_24px_55px_rgba(168,85,247,0.14)]',
        tag: 'text-violet-200/85',
        dot: 'bg-violet-300',
        filter: 'border-violet-300/60 bg-violet-300/15 text-violet-100',
        edge: 'before:bg-violet-300/75',
    },
    'Cyberpunk Phonk': {
        card: 'border-fuchsia-300/20 hover:border-fuchsia-300/50 hover:shadow-[0_24px_55px_rgba(232,121,249,0.14)]',
        tag: 'text-fuchsia-200/85',
        dot: 'bg-fuchsia-300',
        filter: 'border-fuchsia-300/60 bg-fuchsia-300/15 text-fuchsia-100',
        edge: 'before:bg-fuchsia-300/75',
    },
    'Synthwave Trap': {
        card: 'border-pink-300/20 hover:border-pink-300/50 hover:shadow-[0_24px_55px_rgba(244,114,182,0.14)]',
        tag: 'text-pink-200/85',
        dot: 'bg-pink-300',
        filter: 'border-pink-300/60 bg-pink-300/15 text-pink-100',
        edge: 'before:bg-pink-300/75',
    },
    House: {
        card: 'border-cyan-300/20 hover:border-cyan-300/50 hover:shadow-[0_24px_55px_rgba(34,211,238,0.12)]',
        tag: 'text-cyan-200/85',
        dot: 'bg-cyan-300',
        filter: 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100',
        edge: 'before:bg-cyan-300/75',
    },
    Drill: {
        card: 'border-amber-300/20 hover:border-amber-300/50 hover:shadow-[0_24px_55px_rgba(251,191,36,0.12)]',
        tag: 'text-amber-200/85',
        dot: 'bg-amber-300',
        filter: 'border-amber-300/60 bg-amber-300/15 text-amber-100',
        edge: 'before:bg-amber-300/75',
    },
    'Lo-fi': {
        card: 'border-emerald-300/20 hover:border-emerald-300/50 hover:shadow-[0_24px_55px_rgba(52,211,153,0.12)]',
        tag: 'text-emerald-200/85',
        dot: 'bg-emerald-300',
        filter: 'border-emerald-300/60 bg-emerald-300/15 text-emerald-100',
        edge: 'before:bg-emerald-300/75',
    },
    'R&B': {
        card: 'border-rose-300/20 hover:border-rose-300/50 hover:shadow-[0_24px_55px_rgba(251,113,133,0.12)]',
        tag: 'text-rose-200/85',
        dot: 'bg-rose-300',
        filter: 'border-rose-300/60 bg-rose-300/15 text-rose-100',
        edge: 'before:bg-rose-300/75',
    },
};

export function getGenreTheme(genre: string): GenreTheme {
    return genreThemes[genre] || defaultTheme;
}
