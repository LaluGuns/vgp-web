import type { CreatorGenreContent } from "@/lib/creator-music/content";
import type { MusicLandingCopy } from "@/lib/translations/pages/pomodoro-timer-with-music";
import { esPtMarketRouteCopy, type EsPtMarketLocale } from "./es-pt-market-copy.ts";

type CreatorRootCopy = {
  title: string; description: string; h1: string; intro: string;
  catalogHeading: string; licenseHeading: string; licenseSteps: string[];
};

type CreatorLicenseCopy = {
  title: string; description: string; h1: string; intro: string;
  allowedHeading: string; allowed: string[]; notAllowedHeading: string; notAllowed: string[];
  attributionHeading: string; attributionBody: string; finePrint: string;
  faq: { q: string; a: string }[];
};

export type EsPtCreatorUiCopy = {
  creatorCatalog: string; findTrack: string; eligibleTracks: string; previewPro: string;
  listenSpotify: string; search: string; searchLabel: string; unlock: string; ready: string;
  checking: string; acceptFirst: string; clickwrap: string; readTerms: string; licensedTo: string;
  grantReady: string; seePro: string; matching: string; previewDownload: string; noMatch: string;
  copyAttribution: string; copied: string; allCreatorMusic: string; readTermsCta: string;
  pairTimer: string; browseEligible: string; tracks: string; downloadMp3: string;
  downloadPdf: string; unlockTrack: string;
};

export type EsPtPricingCopy = {
  monthly: string; yearly: string; bestValue: string; button: string; secure: string;
  sounds: string; scenes: string; music: string; support: string; saveYearly: string;
  supportUnlocks: string; title: string; description: string; invalidPromo: string;
  promoApplied: string; promoCode: string; promoPlaceholder: string;
};

const route = (locale: EsPtMarketLocale, path: string) => {
  const copy = esPtMarketRouteCopy(locale, path);
  if (!copy) throw new Error(`Missing ${locale} route copy: ${path}`);
  return copy;
};

const creatorRoot: Record<EsPtMarketLocale, CreatorRootCopy> = {
  "es-MX": {
    title: "174 pistas para creadores: City Pop, Cyberpunk Jazz y Neo Synthwave",
    description: "Música para videos y transmisiones: 49 pistas City Pop, 43 Cyberpunk Jazz y 82 Neo Synthwave. Lofi no está incluido.",
    h1: "174 pistas originales para obras de creadores",
    intro: "El catálogo elegible suma 174 pistas: 49 City Pop, 43 Cyberpunk Jazz y 82 Neo Synthwave. Lofi está excluido. Necesitas Flow Pro activo para cada nueva autorización de licencia y descarga.",
    catalogHeading: "Explora el catálogo para creadores",
    licenseHeading: "Cómo obtener la licencia",
    licenseSteps: ["Mantén Flow Pro activo.", "Acepta los términos y genera la autorización de licencia de la pista en Flow.", "Descarga la pista e incluye la atribución obligatoria."],
  },
  "es-ES": {
    title: "174 pistas para creadores: City Pop, Cyberpunk Jazz y Neo Synthwave",
    description: "Música para vídeos y directos: 49 pistas City Pop, 43 Cyberpunk Jazz y 82 Neo Synthwave. Lofi no está incluido.",
    h1: "174 pistas originales para obras de creadores",
    intro: "El catálogo elegible suma 174 pistas: 49 City Pop, 43 Cyberpunk Jazz y 82 Neo Synthwave. Lofi está excluido. Necesitas Flow Pro activo para cada nueva licencia y descarga.",
    catalogHeading: "Explora el catálogo para creadores",
    licenseHeading: "Cómo obtener la licencia",
    licenseSteps: ["Mantén Flow Pro activo.", "Acepta los términos y genera la licencia de la pista en Flow.", "Descarga la pista e incluye la atribución obligatoria."],
  },
  "pt-BR": {
    title: "174 faixas para criadores: City Pop, Cyberpunk Jazz e Neo Synthwave",
    description: "Música para vídeos e lives: 49 faixas City Pop, 43 Cyberpunk Jazz e 82 Neo Synthwave. Lofi não está incluído.",
    h1: "174 faixas originais para obras de criadores",
    intro: "O catálogo elegível soma 174 faixas: 49 City Pop, 43 Cyberpunk Jazz e 82 Neo Synthwave. Lofi está excluído. Você precisa de Flow Pro ativo para cada nova licença e download.",
    catalogHeading: "Explore o catálogo para criadores",
    licenseHeading: "Como obter a licença",
    licenseSteps: ["Mantenha o Flow Pro ativo.", "Aceite os termos e gere a licença da faixa no Flow.", "Baixe a faixa e inclua a atribuição obrigatória."],
  },
};

