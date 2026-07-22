import type { MarketRouteCopy, MarketSharedCopy } from "./market-copy";

export type EsPtMarketLocale = "es-MX" | "es-ES" | "pt-BR";

export const ES_PT_MARKET_PATHS = [
  "",
  "pricing",
  "deep-work-timer",
  "study-timer",
  "pomodoro-timer-with-music",
  "timer/25-5",
  "timer/50-10",
  "creator-music",
  "creator-music/city-pop",
  "creator-music/cyberpunk-jazz",
  "creator-music/neo-synthwave",
  "license",
  "alternatives/brainfm",
  "alternatives/endel",
  "alternatives/flocus",
  "alternatives/pomofocus",
  "alternatives/noisli",
] as const;

export type EsPtMarketPath = (typeof ES_PT_MARKET_PATHS)[number];

type RouteTable = Record<EsPtMarketPath, MarketRouteCopy>;

const esMx: RouteTable = {
  "": {
    metaTitle: "Música para concentrarte y temporizador Pomodoro | Flow",
    metaDescription: "Organiza bloques de enfoque con un temporizador gratuito, música original, sonidos ambientales y estadísticas medidas en el navegador.",
    h1: "Música para concentrarte y un temporizador que sí acompaña tu trabajo",
    paragraphs: [
      "Flow reúne en una sola pestaña el temporizador, la tarea de la sesión, música original y un mezclador de sonidos ambientales. Puedes empezar gratis y sin registrarte.",
      "Los intervalos son herramientas prácticas, no recetas científicas ni promesas de productividad. Elige un bloque que se adapte a tu tarea y revisa únicamente el tiempo que de verdad mediste.",
    ],
    faq: [
      { q: "¿Puedo usar Flow gratis?", a: "Sí. El temporizador público funciona en el navegador sin cuenta. Flow Pro agrega la biblioteca completa de música y escenas." },
      { q: "¿Flow promete que voy a concentrarme mejor?", a: "No. Flow ofrece herramientas para estructurar una sesión; no hace afirmaciones médicas ni garantiza resultados." },
    ],
  },
  pricing: {
    metaTitle: "Precios de Flow Pro: plan mensual y anual | Flow",
    metaDescription: "Compara Flow gratis y Flow Pro. Consulta el importe y la moneda vigentes directamente en la pantalla de precios y en el checkout.",
    h1: "Elige el plan de Flow que te sirva hoy",
    paragraphs: [
      "El plan gratuito incluye el temporizador público y una selección de música y sonidos. Flow Pro desbloquea la biblioteca completa, todas las escenas y las descargas elegibles para creadores.",
      "El importe, la moneda de cobro y cualquier condición de facturación se muestran en la pantalla de precios y en el checkout. Esta página no promete conversión a pesos, impuestos, reembolsos ni condiciones locales.",
    ],
    faq: [
      { q: "¿Tengo que pagar para probar el temporizador?", a: "No. Puedes usar el temporizador público sin cuenta antes de decidir si Flow Pro te conviene." },
      { q: "¿Flow Pro incluye automáticamente derechos para cualquier canción?", a: "No. Cada nueva autorización de licencia y descarga para creadores requiere Pro activo, una pista elegible, atribución y cumplimiento de la licencia publicada." },
    ],
  },
  "deep-work-timer": {
    metaTitle: "Temporizador para trabajo profundo con música | Flow",
    metaDescription: "Abre un temporizador gratuito para bloques largos de escritura, programación, diseño o investigación, con música y ambiente opcionales.",
    h1: "Un temporizador para sostener el hilo del trabajo profundo",
    paragraphs: [
      "Usa un bloque largo cuando escribir, programar, diseñar o investigar requiera continuidad. Mantén una tarea visible y deja que el temporizador marque el momento de hacer una pausa real.",
      "Puedes sumar música original y capas ambientales o trabajar en silencio. La duración se ajusta a tu tarea; no representa un ciclo biológico universal.",
    ],
    faq: [
      { q: "¿Cuánto debe durar un bloque de trabajo profundo?", a: "No existe una duración única. Prueba un bloque que puedas sostener y ajústalo según la tarea, tu energía y tus compromisos." },
      { q: "¿Puedo usar el temporizador sin instalar nada?", a: "Sí. Funciona en un navegador moderno y la experiencia pública no requiere cuenta." },
    ],
  },
  "study-timer": {
    metaTitle: "Temporizador de estudio gratuito con música | Flow",
    metaDescription: "Divide lecturas, ejercicios y repasos en bloques claros con un temporizador de estudio gratuito, música original y sonidos ambientales.",
    h1: "Un temporizador de estudio para avanzar tema por tema",
    paragraphs: [
      "Elige una lectura, una serie de ejercicios o un tema de repaso y dale un punto de cierre visible. Flow mantiene la tarea, el tiempo y el ambiente en una sola pestaña.",
      "El patrón 25/5 ayuda a dividir una lista; 50/10 conserva mejor el hilo de una lectura larga. Son opciones ajustables, no promesas sobre calificaciones o concentración.",
    ],
    faq: [
      { q: "¿Sirve para estudiar cualquier materia?", a: "Sí. Ajusta la duración al tipo de material y a tu forma de estudiar; Flow no prescribe un método único." },
      { q: "¿Necesito registrarme antes de estudiar?", a: "No. El temporizador público funciona sin registro; Pro es opcional." },
    ],
  },
  "pomodoro-timer-with-music": {
    metaTitle: "Temporizador Pomodoro con música original | Flow",
    metaDescription: "Combina ciclos de trabajo y descanso con música original y sonidos ambientales ajustables en un temporizador Pomodoro gratuito.",
    h1: "Pomodoro con música hecha para acompañar el bloque",
    paragraphs: [
      "En vez de abrir un temporizador y otra pestaña con una playlist, inicia el intervalo, la música original y el ambiente desde el mismo lugar.",
      "El patrón 25/5 es un punto de partida, no una regla de productividad. Cambia la duración cuando la tarea necesite más continuidad o una entrada más breve.",
    ],
    faq: [
      { q: "¿Puedo cambiar los tiempos del Pomodoro?", a: "Sí. Usa 25/5, otra configuración predefinida o una duración personalizada según la tarea." },
      { q: "¿Escuchar una canción me da derecho a usarla en un video?", a: "No. Escuchar en Flow, Spotify o YouTube no concede derechos. Una pista elegible exige Pro activo para la nueva autorización de licencia y la descarga, además de atribución y cumplimiento de la licencia." },
    ],
  },
  "timer/25-5": {
    metaTitle: "Temporizador Pomodoro 25/5 gratuito | Flow",
    metaDescription: "Inicia 25 minutos de trabajo y 5 de descanso para estudiar, leer, hacer pendientes o dar el primer paso en una tarea grande.",
    h1: "Veinticinco minutos para empezar; cinco para despejarte",
    paragraphs: [
      "Usa 25/5 para avanzar una lista de estudio, contestar pendientes, anotar una lectura o arrancar algo que has pospuesto.",
      "Una ronda puede bastar. Repite solo cuando te sea útil o cambia de patrón; la configuración predefinida organiza el tiempo, no te dice cómo debes trabajar.",
    ],
    faq: [
      { q: "¿25/5 funciona para estudiar?", a: "Puede ayudar a dividir una lista en partes manejables. Para escribir o leer a fondo quizá te convenga un bloque más largo." },
      { q: "¿El temporizador 25/5 es gratis?", a: "Sí. Funciona en el navegador sin registro." },
    ],
  },
  "timer/50-10": {
    metaTitle: "Temporizador 50/10 para estudiar y trabajar | Flow",
    metaDescription: "Prueba 50 minutos de enfoque y 10 de descanso para escritura, investigación, diseño, programación y tareas que requieren continuidad.",
    h1: "Cincuenta minutos para mantener el hilo; diez para soltarlo",
    paragraphs: [
      "Un bloque de 50 minutos deja espacio para desarrollar un argumento, seguir una investigación, resolver un problema o sostener una sesión de programación.",
      "Úsalo cuando la continuidad importe y vuelve a 25/5 cuando necesites una entrada más corta. Ningún patrón es superior para todas las personas.",
    ],
    faq: [
      { q: "¿Qué tareas se adaptan a 50/10?", a: "Suele funcionar para escritura, investigación, diseño, programación y estudio detallado." },
      { q: "¿Puedo usar música durante el bloque?", a: "Sí. Puedes añadir música original y sonidos ambientales opcionales, o dejar el temporizador en silencio." },
    ],
  },
  "creator-music": {
    metaTitle: "174 pistas originales para videos y transmisiones | Flow",
    metaDescription: "Explora 174 pistas elegibles: 49 City Pop, 43 Cyberpunk Jazz y 82 Neo Synthwave. Lofi no forma parte del catálogo para creadores.",
    h1: "Música original para videos, podcasts, contenido social y transmisiones",
    paragraphs: [
      "El catálogo elegible contiene 174 pistas: 49 de City Pop, 43 de Cyberpunk Jazz y 82 de Neo Synthwave. Lofi está excluido.",
      "Cada nueva autorización de licencia y descarga requiere Flow Pro activo. Las Obras de Creador correctamente licenciadas exigen atribución; la licencia es no exclusiva e intransferible y prohíbe la redistribución independiente, la transferencia de propiedad y Content ID.",
    ],
    faq: [
      { q: "¿Qué partes del catálogo se pueden licenciar?", a: "Solo las 174 pistas elegibles de City Pop, Cyberpunk Jazz y Neo Synthwave. Lofi queda fuera." },
      { q: "¿Hay un límite de Obras de Creador?", a: "No hay un tope numérico declarado para Obras de Creador correctamente licenciadas; cada uso debe contar con una autorización de licencia válida, la atribución y el cumplimiento de los términos publicados." },
    ],
    legalReviewNotice: "Este texto es un resumen informativo en español. La licencia publicada y la autorización de licencia emitida para cada pista rigen el uso.",
  },
  "creator-music/city-pop": {
    metaTitle: "49 pistas de City Pop para videos y podcasts | Flow",
    metaDescription: "Explora 49 pistas elegibles de City Pop para proyectos de creadores correctamente licenciados mediante Flow Pro activo.",
    h1: "City Pop para ediciones luminosas y relatos con movimiento",
    paragraphs: [
      "La colección ofrece 49 pistas elegibles para videos de creadores, podcasts, contenido social, intros y otros proyectos permitidos que buscan ritmo pulido y brillo nocturno.",
      "Cada nueva autorización de licencia y descarga exige Pro activo. La atribución es obligatoria y la licencia no exclusiva e intransferible prohíbe redistribución independiente, propiedad y Content ID.",
    ],
    faq: [
      { q: "¿Las 49 pistas de City Pop son elegibles?", a: "Sí, siempre que tengas Pro activo para la autorización de licencia y la descarga, incluyas la atribución y cumplas la licencia publicada." },
      { q: "¿Encontrar la pista en Spotify o YouTube da permiso?", a: "No. Escuchar o reproducir una pista no concede derechos de uso para creadores." },
    ],
    legalReviewNotice: "Este texto es un resumen informativo en español. La licencia publicada y la autorización de licencia emitida para cada pista rigen el uso.",
  },
  "creator-music/cyberpunk-jazz": {
    metaTitle: "43 pistas de Cyberpunk Jazz para proyectos | Flow",
    metaDescription: "Descubre 43 pistas elegibles de Cyberpunk Jazz para videos de creadores, podcasts, videoensayos y transmisiones correctamente licenciados.",
    h1: "Cyberpunk Jazz para crear atmósfera con tensión y detalle",
    paragraphs: [
      "Usa las 43 pistas elegibles cuando un video de creador, videoensayo, podcast, sesión de programación o transmisión en directo necesite tensión urbana y movimiento improvisado.",
      "Cada nueva autorización de licencia y descarga requiere Pro activo y atribución. No se permite redistribución musical independiente, transferencia de propiedad ni Content ID.",
    ],
    faq: [
      { q: "¿Cuántas pistas de Cyberpunk Jazz son elegibles?", a: "El catálogo incluye 43. Lofi no forma parte del catálogo para creadores." },
      { q: "¿Un cliente puede quedarse con la propiedad de la música?", a: "No. La licencia no transfiere propiedad y tampoco se puede transferir a otra persona." },
    ],
    legalReviewNotice: "Este texto es un resumen informativo en español. La licencia publicada y la autorización de licencia emitida para cada pista rigen el uso.",
  },
  "creator-music/neo-synthwave": {
    metaTitle: "82 pistas de Neo Synthwave para video y transmisiones | Flow",
    metaDescription: "Descubre 82 pistas elegibles de Neo Synthwave para Obras de Creador correctamente licenciadas mediante Flow Pro activo.",
    h1: "Neo Synthwave para videos de tecnología y ediciones futuristas",
    paragraphs: [
      "Elige entre 82 pistas elegibles para ediciones de creadores, gráficos animados, videos sobre desarrollo, podcasts, transmisiones y relatos con energía electrónica.",
      "Pro activo es obligatorio para cada nueva autorización de licencia y descarga, al igual que la atribución. No se permiten redistribución independiente, propiedad ni Content ID.",
    ],
    faq: [
      { q: "¿Neo Synthwave forma parte de Creator Music?", a: "Sí. Son 82 de las 174 pistas elegibles, sujetas a una autorización de licencia válida y a la licencia publicada." },
      { q: "¿Puedo subir una pista como lanzamiento musical?", a: "No. La redistribución independiente o solo musical está prohibida." },
    ],
    legalReviewNotice: "Este texto es un resumen informativo en español. La licencia publicada y la autorización de licencia emitida para cada pista rigen el uso.",
  },
  license: {
    metaTitle: "Licencia de música para creadores de Flow Pro | Flow",
    metaDescription: "Consulta pistas elegibles, autorizaciones con Pro activo, atribución y restricciones sobre redistribución, propiedad y Content ID.",
    h1: "Cómo funciona la licencia de música para creadores",
    paragraphs: [
      "Hay 174 pistas elegibles: 49 City Pop, 43 Cyberpunk Jazz y 82 Neo Synthwave. Lofi está excluido. Cada nueva autorización de licencia y descarga exige Flow Pro activo y aceptación de los términos publicados.",
      "La licencia es no exclusiva e intransferible. Permite Obras de Creador correctamente licenciadas sin un tope numérico declarado y con atribución, pero no redistribución independiente, transferencia o reclamo de propiedad ni registro en Content ID. Películas, videojuegos y trabajos para clientes requieren una licencia escrita independiente; escuchar en Spotify o YouTube no otorga derechos.",
    ],
    faq: [
      { q: "¿Qué necesito antes de publicar una Obra de Creador?", a: "Una pista elegible, Pro activo para la nueva autorización y la descarga, aceptación de los términos, una autorización de licencia válida para esa pista y la atribución requerida." },
      { q: "¿Qué usos siguen prohibidos?", a: "Usar Lofi, redistribuir la música por separado, transferir o reclamar propiedad, transferir la licencia, registrarla en Content ID o usarla en películas, videojuegos o trabajos para clientes sin una licencia escrita independiente." },
      { q: "¿Puedo publicar más de una Obra de Creador?", a: "Sí. No hay un límite numérico declarado si cada obra cuenta con una autorización de licencia válida, la atribución y el cumplimiento de los términos publicados." },
    ],
    legalReviewNotice: "Este texto es un resumen informativo en español. La licencia publicada y la autorización de licencia emitida para cada pista rigen el uso.",
  },
  "alternatives/brainfm": {
    metaTitle: "Alternativa a Brain.fm con temporizador y música | Flow",
    metaDescription: "Compara Flow si buscas temporizadores visibles, música original, sonidos ambientales, tareas y estadísticas medidas en una pestaña.",
    h1: "Una alternativa a Brain.fm con control directo de la sesión",
    paragraphs: [
      "Flow te deja elegir el intervalo, nombrar la tarea, escoger la música y ajustar el ambiente en un solo espacio de trabajo.",
      "Es un enfoque distinto, no una mejora universal. Flow puede encajar con sesiones guiadas por el temporizador; Brain.fm puede ser mejor si prefieres su experiencia de audio.",
    ],
    faq: [
      { q: "¿Cómo organiza Flow una sesión?", a: "Combina temporizador, tarea, música original, controles ambientales e historial medido en el navegador." },
      { q: "¿Puedo probarlo sin suscribirme?", a: "Sí. Usa el temporizador público sin registro antes de evaluar Pro." },
    ],
  },
  "alternatives/endel": {
    metaTitle: "Alternativa a Endel para sesiones de trabajo y estudio | Flow",
    metaDescription: "Prueba Flow si prefieres intervalos explícitos, música original, ambiente ajustable, tareas y estadísticas medidas.",
    h1: "Una alternativa a Endel para diseñar tu propia sesión",
    paragraphs: [
      "Flow mantiene visible el patrón de trabajo: eliges el intervalo, la tarea, una pista original y las capas ambientales.",
      "Ese control manual no es para todo el mundo. Endel puede seguir siendo la mejor opción si prefieres una experiencia centrada en su propio sonido.",
    ],
    faq: [
      { q: "¿Cuál es el flujo principal de Flow?", a: "Elegir temporizador, tarea, música y ambiente, y después revisar actividad realmente medida." },
      { q: "¿Hay una forma gratuita de probarlo?", a: "Sí. El temporizador público no requiere instalación ni registro." },
    ],
  },
  "alternatives/flocus": {
    metaTitle: "Alternativa a Flocus con música, tareas y timer | Flow",
    metaDescription: "Considera Flow para reunir música original, sonidos ambientales, tareas por sesión, configuraciones predefinidas y estadísticas honestas.",
    h1: "Una alternativa a Flocus con un espacio tranquilo y música propia",
    paragraphs: [
      "Flow reúne soundtracks originales, un temporizador práctico, tareas por sesión, ambiente, escenas e historial medido.",
      "Compara los detalles que realmente usarás. Flow puede encajar si valoras la música propia y la estructura; Flocus puede ajustarse mejor a otras rutinas.",
    ],
    faq: [
      { q: "¿Qué añade Flow alrededor del temporizador?", a: "Música original, ambiente con controles independientes, tareas, escenas y estadísticas basadas en sesiones medidas." },
      { q: "¿Puedo mantener una configuración sencilla?", a: "Sí. Usa solo el temporizador y las funciones que te ayuden." },
    ],
  },
  "alternatives/pomofocus": {
    metaTitle: "Alternativa a Pomofocus con música para trabajar | Flow",
    metaDescription: "Prueba Flow para usar Pomodoro con música original, ambiente, tareas, escenas y progreso medido en el navegador.",
    h1: "Una alternativa a Pomofocus cuando quieres algo más que el timer",
    paragraphs: [
      "Flow conserva el patrón claro de trabajo y descanso y lo acompaña con música original, ambiente ajustable, una tarea y registros de tiempo medido.",
      "Un timer sencillo puede ser justo lo necesario. Flow aporta valor cuando el sonido y el contexto de la sesión también te ayudan.",
    ],
    faq: [
      { q: "¿Flow incluye el patrón 25/5?", a: "Sí. También ofrece bloques más largos y duraciones personalizadas." },
      { q: "¿Tengo que usar música y escenas?", a: "No. Son opcionales; el temporizador puede seguir siendo el centro de la sesión." },
    ],
  },
  "alternatives/noisli": {
    metaTitle: "Alternativa a Noisli con timer y música original | Flow",
    metaDescription: "Elige Flow si quieres ambiente ajustable, música original, intervalos visibles, tareas, escenas e historial medido.",
    h1: "Una alternativa a Noisli que une el ambiente con un bloque claro",
    paragraphs: [
      "Flow combina capas ambientales ajustables con pistas originales y ancla el sonido a un temporizador visible y una sola tarea.",
      "Si solo necesitas ruido de fondo, Noisli puede ser más directo. Flow está pensado para quien también quiere música, tiempo, tareas y registros.",
    ],
    faq: [
      { q: "¿Puedo mezclar sonidos ambientales por separado?", a: "Sí. Cada capa tiene sus propios controles y puede acompañar una pista original." },
      { q: "¿Flow funciona como temporizador silencioso?", a: "Sí. La música y el ambiente son opcionales." },
    ],
  },
};

