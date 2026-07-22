import type { FaqItem } from "./seo.ts";
import { isFocusedMarketLocale, type FocusedMarketLocale } from "./seo-registry.ts";
import { jaKoMarketRouteCopy } from "./ja-ko-market-copy.ts";
import { DE_MARKET_SHARED_COPY, deMarketRouteCopy } from "./de-market-copy.ts";
import { esPtMarketRouteCopy, esPtMarketSharedCopy } from "./es-pt-market-copy.ts";

export type MarketRouteCopy = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  paragraphs: string[];
  faq: FaqItem[];
  legalReviewNotice?: string;
};

export type MarketSharedCopy = {
  breadcrumbHome: string;
  breadcrumbTimers: string;
  faqHeading: string;
  otherTimersHeading: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  work: string;
  break: string;
  start: string;
  pause: string;
  reset: string;
  skip: string;
  timerCaption: string;
  openApp: string;
  presetTemplate: string;
};

type MarketLanguage = {
  labels: {
    home: string;
    pricing: string;
    deepWork: string;
    study: string;
    pomodoroMusic: string;
    timer: (split: string) => string;
    creatorMusic: string;
    creatorGenre: (genre: string) => string;
    license: string;
    alternative: (competitor: string) => string;
  };
  description: (subject: string) => string;
  paragraphs: (subject: string) => string[];
  faq: (subject: string) => FaqItem[];
  shared: MarketSharedCopy;
  legalReviewNotice: string;
};