const genreCopy: Record<EsPtMarketLocale, CreatorGenreContent[]> = {
  "es-MX": [
    { slug: "city-pop", genre: "City Pop", title: "49 pistas de City Pop para videos", description: "City Pop para videos, transmisiones y ediciones creativas. Cada nueva autorización y descarga requiere Flow Pro activo.", h1: "49 pistas de City Pop para tus videos", intro: "Acordes cálidos, una línea de bajo con aire nocturno y ritmo pulido en 49 pistas elegibles para videos, podcasts y transmisiones.", useCases: ["Ediciones retro e inspiradas en anime", "Vlogs de viaje y visuales nocturnos", "Videos de diseño, estilo de vida y proceso creativo"], primaryQuery: "música City Pop para videos" },
    { slug: "cyberpunk-jazz", genre: "Cyberpunk Jazz", title: "43 pistas de Cyberpunk Jazz para transmisiones", description: "Cyberpunk Jazz para transmisiones, videos futuristas y escenas nocturnas. Cada nueva autorización y descarga requiere Flow Pro activo.", h1: "43 pistas de Cyberpunk Jazz para proyectos futuristas", intro: "Acordes noir, textura digital y ritmo nocturno en 43 pistas elegibles para tecnología, gráficos animados y transmisiones.", useCases: ["Ambiente cyberpunk y visuales futuristas", "Tutoriales de tecnología y programación en directo", "Transmisiones nocturnas y gráficos animados"], primaryQuery: "música Cyberpunk Jazz para transmisiones" },
    { slug: "neo-synthwave", genre: "Neo Synthwave", title: "82 pistas de Neo Synthwave para videos de programación", description: "Neo Synthwave para videos, transmisiones y contenido de tecnología. Cada nueva autorización y descarga requiere Flow Pro activo.", h1: "82 pistas de Neo Synthwave para programación y tecnología", intro: "Sintetizadores en movimiento y pulso electrónico limpio en 82 pistas elegibles para demostraciones, videos sobre desarrollo y sesiones de programación.", useCases: ["Videos de programación y transmisiones de desarrollo", "Demostraciones de producto y reseñas de tecnología", "Gráficos animados futuristas y diarios de desarrollo"], primaryQuery: "Neo Synthwave para videos de programación" },
  ],
  "es-ES": [
    { slug: "city-pop", genre: "City Pop", title: "49 pistas de City Pop para vídeos", description: "City Pop para vídeos, directos y montajes creativos. Las nuevas licencias y descargas requieren Flow Pro activo.", h1: "49 pistas de City Pop para tus vídeos", intro: "Acordes cálidos, líneas de bajo suaves y ritmo pulido en 49 pistas elegibles para vídeos, pódcast y directos.", useCases: ["Montajes retro e inspirados en anime", "Vlogs de viaje y escenas nocturnas", "Vídeos de diseño, estilo de vida y procesos creativos"], primaryQuery: "música City Pop para vídeos" },
    { slug: "cyberpunk-jazz", genre: "Cyberpunk Jazz", title: "43 pistas de Cyberpunk Jazz para directos", description: "Cyberpunk Jazz para directos, vídeos futuristas y escenas nocturnas. Las nuevas licencias y descargas requieren Flow Pro activo.", h1: "43 pistas de Cyberpunk Jazz para proyectos futuristas", intro: "Acordes noir, textura digital y ritmo nocturno en 43 pistas elegibles para tecnología, gráficos animados y directos.", useCases: ["Ambiente cyberpunk y escenas futuristas", "Divulgación tecnológica y programación en directo", "Directos nocturnos y gráficos animados"], primaryQuery: "música Cyberpunk Jazz para directos" },
    { slug: "neo-synthwave", genre: "Neo Synthwave", title: "82 pistas de Neo Synthwave para vídeos de programación", description: "Neo Synthwave para vídeos, directos y contenido tecnológico. Las nuevas licencias y descargas requieren Flow Pro activo.", h1: "82 pistas de Neo Synthwave para programación y tecnología", intro: "Sintetizadores con impulso y pulso electrónico limpio en 82 pistas elegibles para demostraciones, vídeos sobre desarrollo y sesiones de programación.", useCases: ["Vídeos de programación y directos de desarrollo", "Demostraciones de producto y análisis de tecnología", "Gráficos animados futuristas y diarios de desarrollo"], primaryQuery: "Neo Synthwave para vídeos de programación" },
  ],
  "pt-BR": [
    { slug: "city-pop", genre: "City Pop", title: "49 faixas de City Pop para vídeos", description: "City Pop para vídeos, lives e edições criativas. Novas licenças e downloads exigem Flow Pro ativo.", h1: "49 faixas de City Pop para os seus vídeos", intro: "Acordes quentes, linha de baixo com clima noturno e ritmo polido em 49 faixas elegíveis para vídeos, podcasts e lives.", useCases: ["Edições retrô e inspiradas em anime", "Vlogs de viagem e cenas noturnas", "Vídeos de design, estilo de vida e processo criativo"], primaryQuery: "música City Pop para vídeos" },
    { slug: "cyberpunk-jazz", genre: "Cyberpunk Jazz", title: "43 faixas de Cyberpunk Jazz para lives", description: "Cyberpunk Jazz para lives, vídeos futuristas e cenas noturnas. Novas licenças e downloads exigem Flow Pro ativo.", h1: "43 faixas de Cyberpunk Jazz para projetos futuristas", intro: "Acordes noir, textura digital e ritmo noturno em 43 faixas elegíveis para tecnologia, gráficos animados e lives.", useCases: ["Ambiente cyberpunk e cenas futuristas", "Conteúdo de tecnologia e programação ao vivo", "Lives noturnas e gráficos animados"], primaryQuery: "música Cyberpunk Jazz para lives" },
    { slug: "neo-synthwave", genre: "Neo Synthwave", title: "82 faixas de Neo Synthwave para vídeos de programação", description: "Neo Synthwave para vídeos, lives e conteúdo de tecnologia. Novas licenças e downloads exigem Flow Pro ativo.", h1: "82 faixas de Neo Synthwave para programação e tecnologia", intro: "Sintetizadores em movimento e pulso eletrônico limpo em 82 faixas elegíveis para demonstrações, vídeos sobre desenvolvimento e sessões de programação.", useCases: ["Vídeos de programação e lives de desenvolvimento", "Demonstrações de produto e análises de tecnologia", "Gráficos animados futuristas e diários de desenvolvimento"], primaryQuery: "Neo Synthwave para vídeos de programação" },
  ],
};

