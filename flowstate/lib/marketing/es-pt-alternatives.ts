import type { AlternativeCopy, AlternativeSlug } from "@/lib/translations/pages/alternatives";
import { esPtMarketRouteCopy, type EsPtMarketLocale } from "./es-pt-market-copy.ts";

type AlternativeTable = Record<AlternativeSlug, AlternativeCopy>;

function route(locale: EsPtMarketLocale, slug: AlternativeSlug) {
  const copy = esPtMarketRouteCopy(locale, `alternatives/${slug}`);
  if (!copy) throw new Error(`Missing ${locale} alternative route: ${slug}`);
  return copy;
}

function esMxAlternative(slug: AlternativeSlug, rich: Omit<AlternativeCopy, "metaTitle" | "metaDescription" | "h1" | "intro">): AlternativeCopy {
  const seo = route("es-MX", slug);
  return { metaTitle: seo.metaTitle, metaDescription: seo.metaDescription, h1: seo.h1, intro: seo.paragraphs, ...rich };
}

const esMx: AlternativeTable = {
  brainfm: esMxAlternative("brainfm", {
    competitorName: "Brain.fm",
    tableHeading: "Brain.fm y Flow, lado a lado",
    rows: [
      { feature: "Enfoque principal", them: "Experiencia de audio propia para concentración", flow: "Timer visible, tarea, música original y ambiente en una sola pestaña" },
      { feature: "Control del tiempo", them: "Sesiones guiadas por su experiencia", flow: "Patrones 25/5, 50/10, bloques largos y tiempos personalizados" },
      { feature: "Música", them: "Catálogo y método de audio de Brain.fm", flow: "Música instrumental original producida para Flow" },
      { feature: "Ambiente", them: "Depende de la experiencia seleccionada", flow: "Capas ambientales con volumen independiente" },
      { feature: "Prueba sin cuenta", them: "Según la oferta vigente de Brain.fm", flow: "Timer público gratis y sin registro" },
      { feature: "Estadísticas", them: "Funciones propias de Brain.fm", flow: "Tiempo y sesiones realmente medidos" },
    ],
    whenHeading: "Cuándo Brain.fm puede ser la mejor opción",
    whenParagraphs: ["Si quieres que una experiencia de audio específica lleve casi todo el peso de la sesión, Brain.fm puede ajustarse mejor a tu forma de trabajar.", "Elige Flow cuando prefieras decidir el intervalo, ver la tarea y controlar por separado música y ambiente. Ninguna opción es superior para todas las personas."],
    faq: route("es-MX", "brainfm").faq,
  }),
  endel: esMxAlternative("endel", {
    competitorName: "Endel",
    tableHeading: "Endel y Flow, lado a lado",
    rows: [
      { feature: "Enfoque principal", them: "Paisajes sonoros de la experiencia Endel", flow: "Bloques de trabajo visibles con música, tareas y ambiente" },
      { feature: "Control de sesión", them: "Experiencia centrada en el sonido", flow: "Tú eliges intervalo, tarea, pista y capas ambientales" },
      { feature: "Temporizador", them: "Depende del modo y la plataforma", flow: "Configuraciones predefinidas visibles y duración personalizada en el navegador" },
      { feature: "Música", them: "Sonido propio de Endel", flow: "Pistas originales completas producidas para Flow" },
      { feature: "Tareas", them: "No son el centro de la experiencia", flow: "Una tarea visible por sesión y planificación junto al timer" },
      { feature: "Historial", them: "Funciones propias de Endel", flow: "Sesiones y minutos realmente medidos" },
    ],
    whenHeading: "Cuándo Endel puede ser la mejor opción",
    whenParagraphs: ["Endel puede encajar mejor si prefieres abrir una experiencia sonora y dejar que ella marque el tono con poca configuración manual.", "Flow encaja cuando quieres que el intervalo y la tarea sigan visibles y deseas elegir una pista y mezclar el ambiente por tu cuenta."],
    faq: route("es-MX", "endel").faq,
  }),
  flocus: esMxAlternative("flocus", {
    competitorName: "Flocus",
    tableHeading: "Flocus y Flow, lado a lado",
    rows: [
      { feature: "Espacio de trabajo", them: "Panel visual de enfoque", flow: "Temporizador, tarea, música, ambiente y estadísticas" },
      { feature: "Música", them: "Selección disponible en Flocus", flow: "Soundtracks originales producidos para la app" },
      { feature: "Ambiente", them: "Según la escena y las funciones disponibles", flow: "Capas independientes de lluvia, café, fuego y otros sonidos" },
      { feature: "Tareas", them: "Herramientas de productividad de Flocus", flow: "Tarea de la sesión junto al reloj" },
      { feature: "Temporizador", them: "Temporizador dentro de su panel", flow: "Patrones desde 25/5 y bloques personalizados" },
      { feature: "Métricas", them: "Funciones propias de Flocus", flow: "Historial basado en minutos realmente medidos" },
    ],
    whenHeading: "Cuándo Flocus puede ser la mejor opción",
    whenParagraphs: ["Flocus puede sentirse más natural si su diseño, escenas y combinación de herramientas coinciden mejor con la forma en que organizas tu día.", "Flow puede convenirte si la música producida internamente, el control ambiental y una estructura clara por sesión son lo que más valoras."],
    faq: route("es-MX", "flocus").faq,
  }),
  pomofocus: esMxAlternative("pomofocus", {
    competitorName: "Pomofocus",
    tableHeading: "Pomofocus y Flow, lado a lado",
    rows: [
      { feature: "Experiencia principal", them: "Timer Pomodoro directo y ligero", flow: "Timer Pomodoro con música, ambiente, tareas y escenas" },
      { feature: "Patrones", them: "Ciclos Pomodoro configurables", flow: "25/5, 50/10, bloques largos y duración personalizada" },
      { feature: "Música", them: "No es el centro del producto", flow: "Biblioteca de música original integrada" },
      { feature: "Ambiente", them: "Funciones según la versión vigente", flow: "Mezclador de sonidos con controles separados" },
      { feature: "Tareas", them: "Lista de tareas dentro del flujo Pomodoro", flow: "Tarea de sesión y planificación junto al timer" },
      { feature: "Uso gratuito", them: "Oferta gratuita propia de Pomofocus", flow: "Timer público gratis y sin registro" },
    ],
    whenHeading: "Cuándo Pomofocus puede ser la mejor opción",
    whenParagraphs: ["Si solo quieres un timer Pomodoro claro y una lista de tareas, la sencillez de Pomofocus puede ser exactamente lo que necesitas.", "Flow agrega valor cuando la música original, el ambiente y las escenas también forman parte de tu ritual de trabajo."],
    faq: route("es-MX", "pomofocus").faq,
  }),
  noisli: esMxAlternative("noisli", {
    competitorName: "Noisli",
    tableHeading: "Noisli y Flow, lado a lado",
    rows: [
      { feature: "Sonido principal", them: "Mezclas de ruido y sonidos ambientales", flow: "Música original más capas ambientales independientes" },
      { feature: "Temporizador", them: "Herramientas disponibles en Noisli", flow: "Patrones 25/5, 50/10, bloques largos y personalizados" },
      { feature: "Música", them: "El ambiente es el foco principal", flow: "Pistas instrumentales originales integradas con el timer" },
      { feature: "Tareas", them: "No son el centro de la mezcla sonora", flow: "Tarea visible y planificación dentro de la sesión" },
      { feature: "Escenas", them: "Interfaz centrada en las mezclas", flow: "Escenas visuales opcionales junto con música y ambiente" },
      { feature: "Estadísticas", them: "Funciones propias de Noisli", flow: "Minutos y sesiones realmente medidos" },
    ],
    whenHeading: "Cuándo Noisli puede ser la mejor opción",
    whenParagraphs: ["Si lo único que buscas es una mezcla de sonidos de fondo, Noisli puede ser una solución más directa.", "Flow es más adecuado cuando quieres conectar ese ambiente con música original, una tarea visible, un timer y un historial de sesiones."],
    faq: route("es-MX", "noisli").faq,
  }),
};