// Spain uses its own idiom (concentración, aplicación, ordenador) and phrasing;
// the content is not a find-and-replace of the Mexican market copy.
const esEs: RouteTable = Object.fromEntries(
  Object.entries(esMx).map(([path, copy]) => [path, { ...copy }]),
) as RouteTable;

Object.assign(esEs, {
  "": { ...esMx[""], metaTitle: "Música para concentrarse y temporizador Pomodoro | Flow", h1: "Música para concentrarse y un temporizador que acompaña cada bloque", paragraphs: ["Flow reúne en una sola pestaña del navegador el temporizador, la tarea de la sesión, música original y un mezclador de sonidos ambientales. Puedes empezar gratis y sin registrarte.", "Los intervalos son herramientas prácticas, no recetas científicas ni promesas de productividad. Escoge un bloque que encaje con la tarea y revisa únicamente el tiempo que has medido de verdad."], faq: [{ q: "¿Se puede utilizar Flow gratis?", a: "Sí. El temporizador público funciona en el navegador sin cuenta. Flow Pro añade la biblioteca completa de música y escenas." }, { q: "¿Flow garantiza que me concentraré mejor?", a: "No. Flow ofrece herramientas para estructurar una sesión; no realiza afirmaciones médicas ni garantiza resultados." }] },
  pricing: { ...esMx.pricing, metaDescription: "Compara Flow gratis y Flow Pro. Consulta el importe y la divisa vigentes directamente en la página de precios y en el proceso de pago.", h1: "Escoge el plan de Flow que encaje contigo", paragraphs: ["El plan gratuito incluye el temporizador público y una selección de música y sonidos. Flow Pro desbloquea la biblioteca completa, todas las escenas y las descargas elegibles para creadores.", "El importe, la divisa y las condiciones de facturación se muestran en la página de precios y durante el pago. Este texto no promete impuestos, reembolsos ni condiciones jurídicas locales."], faq: [{ q: "¿Hay que pagar para probar el temporizador?", a: "No. Puedes utilizar el temporizador público sin cuenta antes de decidir si Flow Pro te interesa." }, { q: "¿Flow Pro incluye automáticamente derechos sobre cualquier canción?", a: "No. Las nuevas licencias y descargas para creadores requieren Pro activo, una pista elegible, atribución y el cumplimiento de la licencia publicada." }] },
  "deep-work-timer": { ...esMx["deep-work-timer"], h1: "Un temporizador para mantener el hilo del trabajo profundo", paragraphs: ["Reserva un bloque amplio para redactar, programar, diseñar o investigar sin cortar el razonamiento. Deja la tarea a la vista y utiliza el aviso del temporizador para levantarte de verdad.", "Puedes acompañar la sesión con música original y ambiente o mantenerla en silencio. Ajusta la duración al trabajo que tengas delante: no existe un ciclo biológico válido para todo el mundo."], faq: [{ q: "¿Qué duración conviene para una sesión de trabajo profundo?", a: "Depende de la tarea y de tu disponibilidad. Empieza con un tramo asumible, observa cómo te funciona y modifícalo para la siguiente sesión." }, { q: "¿Hace falta instalar una aplicación?", a: "No. El temporizador público se abre en un navegador actual y no exige crear una cuenta." }] },
  "study-timer": { ...esMx["study-timer"], metaTitle: "Temporizador de estudio gratis con música | Flow", h1: "Un temporizador de estudio para avanzar tema a tema", paragraphs: ["Escoge una lectura, una tanda de ejercicios o un tema de repaso y fija un final visible. Así mantienes en la misma pestaña la tarea, el tiempo y el ambiente de estudio.", "El patrón 25/5 puede servir para despachar una lista; 50/10 conserva mejor el hilo de un texto largo. Ambos son ajustables y ninguno garantiza notas ni concentración."], faq: [{ q: "¿Puedo adaptar el temporizador a distintas asignaturas?", a: "Sí. Configura el bloque según el material y tu forma de estudiar; Flow no impone una técnica única." }, { q: "¿Debo registrarme para comenzar una sesión?", a: "No. El temporizador público está disponible sin registro y la suscripción Pro es opcional." }] },
  "pomodoro-timer-with-music": { ...esMx["pomodoro-timer-with-music"], h1: "Pomodoro con música creada para acompañar el bloque", paragraphs: ["Pon en marcha desde la misma pantalla el intervalo, una pista original y las capas de ambiente, sin repartir la sesión entre el temporizador y otra lista de reproducción.", "Toma 25/5 como una referencia inicial, no como una norma de productividad. Acorta o alarga el tramo cuando el trabajo necesite otra cadencia."], faq: [{ q: "¿Se pueden personalizar los intervalos Pomodoro?", a: "Sí. Elige 25/5, otra configuración predefinida o indica una duración que se ajuste a la tarea." }, { q: "¿La escucha permite añadir una pista a un vídeo?", a: "No. Oírla en Flow, Spotify o YouTube no concede derechos. Para un uso nuevo necesitas Pro activo, una autorización de licencia válida para una pista elegible, la descarga y la atribución exigida." }] },
  "timer/25-5": { ...esMx["timer/25-5"], h1: "Veinticinco minutos para empezar; cinco para desconectar", paragraphs: ["Prueba 25/5 para repasar una lista, resolver gestiones, tomar notas o arrancar esa tarea que llevas aplazando.", "Puede bastar una vuelta. Continúa únicamente si te resulta útil o escoge otro patrón; la configuración predefinida ordena el reloj, no tu manera de trabajar."], faq: [{ q: "¿Cuándo puede venir bien el patrón 25/5?", a: "Suele resultar práctico para dividir tareas breves. Una lectura exigente o un texto largo quizá necesiten un bloque con más continuidad." }, { q: "¿Puedo abrir 25/5 sin pagar?", a: "Sí. Este temporizador funciona gratis en el navegador y no requiere registro." }] },
  "timer/50-10": { ...esMx["timer/50-10"], h1: "Cincuenta minutos para mantener el hilo; diez para dejarlo reposar", paragraphs: ["Cincuenta minutos ofrecen margen para desarrollar una idea, avanzar una investigación, resolver un problema o entrar de lleno en una sesión de programación.", "Escoge 50/10 cuando te interese proteger la continuidad y vuelve a un tramo más corto si cuesta arrancar. No hay un patrón mejor para todas las personas ni para todas las tareas."], faq: [{ q: "¿Para qué trabajos se suele usar 50/10?", a: "Puede encajar en redacción, investigación, diseño, programación o estudio detallado, siempre que puedas reservar ese tiempo." }, { q: "¿El bloque admite música y sonidos ambientales?", a: "Sí. Añade una pista original y las capas que quieras, o utiliza únicamente el temporizador." }] },
  "creator-music": { ...esMx["creator-music"], h1: "Música original para vídeos, pódcast, contenido social y directos", paragraphs: ["El catálogo para creadores reúne exactamente 174 pistas elegibles: 49 de City Pop, 43 de Cyberpunk Jazz y 82 de Neo Synthwave. La colección Lofi no está incluida.", "Para cada autorización nueva y descarga necesitas Flow Pro activo. Una Obra de Creador debe conservar la atribución y una autorización de licencia válida por pista; la licencia no transfiere propiedad y excluye la redistribución musical y Content ID."], faq: [{ q: "¿Qué géneros incluye el catálogo licenciable?", a: "City Pop, Cyberpunk Jazz y Neo Synthwave suman 174 pistas elegibles. Ninguna pista Lofi forma parte de esta licencia." }, { q: "¿Cuántas Obras de Creador puedo publicar?", a: "No se declara un límite numérico, pero cada obra debe respetar la autorización de su pista, la atribución y todos los términos publicados." }] },
  "creator-music/city-pop": { ...esMx["creator-music/city-pop"], metaTitle: "49 pistas de City Pop para vídeos y pódcast | Flow", paragraphs: ["Estas 49 pistas elegibles combinan acordes luminosos, líneas de bajo fluidas y ritmo nocturno para vídeos, pódcast, cabeceras y otros proyectos de creador permitidos.", "Flow Pro debe estar activo al obtener cada autorización nueva y descargar la pista. La atribución es obligatoria; no puedes redistribuir el audio, reclamarlo como propio ni registrarlo en Content ID."], faq: [{ q: "¿Puedo licenciar cualquiera de las 49 pistas de City Pop?", a: "Sí, si tienes Pro activo al emitir la autorización y descargarla, atribuyes la pista y cumples la licencia publicada." }, { q: "¿Reproducirla en una plataforma de música concede permiso?", a: "No. Spotify y YouTube permiten escucharla, pero no sustituyen una autorización de licencia válida de Flow." }] },
  "creator-music/cyberpunk-jazz": { ...esMx["creator-music/cyberpunk-jazz"], metaDescription: "Descubre 43 pistas elegibles de Cyberpunk Jazz para vídeos de creadores, pódcast, videoensayos y directos correctamente licenciados.", paragraphs: ["Las 43 pistas elegibles aportan armonías noir, textura digital y pulso improvisado a videoensayos, pódcast, programación en directo y piezas tecnológicas.", "Cada autorización nueva y descarga exige Pro activo, además de la atribución. La licencia no permite ceder la propiedad, redistribuir la música por separado ni usar Content ID."], faq: [{ q: "¿Cuántas pistas de Cyberpunk Jazz admite la licencia?", a: "Son 43 dentro del total de 174 pistas elegibles; el catálogo Lofi permanece excluido." }, { q: "¿Puedo transferir la música o la licencia a un cliente?", a: "No. La licencia es intransferible y no concede derechos para trabajos de clientes sin una licencia escrita independiente." }] },
  "creator-music/neo-synthwave": { ...esMx["creator-music/neo-synthwave"], metaTitle: "82 pistas de Neo Synthwave para vídeo y directos | Flow", h1: "Neo Synthwave para vídeos tecnológicos y ediciones futuristas", paragraphs: ["Escoge entre 82 pistas elegibles para gráficos animados, vídeos sobre desarrollo, demostraciones de producto, pódcast, directos y montajes de estética futurista.", "Necesitas Pro activo para cada autorización nueva y descarga, además de atribución. La licencia no admite redistribución independiente, reclamaciones de propiedad ni Content ID."], faq: [{ q: "¿Cuántas pistas de Neo Synthwave están incluidas?", a: "Hay 82 dentro de las 174 pistas elegibles, siempre sujetas a una autorización válida y a la licencia publicada." }, { q: "¿Puedo publicar el audio como un lanzamiento musical?", a: "No. Está prohibido distribuir la pista sola o presentarla como un lanzamiento propio." }] },
  license: { ...esMx.license, metaTitle: "Licencia de música para creadores de Flow Pro | Flow", h1: "Cómo funciona la licencia de música para creadores", paragraphs: ["Flow ofrece 174 pistas elegibles: 49 City Pop, 43 Cyberpunk Jazz y 82 Neo Synthwave; Lofi queda fuera. Pro debe estar activo al emitir cada autorización nueva y descargar el archivo.", "La licencia por pista es no exclusiva e intransferible y exige atribución. No autoriza redistribución independiente, propiedad ni Content ID, y tampoco cubre películas, videojuegos o trabajos para clientes sin otra licencia escrita."], faq: [{ q: "¿Qué debo tener antes de estrenar una Obra de Creador?", a: "Una pista elegible, Pro activo al obtener la autorización y la descarga, aceptación de los términos, una autorización válida para esa pista y la atribución indicada." }, { q: "¿Qué usos quedan expresamente fuera?", a: "Lofi, la redistribución del audio, la propiedad, Content ID y cualquier uso en películas, videojuegos o trabajos de clientes sin una licencia escrita independiente." }, { q: "¿Se limita el número de Obras de Creador?", a: "No se indica un máximo, siempre que cada obra respete su autorización de licencia, la atribución y los términos publicados." }] },
  "alternatives/brainfm": { ...esMx["alternatives/brainfm"], h1: "Una alternativa a Brain.fm con control directo sobre la sesión", paragraphs: ["En Flow decides el tramo de tiempo, escribes la tarea y regulas por separado la música original y las capas ambientales desde el navegador.", "No pretende ser una mejora universal. Puede encajar si quieres ver la estructura de la sesión; Brain.fm puede convenirte más si priorizas su propuesta específica de audio."], faq: [{ q: "¿Qué elementos mantiene Flow a la vista?", a: "El temporizador, la tarea, la música, el ambiente y el historial basado en tiempo realmente medido." }, { q: "¿Puedo comparar Flow sin abrir una cuenta?", a: "Sí. Prueba primero el temporizador público gratis y valora después las funciones Pro." }] },
  "alternatives/endel": { ...esMx["alternatives/endel"], h1: "Una alternativa a Endel para configurar tu propia sesión", paragraphs: ["Flow muestra el intervalo y la tarea mientras eliges una pista original y ajustas cada capa ambiental a tu gusto.", "Es una experiencia deliberadamente manual. Si prefieres que el producto sonoro de Endel marque por sí solo el ambiente, esa opción puede adaptarse mejor a ti."], faq: [{ q: "¿Cómo se prepara una sesión en Flow?", a: "Escoges la duración, anotas una tarea, seleccionas música y mezclas el ambiente antes o durante el bloque." }, { q: "¿La prueba gratuita necesita instalación?", a: "No. El temporizador público funciona directamente en el navegador sin registro." }] },
  "alternatives/flocus": { ...esMx["alternatives/flocus"], h1: "Una alternativa a Flocus con un espacio tranquilo y música propia", paragraphs: ["Flow integra bandas sonoras propias, temporizador, tarea, ambiente, escenas e historial medido en un espacio de trabajo despejado.", "Comprueba qué detalles vas a utilizar cada día. Flow destaca si buscas música producida para la aplicación y sesiones estructuradas; Flocus puede encajar mejor con otros hábitos."], faq: [{ q: "¿Qué acompaña al temporizador de Flow?", a: "Música original, capas ambientales independientes, una tarea de sesión, escenas y estadísticas de tiempo medido." }, { q: "¿Es obligatorio activar todas esas funciones?", a: "No. Puedes dejar la experiencia reducida al temporizador y añadir solo lo que te resulte útil." }] },
  "alternatives/pomofocus": { ...esMx["alternatives/pomofocus"], h1: "Una alternativa a Pomofocus cuando buscas algo más que el temporizador", paragraphs: ["Flow conserva los ciclos de trabajo y descanso, pero añade música original, ambiente mezclable, una tarea visible, escenas y registros del tiempo completado.", "Un temporizador sencillo puede ser suficiente. Flow cobra sentido cuando el sonido y el contexto visual también forman parte de tu rutina de concentración."], faq: [{ q: "¿Puedo utilizar el ciclo 25/5 en Flow?", a: "Sí. También puedes escoger 50/10, un bloque largo o una duración personalizada." }, { q: "¿La música y las escenas se pueden desactivar?", a: "Sí. Son complementos opcionales y el temporizador puede funcionar por sí solo." }] },
  "alternatives/noisli": { ...esMx["alternatives/noisli"], h1: "Una alternativa a Noisli que vincula el ambiente a un bloque claro", paragraphs: ["Flow une capas ambientales regulables y música original a un temporizador visible y a la tarea concreta de la sesión.", "Noisli puede resultar más directo si solo buscas sonido de fondo. Flow está pensado para combinar ese ambiente con música, tiempo, tareas y un historial medido."], faq: [{ q: "¿Se regula cada sonido ambiental por separado?", a: "Sí. Puedes ajustar cada capa de forma independiente y combinarla con una pista original." }, { q: "¿Es posible trabajar sin ningún audio?", a: "Sí. Tanto la música como el ambiente son opcionales; el temporizador sigue disponible en silencio." }] },
} satisfies Partial<RouteTable>);