const licenseCopy: Record<EsPtMarketLocale, CreatorLicenseCopy> = {
  "es-MX": {
    title: "Licencia de música para creadores de Flow Pro", description: "Condiciones para usar 174 pistas elegibles como música de fondo. Lofi está excluido.", h1: "Licencia de música para creadores de Flow Pro",
    intro: "Con Flow Pro activo puedes obtener autorizaciones para usar las 174 pistas elegibles como música de fondo en Obras de Creador. La licencia es no exclusiva e intransferible y no transfiere propiedad ni derechos de autor.",
    allowedHeading: "Usos permitidos", allowed: ["Música de fondo en videos monetizados, transmisiones, podcasts, study-with-me y contenido de programación.", "Vistas y reproducciones sin límite declarado en Obras de Creador correctamente licenciadas.", "Obras publicadas por primera vez mientras Pro estaba activo, con un Grant Record válido para cada pista y cumpliendo las condiciones; después de una cancelación normal, esas obras conservan su licencia."],
    notAllowedHeading: "Usos no permitidos", notAllowed: ["Registrar la pista, una obra derivada o su huella de audio en Content ID u otro sistema de gestión de derechos.", "Subir, revender, sublicenciar o redistribuir el archivo de audio como música independiente.", "Reclamar propiedad, samplear, remezclar, crear una canción derivada o distribuir la pista en un DSP a tu nombre.", "Incluirla en un banco de audio, plantilla o app sin una licencia escrita independiente.", "Usarla en una película, videojuego o trabajo para un cliente sin una licencia escrita independiente."],
    attributionHeading: "La atribución es obligatoria", attributionBody: "Incluye la línea que aparece abajo en la descripción del video, panel de la transmisión o notas del podcast:",
    finePrint: "Flow Pro activo es necesario para cada nueva autorización de licencia y descarga. Escuchar en Spotify o YouTube no concede derechos. La licencia publicada y la autorización válida de cada pista rigen el uso.",
    faq: [{ q: "¿Necesito Flow Pro?", a: "Sí. Cada nueva autorización y descarga de una pista elegible requiere Flow Pro activo." }, { q: "¿Qué pasa si cancelo Pro?", a: "Las Obras de Creador publicadas por primera vez mientras Pro estaba activo conservan su licencia si existía un Grant Record válido para cada pista y se cumplieron las condiciones. Para una obra nueva, reactiva Pro y obtén otra autorización." }, { q: "¿Puedo registrar la música en Content ID?", a: "No. Tampoco puedes reclamar propiedad, transferir la licencia ni redistribuir la música por separado." }],
  },
  "es-ES": {
    title: "Licencia de música para creadores de Flow Pro", description: "Condiciones para utilizar 174 pistas elegibles como música de fondo. Lofi está excluido.", h1: "Licencia de música para creadores de Flow Pro",
    intro: "Con Flow Pro activo puedes obtener licencias para utilizar las 174 pistas elegibles como música de fondo en Obras de Creador. La licencia es no exclusiva e intransferible y no cede la propiedad ni los derechos de autor.",
    allowedHeading: "Usos permitidos", allowed: ["Música de fondo en vídeos monetizados, directos, pódcast, study-with-me y contenido de programación.", "Visualizaciones y reproducciones sin límite declarado en Obras de Creador correctamente licenciadas.", "Obras publicadas por primera vez mientras Pro estaba activo, con una autorización de licencia válida para cada pista y cumpliendo las condiciones; tras una cancelación normal, esas obras conservan la licencia."],
    notAllowedHeading: "Usos no permitidos", notAllowed: ["Registrar la pista, una obra derivada o su huella de audio en Content ID u otro sistema de gestión de derechos.", "Subir, revender, sublicenciar o redistribuir el archivo de audio como música independiente.", "Reclamar la propiedad, samplear, remezclar, crear una canción derivada o distribuir la pista en un DSP a tu nombre.", "Incluirla en un banco de audio, una plantilla o una aplicación sin una licencia escrita independiente.", "Utilizarla en una película, un videojuego o un trabajo para un cliente sin una licencia escrita independiente."],
    attributionHeading: "La atribución es obligatoria", attributionBody: "Incluye la línea inferior en la descripción del vídeo, el panel del directo o las notas del pódcast:",
    finePrint: "Flow Pro activo es necesario para cada nueva autorización de licencia y descarga. Escuchar en Spotify o YouTube no concede derechos. La licencia publicada y la autorización válida para cada pista rigen el uso.",
    faq: [{ q: "¿Necesito Flow Pro?", a: "Sí. Cada nueva autorización y descarga de una pista elegible requiere Flow Pro activo." }, { q: "¿Qué ocurre si cancelo Pro?", a: "Las Obras de Creador publicadas por primera vez mientras Pro estaba activo conservan la licencia si existía una autorización válida para cada pista y se cumplieron las condiciones. Para una obra nueva, reactiva Pro y obtén otra autorización." }, { q: "¿Puedo registrar la música en Content ID?", a: "No. Tampoco puedes reclamar la propiedad, transferir la licencia ni redistribuir la música por separado." }],
  },
  "pt-BR": {
    title: "Licença de música para criadores do Flow Pro", description: "Condições para usar 174 faixas elegíveis como música de fundo. Lofi está excluído.", h1: "Licença de música para criadores do Flow Pro",
    intro: "Com o Flow Pro ativo, você pode obter licenças para usar as 174 faixas elegíveis como música de fundo em Obras de Criador. A licença é não exclusiva e intransferível e não transfere propriedade nem direitos autorais.",
    allowedHeading: "Usos permitidos", allowed: ["Música de fundo em vídeos monetizados, lives, podcasts, study-with-me e conteúdo de programação.", "Visualizações e reproduções sem limite declarado em Obras de Criador devidamente licenciadas.", "Obras publicadas pela primeira vez enquanto o Pro estava ativo, com uma licença emitida válida para cada faixa e em conformidade com os termos; depois de um cancelamento normal, essas obras continuam licenciadas."],
    notAllowedHeading: "Usos não permitidos", notAllowed: ["Registrar a faixa, uma obra derivada ou a impressão digital do áudio no Content ID ou em outro sistema de gestão de direitos.", "Enviar, revender, sublicenciar ou redistribuir o arquivo de áudio como música avulsa.", "Alegar propriedade, samplear, remixar, criar uma música derivada ou distribuir a faixa em um DSP no seu nome.", "Incluir a faixa em banco de áudio, modelo ou aplicativo sem uma licença escrita independente.", "Usar a faixa em filme, videogame ou trabalho para cliente sem uma licença escrita independente."],
    attributionHeading: "A atribuição é obrigatória", attributionBody: "Inclua a linha abaixo na descrição do vídeo, no painel da live ou nas notas do podcast:",
    finePrint: "O Flow Pro ativo é necessário para cada nova licença e download. Ouvir no Spotify ou YouTube não concede direitos. A licença publicada e uma licença emitida válida para cada faixa regem o uso.",
    faq: [{ q: "Preciso do Flow Pro?", a: "Sim. Cada nova licença e download de uma faixa elegível exige Flow Pro ativo." }, { q: "O que acontece se eu cancelar o Pro?", a: "Obras de Criador publicadas pela primeira vez enquanto o Pro estava ativo continuam licenciadas se havia uma licença emitida válida para cada faixa e os termos foram cumpridos. Para uma obra nova, reative o Pro e obtenha outra licença." }, { q: "Posso registrar a música no Content ID?", a: "Não. Você também não pode alegar propriedade, transferir a licença nem redistribuir a música separadamente." }],
  },
};