function esEsFromMx(slug: AlternativeSlug, overrides: Partial<AlternativeCopy>): AlternativeCopy {
  const seo = route("es-ES", slug);
  const base = esMx[slug];
  return { ...base, metaTitle: seo.metaTitle, metaDescription: seo.metaDescription, h1: seo.h1, intro: seo.paragraphs, faq: seo.faq, ...overrides };
}

const esEs: AlternativeTable = {
  brainfm: esEsFromMx("brainfm", { tableHeading: "Comparativa entre Brain.fm y Flow", rows: [
    { feature: "Cómo guía la concentración", them: "Su tecnología y catálogo de audio conducen la experiencia", flow: "El usuario combina reloj, objetivo, pista y sonido ambiental" },
    { feature: "Ritmo de trabajo", them: "Se organiza mediante las sesiones disponibles en Brain.fm", flow: "Admite 25/5, 50/10, intervalos extensos y ajuste libre" },
    { feature: "Origen de las pistas", them: "Contenido asociado al método sonoro de Brain.fm", flow: "Instrumentales compuestos y producidos para la aplicación" },
    { feature: "Capas de fondo", them: "Cambian con la modalidad seleccionada", flow: "Cada ambiente dispone de su propio control de volumen" },
    { feature: "Acceso para probar", them: "Depende de las condiciones comerciales que publique Brain.fm", flow: "El temporizador básico se abre gratis y sin crear cuenta" },
    { feature: "Medición", them: "La determina el conjunto de funciones vigente del servicio", flow: "El historial recoge únicamente minutos y sesiones completados" },
  ], whenHeading: "Cuándo Brain.fm puede encajar mejor", whenParagraphs: ["Si quieres que una experiencia de audio concreta lleve casi todo el peso de la sesión, Brain.fm puede ajustarse mejor a tu forma de trabajar.", "Escoge Flow cuando prefieras decidir el intervalo, ver la tarea y controlar por separado la música y el ambiente. Ninguna opción es superior para todo el mundo."] }),
  endel: esEsFromMx("endel", { tableHeading: "Comparativa entre Endel y Flow", rows: [
    { feature: "Forma de empezar", them: "Se abre una experiencia sonora de Endel", flow: "Se define un tramo de trabajo y una tarea concreta" },
    { feature: "Decisiones durante el bloque", them: "La propuesta prioriza la continuidad del sonido", flow: "Puedes cambiar pista y regular cada capa ambiental" },
    { feature: "Reloj de la sesión", them: "Varía según el modo y el dispositivo", flow: "Intervalos visibles y duración elegida desde el navegador" },
    { feature: "Material musical", them: "Audio perteneciente al ecosistema Endel", flow: "Temas instrumentales completos producidos para Flow" },
    { feature: "Tarea en pantalla", them: "No constituye el eje de la experiencia", flow: "El objetivo permanece junto al temporizador" },
    { feature: "Registro de actividad", them: "Depende de las funciones actuales de Endel", flow: "Solo refleja sesiones y minutos efectivamente completados" },
  ], whenHeading: "Cuándo Endel puede encajar mejor", whenParagraphs: ["Endel puede resultar más apropiado si prefieres abrir una experiencia sonora y dejar que marque el tono con poca configuración manual.", "Flow encaja cuando quieres que el intervalo y la tarea permanezcan visibles y deseas escoger una pista y mezclar el ambiente por tu cuenta."] }),
  flocus: esEsFromMx("flocus", { tableHeading: "Comparativa entre Flocus y Flow", rows: [
    { feature: "Entorno visual", them: "Panel de concentración diseñado por Flocus", flow: "Espacio despejado con reloj, tarea, sonido y métricas" },
    { feature: "Procedencia de la música", them: "Selección ofrecida dentro de Flocus", flow: "Bandas sonoras creadas específicamente para la aplicación" },
    { feature: "Mezcla ambiental", them: "Condicionada por sus escenas y opciones vigentes", flow: "Lluvia, cafetería, fuego y otras capas regulables por separado" },
    { feature: "Organización del trabajo", them: "Herramientas de productividad propias del servicio", flow: "Un objetivo visible para el bloque en curso" },
    { feature: "Duración", them: "Temporizador integrado en su panel", flow: "25/5, 50/10, sesiones largas o tiempos personalizados" },
    { feature: "Datos mostrados", them: "Según las prestaciones disponibles en Flocus", flow: "Historial calculado a partir del tiempo realmente medido" },
  ], whenHeading: "Cuándo Flocus puede encajar mejor", whenParagraphs: ["Flocus puede resultar más natural si su diseño, sus escenas y su combinación de herramientas coinciden con tu manera de organizar el día.", "Flow puede interesarte si valoras especialmente la música propia, el control ambiental y una estructura clara para cada sesión."] }),
  pomofocus: esEsFromMx("pomofocus", { tableHeading: "Comparativa entre Pomofocus y Flow", rows: [
    { feature: "Punto de partida", them: "Pomodoro sencillo y ligero", flow: "Pomodoro acompañado de música, ambiente, tarea y escenas" },
    { feature: "Cadencias disponibles", them: "Ciclos que se pueden configurar", flow: "Patrones 25/5 y 50/10, tramos extensos y ajuste manual" },
    { feature: "Audio musical", them: "No ocupa el centro de su propuesta", flow: "Catálogo original integrado en el espacio de concentración" },
    { feature: "Sonidos de fondo", them: "Dependen de la versión actual del producto", flow: "Mezclador con volumen independiente para cada capa" },
    { feature: "Gestión de tareas", them: "Lista incorporada al flujo Pomodoro", flow: "Tarea del bloque y planificación junto al reloj" },
    { feature: "Acceso inicial", them: "Conforme a la modalidad gratuita de Pomofocus", flow: "Temporizador público sin pago ni registro" },
  ], whenHeading: "Cuándo Pomofocus puede encajar mejor", whenParagraphs: ["Si solo quieres un temporizador Pomodoro claro y una lista de tareas, la sencillez de Pomofocus puede ser justo lo que necesitas.", "Flow aporta más cuando la música original, el ambiente y las escenas también forman parte de tu rutina de trabajo."] }),
  noisli: esEsFromMx("noisli", { tableHeading: "Comparativa entre Noisli y Flow", rows: [
    { feature: "Base sonora", them: "Combinaciones de ruido y ambientes", flow: "Pistas originales combinadas con capas ambientales" },
    { feature: "Estructura temporal", them: "Herramientas que ofrezca Noisli en ese momento", flow: "25/5, 50/10 y bloques configurados por el usuario" },
    { feature: "Papel de la música", them: "La mezcla ambiental dirige la experiencia", flow: "Temas instrumentales coordinados con el temporizador" },
    { feature: "Objetivo de sesión", them: "Queda fuera del núcleo de la mezcla", flow: "Tarea y planificación visibles durante el bloque" },
    { feature: "Acompañamiento visual", them: "Interfaz concebida alrededor de los sonidos", flow: "Escenas opcionales que conviven con música y ambiente" },
    { feature: "Seguimiento", them: "Sujeto a las prestaciones propias de Noisli", flow: "Recuento de minutos y sesiones que sí se han completado" },
  ], whenHeading: "Cuándo Noisli puede encajar mejor", whenParagraphs: ["Si únicamente buscas una mezcla de sonidos de fondo, Noisli puede ser una solución más directa.", "Flow resulta más adecuado cuando quieres vincular ese ambiente con música original, una tarea visible, un temporizador y un historial de sesiones."] }),
};