const ptBr = {
  "": { metaTitle: "Música para foco e timer Pomodoro | Flow", metaDescription: "Organize blocos de foco com timer grátis, música original, sons de ambiente e estatísticas medidas direto no navegador.", h1: "Música para foco e um timer que acompanha o seu trabalho", paragraphs: ["O Flow reúne timer, tarefa da sessão, música original e mixer de sons de ambiente em uma única aba. Você pode começar grátis e sem cadastro.", "Os intervalos são ferramentas práticas, não receitas científicas nem promessas de produtividade. Escolha um bloco compatível com a tarefa e acompanhe apenas o tempo realmente medido."], faq: [{ q: "Posso usar o Flow de graça?", a: "Sim. O timer público funciona no navegador sem conta. O Flow Pro libera a biblioteca completa de músicas e cenas." }, { q: "O Flow promete melhorar minha concentração?", a: "Não. O Flow oferece ferramentas para estruturar a sessão; não faz alegações médicas nem garante resultados." }] },
  pricing: { metaTitle: "Preços do Flow Pro: mensal e anual | Flow", metaDescription: "Compare o Flow grátis e o Flow Pro. Consulte o valor e a moeda atuais na página de preços e no checkout.", h1: "Escolha o plano do Flow que faz sentido para você", paragraphs: ["O plano grátis inclui o timer público e uma seleção de músicas e sons. O Flow Pro libera a biblioteca completa, todas as cenas e downloads elegíveis para criadores.", "O valor, a moeda de cobrança e as condições de faturamento aparecem na página de preços e no checkout. Este texto não promete conversão para reais, impostos, reembolsos nem condições locais."], faq: [{ q: "Preciso pagar para testar o timer?", a: "Não. Use o timer público sem conta antes de decidir se o Flow Pro vale a pena para você." }, { q: "O Flow Pro dá automaticamente direitos sobre qualquer música?", a: "Não. Novas licenças e downloads para criadores exigem Pro ativo, faixa elegível, atribuição e cumprimento da licença publicada." }] },
  "deep-work-timer": { metaTitle: "Timer para trabalho profundo com música | Flow", metaDescription: "Abra um timer grátis para blocos longos de escrita, programação, design ou pesquisa, com música e ambiente opcionais.", h1: "Um timer para manter o fio do trabalho profundo", paragraphs: ["Use um bloco longo quando escrever, programar, projetar ou pesquisar exigir continuidade. Mantenha uma tarefa visível e deixe o timer marcar a hora de uma pausa de verdade.", "Você pode adicionar música original e camadas de ambiente ou trabalhar em silêncio. A duração se adapta à tarefa; não representa um ciclo biológico universal."], faq: [{ q: "Quanto deve durar um bloco de trabalho profundo?", a: "Não existe duração única. Teste um bloco sustentável e ajuste conforme a tarefa, sua energia e seus compromissos." }, { q: "Posso usar o timer sem instalar nada?", a: "Sim. Ele funciona em um navegador moderno e a experiência pública não exige conta." }] },
  "study-timer": { metaTitle: "Timer de estudos grátis com música | Flow", metaDescription: "Divida leituras, exercícios e revisões em blocos claros com timer de estudos grátis, música original e sons de ambiente.", h1: "Um timer de estudos para avançar assunto por assunto", paragraphs: ["Escolha uma leitura, uma lista de exercícios ou um assunto para revisar e defina um ponto de chegada visível. O Flow mantém tarefa, tempo e ambiente na mesma aba.", "O padrão 25/5 ajuda a dividir uma lista; o 50/10 preserva melhor o raciocínio em uma leitura longa. São opções ajustáveis, não promessas de nota ou concentração."], faq: [{ q: "Serve para estudar qualquer matéria?", a: "Sim. Ajuste a duração ao material e ao seu jeito de estudar; o Flow não prescreve um único método." }, { q: "Preciso criar conta antes de estudar?", a: "Não. O timer público funciona sem cadastro; o Pro é opcional." }] },
  "pomodoro-timer-with-music": { metaTitle: "Timer Pomodoro com música original | Flow", metaDescription: "Combine ciclos de trabalho e pausa com música original e sons de ambiente ajustáveis em um timer Pomodoro grátis.", h1: "Pomodoro com música feita para acompanhar o bloco", paragraphs: ["Em vez de abrir um timer e outra aba com playlist, inicie o intervalo, a música original e o ambiente no mesmo lugar.", "O padrão 25/5 é um ponto de partida, não uma regra de produtividade. Mude a duração quando a tarefa pedir mais continuidade ou um começo mais curto."], faq: [{ q: "Posso mudar os tempos do Pomodoro?", a: "Sim. Use 25/5, outra configuração predefinida ou uma duração personalizada conforme a tarefa." }, { q: "Ouvir uma faixa me dá direito de usá-la em vídeo?", a: "Não. Ouvir no Flow, Spotify ou YouTube não concede direitos. Uma faixa elegível exige Pro ativo para a nova licença e o download, além de atribuição e cumprimento dos termos." }] },
  "timer/25-5": { metaTitle: "Timer Pomodoro 25/5 grátis | Flow", metaDescription: "Comece 25 minutos de trabalho e 5 de pausa para estudar, ler, resolver pendências ou iniciar uma tarefa grande.", h1: "Vinte e cinco minutos para começar; cinco para respirar", paragraphs: ["Use 25/5 para avançar uma lista de estudos, resolver pendências, anotar uma leitura ou começar algo que você vem adiando.", "Uma rodada pode bastar. Repita apenas quando for útil ou mude o padrão; a configuração predefinida organiza o tempo, não dita como você deve trabalhar."], faq: [{ q: "25/5 funciona para estudar?", a: "Pode ajudar a dividir uma lista em partes menores. Para escrever ou ler com profundidade, talvez um bloco mais longo preserve melhor o raciocínio." }, { q: "O timer 25/5 é grátis?", a: "Sim. Ele funciona no navegador sem cadastro." }] },
  "timer/50-10": { metaTitle: "Timer 50/10 para estudo e trabalho | Flow", metaDescription: "Experimente 50 minutos de foco e 10 de pausa para escrita, pesquisa, design, programação e tarefas que pedem continuidade.", h1: "Cinquenta minutos para manter o raciocínio; dez para se afastar", paragraphs: ["Um bloco de 50 minutos dá espaço para desenvolver um argumento, acompanhar uma pesquisa, resolver um problema ou sustentar uma sessão de programação.", "Use quando a continuidade importar e volte ao 25/5 quando um começo mais curto for realista. Nenhum padrão é melhor para todo mundo."], faq: [{ q: "Que tarefas combinam com 50/10?", a: "Costuma funcionar para escrita, pesquisa, design, programação e estudo detalhado." }, { q: "Posso usar música durante o bloco?", a: "Sim. Adicione música original e sons de ambiente opcionais ou deixe o timer em silêncio." }] },
  "creator-music": { metaTitle: "174 faixas originais para vídeos e lives | Flow", metaDescription: "Explore 174 faixas elegíveis: 49 City Pop, 43 Cyberpunk Jazz e 82 Neo Synthwave. Lofi não faz parte do catálogo para criadores.", h1: "Música original para vídeos, podcasts, conteúdo social e lives", paragraphs: ["O catálogo elegível tem 174 faixas: 49 de City Pop, 43 Cyberpunk Jazz e 82 Neo Synthwave. Lofi está excluído.", "Novas licenças e downloads exigem Flow Pro ativo. Obras de Criador devidamente licenciadas exigem atribuição; a licença é não exclusiva e intransferível e proíbe redistribuição avulsa, transferência de propriedade e Content ID."], faq: [{ q: "Quais partes do catálogo podem ser licenciadas?", a: "Somente as 174 faixas elegíveis de City Pop, Cyberpunk Jazz e Neo Synthwave. Lofi fica de fora." }, { q: "Existe limite de Obras de Criador?", a: "Não há limite numérico declarado para Obras de Criador devidamente licenciadas; cada uso deve cumprir a licença, a atribuição e os termos publicados." }], legalReviewNotice: "Este texto é um resumo informativo em português do Brasil. A licença publicada e a licença emitida para cada faixa regem o uso." },
  "creator-music/city-pop": { metaTitle: "49 faixas de City Pop para vídeos e podcasts | Flow", metaDescription: "Explore 49 faixas elegíveis de City Pop para projetos de criadores devidamente licenciados com Flow Pro ativo.", h1: "City Pop para edições luminosas e histórias em movimento", paragraphs: ["A coleção oferece 49 faixas elegíveis para vídeos de criadores, podcasts, conteúdo social, aberturas e outros projetos permitidos que pedem ritmo polido e brilho noturno.", "Cada nova licença e download exige Pro ativo. A atribuição é obrigatória e a licença não exclusiva e intransferível proíbe redistribuição avulsa, propriedade e Content ID."], faq: [{ q: "As 49 faixas de City Pop são elegíveis?", a: "Sim, desde que o Pro esteja ativo para a licença e o download, a atribuição seja incluída e os termos publicados sejam cumpridos." }, { q: "Encontrar a faixa no Spotify ou YouTube dá permissão?", a: "Não. Ouvir ou reproduzir uma faixa não concede direitos de uso para criadores." }], legalReviewNotice: "Este texto é um resumo informativo em português do Brasil. A licença publicada e a licença emitida para cada faixa regem o uso." },
  "creator-music/cyberpunk-jazz": { metaTitle: "43 faixas de Cyberpunk Jazz para projetos | Flow", metaDescription: "Descubra 43 faixas elegíveis de Cyberpunk Jazz para vídeos de criadores, podcasts, videoensaios e lives devidamente licenciados.", h1: "Cyberpunk Jazz para criar atmosfera com tensão e detalhe", paragraphs: ["Use as 43 faixas elegíveis quando um vídeo de criador, videoensaio, podcast, sessão de programação ou live pedir tensão urbana e movimento improvisado.", "Novas licenças e downloads exigem Pro ativo e atribuição. Não são permitidos redistribuição avulsa, transferência de propriedade nem Content ID."], faq: [{ q: "Quantas faixas de Cyberpunk Jazz são elegíveis?", a: "O catálogo inclui 43. Lofi não faz parte do catálogo para criadores." }, { q: "Um cliente pode ficar com a propriedade da música?", a: "Não. A licença não transfere propriedade e também não pode ser transferida para outra pessoa." }], legalReviewNotice: "Este texto é um resumo informativo em português do Brasil. A licença publicada e a licença emitida para cada faixa regem o uso." },
  "creator-music/neo-synthwave": { metaTitle: "82 faixas de Neo Synthwave para vídeo e lives | Flow", metaDescription: "Descubra 82 faixas elegíveis de Neo Synthwave para Obras de Criador devidamente licenciadas com Flow Pro ativo.", h1: "Neo Synthwave para vídeos de tecnologia e edições futuristas", paragraphs: ["Escolha entre 82 faixas elegíveis para edições de criadores, gráficos animados, vídeos sobre desenvolvimento, podcasts, lives e histórias com energia eletrônica.", "Pro ativo é obrigatório para cada nova licença e download, assim como a atribuição. Não são permitidos redistribuição avulsa, propriedade nem Content ID."], faq: [{ q: "Neo Synthwave faz parte do Creator Music?", a: "Sim. São 82 das 174 faixas elegíveis, sujeitas à licença e aos termos publicados." }, { q: "Posso subir uma faixa como lançamento musical?", a: "Não. Redistribuição avulsa ou apenas musical é proibida." }], legalReviewNotice: "Este texto é um resumo informativo em português do Brasil. A licença publicada e a licença emitida para cada faixa regem o uso." },
  license: { metaTitle: "Licença de música para criadores do Flow Pro | Flow", metaDescription: "Consulte faixas elegíveis, licenças com Pro ativo, atribuição e restrições sobre redistribuição, propriedade e Content ID.", h1: "Como funciona a licença de música para criadores", paragraphs: ["Há 174 faixas elegíveis: 49 City Pop, 43 Cyberpunk Jazz e 82 Neo Synthwave. Lofi está excluído. Cada nova licença e download exige Flow Pro ativo e aceitação dos termos publicados.", "A licença é não exclusiva e intransferível. Permite Obras de Criador devidamente licenciadas sem limite numérico declarado e com atribuição, mas não redistribuição avulsa, transferência ou alegação de propriedade nem registro no Content ID. Filmes, videogames e trabalhos para clientes exigem uma licença escrita independente; ouvir no Spotify ou YouTube não concede direitos."], faq: [{ q: "O que preciso antes de publicar uma Obra de Criador?", a: "Uma faixa elegível, Pro ativo para a nova licença e o download, aceitação dos termos, uma licença válida para aquela faixa e a atribuição exigida." }, { q: "Quais usos continuam proibidos?", a: "Usar Lofi, redistribuir a música separadamente, transferir ou alegar propriedade, registrar no Content ID ou usar em filmes, videogames ou trabalhos para clientes sem uma licença escrita independente." }, { q: "Posso publicar mais de uma Obra de Criador?", a: "Sim. Não há limite numérico declarado se cada obra tiver licença válida para cada faixa e cumprir a atribuição e os termos publicados." }], legalReviewNotice: "Este texto é um resumo informativo em português do Brasil. A licença publicada e a licença emitida para cada faixa regem o uso." },
  "alternatives/brainfm": { metaTitle: "Alternativa ao Brain.fm com timer e música | Flow", metaDescription: "Compare o Flow se você busca timer visível, música original, ambiente ajustável, tarefas e estatísticas medidas em uma aba.", h1: "Uma alternativa ao Brain.fm com controle direto da sessão", paragraphs: ["O Flow deixa você escolher o intervalo, nomear a tarefa, selecionar a música e ajustar o ambiente no mesmo espaço de trabalho.", "É uma proposta diferente, não uma melhoria universal. O Flow pode servir para sessões guiadas pelo timer; o Brain.fm pode ser melhor se você prefere a experiência de áudio dele."], faq: [{ q: "Como o Flow organiza uma sessão?", a: "Ele combina timer, tarefa, música original, controles de ambiente e histórico medido no navegador." }, { q: "Posso testar sem assinar?", a: "Sim. Use o timer público sem cadastro antes de avaliar o Pro." }] },
  "alternatives/endel": { metaTitle: "Alternativa ao Endel para trabalho e estudo | Flow", metaDescription: "Teste o Flow se você prefere intervalos explícitos, músicas originais, ambiente ajustável, tarefas e estatísticas medidas.", h1: "Uma alternativa ao Endel para montar a sua própria sessão", paragraphs: ["O Flow mantém o padrão de trabalho visível: você escolhe intervalo, tarefa, faixa original e camadas de ambiente.", "Esse controle manual não serve para todo mundo. O Endel pode continuar sendo a melhor escolha se você prefere uma experiência guiada pelo som dele."], faq: [{ q: "Qual é o fluxo principal do Flow?", a: "Escolher timer, tarefa, música e ambiente e depois revisar atividade realmente medida." }, { q: "Existe um jeito grátis de testar?", a: "Sim. O timer público não exige instalação nem cadastro." }] },
  "alternatives/flocus": { metaTitle: "Alternativa ao Flocus com música, tarefas e timer | Flow", metaDescription: "Considere o Flow para reunir música original, sons de ambiente, tarefas por sessão, configurações predefinidas e estatísticas honestas.", h1: "Uma alternativa ao Flocus com espaço tranquilo e trilha própria", paragraphs: ["O Flow reúne trilhas originais, timer prático, tarefas por sessão, ambiente, cenas e histórico medido.", "Compare os detalhes que você realmente usará. O Flow pode servir para quem valoriza música própria e estrutura; o Flocus pode combinar melhor com outras rotinas."], faq: [{ q: "O que o Flow adiciona ao timer?", a: "Música original, ambiente com controles independentes, tarefas, cenas e estatísticas baseadas em sessões medidas." }, { q: "Posso manter uma configuração simples?", a: "Sim. Use apenas o timer e os recursos que ajudam você." }] },
  "alternatives/pomofocus": { metaTitle: "Alternativa ao Pomofocus com música para trabalhar | Flow", metaDescription: "Teste o Flow para usar Pomodoro com música original, ambiente, tarefas, cenas e progresso medido no navegador.", h1: "Uma alternativa ao Pomofocus quando você quer mais do que o timer", paragraphs: ["O Flow mantém o padrão claro de trabalho e pausa e acrescenta música original, ambiente ajustável, uma tarefa e registros de tempo medido.", "Um timer simples pode ser exatamente o necessário. O Flow faz sentido quando o som e o contexto da sessão também ajudam."], faq: [{ q: "O Flow inclui o padrão 25/5?", a: "Sim. Também há blocos mais longos e durações personalizadas." }, { q: "Preciso usar música e cenas?", a: "Não. Elas são opcionais; o timer pode continuar no centro da sessão." }] },
  "alternatives/noisli": { metaTitle: "Alternativa ao Noisli com timer e música original | Flow", metaDescription: "Escolha o Flow se você quer ambiente ajustável, música original, intervalos visíveis, tarefas, cenas e histórico medido.", h1: "Uma alternativa ao Noisli que liga o ambiente a um bloco claro", paragraphs: ["O Flow combina camadas de ambiente ajustáveis com faixas originais e ancora o som a um timer visível e uma única tarefa.", "Se você só precisa de som de fundo, o Noisli pode ser mais direto. O Flow é para quem também quer música, tempo, tarefas e registros."], faq: [{ q: "Posso misturar sons de ambiente separadamente?", a: "Sim. Cada camada tem controles próprios e pode acompanhar uma faixa original." }, { q: "O Flow funciona como timer silencioso?", a: "Sim. Música e ambiente são opcionais." }] },
} satisfies RouteTable;