const ui: Record<EsPtMarketLocale, EsPtCreatorUiCopy> = {
  "es-MX": { creatorCatalog: "Catálogo para creadores", findTrack: "Encuentra una pista para tu próxima obra", eligibleTracks: "pistas elegibles", previewPro: "La escucha previa está abierta; las descargas requieren Flow Pro activo.", listenSpotify: "Escuchar en Spotify (no concede derechos)", search: "Buscar por título, artista o género", searchLabel: "Buscar música para creadores", unlock: "Habilitar descargas Pro", ready: "Licencia lista", checking: "Verificando Pro…", acceptFirst: "Primero acepta la licencia de música para creadores.", clickwrap: "Leí y acepto la Licencia de Música para Creadores creator-license-2026-07-21. Entiendo que la atribución es obligatoria, que la música no se puede redistribuir de forma independiente y que no puedo registrar la pista ni su huella en Content ID o un sistema similar.", readTerms: "Leer los términos completos", licensedTo: "Titular de la licencia (nombre o canal)", grantReady: "La licencia está lista. Ya puedes descargar la pista y el certificado PDF.", seePro: "Ver Flow Pro", matching: "pistas coincidentes", previewDownload: "Escuchar / descargar MP3 y PDF", noMatch: "No hay pistas elegibles que coincidan con la búsqueda.", copyAttribution: "Copiar atribución", copied: "Copiado", allCreatorMusic: "Toda la música para creadores", readTermsCta: "Leer la licencia", pairTimer: "Usarla con un temporizador de enfoque", browseEligible: "Explorar música elegible", tracks: "pistas", downloadMp3: "Descargar MP3", downloadPdf: "Descargar licencia PDF", unlockTrack: "Habilitar descarga con Flow Pro" },
  "es-ES": { creatorCatalog: "Catálogo para creadores", findTrack: "Encuentra una pista para tu próxima obra", eligibleTracks: "pistas elegibles", previewPro: "La escucha previa está abierta; las descargas requieren Flow Pro activo.", listenSpotify: "Escuchar en Spotify (no concede derechos)", search: "Buscar por título, artista o género", searchLabel: "Buscar música para creadores", unlock: "Activar descargas Pro", ready: "Licencia lista", checking: "Comprobando Pro…", acceptFirst: "Primero debes aceptar la licencia de música para creadores.", clickwrap: "He leído y acepto la Licencia de Música para Creadores creator-license-2026-07-21. Entiendo que la atribución es obligatoria, que la música no puede redistribuirse de forma independiente y que no puedo registrar la pista ni su huella en Content ID o un sistema similar.", readTerms: "Leer todos los términos", licensedTo: "Titular de la licencia (nombre o canal)", grantReady: "La licencia está lista. Ya puedes descargar la pista y el certificado PDF.", seePro: "Ver Flow Pro", matching: "pistas coincidentes", previewDownload: "Escuchar / descargar MP3 y PDF", noMatch: "No hay pistas elegibles que coincidan con la búsqueda.", copyAttribution: "Copiar atribución", copied: "Copiado", allCreatorMusic: "Toda la música para creadores", readTermsCta: "Leer la licencia", pairTimer: "Combinarla con un temporizador de concentración", browseEligible: "Explorar música elegible", tracks: "pistas", downloadMp3: "Descargar MP3", downloadPdf: "Descargar licencia PDF", unlockTrack: "Activar descarga con Flow Pro" },
  "pt-BR": { creatorCatalog: "Catálogo para criadores", findTrack: "Encontre uma faixa para a sua próxima obra", eligibleTracks: "faixas elegíveis", previewPro: "A prévia está aberta; downloads exigem Flow Pro ativo.", listenSpotify: "Ouvir no Spotify (não concede direitos)", search: "Buscar por título, artista ou gênero", searchLabel: "Buscar música para criadores", unlock: "Liberar downloads Pro", ready: "Licença pronta", checking: "Verificando o Pro…", acceptFirst: "Aceite primeiro a licença de música para criadores.", clickwrap: "Li e aceito a Licença de Música para Criadores creator-license-2026-07-21. Entendo que a atribuição é obrigatória, que a música não pode ser redistribuída separadamente e que não posso registrar a faixa nem sua impressão digital no Content ID ou em sistema semelhante.", readTerms: "Ler os termos completos", licensedTo: "Titular da licença (nome ou canal)", grantReady: "A licença está pronta. Agora você pode baixar a faixa e o certificado em PDF.", seePro: "Ver o Flow Pro", matching: "faixas encontradas", previewDownload: "Ouvir / baixar MP3 e PDF", noMatch: "Nenhuma faixa elegível corresponde à busca.", copyAttribution: "Copiar atribuição", copied: "Copiado", allCreatorMusic: "Todas as músicas para criadores", readTermsCta: "Ler a licença", pairTimer: "Usar com um timer de foco", browseEligible: "Explorar músicas elegíveis", tracks: "faixas", downloadMp3: "Baixar MP3", downloadPdf: "Baixar licença em PDF", unlockTrack: "Liberar download com Flow Pro" },
};

