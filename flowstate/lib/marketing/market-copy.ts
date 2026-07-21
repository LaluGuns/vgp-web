import type { FaqItem } from "./seo.ts";
import { isFocusedMarketLocale, type FocusedMarketLocale } from "./seo-registry.ts";

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
    legalReviewNotice: "This localized creator-license summary is under native-language and legal review. The published English contract controls until an approved local contract is supplied.",
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
    legalReviewNotice: "This localised creator-licence summary is under native-language and legal review. The published English contract controls until an approved local contract is supplied.",
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
  const language = REGIONAL_COPY[locale];
  const subject = routeSubject(language, path);
  const legal = path === "license" || path === "creator-music" || path.startsWith("creator-music/");
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
  return isFocusedMarketLocale(locale) ? REGIONAL_COPY[locale].shared : undefined;
}