const REGIONAL_COPY: Record<FocusedMarketLocale, MarketLanguage> = {
  "en-US": {
    labels: {
      home: "Focus Music and Pomodoro Timer",
      pricing: "Flow Pro Pricing",
      deepWork: "Deep Work Timer",
      study: "Study Timer",
      pomodoroMusic: "Pomodoro Timer with Original Music",
      timer: (split) => `${split} Focus Timer`,
      creatorMusic: "Music for Creators",
      creatorGenre: (genre) => `${genre} Background Music for Creators`,
      license: "Flow Pro Creator Music License",
      alternative: (competitor) => `${competitor} Alternative for Focus Sessions`,
    },
    description: (subject) => `${subject} from Flow: a browser-based focus tool with original music, practical timer presets, and optional ambient sound.`,
    paragraphs: (subject) => [
      `${subject} is designed for a clear next block of work, not exaggerated productivity promises. Choose a preset, start the timer, and keep one task in view.`,
      "Flow pairs a usable browser timer with original music and an ambient mixer. The free tier lets visitors try the workflow before deciding whether Pro is useful.",
    ],
    faq: (subject) => [
      { q: `Is ${subject} free to use?`, a: "Yes. The public timer experience runs in the browser without an account. Flow Pro adds the full music library and additional scenes." },
      { q: "Is this a medical or scientific focus claim?", a: "No. Timer lengths are practical workflow presets, not a promise of a universal biological optimum." },
    ],
    shared: { breadcrumbHome: "Home", breadcrumbTimers: "Timers", faqHeading: "Questions", otherTimersHeading: "Related focus tools", ctaTitle: "Open the full focus setup", ctaBody: "Add original focus music, ambient layers, tasks, and measured session stats.", ctaButton: "Open Flow free", work: "Work", break: "Break", start: "Start", pause: "Pause", reset: "Reset", skip: "Skip", timerCaption: "Runs in your browser.", openApp: "Open the app", presetTemplate: "{work} min work · {break} min break" },
    legalReviewNotice: "This page is a plain-English marketing summary, not a replacement for the published Flow Creator Music License. The published license and the grant issued for a track control its use.",
  },
  "en-GB": {
    labels: {
      home: "Focus Music and Pomodoro Timer",
      pricing: "Flow Pro Pricing",
      deepWork: "Deep Work Timer",
      study: "Study Timer",
      pomodoroMusic: "Pomodoro Timer with Original Music",
      timer: (split) => `${split} Focus Timer`,
      creatorMusic: "Music for Creators",
      creatorGenre: (genre) => `${genre} Background Music for Creators`,
      license: "Flow Pro Creator Music Licence",
      alternative: (competitor) => `${competitor} Alternative for Focus Sessions`,
    },
    description: (subject) => `${subject} from Flow: a browser-based focus tool with original music, practical timer presets, and optional ambient sound.`,
    paragraphs: (subject) => [
      `${subject} supports a deliberate block of work without making inflated productivity claims. Pick a preset, start the timer and keep one task in view.`,
      "Flow combines a practical browser timer with original music and an ambient mixer. The free tier lets people try the workflow before deciding whether Pro is useful.",
    ],
    faq: (subject) => [
      { q: `Can I use ${subject} for free?`, a: "Yes. The public timer runs in the browser without an account. Flow Pro adds the full music library and additional scenes." },
      { q: "Are timer lengths scientific prescriptions?", a: "No. They are practical workflow presets rather than a claim about a universal biological optimum." },
    ],
    shared: { breadcrumbHome: "Home", breadcrumbTimers: "Timers", faqHeading: "Questions", otherTimersHeading: "Related focus tools", ctaTitle: "Open the full focus set-up", ctaBody: "Add original focus music, ambient layers, tasks, and measured session stats.", ctaButton: "Open Flow free", work: "Work", break: "Break", start: "Start", pause: "Pause", reset: "Reset", skip: "Skip", timerCaption: "Runs in your browser.", openApp: "Open the app", presetTemplate: "{work} min work · {break} min break" },
    legalReviewNotice: "This page is a plain-English marketing summary, not a replacement for the published Flow Creator Music Licence. The published licence and the grant issued for a track govern its use.",
  },
  "ja-JP": {
    labels: {
      home: "集中用音楽とポモドーロタイマー",
      pricing: "Flow Pro の料金",
      deepWork: "ディープワークタイマー",
      study: "勉強用タイマー",
      pomodoroMusic: "オリジナル音楽付きポモドーロタイマー",
      timer: (split) => `${split} 集中タイマー`,
      creatorMusic: "クリエイター向け音楽",
      creatorGenre: (genre) => `クリエイター向け ${genre} 音楽`,
      license: "Flow Pro クリエイター音楽ライセンス",
      alternative: (competitor) => `${competitor} の代替となる集中ツール`,
    },
    description: (subject) => `Flowの${subject}。オリジナル音楽、実用的なタイマープリセット、環境音をブラウザで組み合わせられます。`,
    paragraphs: (subject) => [
      `${subject}は、次の作業に集中するための実用的なページです。プリセットを選び、タイマーを開始し、ひとつのタスクに取り組みます。`,
      "Flowでは、ブラウザで使えるタイマーにオリジナル音楽と環境音ミキサーを組み合わせています。無料プランでワークフローを試せます。",
    ],
    faq: (subject) => [
      { q: `${subject}は無料で使えますか？`, a: "はい。公開タイマーはアカウントなしでブラウザ上で使えます。Flow Proでは音楽ライブラリと追加シーンを利用できます。" },
      { q: "タイマーの長さには科学的な根拠がありますか？", a: "これは誰にでも最適な生物学的サイクルを示すものではなく、実用的な作業プリセットです。" },
    ],
    shared: { breadcrumbHome: "ホーム", breadcrumbTimers: "タイマー", faqHeading: "よくある質問", otherTimersHeading: "関連する集中ツール", ctaTitle: "集中環境を開く", ctaBody: "オリジナルの集中用音楽、環境音、タスク、計測されたセッション統計を追加できます。", ctaButton: "Flow を無料で開く", work: "集中", break: "休憩", start: "開始", pause: "一時停止", reset: "リセット", skip: "スキップ", timerCaption: "ブラウザで動作します。", openApp: "アプリを開く", presetTemplate: "集中 {work} 分 · 休憩 {break} 分" },
    legalReviewNotice: "このクリエイターライセンスの日本語要約は、ネイティブ確認と法務確認の対象です。承認済みの日本語契約書が公開されるまで、英語の契約書が適用されます。",
  },
  "de-DE": {
    labels: {
      home: "Fokusmusik und Pomodoro-Timer",
      pricing: "Flow Pro Preise",
      deepWork: "Deep-Work-Timer",
      study: "Lern-Timer",
      pomodoroMusic: "Pomodoro-Timer mit Originalmusik",
      timer: (split) => `${split} Fokus-Timer`,
      creatorMusic: "Musik für Kreative",
      creatorGenre: (genre) => `${genre}-Musik für Kreative`,
      license: "Flow Pro Creator-Musiklizenz",
      alternative: (competitor) => `${competitor}-Alternative für Fokus-Sessions`,
    },
    description: (subject) => `${subject} von Flow: ein browserbasiertes Fokus-Tool mit Originalmusik, praktischen Timer-Presets und optionalen Umgebungsgeräuschen.`,
    paragraphs: (subject) => [
      `${subject} hilft bei einem klaren nächsten Arbeitsblock, ohne übertriebene Produktivitätsversprechen. Wähle ein Preset, starte den Timer und behalte eine Aufgabe im Blick.`,
      "Flow verbindet einen nutzbaren Browser-Timer mit Originalmusik und einem Ambient-Mixer. Der kostenlose Tarif ermöglicht es, den Ablauf vor Flow Pro auszuprobieren.",
    ],
    faq: (subject) => [
      { q: `Ist ${subject} kostenlos nutzbar?`, a: "Ja. Der öffentliche Timer läuft im Browser ohne Konto. Flow Pro ergänzt die vollständige Musikbibliothek und weitere Szenen." },
      { q: "Sind die Timerlängen wissenschaftliche Vorgaben?", a: "Nein. Sie sind praktische Arbeits-Presets und kein Versprechen eines universell optimalen biologischen Rhythmus." },
    ],
    shared: { breadcrumbHome: "Startseite", breadcrumbTimers: "Timer", faqHeading: "Fragen", otherTimersHeading: "Verwandte Fokus-Tools", ctaTitle: "Vollständiges Fokus-Setup öffnen", ctaBody: "Ergänze Originalmusik, Ambient-Ebenen, Aufgaben und gemessene Sitzungsstatistiken.", ctaButton: "Flow kostenlos öffnen", work: "Arbeit", break: "Pause", start: "Start", pause: "Pause", reset: "Zurücksetzen", skip: "Überspringen", timerCaption: "Läuft direkt im Browser.", openApp: "App öffnen", presetTemplate: "{work} Min. Arbeit · {break} Min. Pause" },
    legalReviewNotice: "Diese lokalisierte Zusammenfassung der Creator-Lizenz wird sprachlich und rechtlich geprüft. Bis ein genehmigter deutscher Vertrag vorliegt, gilt der veröffentlichte englische Vertrag.",
  },
  "es-MX": {
    labels: {
      home: "Música para concentrarse y temporizador Pomodoro",
      pricing: "Precios de Flow Pro",
      deepWork: "Temporizador para trabajo profundo",
      study: "Temporizador de estudio",
      pomodoroMusic: "Temporizador Pomodoro con música original",
      timer: (split) => `Temporizador de enfoque ${split}`,
      creatorMusic: "Música para creadores",
      creatorGenre: (genre) => `Música ${genre} para creadores`,
      license: "Licencia de música para creadores Flow Pro",
      alternative: (competitor) => `Alternativa a ${competitor} para sesiones de enfoque`,
    },
    description: (subject) => `${subject} de Flow: una herramienta de enfoque en el navegador con música original, temporizadores prácticos y sonido ambiental opcional.`,
    paragraphs: (subject) => [
      `${subject} está pensado para el siguiente bloque claro de trabajo, sin promesas exageradas de productividad. Elige un preset, inicia el temporizador y mantén una sola tarea a la vista.`,
      "Flow combina un temporizador útil en el navegador con música original y un mezclador ambiental. El plan gratuito permite probar el flujo de trabajo antes de elegir Pro.",
    ],
    faq: (subject) => [
      { q: `¿${subject} se puede usar gratis?`, a: "Sí. El temporizador público funciona en el navegador sin cuenta. Flow Pro añade la biblioteca completa de música y escenas adicionales." },
      { q: "¿Las duraciones del temporizador son una indicación científica?", a: "No. Son presets prácticos de trabajo, no una promesa de un ciclo biológico óptimo para todas las personas." },
    ],
    shared: { breadcrumbHome: "Inicio", breadcrumbTimers: "Temporizadores", faqHeading: "Preguntas", otherTimersHeading: "Herramientas de enfoque relacionadas", ctaTitle: "Abre la configuración completa", ctaBody: "Añade música original, capas ambientales, tareas y estadísticas de sesión medidas.", ctaButton: "Abrir Flow gratis", work: "Trabajo", break: "Descanso", start: "Iniciar", pause: "Pausar", reset: "Restablecer", skip: "Saltar", timerCaption: "Funciona en tu navegador.", openApp: "Abrir la app", presetTemplate: "{work} min de trabajo · {break} min de descanso" },
    legalReviewNotice: "Este resumen localizado de la licencia para creadores está en revisión lingüística y legal. El contrato publicado en inglés prevalece hasta que exista un contrato local aprobado.",
  },
  "es-ES": {
    labels: {
      home: "Música para concentrarse y temporizador Pomodoro",
      pricing: "Precios de Flow Pro",
      deepWork: "Temporizador de trabajo profundo",
      study: "Temporizador de estudio",
      pomodoroMusic: "Temporizador Pomodoro con música original",
      timer: (split) => `Temporizador de concentración ${split}`,
      creatorMusic: "Música para creadores",
      creatorGenre: (genre) => `Música ${genre} para creadores`,
      license: "Licencia de música para creadores de Flow Pro",
      alternative: (competitor) => `Alternativa a ${competitor} para sesiones de concentración`,
    },
    description: (subject) => `${subject} de Flow: una herramienta de concentración en el navegador con música original, temporizadores prácticos y sonido ambiental opcional.`,
    paragraphs: (subject) => [
      `${subject} está pensado para el próximo bloque de trabajo, sin promesas exageradas de productividad. Elige un preset, inicia el temporizador y mantén una única tarea a la vista.`,
      "Flow combina un temporizador útil en el navegador con música original y un mezclador ambiental. El plan gratuito permite probar el flujo de trabajo antes de elegir Pro.",
    ],
    faq: (subject) => [
      { q: `¿Se puede usar ${subject} gratis?`, a: "Sí. El temporizador público funciona en el navegador sin cuenta. Flow Pro añade la biblioteca completa de música y escenas adicionales." },
      { q: "¿Las duraciones del temporizador son una prescripción científica?", a: "No. Son presets prácticos de trabajo, no una promesa de un ciclo biológico óptimo para todo el mundo." },
    ],
    shared: { breadcrumbHome: "Inicio", breadcrumbTimers: "Temporizadores", faqHeading: "Preguntas", otherTimersHeading: "Herramientas de concentración relacionadas", ctaTitle: "Abre la configuración completa", ctaBody: "Añade música original, capas ambientales, tareas y estadísticas de sesión medidas.", ctaButton: "Abrir Flow gratis", work: "Trabajo", break: "Descanso", start: "Iniciar", pause: "Pausar", reset: "Restablecer", skip: "Saltar", timerCaption: "Funciona en tu navegador.", openApp: "Abrir la aplicación", presetTemplate: "{work} min de trabajo · {break} min de descanso" },
    legalReviewNotice: "Este resumen localizado de la licencia para creadores está en revisión lingüística y legal. El contrato publicado en inglés prevalece hasta que exista un contrato local aprobado.",
  },
  "pt-BR": {
    labels: {
      home: "Música para foco e temporizador Pomodoro",
      pricing: "Preços do Flow Pro",
      deepWork: "Temporizador para trabalho profundo",
      study: "Temporizador de estudos",
      pomodoroMusic: "Temporizador Pomodoro com música original",
      timer: (split) => `Temporizador de foco ${split}`,
      creatorMusic: "Música para criadores",
      creatorGenre: (genre) => `Música ${genre} para criadores`,
      license: "Licença de música para criadores do Flow Pro",
      alternative: (competitor) => `Alternativa ao ${competitor} para sessões de foco`,
    },
    description: (subject) => `${subject} do Flow: uma ferramenta de foco no navegador com música original, temporizadores práticos e som ambiente opcional.`,
    paragraphs: (subject) => [
      `${subject} foi criado para o próximo bloco claro de trabalho, sem promessas exageradas de produtividade. Escolha um preset, inicie o temporizador e mantenha uma tarefa em foco.`,
      "O Flow une um temporizador útil no navegador a música original e um mixer de sons ambientes. O plano gratuito permite testar o fluxo antes de escolher o Pro.",
    ],
    faq: (subject) => [
      { q: `${subject} pode ser usado gratuitamente?`, a: "Sim. O temporizador público funciona no navegador sem conta. O Flow Pro adiciona a biblioteca musical completa e cenas extras." },
      { q: "As durações do temporizador são uma recomendação científica?", a: "Não. São presets práticos de trabalho, não uma promessa de ciclo biológico ideal para todas as pessoas." },
    ],
    shared: { breadcrumbHome: "Início", breadcrumbTimers: "Temporizadores", faqHeading: "Perguntas", otherTimersHeading: "Ferramentas de foco relacionadas", ctaTitle: "Abra a configuração completa", ctaBody: "Adicione música original, camadas de ambiente, tarefas e estatísticas de sessão medidas.", ctaButton: "Abrir Flow grátis", work: "Trabalho", break: "Pausa", start: "Iniciar", pause: "Pausar", reset: "Redefinir", skip: "Pular", timerCaption: "Funciona no navegador.", openApp: "Abrir o app", presetTemplate: "{work} min de trabalho · {break} min de pausa" },
    legalReviewNotice: "Este resumo localizado da licença para criadores está em revisão linguística e jurídica. O contrato publicado em inglês prevalece até que exista um contrato local aprovado.",
  },
  "ko-KR": {
    labels: {
      home: "집중 음악과 포모도로 타이머",
      pricing: "Flow Pro 요금",
      deepWork: "딥 워크 타이머",
      study: "학습 타이머",
      pomodoroMusic: "오리지널 음악이 있는 포모도로 타이머",
      timer: (split) => `${split} 집중 타이머`,
      creatorMusic: "크리에이터용 음악",
      creatorGenre: (genre) => `크리에이터를 위한 ${genre} 음악`,
      license: "Flow Pro 크리에이터 음악 라이선스",
      alternative: (competitor) => `${competitor} 집중 세션 대안`,
    },
    description: (subject) => `Flow의 ${subject}입니다. 오리지널 음악, 실용적인 타이머 프리셋, 선택 가능한 앰비언트 사운드를 브라우저에서 함께 사용할 수 있습니다.`,
    paragraphs: (subject) => [
      `${subject}은 과장된 생산성 약속이 아니라 다음 작업 블록에 집중하도록 설계되었습니다. 프리셋을 고르고 타이머를 시작한 뒤 하나의 작업에 집중하세요.`,
      "Flow는 브라우저 타이머에 오리지널 음악과 앰비언트 믹서를 결합합니다. 무료 플랜으로 워크플로를 먼저 체험할 수 있습니다.",
    ],
    faq: (subject) => [
      { q: `${subject}을(를) 무료로 사용할 수 있나요?`, a: "네. 공개 타이머는 계정 없이 브라우저에서 실행됩니다. Flow Pro에서는 전체 음악 라이브러리와 추가 장면을 이용할 수 있습니다." },
      { q: "타이머 길이는 과학적인 처방인가요?", a: "아닙니다. 누구에게나 최적인 생체 리듬을 약속하는 것이 아니라 실용적인 작업 프리셋입니다." },
    ],
    shared: { breadcrumbHome: "홈", breadcrumbTimers: "타이머", faqHeading: "자주 묻는 질문", otherTimersHeading: "관련 집중 도구", ctaTitle: "전체 집중 환경 열기", ctaBody: "오리지널 집중 음악, 앰비언트 레이어, 작업 목록, 측정된 세션 통계를 추가하세요.", ctaButton: "Flow 무료로 열기", work: "집중", break: "휴식", start: "시작", pause: "일시정지", reset: "재설정", skip: "건너뛰기", timerCaption: "브라우저에서 실행됩니다.", openApp: "앱 열기", presetTemplate: "집중 {work}분 · 휴식 {break}분" },
    legalReviewNotice: "이 크리에이터 라이선스 현지화 요약은 언어 및 법률 검토 중입니다. 승인된 현지 계약서가 제공되기 전까지 공개된 영어 계약서가 적용됩니다.",
  },
};