function pt(slug: AlternativeSlug, rich: Omit<AlternativeCopy, "metaTitle" | "metaDescription" | "h1" | "intro" | "faq">): AlternativeCopy {
  const seo = route("pt-BR", slug);
  return { metaTitle: seo.metaTitle, metaDescription: seo.metaDescription, h1: seo.h1, intro: seo.paragraphs, faq: seo.faq, ...rich };
}

const ptBr: AlternativeTable = {
  brainfm: pt("brainfm", { competitorName: "Brain.fm", tableHeading: "Brain.fm e Flow lado a lado", rows: [
    { feature: "Foco principal", them: "Experiência própria de áudio para concentração", flow: "Timer visível, tarefa, música original e ambiente na mesma aba" },
    { feature: "Controle de tempo", them: "Sessões guiadas pela experiência", flow: "Padrões 25/5, 50/10, blocos longos e tempos personalizados" },
    { feature: "Música", them: "Catálogo e método de áudio do Brain.fm", flow: "Música instrumental original produzida para o Flow" },
    { feature: "Ambiente", them: "Depende da experiência escolhida", flow: "Camadas de ambiente com volumes independentes" },
    { feature: "Teste sem conta", them: "Conforme a oferta vigente do Brain.fm", flow: "Timer público grátis e sem cadastro" },
    { feature: "Estatísticas", them: "Recursos próprios do Brain.fm", flow: "Tempo e sessões realmente medidos" },
  ], whenHeading: "Quando o Brain.fm pode ser a melhor escolha", whenParagraphs: ["Se você quer que uma experiência específica de áudio conduza quase toda a sessão, o Brain.fm pode combinar mais com o seu jeito de trabalhar.", "Escolha o Flow quando quiser decidir o intervalo, ver a tarefa e controlar música e ambiente separadamente. Nenhuma opção é melhor para todo mundo."] }),
  endel: pt("endel", { competitorName: "Endel", tableHeading: "Endel e Flow lado a lado", rows: [
    { feature: "Foco principal", them: "Paisagens sonoras da experiência Endel", flow: "Blocos visíveis com música, tarefas e ambiente" },
    { feature: "Controle da sessão", them: "Experiência centrada no som", flow: "Você escolhe intervalo, tarefa, faixa e camadas" },
    { feature: "Timer", them: "Depende do modo e da plataforma", flow: "Configurações predefinidas visíveis e duração personalizada no navegador" },
    { feature: "Música", them: "Som próprio do Endel", flow: "Faixas originais completas produzidas para o Flow" },
    { feature: "Tarefas", them: "Não são o centro da experiência", flow: "Uma tarefa visível por sessão e planejamento ao lado do timer" },
    { feature: "Histórico", them: "Recursos próprios do Endel", flow: "Sessões e minutos realmente medidos" },
  ], whenHeading: "Quando o Endel pode ser a melhor escolha", whenParagraphs: ["O Endel pode combinar mais se você prefere abrir uma experiência sonora e deixar que ela defina o clima com pouca configuração manual.", "O Flow faz sentido quando você quer manter intervalo e tarefa visíveis e escolher uma faixa e o ambiente por conta própria."] }),
  flocus: pt("flocus", { competitorName: "Flocus", tableHeading: "Flocus e Flow lado a lado", rows: [
    { feature: "Espaço de trabalho", them: "Painel visual de foco", flow: "Timer, tarefa, música, ambiente e estatísticas" },
    { feature: "Música", them: "Seleção disponível no Flocus", flow: "Trilhas originais produzidas para o app" },
    { feature: "Ambiente", them: "Conforme cenas e recursos disponíveis", flow: "Camadas independentes de chuva, café, fogo e outros sons" },
    { feature: "Tarefas", them: "Ferramentas de produtividade do Flocus", flow: "Tarefa da sessão ao lado do relógio" },
    { feature: "Timer", them: "Temporizador dentro do painel", flow: "Padrões a partir de 25/5 e blocos personalizados" },
    { feature: "Métricas", them: "Recursos próprios do Flocus", flow: "Histórico baseado em minutos realmente medidos" },
  ], whenHeading: "Quando o Flocus pode ser a melhor escolha", whenParagraphs: ["O Flocus pode parecer mais natural se o design, as cenas e a combinação de ferramentas dele combinarem melhor com a sua rotina.", "O Flow pode servir mais se música produzida internamente, controle do ambiente e estrutura clara por sessão forem prioridades."] }),
  pomofocus: pt("pomofocus", { competitorName: "Pomofocus", tableHeading: "Pomofocus e Flow lado a lado", rows: [
    { feature: "Experiência principal", them: "Timer Pomodoro direto e leve", flow: "Timer Pomodoro com música, ambiente, tarefas e cenas" },
    { feature: "Padrões", them: "Ciclos Pomodoro configuráveis", flow: "25/5, 50/10, blocos longos e duração personalizada" },
    { feature: "Música", them: "Não é o centro do produto", flow: "Biblioteca de música original integrada" },
    { feature: "Ambiente", them: "Recursos conforme a versão atual", flow: "Mixer de sons com controles separados" },
    { feature: "Tarefas", them: "Lista de tarefas no fluxo Pomodoro", flow: "Tarefa da sessão e planejamento ao lado do timer" },
    { feature: "Uso grátis", them: "Oferta gratuita própria do Pomofocus", flow: "Timer público grátis e sem cadastro" },
  ], whenHeading: "Quando o Pomofocus pode ser a melhor escolha", whenParagraphs: ["Se você quer apenas um timer Pomodoro claro e uma lista de tarefas, a simplicidade do Pomofocus pode ser exatamente o necessário.", "O Flow agrega valor quando música original, ambiente e cenas também fazem parte do seu ritual de trabalho."] }),
  noisli: pt("noisli", { competitorName: "Noisli", tableHeading: "Noisli e Flow lado a lado", rows: [
    { feature: "Som principal", them: "Misturas de ruído e sons de ambiente", flow: "Música original mais camadas de ambiente independentes" },
    { feature: "Timer", them: "Ferramentas disponíveis no Noisli", flow: "Padrões 25/5, 50/10, blocos longos e personalizados" },
    { feature: "Música", them: "O ambiente é o foco principal", flow: "Faixas instrumentais originais integradas ao timer" },
    { feature: "Tarefas", them: "Não são o centro da mistura sonora", flow: "Tarefa visível e planejamento dentro da sessão" },
    { feature: "Cenas", them: "Interface centrada nas misturas", flow: "Cenas opcionais junto com música e ambiente" },
    { feature: "Estatísticas", them: "Recursos próprios do Noisli", flow: "Minutos e sessões realmente medidos" },
  ], whenHeading: "Quando o Noisli pode ser a melhor escolha", whenParagraphs: ["Se você só procura uma mistura de sons de fundo, o Noisli pode ser uma solução mais direta.", "O Flow é mais adequado quando você quer ligar esse ambiente a música original, uma tarefa visível, timer e histórico de sessões."] }),
};

export function getEsPtAlternativeCopy(locale: string, slug: AlternativeSlug): AlternativeCopy | undefined {
  if (locale === "es-MX") return esMx[slug];
  if (locale === "es-ES") return esEs[slug];
  if (locale === "pt-BR") return ptBr[slug];
  return undefined;
}