const routes: Record<EsPtMarketLocale, RouteTable> = { "es-MX": esMx, "es-ES": esEs, "pt-BR": ptBr };

const shared: Record<EsPtMarketLocale, MarketSharedCopy> = {
  "es-MX": { breadcrumbHome: "Inicio", breadcrumbTimers: "Temporizadores", faqHeading: "Preguntas frecuentes", otherTimersHeading: "Otros temporizadores", ctaTitle: "Abre tu espacio completo de enfoque", ctaBody: "Añade música original, ambiente, tareas y estadísticas de sesión medidas.", ctaButton: "Abrir Flow gratis", work: "Trabajo", break: "Descanso", start: "Iniciar", pause: "Pausar", reset: "Restablecer", skip: "Saltar", timerCaption: "Funciona en tu navegador.", openApp: "Abrir la app", presetTemplate: "{work} min de trabajo · {break} min de descanso" },
  "es-ES": { breadcrumbHome: "Inicio", breadcrumbTimers: "Temporizadores", faqHeading: "Preguntas frecuentes", otherTimersHeading: "Otros temporizadores", ctaTitle: "Abre tu espacio completo de concentración", ctaBody: "Añade música original, ambiente, tareas y estadísticas de sesión medidas.", ctaButton: "Abrir Flow gratis", work: "Trabajo", break: "Descanso", start: "Iniciar", pause: "Pausar", reset: "Restablecer", skip: "Omitir", timerCaption: "Funciona en el navegador.", openApp: "Abrir la aplicación", presetTemplate: "{work} min de trabajo · {break} min de descanso" },
  "pt-BR": { breadcrumbHome: "Início", breadcrumbTimers: "Timers", faqHeading: "Perguntas frequentes", otherTimersHeading: "Outros timers", ctaTitle: "Abra seu espaço completo de foco", ctaBody: "Adicione música original, ambiente, tarefas e estatísticas de sessão medidas.", ctaButton: "Abrir o Flow grátis", work: "Trabalho", break: "Pausa", start: "Iniciar", pause: "Pausar", reset: "Reiniciar", skip: "Pular", timerCaption: "Funciona no seu navegador.", openApp: "Abrir o app", presetTemplate: "{work} min de trabalho · {break} min de pausa" },
};

export function isEsPtMarketLocale(locale: string): locale is EsPtMarketLocale {
  return locale === "es-MX" || locale === "es-ES" || locale === "pt-BR";
}

export function esPtMarketRouteCopy(locale: string, path: string): MarketRouteCopy | undefined {
  if (!isEsPtMarketLocale(locale) || !(ES_PT_MARKET_PATHS as readonly string[]).includes(path)) return undefined;
  return routes[locale][path as EsPtMarketPath];
}

export function esPtMarketSharedCopy(locale: string): MarketSharedCopy | undefined {
  return isEsPtMarketLocale(locale) ? shared[locale] : undefined;
}