type EnglishMarketLocale = "en-US" | "en-GB";
type EnglishRouteCopy = Omit<MarketRouteCopy, "legalReviewNotice">;

/**
 * Reviewed English-market copy is intentionally route-specific. US and UK
 * pages answer different search intents and use different examples instead of
 * producing thin country-name or spelling variants of the global /en pages.
 */
const ENGLISH_MARKET_ROUTE_COPY: Record<
  EnglishMarketLocale,
  Record<string, EnglishRouteCopy>
> = {
  "en-US": {
    "": {
      metaTitle: "Focus Timer with Original Music for Work & Study | Flow",
      metaDescription: "Plan focused work or study blocks with a browser timer, original music, ambient sound, and a free setup you can start without an account.",
      h1: "A focus timer built for busy workdays and study sessions",
      paragraphs: [
        "Turn the next assignment, coding block, or creative task into a session you can actually start. Flow puts a practical timer, original music, and adjustable ambient sound in one browser workspace.",
        "Use the free setup without registration, choose a short Pomodoro or a longer work block, and keep one task in view. Flow Pro adds the full music library, more scenes, and creator-music access without pretending a timer can guarantee productivity.",
      ],
      faq: [
        { q: "Can I use Flow without creating an account?", a: "Yes. You can open the public focus timer in your browser and start a session without registering. An account is needed for features that save or license account-specific activity." },
        { q: "Does Flow work for both work and school?", a: "Yes. The timer is flexible enough for desk work, remote-work blocks, reading, assignments, and exam preparation; choose the session length that fits the task." },
      ],
    },
    pricing: {
      metaTitle: "Flow Pro Pricing: Monthly and Annual Plans | Flow",
      metaDescription: "Compare Flow Free with monthly and annual Flow Pro access for the full music library, additional scenes, and eligible Creator Music downloads.",
      h1: "Choose the Flow plan that fits your routine",
      paragraphs: [
        "Start with the free timer, then compare monthly and annual Flow Pro access when you want the complete focus-music library, more visual scenes, and eligible Creator Music downloads.",
        "Plan prices and billing terms are shown in US dollars on the pricing and checkout screens. Creator Music grants require an active Pro subscription and acceptance of the published license; listening on YouTube or Spotify does not include creator-use rights.",
      ],
      faq: [
        { q: "Do I need Pro to try the focus timer?", a: "No. The core public timer is available free. Pro is for people who want the full library, additional scenes, and access to request eligible Creator Music grants." },
        { q: "Does a Pro subscription automatically license any music I hear?", a: "No. Creator use requires an active Pro subscription, an eligible track, acceptance of the published terms, and a grant for that track. Streaming or listening alone grants no use rights." },
      ],
    },
    "deep-work-timer": {
      metaTitle: "Deep Work Timer for Coding, Writing, and Projects | Flow",
      metaDescription: "Protect a longer work block with a browser-based deep work timer, original focus music, ambient layers, and practical 50/10 or 90/15 presets.",
      h1: "A deep work timer for the task that needs real headroom",
      paragraphs: [
        "Set aside a longer block for code, writing, design, or analysis without turning the timer into a performance score. Flow keeps the countdown, current task, original music, and room-masking ambience together.",
        "Try 50/10 for sustained desk work or 90/15 when a larger block suits the project. These are practical presets, not medical advice or a claim that one biological rhythm works for everyone.",
      ],
      faq: [
        { q: "Which deep work timer should I start with?", a: "Choose 50/10 when you want a substantial block with a short reset. Use 90/15 only when your schedule and task support a longer session, or set a custom duration." },
        { q: "Is the 90-minute preset scientifically optimal for everyone?", a: "No. It is an optional workflow preset, not a universal biological prescription. Shorten, extend, or stop a session when the work or your wellbeing calls for it." },
      ],
    },
    "study-timer": {
      metaTitle: "Study Timer with Music for College and Exam Prep | Flow",
      metaDescription: "Break reading, assignments, and exam prep into manageable sessions with a free browser study timer, original music, and optional ambient sound.",
      h1: "A study timer for assignments, reading, and exam prep",
      paragraphs: [
        "Give one chapter, problem set, or draft a clear start and finish. Flow combines a browser timer with original focus music and ambient sound so the study setup stays in one tab.",
        "Use 25/5 for a stack of smaller tasks or move to 50/10 when you need more continuity. The timer measures the block; it does not promise grades, attention, or a one-size-fits-all learning method.",
      ],
      faq: [
        { q: "Is Flow useful for college study sessions?", a: "Yes. Students can use it for reading, practice problems, essays, and exam review. Pick a session length based on the material and your schedule." },
        { q: "Can I study with Flow for free?", a: "Yes. The public timer runs in the browser without an account. Pro adds the full music library and additional visual scenes." },
      ],
    },
    "pomodoro-timer-with-music": {
      metaTitle: "Pomodoro Timer with Original Focus Music | Flow",
      metaDescription: "Run practical Pomodoro work and break cycles with original music, optional ambient layers, and a free browser timer with no registration required.",
      h1: "A Pomodoro timer where the music belongs to the session",
      paragraphs: [
        "Start a 25-minute work block with music produced for Flow instead of juggling a timer and an unrelated playlist. Ambient layers can soften office, dorm, or household noise underneath the track.",
        "Use the classic 25/5 split as a starting point, then switch presets when the task needs more continuity. Flow treats Pomodoro as a practical planning method, not a guarantee of focus or output.",
      ],
      faq: [
        { q: "Does the music stop during a Pomodoro break?", a: "The timer marks work and break phases so you can manage the session in one place. Playback controls remain available, letting you choose how sound fits each phase." },
        { q: "Is the music in Flow cleared for my YouTube videos?", a: "Listening in the timer does not grant creator rights. Eligible use requires active Pro, an individual track grant, required attribution, and compliance with the published Creator Music License." },
      ],
    },
    "timer/25-5": {
      metaTitle: "Free 25/5 Pomodoro Timer for Work and Study | Flow",
      metaDescription: "Start a free 25-minute focus and 5-minute break timer in your browser, then add original music, ambient sound, and a simple task list.",
      h1: "25 minutes on, 5 minutes to reset",
      paragraphs: [
        "Use a 25/5 timer when you need enough structure to begin without committing the whole afternoon. It works well for email batches, reading sections, practice sets, and first-pass drafts.",
        "The preset is a flexible workflow choice, not a rule. Repeat it, take a longer break, or choose another timer when the task, your energy, or accessibility needs call for a different pace.",
      ],
      faq: [
        { q: "How many 25/5 sessions should I run?", a: "There is no required number. Start with one block, review what remains, and only continue when another focused session is useful." },
        { q: "Do I need to install an app?", a: "No. The public 25/5 timer runs in a modern browser and can be started without an account." },
      ],
    },
    "timer/50-10": {
      metaTitle: "Free 50/10 Focus Timer for Longer Work Blocks | Flow",
      metaDescription: "Use a free 50-minute focus and 10-minute break timer for writing, coding, design, or study that benefits from fewer interruptions.",
      h1: "A 50/10 timer for work that needs continuity",
      paragraphs: [
        "A 50-minute block gives a longer runway for debugging, drafting, design, or close reading while the 10-minute break creates a deliberate stopping point.",
        "Treat 50/10 as a practical option rather than a productivity formula. Use a shorter preset for fragmented tasks and take the break you actually need before starting another block.",
      ],
      faq: [
        { q: "When is 50/10 better than 25/5?", a: "It can suit tasks with setup costs or a longer train of thought, such as coding, writing, design, or detailed study. Choose 25/5 when a shorter commitment makes starting easier." },
        { q: "Can I use music with the 50/10 timer?", a: "Yes. Flow can pair the timer with original focus music and optional ambient layers. The public timer itself is available without registration." },
      ],
    },
    "creator-music": {
      metaTitle: "174 Original Creator Music Tracks with Pro | Flow",
      metaDescription: "Explore 174 Creator Music tracks across City Pop, Cyberpunk Jazz, and Neo Synthwave, with track grants for active Pro members under published terms.",
      h1: "Original background music for videos, podcasts, and streams",
      paragraphs: [
        "Browse 174 eligible Creator Music tracks: 49 City Pop, 43 Cyberpunk Jazz, and 82 Neo Synthwave. Lofi tracks are not part of the Creator Music catalog.",
        "Active Pro members can request new track grants and downloads for properly licensed Creator Works. The license is nonexclusive and nontransferable, attribution is required, and standalone redistribution, ownership claims, and Content ID registration are prohibited.",
      ],
      faq: [
        { q: "Does Pro let me use every track in Flow?", a: "No. Creator use is limited to the 174 eligible tracks in City Pop, Cyberpunk Jazz, and Neo Synthwave. Lofi is excluded, and each use must follow the published terms and grant process." },
        { q: "Can I use a granted track in unlimited videos?", a: "You may create unlimited properly licensed Creator Works while meeting the grant and attribution requirements. The license does not allow standalone music redistribution, ownership transfer, or Content ID claims." },
      ],
    },
    "creator-music/city-pop": {
      metaTitle: "49 City Pop Background Tracks for Creators | Flow",
      metaDescription: "Browse 49 eligible City Pop tracks for properly licensed Creator Works, available for new grants and downloads while Flow Pro is active.",
      h1: "City Pop background music with bright motion and clean momentum",
      paragraphs: [
        "Explore 49 eligible City Pop tracks for creator projects that need polished rhythm, upbeat movement, or a neon-night feel without relying on stock-loop sameness.",
        "New grants and downloads require active Pro. Attribution is required, and the nonexclusive, nontransferable license does not permit standalone redistribution, ownership claims, or Content ID registration.",
      ],
      faq: [
        { q: "Are all 49 City Pop tracks eligible for creator use?", a: "They are the eligible City Pop portion of the current Creator Music catalog, subject to active Pro, the track-grant flow, required attribution, and the published license." },
        { q: "Does playing a City Pop track on YouTube or Spotify license it?", a: "No. Listening or streaming does not grant creator-use rights. Request a grant through Flow while Pro is active before using an eligible track in a Creator Work." },
      ],
    },
    "creator-music/cyberpunk-jazz": {
      metaTitle: "43 Cyberpunk Jazz Tracks for Creator Projects | Flow",
      metaDescription: "Find 43 eligible Cyberpunk Jazz tracks for tech videos, narrative edits, podcasts, and streams licensed through an active Flow Pro account.",
      h1: "Cyberpunk Jazz for stories with tension, circuitry, and swing",
      paragraphs: [
        "Choose from 43 eligible Cyberpunk Jazz tracks when a video, podcast, livestream, or narrative edit needs nocturnal tension and improvisational energy.",
        "Creator use requires active Pro for each new grant and download, plus required attribution. Rights are nonexclusive and nontransferable; standalone redistribution, ownership claims, and Content ID registration are not allowed.",
      ],
      faq: [
        { q: "Can I use Cyberpunk Jazz in monetized creator content?", a: "Use is governed by the published Creator Music License and a valid track grant. Monetization does not remove the attribution requirement or permit Content ID, ownership claims, or music redistribution." },
        { q: "How many Cyberpunk Jazz tracks are eligible?", a: "The current eligible catalog contains 43 Cyberpunk Jazz tracks. Lofi music is outside the Creator Music catalog." },
      ],
    },
    "creator-music/neo-synthwave": {
      metaTitle: "82 Neo Synthwave Tracks for Videos and Streams | Flow",
      metaDescription: "Browse 82 eligible Neo Synthwave tracks for properly licensed videos, podcasts, and streams, with new grants available to active Pro members.",
      h1: "Neo Synthwave for bold edits, night drives, and future-facing stories",
      paragraphs: [
        "Browse 82 eligible Neo Synthwave tracks for intros, product stories, gaming edits, podcasts, and livestreams that call for cinematic electronic momentum.",
        "Active Pro is required for new grants and downloads. The license is nonexclusive and nontransferable, attribution is mandatory, and it excludes standalone redistribution, ownership transfer, and Content ID registration.",
      ],
      faq: [
        { q: "Are Neo Synthwave tracks included in Creator Music?", a: "Yes. The current eligible catalog includes 82 Neo Synthwave tracks, available through the grant process while Pro is active." },
        { q: "Can I upload the track by itself or register it with Content ID?", a: "No. Standalone redistribution and Content ID registration are prohibited, as are ownership claims or transfer of the music rights." },
      ],
    },
    license: {
      metaTitle: "Flow Pro Creator Music License Explained | Flow",
      metaDescription: "Understand eligibility, active-Pro grants, attribution, permitted Creator Works, and prohibited redistribution, ownership claims, and Content ID use.",
      h1: "Creator Music licensing, in plain English",
      paragraphs: [
        "The Creator Music catalog contains 174 eligible tracks: 49 City Pop, 43 Cyberpunk Jazz, and 82 Neo Synthwave. Lofi is excluded. New grants and downloads require an active Pro subscription and acceptance of the published terms.",
        "The license is nonexclusive and nontransferable and allows unlimited properly licensed Creator Works with required attribution. It does not transfer ownership or permit standalone redistribution or Content ID registration. Listening on Spotify or YouTube alone grants no rights.",
      ],
      faq: [
        { q: "What do I need before using a track in a Creator Work?", a: "Keep Pro active for the new grant and download, choose one of the 174 eligible tracks, accept the published terms, obtain the track grant, and include the required attribution." },
        { q: "What is not covered by the Creator Music License?", a: "Lofi tracks, standalone music redistribution, ownership transfer or claims, sublicensing or transfer of the license, and Content ID registration are not permitted. Spotify or YouTube listening is not a license." },
        { q: "How many Creator Works may I publish?", a: "There is no stated cap on properly licensed Creator Works. Each use must remain within the published terms, valid grant, and attribution requirements." },
      ],
    },
    "alternatives/brainfm": {
      metaTitle: "Brain.fm Alternative with a Timer and Original Music | Flow",
      metaDescription: "Compare Flow when you want a browser focus timer, original in-house music, ambient layers, tasks, and measured session stats in one workspace.",
      h1: "A Brain.fm alternative for people who want the timer in the same workspace",
      paragraphs: [
        "If your priority is turning a task into a timed work block, Flow keeps the timer, current task, original music, and ambient controls together instead of making audio the only center of the experience.",
        "Use the comparison to decide which workflow fits you. Flow is strongest when you want practical presets, music produced in-house, and straightforward measured session stats; Brain.fm may still be the better choice when its own approach and catalog match your needs.",
      ],
      faq: [
        { q: "Is Flow the same kind of product as Brain.fm?", a: "No. Both can be considered for focus audio, but Flow centers a combined timer, task, original-music, ambient, and session-stat workflow. Compare the actual features you plan to use." },
        { q: "Can I try Flow before choosing?", a: "Yes. The public timer can be used in the browser without an account, so you can test the workflow before considering Pro." },
      ],
    },
    "alternatives/endel": {
      metaTitle: "Endel Alternative with Focus Timers and Original Music | Flow",
      metaDescription: "Consider Flow when your ideal focus setup combines practical timers, original tracks, ambient mixing, tasks, and session stats in the browser.",
      h1: "An Endel alternative built around visible work blocks",
      paragraphs: [
        "Flow is for people who want to see the work interval, keep a task beside it, and choose original music plus ambient layers from the same browser workspace.",
        "The right choice depends on how you prefer to work. Choose Flow for explicit timer presets and a hands-on session setup; keep Endel on your shortlist when its product experience better suits how you want sound delivered.",
      ],
      faq: [
        { q: "What makes Flow a practical Endel alternative?", a: "Flow combines visible work and break timers with a task list, original tracks, ambient controls, and measured session stats. It is a different workflow, not a claim that one product is universally better." },
        { q: "Does Flow require a download?", a: "No. The public focus timer runs in a modern browser and can be tried without creating an account." },
      ],
    },
    "alternatives/flocus": {
      metaTitle: "Flocus Alternative with Original Music and Tasks | Flow",
      metaDescription: "Explore Flow as a Flocus alternative for browser-based focus blocks with original music, ambient layers, task planning, and honest session stats.",
      h1: "A Flocus alternative with an in-house soundtrack at its center",
      paragraphs: [
        "Flow brings the timer, per-session tasks, original music, ambient mixing, and measured activity into one workspace for remote work, solo projects, and study.",
        "Compare the interfaces and features that matter to your routine. Flow may fit when original soundtracks and a combined task-and-timer workflow are priorities; Flocus may remain the right pick when its environment better matches your taste.",
      ],
      faq: [
        { q: "Can Flow replace a simple online focus dashboard?", a: "It can when you want a browser timer plus original music, ambient layers, tasks, and session stats. A simpler dashboard may be preferable if those extras are not useful to you." },
        { q: "Is Flow free to test?", a: "Yes. Start the public browser timer without registration. Pro unlocks the full music library and additional scenes." },
      ],
    },
    "alternatives/pomofocus": {
      metaTitle: "Pomofocus Alternative with Original Focus Music | Flow",
      metaDescription: "Try Flow when you want a Pomodoro timer plus original music, ambient sound, per-session tasks, visual scenes, and measured focus stats.",
      h1: "A Pomofocus alternative for timers with a full sound setup",
      paragraphs: [
        "Flow starts with the same practical need—a clear work block and break—but adds original music, ambient layers, tasks, visual scenes, and measured session history around the timer.",
        "Pick based on the amount of setup you want. Pomofocus may suit a lean timer-first routine, while Flow is designed for people who want sound and session context in the same place.",
      ],
      faq: [
        { q: "Can I use Flow as a basic Pomodoro timer?", a: "Yes. Start with the free 25/5 timer in your browser, then ignore or add the music, ambient, task, and scene features as needed." },
        { q: "Is Flow better than Pomofocus?", a: "That depends on your workflow. Flow offers a broader sound and session environment; a lighter timer may be preferable when you want fewer controls." },
      ],
    },
    "alternatives/noisli": {
      metaTitle: "Noisli Alternative with Original Music and a Timer | Flow",
      metaDescription: "Compare Flow when you want ambient layers alongside original focus music, practical timers, tasks, scenes, and measured browser sessions.",
      h1: "A Noisli alternative that combines ambience with original music",
      paragraphs: [
        "Flow lets you mix ambient layers under original tracks while a visible timer and task keep the session anchored. It is built for people who want sound and work structure in one tab.",
        "Noisli may remain a better fit when an ambient-sound workflow is all you need. Choose Flow when adding original music, timer presets, tasks, scenes, and session stats makes the setup more useful.",
      ],
      faq: [
        { q: "Does Flow include ambient sounds?", a: "Yes. Ambient layers can sit underneath Flow's original music, with independent controls so you can shape the room-masking mix." },
        { q: "Can I use Flow without playing music?", a: "Yes. The timer is usable on its own, and sound controls let you choose whether original music or ambient layers belong in the session." },
      ],
    },
  },
  "en-GB": {
    "": {
      metaTitle: "Focus Timer and Original Music for Work & Revision | Flow",
      metaDescription: "Set up focused work, revision, or creative sessions with a browser timer, original music, adjustable ambience, and no registration to begin.",
      h1: "Make room for focused work, revision, and creative practice",
      paragraphs: [
        "Flow gives a busy day a quieter centre: one task, a visible timer, music made in-house, and ambient layers you can adjust for a shared flat, home office, studio, or library session.",
        "Begin with the free browser experience, use a compact Pomodoro for revision, or reserve a longer block for writing and project work. Pro expands the soundtrack and scene library without claiming that one routine suits everybody.",
      ],
      faq: [
        { q: "Can I begin a Flow session without signing up?", a: "Yes. The public timer opens in your browser without registration. Account-specific features, including creator-music grants, require an account." },
        { q: "Is Flow only for office work?", a: "No. It can support revision, coursework, research, home working, studio practice, and other tasks that benefit from a clearly bounded session." },
      ],
    },
    pricing: {
      metaTitle: "Flow Pro Plans: Compare Monthly and Annual Access | Flow",
      metaDescription: "See what Flow Free includes and compare monthly or annual Pro access to the complete music library, extra scenes, and Creator Music tools.",
      h1: "Compare Free and Pro without changing how you start",
      paragraphs: [
        "The free timer is enough to test the core routine. Move to monthly or annual Pro only when the complete focus-music library, additional visual scenes, or Creator Music grant tools add value to your work.",
        "The pricing and checkout screens state the current charge and billing currency; no local tax or currency claim is made here. Creator Music rights are separate from listening and depend on active Pro, an eligible track grant, attribution, and the published licence.",
      ],
      faq: [
        { q: "Can I keep using the timer on the Free plan?", a: "Yes. The public focus timer remains available without registration. Pro adds the complete library, further scenes, and access to the eligible Creator Music grant process." },
        { q: "Is music use in my channel included merely because I subscribe?", a: "No. Active Pro enables new grants and downloads for eligible tracks, but each use still requires the grant, attribution, and compliance with the published Creator Music Licence." },
      ],
    },
    "deep-work-timer": {
      metaTitle: "Deep Work Timer for Writing, Research, and Projects | Flow",
      metaDescription: "Create a protected work period with practical 50/10 and 90/15 timer options, original focus music, ambient layers, and a clear task.",
      h1: "Protect a proper stretch of time for demanding work",
      paragraphs: [
        "Use Flow to fence off a report, research chapter, design pass, or technical problem from the rest of a hybrid day. The task, countdown, original soundtrack, and ambient controls stay together.",
        "A 50/10 block can preserve momentum without consuming the diary; 90/15 is available when deeper continuity is useful. Both are optional working patterns, not health advice or universal claims about concentration.",
      ],
      faq: [
        { q: "How should I fit deep work around meetings?", a: "Choose a block that leaves a realistic margin before your next commitment. A 50/10 session is often easier to place; use a custom duration when the diary is tighter." },
        { q: "Does Flow claim that 90 minutes is the ideal focus cycle?", a: "No. The 90/15 option is simply a practical preset. Individual tasks, circumstances, access needs, and energy levels call for different session lengths." },
      ],
    },
    "study-timer": {
      metaTitle: "Study and Revision Timer with Original Music | Flow",
      metaDescription: "Organise revision, reading, essays, and coursework into manageable blocks with a free browser timer, original music, and optional ambience.",
      h1: "A study timer for revision that needs a clear boundary",
      paragraphs: [
        "Choose one reading, essay section, problem set, or past-paper task and give it a visible finish point. Flow keeps the timer and sound environment in one browser tab.",
        "A 25/5 pattern can help divide a revision list, whilst 50/10 offers more continuity for essays and close reading. These are adjustable planning tools, not promises about attainment or concentration.",
      ],
      faq: [
        { q: "Can I use Flow for GCSE, A-level, or university revision?", a: "Yes. The timer can support any subject or level; choose a duration that suits the material, your timetable, and the way you study." },
        { q: "Must I create an account before studying?", a: "No. The public study timer works in the browser without registration. Pro is optional and adds the full music collection and extra scenes." },
      ],
    },
    "pomodoro-timer-with-music": {
      metaTitle: "Pomodoro Timer with Original Music and Ambience | Flow",
      metaDescription: "Pair practical work-and-break cycles with original Flow music and adjustable ambient layers in a free browser Pomodoro timer.",
      h1: "Pomodoro timing with a soundtrack made for the work block",
      paragraphs: [
        "Rather than run a timer beside a separate playlist, start the work interval, original music, and room-softening ambience from one place. It suits revision desks, studios, and home-working days alike.",
        "The familiar 25/5 split is available as a convenient first pattern, not a productivity prescription. Change the duration whenever the task or your own working needs call for something else.",
      ],
      faq: [
        { q: "Can I adjust the Pomodoro pattern?", a: "Yes. Use 25/5 as a starting point or choose another preset when a longer or shorter working period suits the task better." },
        { q: "May I put music from the focus player in a client video?", a: "Listening does not provide creator rights, and client use requires a separate written licence. The standard Creator Music Licence covers only its listed creator uses when active Pro, a valid grant, required attribution, and all published terms are satisfied." },
      ],
    },
    "timer/25-5": {
      metaTitle: "Free 25/5 Pomodoro Timer for Work and Revision | Flow",
      metaDescription: "Open a free 25-minute work and 5-minute break timer for revision, admin, reading, or a manageable first step on a larger task.",
      h1: "A small enough block to begin: 25 minutes, then 5",
      paragraphs: [
        "Use 25/5 to work through a revision list, clear a batch of admin, annotate a reading, or make a first pass at something you have been postponing.",
        "One round may be sufficient. Repeat it only when useful, take a longer pause when needed, or choose a custom length—the preset is a planning aid rather than a rule about how you ought to work.",
      ],
      faq: [
        { q: "Is 25/5 suitable for revision?", a: "It can be useful for dividing a list into approachable pieces. For essay writing or close reading, a longer block may preserve your train of thought better." },
        { q: "Can I run the timer without installing anything?", a: "Yes. It runs in a modern browser, and the public timer does not require an account." },
      ],
    },
    "timer/50-10": {
      metaTitle: "Free 50/10 Timer for Study and Project Work | Flow",
      metaDescription: "Try a 50-minute focus and 10-minute break timer for essays, research, design, coding, and other work that benefits from continuity.",
      h1: "Fifty minutes for the thread, ten minutes away from it",
      paragraphs: [
        "A 50-minute interval can give an essay argument, research note, design decision, or debugging trail enough space to develop before the timer marks a proper pause.",
        "Use it when continuity matters and return to 25/5 when a shorter commitment is more realistic. Neither pattern is inherently superior; the useful one is the one that fits the work and the day.",
      ],
      faq: [
        { q: "What kind of task suits a 50/10 timer?", a: "It often fits writing, research, design, coding, and detailed revision where restarting every 25 minutes would be disruptive." },
        { q: "Does Flow include sound for the session?", a: "Yes. You can add original focus music and optional ambient layers, or keep the browser timer quiet." },
      ],
    },
    "creator-music": {
      metaTitle: "174 Original Music Tracks for Creator Projects | Flow",
      metaDescription: "Find 174 eligible tracks in City Pop, Cyberpunk Jazz, and Neo Synthwave for properly licensed creator videos, podcasts, social content, and streams.",
      h1: "Original creator music for podcasts, videos, social content, and streams",
      paragraphs: [
        "The eligible Creator Music catalogue contains 174 tracks: 49 City Pop, 43 Cyberpunk Jazz, and 82 Neo Synthwave. Lofi is not included.",
        "Active Pro is required for new grants and downloads. Properly licensed Creator Works require attribution under a non-exclusive, non-transferable licence; standalone redistribution, ownership claims, and Content ID registration are prohibited.",
      ],
      faq: [
        { q: "Which parts of the Flow catalogue are licensed for creator projects?", a: "Only the 174 eligible City Pop, Cyberpunk Jazz, and Neo Synthwave tracks. Lofi tracks are excluded, and each use must follow the grant process and published licence." },
        { q: "Is there a limit on the number of Creator Works?", a: "There is no stated cap on properly licensed Creator Works. Every use must satisfy the grant, attribution, and published-licence requirements." },
      ],
    },
    "creator-music/city-pop": {
      metaTitle: "49 City Pop Tracks for Videos, Podcasts, and Streams | Flow",
      metaDescription: "Explore 49 eligible City Pop tracks for properly licensed creator projects, with new grants and downloads available whilst Flow Pro is active.",
      h1: "City Pop for bright edits, polished stories, and forward motion",
      paragraphs: [
        "The City Pop collection offers 49 eligible tracks for programmes, podcasts, video essays, channel intros, and other projects that benefit from crisp rhythm and an after-dark sheen.",
        "An active Pro subscription is needed for each new grant and download. Attribution remains required, and the non-exclusive, non-transferable licence forbids standalone redistribution, ownership claims, and Content ID use.",
      ],
      faq: [
        { q: "Are the 49 City Pop tracks all in the eligible catalogue?", a: "Yes, subject to active Pro, an individual grant, required attribution, and all published licence conditions." },
        { q: "Does finding a City Pop track on Spotify or YouTube grant permission?", a: "No. Streaming or listening provides no creator-use rights. Obtain the relevant Flow grant whilst Pro is active." },
      ],
    },
    "creator-music/cyberpunk-jazz": {
      metaTitle: "43 Cyberpunk Jazz Tracks for Creative Projects | Flow",
      metaDescription: "Browse 43 eligible Cyberpunk Jazz tracks for properly licensed creator videos, podcasts, video essays, and streams through an active Flow Pro account.",
      h1: "Cyberpunk Jazz for atmosphere with friction and intelligence",
      paragraphs: [
        "Use the 43-track eligible Cyberpunk Jazz collection when a creator video, podcast, video essay, coding session, or stream needs urban tension with improvisational movement.",
        "New grants and downloads require active Pro and attribution. The licence is non-exclusive and non-transferable and does not allow music-only redistribution, ownership transfer, or Content ID registration.",
      ],
      faq: [
        { q: "How many Cyberpunk Jazz tracks can be licensed?", a: "The eligible Creator Music catalogue currently contains 43 Cyberpunk Jazz tracks. Lofi remains outside the catalogue." },
        { q: "May I use this music in a client delivery?", a: "Client and agency use requires a separate written licence. The standard Creator Music Licence is non-transferable, never transfers ownership, and covers only its listed creator uses under the published terms and relevant track grant." },
      ],
    },
    "creator-music/neo-synthwave": {
      metaTitle: "82 Neo Synthwave Tracks for Video, Podcasts, and Streams | Flow",
      metaDescription: "Discover 82 eligible Neo Synthwave tracks for properly licensed creator work, with new track grants available while Flow Pro remains active.",
      h1: "Neo Synthwave for cinematic builds and future-facing edits",
      paragraphs: [
        "Choose among 82 eligible Neo Synthwave tracks for creator edits, motion work, game-development videos, podcasts, streams, and stories that need scale without losing electronic detail.",
        "Active Pro is required for new grants and downloads, and attribution is compulsory. Rights remain non-exclusive and non-transferable; standalone redistribution, ownership transfer, and Content ID registration are prohibited.",
      ],
      faq: [
        { q: "Is the Neo Synthwave collection part of Creator Music?", a: "Yes. It accounts for 82 of the 174 eligible tracks, each subject to the active-Pro grant flow and published licence." },
        { q: "May I release a Neo Synthwave track as a music upload?", a: "No. Standalone or music-only redistribution is not permitted, nor are ownership claims or Content ID registration." },
      ],
    },
    license: {
      metaTitle: "Flow Pro Creator Music Licence: A Practical Guide | Flow",
      metaDescription: "Review eligible tracks, active-Pro grants, attribution, permitted Creator Works, and the restrictions on redistribution, ownership, and Content ID.",
      h1: "How the Flow Creator Music licence works",
      paragraphs: [
        "There are 174 eligible tracks—49 City Pop, 43 Cyberpunk Jazz, and 82 Neo Synthwave. Lofi is excluded. An active Pro subscription and acceptance of the published terms are required for every new grant and download.",
        "The licence is non-exclusive and non-transferable. It supports unlimited properly licensed Creator Works with attribution, but not standalone redistribution, ownership transfer or claims, or Content ID registration. Spotify and YouTube listening alone grant no rights.",
      ],
      faq: [
        { q: "What must be in place before I publish a Creator Work?", a: "Use an eligible track, keep Pro active for the new grant and download, accept the published terms, obtain the track grant, and provide the required attribution." },
        { q: "Which uses remain prohibited?", a: "Lofi use, standalone redistribution, ownership transfer or claims, transfer of the licence, and Content ID registration are not allowed. Merely listening on Spotify or YouTube does not create a licence." },
        { q: "May I make more than one properly licensed Creator Work?", a: "Yes. There is no stated numerical cap, provided each Creator Work follows the applicable grant, attribution, and published terms." },
      ],
    },
    "alternatives/brainfm": {
      metaTitle: "Brain.fm Alternative with Timers and Original Music | Flow",
      metaDescription: "Compare Flow when you want a visible work timer, original in-house music, adjustable ambience, tasks, and measured sessions in one browser tab.",
      h1: "A Brain.fm alternative for a more hands-on focus session",
      paragraphs: [
        "Flow suits a study or working day where you want to set the interval yourself, name the task, choose the music, and adjust ambient layers rather than make sound the whole interface.",
        "It is a different emphasis, not a universal upgrade. Flow may fit timer-led work and revision; Brain.fm may remain preferable when its particular audio experience is the main thing you want.",
      ],
      faq: [
        { q: "How does Flow approach a focus session?", a: "It places practical timers, a per-session task, original music, ambient controls, and measured history in one browser workspace." },
        { q: "Can I compare Flow without subscribing?", a: "Yes. Use the public timer without registration before deciding whether the Pro music and scene library is useful." },
      ],
    },
    "alternatives/endel": {
      metaTitle: "Endel Alternative for Timed Work and Revision Sessions | Flow",
      metaDescription: "Explore Flow when you prefer explicit work intervals, original tracks, ambient mixing, task planning, and measured stats in a browser workspace.",
      h1: "An Endel alternative for people who prefer to shape the session",
      paragraphs: [
        "Flow leaves the working pattern visible: select an interval, keep the task nearby, choose an original track, and mix ambience for a library desk, studio, or home office.",
        "That manual control will not suit everyone. Flow is a strong option for deliberate work blocks; Endel may remain the right fit when its own sound-led experience asks less of your attention.",
      ],
      faq: [
        { q: "What is the main Flow workflow?", a: "You choose a timer, task, original soundtrack, and optional ambient layers, then review genuinely measured session activity." },
        { q: "Is there a free way to try it?", a: "Yes. The public browser timer requires neither an installation nor registration." },
      ],
    },
    "alternatives/flocus": {
      metaTitle: "Flocus Alternative for Focus Music, Tasks, and Timers | Flow",
      metaDescription: "Consider Flow for a browser focus environment that joins original music, ambient layers, per-session tasks, timer presets, and honest stats.",
      h1: "A Flocus alternative built for a quieter, track-led workspace",
      paragraphs: [
        "Flow brings original soundtracks, a practical timer, per-session tasks, ambient layers, visual scenes, and measured history together for revision and independent project work.",
        "Use the side-by-side details rather than the headline alone. Flow may suit people who value in-house music and session structure; Flocus can still be the sensible choice when its presentation and feature mix feel more natural.",
      ],
      faq: [
        { q: "What does Flow add around the timer?", a: "It adds original music, independently controlled ambient layers, per-session tasks, visual scenes, and stats based on measured sessions." },
        { q: "Can I keep the setup simple?", a: "Yes. Start the free browser timer and use only the sound or task features that help; the rest can stay out of the way." },
      ],
    },
    "alternatives/pomofocus": {
      metaTitle: "Pomofocus Alternative with Music for Work and Revision | Flow",
      metaDescription: "Try Flow for Pomodoro timing with original music, ambient controls, session tasks, visual scenes, and measured progress in the browser.",
      h1: "A Pomofocus alternative when a timer alone is not quite enough",
      paragraphs: [
        "Flow preserves the clear work-and-break pattern but surrounds it with original music, adjustable ambience, a session task, visual scenes, and honest records of completed time.",
        "A lean timer can be exactly right, so compare what you will genuinely use. Flow earns its place when the sound environment and session context help; Pomofocus may suit a more minimal routine.",
      ],
      faq: [
        { q: "Does Flow include the familiar 25/5 Pomodoro split?", a: "Yes. The free browser timer includes a 25/5 option, alongside longer and custom working patterns." },
        { q: "Must I use the music and scenes?", a: "No. They are optional parts of the workspace; the timer can remain the centre of a simple session." },
      ],
    },
    "alternatives/noisli": {
      metaTitle: "Noisli Alternative with a Focus Timer and Original Music | Flow",
      metaDescription: "Choose Flow when you want adjustable ambience plus original music, visible focus intervals, tasks, scenes, and measured session history.",
      h1: "A Noisli alternative for ambience tied to a clear work block",
      paragraphs: [
        "Flow combines independently adjustable ambient layers with original tracks, then anchors the sound to a visible timer and a single task for work, study, or creative practice.",
        "If background ambience is the entire requirement, Noisli may remain the neater fit. Flow is intended for people who also value original music, timing, tasks, visual scenes, and session records.",
      ],
      faq: [
        { q: "Can I mix ambient sounds separately from the music?", a: "Yes. Ambient layers have their own controls, so they can sit beneath an original track or be used according to the session setup you prefer." },
        { q: "Does Flow work as a silent timer too?", a: "Yes. Music and ambience are optional; the public browser timer can run without either." },
      ],
    },
  },
};