const grantErrors: Record<EsPtMarketLocale, Record<string, string>> = {
  "es-MX": { login_required: "Inicia sesión y vuelve a esta página para generar la licencia.", active_pro_required: "Las descargas para creadores requieren Flow Pro activo.", creator_license_not_enabled: "Las descargas para creadores no están disponibles en este momento.", terms_acceptance_required: "Acepta la licencia antes de generar la autorización.", terms_version_mismatch: "Los términos cambiaron. Revisa y acepta la versión vigente.", catalog_version_mismatch: "El catálogo cambió. Actualiza la página.", invalid_licensee_name: "Escribe un nombre válido de 2 a 100 caracteres; no uses un correo.", fallback: "No pudimos generar la licencia en este momento. Inténtalo de nuevo más tarde." },
  "es-ES": { login_required: "Inicia sesión y vuelve a esta página para generar la licencia.", active_pro_required: "Las descargas para creadores requieren Flow Pro activo.", creator_license_not_enabled: "Las descargas para creadores no están disponibles en este momento.", terms_acceptance_required: "Acepta la licencia antes de generarla.", terms_version_mismatch: "Los términos han cambiado. Revisa y acepta la versión vigente.", catalog_version_mismatch: "El catálogo ha cambiado. Actualiza la página.", invalid_licensee_name: "Escribe un nombre válido de 2 a 100 caracteres; no utilices un correo electrónico.", fallback: "No hemos podido generar la licencia en este momento. Inténtalo de nuevo más tarde." },
  "pt-BR": { login_required: "Entre na sua conta e volte a esta página para gerar a licença.", active_pro_required: "Downloads para criadores exigem Flow Pro ativo.", creator_license_not_enabled: "Downloads para criadores não estão disponíveis no momento.", terms_acceptance_required: "Aceite a licença antes de gerá-la.", terms_version_mismatch: "Os termos mudaram. Leia e aceite a versão atual.", catalog_version_mismatch: "O catálogo mudou. Atualize a página.", invalid_licensee_name: "Digite um nome válido de 2 a 100 caracteres; não use e-mail.", fallback: "Não foi possível gerar a licença agora. Tente novamente mais tarde." },
};