function routeSubject(language: MarketLanguage, path: string): string {
  if (path === "") return language.labels.home;
  if (path === "pricing") return language.labels.pricing;
  if (path === "deep-work-timer") return language.labels.deepWork;
  if (path === "study-timer") return language.labels.study;
  if (path === "pomodoro-timer-with-music") return language.labels.pomodoroMusic;
  if (path === "timer/25-5") return language.labels.timer("25/5");
  if (path === "timer/50-10") return language.labels.timer("50/10");
  if (path === "creator-music") return language.labels.creatorMusic;
  if (path === "creator-music/city-pop") return language.labels.creatorGenre("City Pop");
  if (path === "creator-music/cyberpunk-jazz") return language.labels.creatorGenre("Cyberpunk Jazz");
  if (path === "creator-music/neo-synthwave") return language.labels.creatorGenre("Neo Synthwave");
  if (path === "license") return language.labels.license;
  if (path.startsWith("alternatives/")) return language.labels.alternative(path.split("/")[1]);
  return language.labels.home;
}

export function marketRouteCopy(locale: string, path: string): MarketRouteCopy | undefined {
  if (!isFocusedMarketLocale(locale)) return undefined;
  const jaKo = jaKoMarketRouteCopy(locale, path);
  if (jaKo) return jaKo;
  const de = deMarketRouteCopy(locale, path);
  if (de) return de;
  const esPt = esPtMarketRouteCopy(locale, path);
  if (esPt) return esPt;
  const language = REGIONAL_COPY[locale];
  const legal = path === "license" || path === "creator-music" || path.startsWith("creator-music/");
  if (locale === "en-US" || locale === "en-GB") {
    const copy = ENGLISH_MARKET_ROUTE_COPY[locale][path];
    if (!copy) return undefined;
    return {
      ...copy,
      ...(legal ? { legalReviewNotice: language.legalReviewNotice } : {}),
    };
  }
  const subject = routeSubject(language, path);
  return {
    metaTitle: `${subject} | Flow`,
    metaDescription: language.description(subject),
    h1: subject,
    paragraphs: language.paragraphs(subject),
    faq: language.faq(subject),
    ...(legal ? { legalReviewNotice: language.legalReviewNotice } : {}),
  };
}

/** Apply the regional long-form copy to route modules that share this shape. */
export function withMarketRouteCopy<
  T extends { metaTitle: string; metaDescription: string; h1: string; paragraphs: string[]; faq: FaqItem[] }
>(locale: string, path: string, base: T): T {
  const localized = marketRouteCopy(locale, path);
  if (!localized) return base;
  return {
    ...base,
    metaTitle: localized.metaTitle,
    metaDescription: localized.metaDescription,
    h1: localized.h1,
    paragraphs: localized.paragraphs,
    faq: localized.faq,
  };
}

export function marketSharedCopy(locale: string): MarketSharedCopy | undefined {
  if (locale === "de-DE") return DE_MARKET_SHARED_COPY;
  const esPt = esPtMarketSharedCopy(locale);
  if (esPt) return esPt;
  return isFocusedMarketLocale(locale) ? REGIONAL_COPY[locale].shared : undefined;
}