const pricing: Record<EsPtMarketLocale, EsPtPricingCopy> = {
  "es-MX": { monthly: "Mensual", yearly: "Anual", bestValue: "mejor opción", button: "Continuar", secure: "Pago seguro con Lemon Squeezy (Merchant of Record). El importe, la moneda y las condiciones finales aparecen en el checkout.", sounds: "Sonidos ambientales adicionales: fuego y lluvia, río, cascada, ciudad y vinilo", scenes: "Todas las escenas visuales y temas", music: "Música original nueva cada mes", support: "Cada tema aquí lo hace un solo productor — Pro mantiene el catálogo creciendo", saveYearly: "Compara el ahorro anual con el precio mensual mostrado", supportUnlocks: "Pro te da", title: "Elige un plan", description: "Acceso completo a los 295 temas originales, todos los sonidos ambientales y escenas visuales — con música nueva cada mes, más descargas elegibles para creadores mientras Pro esté activo.", invalidPromo: "El código promocional no es válido", promoApplied: "Código promocional aplicado", promoCode: "¿Tienes un código promocional?", promoPlaceholder: "Ingresa el código" },
  "es-ES": { monthly: "Mensual", yearly: "Anual", bestValue: "mejor opción", button: "Continuar", secure: "Pago seguro mediante Lemon Squeezy (Merchant of Record). El importe, la divisa y las condiciones finales aparecen durante el pago.", sounds: "Sonidos ambientales adicionales: fuego y lluvia, río, cascada, ciudad y vinilo", scenes: "Todas las escenas visuales y temas", music: "Música original nueva cada mes", support: "Cada tema aquí lo hace un solo productor — Pro mantiene el catálogo en crecimiento", saveYearly: "Compara el ahorro anual con el precio mensual mostrado", supportUnlocks: "Pro te da", title: "Escoge un plan", description: "Acceso completo a los 295 temas originales, todos los sonidos ambientales y escenas visuales — con música nueva cada mes, más descargas elegibles para creadores mientras Pro esté activo.", invalidPromo: "El código promocional no es válido", promoApplied: "Código promocional aplicado", promoCode: "¿Tienes un código promocional?", promoPlaceholder: "Introduce el código" },
  "pt-BR": { monthly: "Mensal", yearly: "Anual", bestValue: "melhor opção", button: "Continuar", secure: "Pagamento seguro pelo Lemon Squeezy (Merchant of Record). O valor, a moeda e as condições finais aparecem no checkout.", sounds: "Sons de ambiente extras: fogo e chuva, rio, cachoeira, cidade e vinil", scenes: "Todas as cenas visuais e temas", music: "Música original nova todo mês", support: "Cada faixa aqui é feita por um único produtor — o Pro mantém o catálogo crescendo", saveYearly: "Compare a economia anual com o preço mensal exibido", supportUnlocks: "O Pro te dá", title: "Escolha um plano", description: "Acesso completo às 295 faixas originais, todos os sons de ambiente e cenas visuais — com música nova todo mês, além de downloads elegíveis para criadores enquanto o Pro estiver ativo.", invalidPromo: "O código promocional não é válido", promoApplied: "Código promocional aplicado", promoCode: "Tem um código promocional?", promoPlaceholder: "Digite o código" },
};

export function esPtCreatorMusicCopy(locale: string): CreatorRootCopy | undefined {
  return locale in creatorRoot ? creatorRoot[locale as EsPtMarketLocale] : undefined;
}

export function esPtCreatorGenres(locale: string): CreatorGenreContent[] | undefined {
  return locale in genreCopy ? genreCopy[locale as EsPtMarketLocale] : undefined;
}

export function esPtCreatorLicenseCopy(locale: string): CreatorLicenseCopy | undefined {
  return locale in licenseCopy ? licenseCopy[locale as EsPtMarketLocale] : undefined;
}

export function esPtCreatorUiCopy(locale: string): EsPtCreatorUiCopy | undefined {
  return locale in ui ? ui[locale as EsPtMarketLocale] : undefined;
}

export function esPtCreatorGrantErrorCopy(locale: string, code: string): string | undefined {
  if (!(locale in grantErrors)) return undefined;
  const messages = grantErrors[locale as EsPtMarketLocale];
  return messages[code] ?? messages.fallback;
}

export function esPtPricingCopy(locale: string): EsPtPricingCopy | undefined {
  return locale in pricing ? pricing[locale as EsPtMarketLocale] : undefined;
}

export function esPtPomodoroMusicCopy(locale: string): MusicLandingCopy | undefined {
  if (!(locale === "es-MX" || locale === "es-ES" || locale === "pt-BR")) return undefined;
  const seo = route(locale, "pomodoro-timer-with-music");
  if (locale === "pt-BR") return {
    metaTitle: seo.metaTitle, metaDescription: seo.metaDescription, h1: seo.h1, paragraphs: seo.paragraphs,
    musicHeading: "Música produzida para o Flow, não encontrada para preencher uma playlist",
    musicParagraphs: ["A biblioteca reúne faixas instrumentais originais produzidas internamente para acompanhar blocos de foco. Elas não são geradas por IA nem reutilizadas de um banco de áudio.", "Música e timer funcionam no mesmo espaço, e o mixer permite combinar chuva, café, fogo e outras camadas em volumes independentes. Ouvir aqui, no Spotify ou no YouTube não concede direitos de uso em obras de criadores."],
    genresLabel: "Na biblioteca de foco", genres: ["Lofi", "Synthwave", "City Pop", "Cyberpunk Jazz", "Ambiente"], faq: seo.faq,
  };
  const spain = locale === "es-ES";
  return {
    metaTitle: seo.metaTitle, metaDescription: seo.metaDescription, h1: seo.h1, paragraphs: seo.paragraphs,
    musicHeading: spain ? "Música producida para Flow, no escogida para rellenar una lista" : "Música producida para Flow, no encontrada para rellenar una playlist",
    musicParagraphs: spain
      ? ["La biblioteca reúne pistas instrumentales originales producidas internamente para acompañar bloques de concentración. No se generan con IA ni se reutilizan desde un banco de audio.", "La música y el temporizador funcionan en el mismo espacio, y el mezclador permite combinar lluvia, cafetería, fuego y otras capas con volúmenes independientes. Escuchar aquí, en Spotify o en YouTube no concede derechos para obras de creadores."]
      : ["La biblioteca reúne pistas instrumentales originales producidas internamente para acompañar bloques de enfoque. No se generan con IA ni se reutilizan desde un banco de audio.", "La música y el temporizador funcionan en el mismo espacio, y el mezclador permite combinar lluvia, café, fuego y otras capas con volúmenes independientes. Escuchar aquí, en Spotify o en YouTube no concede derechos para obras de creadores."],
    genresLabel: spain ? "En la biblioteca de concentración" : "En la biblioteca de enfoque", genres: ["Lofi", "Synthwave", "City Pop", "Cyberpunk Jazz", "Ambiental"], faq: seo.faq,
  };
}
