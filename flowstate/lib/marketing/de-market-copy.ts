import type { FaqItem } from "./seo";
import type { MarketRouteCopy, MarketSharedCopy } from "./market-copy";
import type { AlternativeCopy, AlternativeSlug } from "@/lib/translations/pages/alternatives";
import type { CreatorGenreContent } from "@/lib/creator-music/content";

/**
 * Native German product copy for the de-DE search release.
 *
 * Keep this module independent from the regional-copy generator. It contains
 * the complete page-level copy that otherwise falls back to English: route
 * copy, comparison tables, Creator Music UI and the licence summary.
 */

export const DE_MARKET_SHARED_COPY: MarketSharedCopy = {
  breadcrumbHome: "Startseite",
  breadcrumbTimers: "Fokus-Timer",
  faqHeading: "Häufige Fragen",
  otherTimersHeading: "Weitere Timer und Fokus-Tools",
  ctaTitle: "Deine komplette Fokusumgebung",
  ctaBody:
    "Kombiniere den Timer mit eigens produzierter Fokusmusik, einzeln regelbaren Umgebungsgeräuschen, Aufgaben und gemessenen Sitzungsstatistiken.",
  ctaButton: "Flow kostenlos öffnen",
  work: "Fokus",
  break: "Pause",
  start: "Starten",
  pause: "Pausieren",
  reset: "Zurücksetzen",
  skip: "Überspringen",
  timerCaption: "Läuft direkt in deinem Browser.",
  openApp: "App öffnen",
  presetTemplate: "{work} Min. Fokus · {break} Min. Pause",
};

export const DE_LEGAL_REVIEW_NOTICE =
  "Diese deutsche Seite fasst den Produktablauf und die wichtigsten Nutzungsgrenzen verständlich zusammen. Sie ist keine rechtsverbindliche Übersetzung. Maßgeblich sind die veröffentlichten Lizenzbedingungen und die für den jeweiligen Titel ausgestellte Lizenzfreigabe.";

const route = (
  metaTitle: string,
  metaDescription: string,
  h1: string,
  paragraphs: string[],
  faq: FaqItem[],
  legalReviewNotice?: string,
): MarketRouteCopy => ({
  metaTitle,
  metaDescription,
  h1,
  paragraphs,
  faq,
  ...(legalReviewNotice ? { legalReviewNotice } : {}),
});

export const DE_MARKET_ROUTE_COPY: Record<string, MarketRouteCopy> = {
  "": route(
    "Fokus-Timer mit Musik für Arbeit und Lernen | Flow",
    "Starte konzentrierte Arbeits- und Lernphasen mit einem kostenlosen Browser-Timer, eigens produzierter Musik und regelbaren Umgebungsgeräuschen.",
    "Fokus-Timer und Musik in einer ruhigen Arbeitsumgebung",
    [
      "Mach aus der nächsten Aufgabe einen klar abgegrenzten Fokusblock. Flow vereint Timer, eigens produzierte Instrumentalmusik und einen Ambient-Mixer in einem Browser-Tab.",
      "Du kannst ohne Registrierung kostenlos starten und zwischen kurzen Pomodoro-Einheiten und längeren Arbeitsphasen wählen. Flow Pro erweitert Musikbibliothek und Szenen, verspricht aber keine automatische Produktivitätssteigerung.",
    ],
    [
      {
        q: "Kann ich Flow ohne Konto ausprobieren?",
        a: "Ja. Der öffentliche Fokus-Timer läuft kostenlos im Browser. Ein Konto ist erst für Funktionen nötig, die kontobezogene Daten oder Musikfreigaben speichern.",
      },
      {
        q: "Eignet sich Flow für Arbeit und Studium?",
        a: "Ja. Du kannst damit Schreib-, Programmier- und Kreativaufgaben ebenso strukturieren wie Lektüre, Übungsaufgaben oder Prüfungsvorbereitung. Die passende Sitzungsdauer bestimmst du selbst.",
      },
    ],
  ),
  pricing: route(
    "Flow Pro: Preise und Leistungsumfang | Flow",
    "Vergleiche Flow Free und Flow Pro für die vollständige Musikbibliothek, zusätzliche Szenen und Freigaben aus dem Creator-Music-Katalog.",
    "Der passende Flow-Tarif für deine Routine",
    [
      "Der kostenlose Tarif enthält den Browser-Timer und einen Teil der Fokusumgebung. Flow Pro schaltet die vollständige Musikbibliothek, weitere Szenen und den Zugang zu Freigaben für berechtigte Creator-Music-Titel frei.",
      "Aktuelle Preise, Abrechnungswährung und Zahlungsbedingungen werden auf der Preis- und Checkout-Seite angezeigt. Für neue Musikfreigaben und Downloads muss Flow Pro aktiv sein; bloßes Hören auf Spotify oder YouTube verleiht keine Nutzungsrechte.",
    ],
    [
      {
        q: "Brauche ich Flow Pro, um den Timer zu testen?",
        a: "Nein. Der öffentliche Timer ist kostenlos verfügbar. Pro richtet sich an Nutzerinnen und Nutzer, die die komplette Bibliothek, zusätzliche Szenen und Creator-Music-Freigaben möchten.",
      },
      {
        q: "Darf ich mit Pro automatisch jeden gehörten Titel in Videos verwenden?",
        a: "Nein. Erlaubt sind nur die 174 berechtigten Titel aus City Pop, Cyberpunk Jazz und Neo Synthwave. Für die Nutzung brauchst du bei aktivem Pro eine titelbezogene Freigabe und musst die vorgeschriebene Quellenangabe setzen. Lofi ist ausgeschlossen.",
      },
    ],
  ),
  "deep-work-timer": route(
    "Deep-Work-Timer für konzentrierte Arbeitsphasen | Flow",
    "Plane längere Fokusblöcke mit einem kostenlosen Deep-Work-Timer, Originalmusik, Ambient-Sounds und praktischen 50/10- oder 90/15-Presets.",
    "Ein Deep-Work-Timer für Aufgaben, die Ruhe brauchen",
    [
      "Reserviere einen längeren Block für Code, Texte, Gestaltung oder Analyse. Flow hält Countdown, aktuelle Aufgabe, Instrumentalmusik und Umgebungsgeräusche an einem Ort zusammen.",
      "50/10 ist ein praktikabler Einstieg für längere Schreibtischarbeit; 90/15 passt nur, wenn Aufgabe und Tagesablauf einen so langen Block tragen. Beide Varianten sind Arbeitsvorlagen, keine medizinische Empfehlung und kein biologisches Optimum.",
    ],
    [
      {
        q: "Welche Dauer eignet sich für Deep Work?",
        a: "Beginne zum Beispiel mit 50 Minuten Fokus und 10 Minuten Pause. Verlängere oder verkürze den Block je nach Aufgabe, Energie und Zeitplan.",
      },
      {
        q: "Sind 90 Minuten wissenschaftlich für alle optimal?",
        a: "Nein. 90/15 ist nur ein optionales Preset. Es gibt keine universelle Sitzungsdauer, die für jeden Menschen und jede Aufgabe optimal ist.",
      },
    ],
  ),
  "study-timer": route(
    "Lern-Timer mit Musik für Studium und Prüfung | Flow",
    "Teile Lektüre, Hausaufgaben und Prüfungsvorbereitung mit einem kostenlosen Lern-Timer, Instrumentalmusik und optionalen Ambient-Sounds in klare Einheiten.",
    "Ein Lern-Timer für Lektüre, Aufgaben und Prüfungsvorbereitung",
    [
      "Gib einem Kapitel, einem Übungsblatt oder einem Entwurf einen klaren Anfang und ein klares Ende. Timer, Fokusmusik und Ambient-Sounds bleiben dabei in einem Browser-Tab.",
      "Nutze 25/5 für mehrere kleinere Aufgaben oder 50/10, wenn du mehr zusammenhängende Arbeitszeit brauchst. Der Timer misst die Dauer; er verspricht weder bessere Noten noch eine bestimmte Konzentrationswirkung.",
    ],
    [
      {
        q: "Kann ich den Lern-Timer kostenlos verwenden?",
        a: "Ja. Der öffentliche Timer funktioniert ohne Konto im Browser. Flow Pro ergänzt die vollständige Musikbibliothek und zusätzliche visuelle Szenen.",
      },
      {
        q: "Welche Timerlänge passt zum Lernen?",
        a: "Das hängt von Stoff und Aufgabe ab. 25/5 ist oft praktisch für kurze Übungsblöcke; 50/10 gibt dir mehr Zeit für Lektüre, Schreiben oder komplexere Probleme.",
      },
    ],
  ),
  "pomodoro-timer-with-music": route(
    "Pomodoro-Timer mit eigens produzierter Fokusmusik | Flow",
    "Arbeite in Pomodoro-Blöcken mit Instrumentalmusik, regelbaren Ambient-Sounds und einem kostenlosen Browser-Timer ohne Registrierung.",
    "Pomodoro-Timer und Fokusmusik, die zusammengehören",
    [
      "Statt Timer und Playlist auf zwei Tabs zu verteilen, bündelt Flow beides in einer Arbeitsumgebung. Die Instrumentalmusik wurde eigens für Flow produziert; Ambient-Sounds wie Regen, Café oder Feuer lassen sich separat dazumischen.",
      "25/5 ist ein einfacher Ausgangspunkt. Für Aufgaben mit mehr Anlaufzeit kannst du längere Presets oder eigene Zeiten wählen. Pomodoro ist hier eine praktische Planungsmethode, kein Versprechen für Konzentration oder Leistung.",
    ],
    [
      {
        q: "Ist der Pomodoro-Timer kostenlos?",
        a: "Ja. Timer, grundlegende Ambient-Sounds und ein Teil der Musikbibliothek sind kostenlos verfügbar. Flow Pro erweitert Bibliothek und Szenen.",
      },
      {
        q: "Darf ich die Fokusmusik in eigenen Videos verwenden?",
        a: "Nicht allein durch das Anhören. Creator-Nutzung ist auf 174 berechtigte City-Pop-, Cyberpunk-Jazz- und Neo-Synthwave-Titel begrenzt, erfordert aktives Pro für neue Freigaben und Downloads sowie die vorgeschriebene Quellenangabe. Lofi ist nicht enthalten.",
      },
    ],
  ),
  "timer/25-5": route(
    "25/5-Pomodoro-Timer kostenlos im Browser | Flow",
    "Starte einen 25-Minuten-Fokusblock mit 5 Minuten Pause. Kostenloser 25/5-Pomodoro-Timer mit Aufgaben, optionaler Musik und Ambient-Sounds.",
    "25/5-Pomodoro-Timer für kurze, klare Fokusblöcke",
    [
      "Arbeite 25 Minuten an einer klar benannten Aufgabe und plane danach fünf Minuten Pause ein. Das Preset eignet sich als unkomplizierter Einstieg oder für mehrere kleine Aufgaben nacheinander.",
      "Du kannst den Timer kostenlos direkt im Browser starten. Musik und Umgebungsgeräusche sind optional; bei Bedarf wechselst du jederzeit zu einer längeren Sitzung.",
    ],
    [
      {
        q: "Muss ich mich für den 25/5-Timer anmelden?",
        a: "Nein. Der öffentliche Timer startet ohne Konto im Browser.",
      },
      {
        q: "Muss ich exakt nach 25 Minuten aufhören?",
        a: "Nein. 25/5 ist ein Preset, keine Vorschrift. Passe die Länge an Aufgabe, Energie und verfügbaren Zeitraum an.",
      },
    ],
  ),
  "timer/50-10": route(
    "50/10-Fokus-Timer kostenlos im Browser | Flow",
    "Nutze 50 Minuten Fokus und 10 Minuten Pause für längere Schreib-, Lern- oder Programmierblöcke. Kostenlos mit optionaler Musik und Ambient-Sounds.",
    "50/10-Fokus-Timer für längere Arbeitsphasen",
    [
      "Das 50/10-Preset gibt anspruchsvolleren Aufgaben mehr zusammenhängende Zeit, bevor eine zehnminütige Pause beginnt. Es eignet sich etwa für Schreiben, Programmieren, Gestaltung oder konzentrierte Lektüre.",
      "Der Timer läuft kostenlos im Browser und kann mit Musik oder Ambient-Sounds kombiniert werden. Wenn 50 Minuten heute nicht passen, verkürze den Block oder wähle eine eigene Dauer.",
    ],
    [
      {
        q: "Wofür eignet sich der 50/10-Timer?",
        a: "Für Aufgaben, bei denen 25 Minuten zu kurz sind, zum Beispiel längere Textarbeit, komplexe Übungsaufgaben oder Programmierphasen.",
      },
      {
        q: "Ist 50/10 wissenschaftlich besser als 25/5?",
        a: "Nein. Beide sind praktische Arbeitsvorlagen. Entscheidend ist, welche Dauer zu deiner Aufgabe und deinem Tagesablauf passt.",
      },
    ],
  ),
  "creator-music": route(
    "174 Musiktitel für Videos, Podcasts und Streams | Flow",
    "Entdecke 174 berechtigte Creator-Music-Titel: 49 City Pop, 43 Cyberpunk Jazz und 82 Neo Synthwave. Lofi ist ausgeschlossen.",
    "174 Musiktitel für Videos, Podcasts und Streams",
    [
      "Der Creator-Music-Katalog umfasst genau 174 berechtigte Titel: 49 City Pop, 43 Cyberpunk Jazz und 82 Neo Synthwave. Lofi gehört nicht zu diesem Katalog.",
      "Für neue titelbezogene Freigaben und Downloads muss Flow Pro aktiv sein. Die Lizenz ist nicht exklusiv und nicht übertragbar, verlangt eine Quellenangabe und erlaubt keine alleinstehende Weitergabe, Eigentumsbehauptung oder Content-ID-Registrierung.",
    ],
    [
      {
        q: "Welche Flow-Titel sind für Creator-Projekte berechtigt?",
        a: "Ausschließlich die 174 Titel aus City Pop (49), Cyberpunk Jazz (43) und Neo Synthwave (82). Lofi ist ausgeschlossen. Für jeden Einsatz gelten Freigabe, Quellenangabe und veröffentlichte Lizenzbedingungen.",
      },
      {
        q: "Wie viele Creator-Werke darf ich veröffentlichen?",
        a: "Es gibt keine zahlenmäßige Obergrenze für ordnungsgemäß lizenzierte Creator-Werke. Jeder Einsatz muss durch die passende Freigabe gedeckt sein und die vorgeschriebene Quellenangabe enthalten.",
      },
    ],
    DE_LEGAL_REVIEW_NOTICE,
  ),
  "creator-music/city-pop": route(
    "49 City-Pop-Titel als Hintergrundmusik | Flow",
    "Durchsuche 49 berechtigte City-Pop-Titel für ordnungsgemäß lizenzierte Videos, Vlogs, Podcasts und Streams. Neue Freigaben erfordern aktives Flow Pro.",
    "49 City-Pop-Titel für Videos, Vlogs und Streams",
    [
      "Warme Akkorde, Night-Drive-Bässe und klare Rhythmen für Retro-Edits, Reise-Vlogs, Designvideos und entspannte Formate. Dieser Bereich enthält 49 berechtigte Creator-Music-Titel.",
      "Neue Freigaben und Downloads setzen aktives Flow Pro voraus. Die Quellenangabe ist verpflichtend; alleinstehende Weitergabe, Eigentumsbehauptungen und Content-ID-Registrierung sind nicht gestattet.",
    ],
    [
      {
        q: "Sind alle 49 City-Pop-Titel für Creator-Nutzung berechtigt?",
        a: "Sie bilden den berechtigten City-Pop-Teil des aktuellen Creator-Music-Katalogs. Vor der Nutzung brauchst du bei aktivem Pro die titelbezogene Freigabe und musst die veröffentlichte Lizenz samt Quellenangabe einhalten.",
      },
      {
        q: "Reicht es, einen Titel auf Spotify oder YouTube anzuhören?",
        a: "Nein. Streaming oder Anhören verleiht keine Creator-Nutzungsrechte. Beantrage die Freigabe über Flow, solange Pro aktiv ist.",
      },
    ],
    DE_LEGAL_REVIEW_NOTICE,
  ),
  "creator-music/cyberpunk-jazz": route(
    "43 Cyberpunk-Jazz-Titel für Videos und Streams | Flow",
    "Finde 43 berechtigte Cyberpunk-Jazz-Titel für Tech-Videos, Podcasts, futuristische Edits und Livestreams mit titelbezogener Flow-Freigabe.",
    "43 Cyberpunk-Jazz-Titel für futuristische Creator-Projekte",
    [
      "Noir-Akkorde, digitale Texturen und nächtliche Rhythmen für Technologie-Erklärvideos, Live-Coding, urbane Zukunftsbilder und narrative Formate. Der berechtigte Katalog umfasst 43 Titel.",
      "Für neue Freigaben und Downloads brauchst du aktives Flow Pro. Die nicht exklusive, nicht übertragbare Lizenz verlangt eine Quellenangabe und gestattet weder alleinstehende Musikweitergabe noch Eigentums- oder Content-ID-Ansprüche.",
    ],
    [
      {
        q: "Wie viele Cyberpunk-Jazz-Titel sind berechtigt?",
        a: "Der aktuelle Creator-Music-Katalog enthält 43 berechtigte Cyberpunk-Jazz-Titel. Lofi ist nicht Teil des Creator-Katalogs.",
      },
      {
        q: "Darf ich die Musik in monetarisierten Inhalten verwenden?",
        a: "Entscheidend sind die veröffentlichte Creator Music License und eine gültige titelbezogene Freigabe. Monetarisierung hebt weder die Quellenangabe noch die Verbote von Content ID, Eigentumsbehauptung und Musikweitergabe auf.",
      },
    ],
    DE_LEGAL_REVIEW_NOTICE,
  ),
  "creator-music/neo-synthwave": route(
    "82 Neo-Synthwave-Titel für Coding- und Tech-Videos | Flow",
    "Entdecke 82 berechtigte Neo-Synthwave-Titel für Coding-Videos, Produktdemos, Game-Dev-Tagebücher und Streams. Neue Freigaben erfordern aktives Pro.",
    "82 Neo-Synthwave-Titel für Coding und Technologie",
    [
      "Vorwärtsdrängende Synthesizer und klare elektronische Rhythmen für Build-Videos, Produktvorstellungen, Technologiereviews und Game-Dev-Tagebücher. Dieser Bereich umfasst 82 berechtigte Titel.",
      "Aktives Flow Pro ist für neue Freigaben und Downloads erforderlich. Die Lizenz ist nicht exklusiv und nicht übertragbar; Quellenangabe ist Pflicht, alleinstehende Weitergabe, Eigentumsübertragung und Content-ID-Registrierung sind ausgeschlossen.",
    ],
    [
      {
        q: "Wie viele Neo-Synthwave-Titel sind verfügbar?",
        a: "Der berechtigte Creator-Music-Katalog enthält 82 Neo-Synthwave-Titel. Zusammen mit City Pop und Cyberpunk Jazz ergibt das 174 Titel; Lofi ist ausgeschlossen.",
      },
      {
        q: "Kann ich einen Titel in mehreren Creator-Werken verwenden?",
        a: "Ordnungsgemäß lizenzierte Creator-Werke sind zahlenmäßig nicht begrenzt. Jeder Einsatz muss von der passenden Freigabe gedeckt sein und die vorgeschriebene Quellenangabe enthalten.",
      },
    ],
    DE_LEGAL_REVIEW_NOTICE,
  ),
  license: route(
    "Flow Pro Creator Music License: verständliche Übersicht",
    "Überblick über die Creator-Music-Regeln für 174 berechtigte Titel aus City Pop, Cyberpunk Jazz und Neo Synthwave. Lofi ist ausgeschlossen.",
    "Flow Pro Creator Music License im Überblick",
    [
      "Aktive Flow-Pro-Mitglieder können für 174 berechtigte Titel neue Freigaben und Downloads erhalten: 49 City Pop, 43 Cyberpunk Jazz und 82 Neo Synthwave. Lofi ist ausgeschlossen. Bereits während einer aktiven Pro-Mitgliedschaft erstmals veröffentlichte, ordnungsgemäß lizenzierte Creator-Werke bleiben nach einer regulären Kündigung lizenziert.",
      "Die Lizenz ist nicht exklusiv und nicht übertragbar. Sie erlaubt unbegrenzt viele ordnungsgemäß lizenzierte Creator-Werke mit vorgeschriebener Quellenangabe, überträgt aber kein Eigentum und gestattet weder alleinstehende Weitergabe noch Content-ID-Registrierung. Anhören auf Spotify oder YouTube allein verleiht keine Rechte.",
    ],
    [
      {
        q: "Was gehört nicht zum Creator-Music-Katalog?",
        a: "Lofi-Titel sind ausgeschlossen. Ebenfalls nicht erlaubt sind alleinstehende Weitergabe, Verkauf oder Unterlizenzierung der Musik, Eigentumsübertragung oder -behauptung und Content-ID-Registrierung. Spotify- oder YouTube-Wiedergabe ist keine Lizenz.",
      },
      {
        q: "Was passiert nach der Kündigung von Flow Pro?",
        a: "Creator-Werke, die während einer aktiven Pro-Mitgliedschaft erstmals veröffentlicht und ordnungsgemäß lizenziert wurden, bleiben nach einer regulären Kündigung lizenziert. Für neue Freigaben und Downloads musst du Pro erneut aktivieren.",
      },
      {
        q: "Gibt es eine Höchstzahl an Creator-Werken?",
        a: "Nein. Ordnungsgemäß lizenzierte Creator-Werke sind zahlenmäßig nicht begrenzt. Für jeden Einsatz gelten die titelbezogene Freigabe, die Quellenangabe und die veröffentlichten Bedingungen.",
      },
    ],
    DE_LEGAL_REVIEW_NOTICE,
  ),
};

export const DE_POMODORO_MUSIC_DETAIL = {
  musicHeading: "Musik, die für Flow produziert wurde",
  musicParagraphs: [
    "Die Instrumentaltitel stammen aus eigener Produktion und werden um neue Veröffentlichungen ergänzt. Sie sind so arrangiert, dass sie im Hintergrund eines Arbeitsblocks bleiben: ohne Gesang und ohne abrupte Werbeunterbrechungen.",
    "Da Musik und Timer in derselben App laufen, kannst du Regen, Café, Feuer oder andere Ambient-Sounds in eigener Lautstärke dazumischen. Für Creator-Nutzung gelten getrennte Regeln: Nur 174 Titel aus City Pop, Cyberpunk Jazz und Neo Synthwave sind berechtigt; Lofi ist ausgeschlossen.",
  ],
  genresLabel: "Musik in Flow",
  genres: ["Lofi", "Synthwave", "City Pop", "Cyberpunk Jazz", "Ambient"],
} as const;

export const DE_CREATOR_UI_COPY = {
  creatorCatalog: "Creator-Music-Katalog",
  findTrack: "Musik für dein nächstes Projekt finden",
  eligibleTracks: "berechtigte Titel",
  previewPro: "Vorhören ist frei. Neue Freigaben und Downloads erfordern aktives Flow Pro.",
  listenSpotify: "Auf Spotify anhören (keine Nutzungsrechte)",
  search: "Titel, Künstler oder Genre suchen",
  searchLabel: "Creator Music durchsuchen",
  unlock: "Downloads mit Pro freischalten",
  ready: "Freigabe erteilt",
  checking: "Pro-Status wird geprüft …",
  acceptFirst: "Bitte stimme zuerst der Creator Music License zu.",
  clickwrap:
    "Ich habe die Creator Music License creator-license-2026-07-21 gelesen und stimme ihr zu. Mir ist bekannt, dass eine Quellenangabe erforderlich ist, die Musik nicht alleinstehend weitergegeben werden darf und weder Titel noch Audio-Fingerprints bei Content ID oder vergleichbaren Systemen registriert werden dürfen.",
  readTerms: "Vollständige Bedingungen lesen",
  licensedTo: "Lizenznehmer (Name oder Kanal)",
  grantReady: "Die Freigabe wurde erstellt. Du kannst den berechtigten Titel und den PDF-Nachweis herunterladen.",
  seePro: "Flow Pro ansehen",
  matching: "passende berechtigte Titel",
  previewDownload: "Vorhören / MP3 und PDF herunterladen",
  noMatch: "Keine berechtigten Titel entsprechen deiner Suche.",
  copyAttribution: "Quellenangabe kopieren",
  copied: "Kopiert",
  allCreatorMusic: "Alle Creator-Music-Titel",
  readTermsCta: "Lizenzbedingungen lesen",
  pairTimer: "Mit einem Fokus-Timer kombinieren",
  browseEligible: "Berechtigte Creator Music durchsuchen",
  tracks: "Titel",
  downloadMp3: "MP3 herunterladen",
  downloadPdf: "Lizenznachweis als PDF herunterladen",
  unlockTrack: "Download mit Flow Pro freischalten",
} as const;

export const DE_CREATOR_GENRES: CreatorGenreContent[] = [
  {
    slug: "city-pop",
    genre: "City Pop",
    title: "49 City-Pop-Titel als Hintergrundmusik für Videos",
    description:
      "49 berechtigte City-Pop-Titel für Videos, Vlogs und Streams. Neue Freigaben und Downloads erfordern aktives Flow Pro.",
    h1: "49 City-Pop-Titel für Videos, Vlogs und Streams",
    intro:
      "Warme Akkorde, Night-Drive-Bässe und klare Rhythmen für Retro-Edits, Reise-Vlogs und Designvideos. Alle 49 Titel gehören zum berechtigten Creator-Music-Katalog.",
    useCases: [
      "Retro- und Anime-inspirierte Edits",
      "Reise-Vlogs und nächtliche Fahraufnahmen",
      "Lifestyle-, Design- und Making-of-Videos",
    ],
    primaryQuery: "City-Pop-Hintergrundmusik für Videos",
  },
  {
    slug: "cyberpunk-jazz",
    genre: "Cyberpunk Jazz",
    title: "43 Cyberpunk-Jazz-Titel für Videos und Streams",
    description:
      "43 berechtigte Cyberpunk-Jazz-Titel für Tech-Videos, futuristische Edits und Livestreams. Downloads erfordern aktives Flow Pro.",
    h1: "43 Cyberpunk-Jazz-Titel für futuristische Projekte",
    intro:
      "Noir-Akkorde, digitale Texturen und nächtliche Rhythmen für Technologie-Erklärvideos, Live-Coding und urbane Zukunftsbilder. Dieser Bereich umfasst 43 berechtigte Titel.",
    useCases: [
      "Cyberpunk-Atmosphäre und futuristische Visuals",
      "Technologie-Erklärvideos und Live-Coding",
      "Night-City-Streams und Motion Design",
    ],
    primaryQuery: "Cyberpunk-Jazz-Hintergrundmusik",
  },
  {
    slug: "neo-synthwave",
    genre: "Neo Synthwave",
    title: "82 Neo-Synthwave-Titel für Coding- und Tech-Videos",
    description:
      "82 berechtigte Neo-Synthwave-Titel für Coding-Videos, Produktdemos und Streams. Neue Downloads erfordern aktives Flow Pro.",
    h1: "82 Neo-Synthwave-Titel für Coding und Technologie",
    intro:
      "Vorwärtsdrängende Synthesizer und klare elektronische Rhythmen für Build-Videos, Produktvorstellungen und Game-Dev-Tagebücher. Der Katalog enthält 82 berechtigte Titel.",
    useCases: [
      "Coding-Videos und Entwickler-Livestreams",
      "Produktdemos und Technologiereviews",
      "Futuristisches Motion Design und Game-Dev-Tagebücher",
    ],
    primaryQuery: "Neo-Synthwave-Musik für Coding-Videos",
  },
];

export const DE_CREATOR_MUSIC_COPY = {
  title: "174 Creator-Music-Titel: City Pop, Cyberpunk Jazz und Neo Synthwave",
  description:
    "174 berechtigte Titel für Videos und Streams: 49 City Pop, 43 Cyberpunk Jazz und 82 Neo Synthwave. Lofi ist ausgeschlossen.",
  h1: "174 Musiktitel für Videos, Podcasts und Streams",
  intro:
    "Der berechtigte Katalog umfasst 49 City-Pop-, 43 Cyberpunk-Jazz- und 82 Neo-Synthwave-Titel, insgesamt 174. Lofi ist ausgeschlossen. Neue Freigaben und Downloads setzen aktives Flow Pro voraus.",
  catalogHeading: "Creator-Music-Katalog durchsuchen",
  licenseHeading: "So funktioniert die Musikfreigabe",
  licenseSteps: [
    "Halte Flow Pro für neue Freigaben und Downloads aktiv.",
    "Erstelle in Flow eine titelbezogene Creator-Music-Freigabe.",
    "Lade den berechtigten Titel herunter und setze die vorgeschriebene Quellenangabe.",
  ],
} as const;

export const DE_CREATOR_LICENSE_COPY = {
  title: "Flow Pro Creator Music License",
  description:
    "Verständlicher Überblick über die Nutzungsbedingungen für 174 berechtigte Titel aus City Pop, Cyberpunk Jazz und Neo Synthwave. Lofi ist ausgeschlossen.",
  h1: "Flow Pro Creator Music License im Überblick",
  intro:
    "Aktive Flow-Pro-Mitglieder können die 174 berechtigten Titel als Hintergrundmusik in ordnungsgemäß lizenzierten Creator-Werken verwenden. Die Lizenz ist nicht exklusiv und nicht übertragbar; Eigentum und Urheberrechte werden nicht übertragen.",
  allowedHeading: "Laut veröffentlichter Lizenz erlaubt",
  allowed: [
    "Berechtigte Titel als Hintergrundmusik in ordnungsgemäß lizenzierten Videos, Livestreams, Podcasts, Study-with-me- und Coding-Inhalten verwenden.",
    "Unbegrenzt viele ordnungsgemäß lizenzierte Creator-Werke mit vorgeschriebener Quellenangabe veröffentlichen; Views und Streams dieser Werke sind nicht zahlenmäßig begrenzt.",
    "Creator-Werke weiter veröffentlichen, die erstmals während einer aktiven Pro-Mitgliedschaft mit gültiger titelbezogener Freigabe und unter Einhaltung der Bedingungen erschienen sind. Nach einer regulären Kündigung bleibt deren Lizenz bestehen.",
  ],
  notAllowedHeading: "Laut veröffentlichter Lizenz nicht erlaubt",
  notAllowed: [
    "Titel, Bearbeitungen oder Audio-Fingerprints bei Content ID oder einem anderen Rechteverwaltungssystem registrieren.",
    "Audiodateien alleinstehend hochladen, verkaufen, unterlizenzieren oder weitergeben.",
    "Eigentum am Titel behaupten oder übertragen, den Titel sampeln oder remixen oder ihn unter eigenem Namen an Musikdienste ausliefern.",
    "Die Musik ohne gesonderte Erlaubnis in Musikbibliotheken, Verkaufsvorlagen, Apps oder Spiele einbauen.",
  ],
  attributionHeading: "Quellenangabe ist Pflicht",
  attributionBody:
    "Füge die vorgegebene Quellenangabe in die Videobeschreibung, das Stream-Panel oder die Podcast-Notizen ein:",
  finePrint:
    "Neue Freigaben und Downloads erfordern aktives Flow Pro. Spotify- oder YouTube-Wiedergabe allein verleiht keine Nutzungsrechte. Maßgeblich bleiben die veröffentlichte Creator Music License und die titelbezogene Freigabe.",
  faq: DE_MARKET_ROUTE_COPY.license.faq,
} as const;

const comparison = (
  competitorName: string,
  intro: string[],
  rows: AlternativeCopy["rows"],
  whenParagraphs: string[],
  faq: FaqItem[],
): AlternativeCopy => ({
  metaTitle: `${competitorName}-Alternative: Flow im Vergleich`,
  metaDescription: `Vergleiche ${competitorName} und Flow bei Timer, Musik, Ambient-Sounds und Fokusfunktionen. Ein sachlicher Überblick ohne überzogene Wirkungsversprechen.`,
  h1: `${competitorName}-Alternative: Flow im Vergleich`,
  intro,
  competitorName,
  tableHeading: "Funktionen im direkten Vergleich",
  rows,
  whenHeading: `Wann ${competitorName} besser passen kann`,
  whenParagraphs,
  faq,
});

export const DE_ALTERNATIVE_COPY: Record<AlternativeSlug, AlternativeCopy> = {
  brainfm: comparison(
    "Brain.fm",
    [
      "Brain.fm stellt Forschung und speziell entwickelte Audioerlebnisse in den Mittelpunkt. Wer genau diesen Ansatz und einen großen Katalog sucht, findet dort ein klar positioniertes Produkt.",
      "Flow setzt einen anderen Schwerpunkt: einen vollständigen Pomodoro- und Fokus-Timer mit Aufgaben, gemessenen Sitzungsdaten, eigens produzierten Musiktiteln und einem Ambient-Mixer in einem Browser-Tab.",
    ],
    [
      { feature: "Musikansatz", them: "Forschungsorientierte, funktionale Audioerlebnisse", flow: "Fertig produzierte Instrumentaltitel eines Musikers" },
      { feature: "Fokus-Timer", them: "Sitzungssteuerung im Player", flow: "Presets, eigene Zeiten und Aufgaben pro Sitzung" },
      { feature: "Sitzungsdaten", them: "Hör- und Fokusnutzung im Produkt", flow: "Streaks, Heatmap und ausschließlich gemessene Minuten" },
      { feature: "Ambient-Sounds", them: "Teil des funktionalen Audiokatalogs", flow: "Zwölf einzeln regelbare Ebenen" },
      { feature: "Kostenlos testen", them: "Je nach aktuellem Angebot", flow: "Timer, Ambient-Sounds und ein Teil der Musikbibliothek" },
      { feature: "Creator Music", them: "Nicht der Schwerpunkt des Fokus-Abos", flow: "174 berechtigte Titel; aktives Pro, Freigabe und Quellenangabe nötig" },
    ],
    [
      "Wenn du den Forschungsansatz, mehrere funktionale Audiomodi oder einen besonders großen Katalog priorisierst, kann Brain.fm besser zu dir passen.",
      "Flow ist eher für dich gedacht, wenn Timer, Aufgaben und nachvollziehbar gemessene Sitzungen die Basis bilden sollen und Musik direkt in diesen Ablauf eingebaut sein soll.",
    ],
    [
      { q: "Ist die Musik von Flow KI-generiert?", a: "Nein. Die Flow-Titel werden von Virzy Guns komponiert und produziert. Flow macht daraus jedoch keine medizinische oder wissenschaftliche Wirkungsbehauptung." },
      { q: "Kann ich Flow kostenlos ausprobieren?", a: "Ja. Der Browser-Timer, grundlegende Ambient-Sounds und ein Teil der Musikbibliothek sind kostenlos verfügbar." },
      { q: "Welche Lösung bietet mehr Timerfunktionen?", a: "Flow legt den Schwerpunkt auf Presets, eigene Arbeits- und Pausenlängen, Sitzungsaufgaben und gemessene Fokusdaten. Prüfe für Brain.fm den aktuellen Funktionsumfang direkt beim Anbieter." },
    ],
  ),
  endel: comparison(
    "Endel",
    [
      "Endel ist für generative, adaptive Klanglandschaften bekannt und stark in ein eigenes App-Erlebnis eingebettet. Wer kontinuierlich veränderliche Sounds sucht, findet dort einen klaren Ansatz.",
      "Flow arbeitet mit fertig komponierten Instrumentaltiteln und ist browserbasiert. Timer, Aufgaben, Ambient-Mixer und Sitzungsdaten stehen gleichberechtigt neben der Musik.",
    ],
    [
      { feature: "Audio", them: "Generative, adaptive Klanglandschaften", flow: "Eigens produzierte, fertig komponierte Titel" },
      { feature: "Plattform", them: "App-orientiertes Erlebnis", flow: "Browserbasiert auf gängigen Desktop-Plattformen" },
      { feature: "Fokus-Timer", them: "Fokusmodi mit Zeitsteuerung", flow: "Pomodoro-Presets, eigene Zeiten und Sitzungsaufgaben" },
      { feature: "Sitzungsdaten", them: "Schlanker Fokus auf das Hörerlebnis", flow: "Streaks, Heatmap und gemessene Minuten" },
      { feature: "Ambient-Sounds", them: "Generatives Kernerlebnis", flow: "Zwölf separat mischbare Geräusche unter der Musik" },
      { feature: "Creator Music", them: "Nicht der Schwerpunkt des Fokus-Abos", flow: "174 berechtigte Titel; aktives Pro, Freigabe und Quellenangabe nötig" },
    ],
    [
      "Wenn du adaptive, generative Klanglandschaften und ein stark appzentriertes Erlebnis suchst, kann Endel die passendere Wahl sein.",
      "Flow passt eher, wenn du im Browser arbeiten, komponierte Musik hören und Timer, Aufgaben sowie Sitzungsdaten in einem Werkzeug bündeln möchtest.",
    ],
    [
      { q: "Läuft Flow unter Windows, macOS und Linux?", a: "Flow ist browserbasiert und läuft auf gängigen Desktop-Systemen in einem unterstützten Browser, ohne dass eine native App erforderlich ist." },
      { q: "Ist die Musik von Flow generativ wie bei Endel?", a: "Nein. Flow spielt fertig komponierte und produzierte Instrumentaltitel ab; der Ambient-Mixer lässt sich zusätzlich anpassen." },
      { q: "Gibt es einen kostenlosen Flow-Tarif?", a: "Ja. Timer, grundlegende Ambient-Sounds und ein Teil der Musikbibliothek können kostenlos genutzt werden." },
    ],
  ),
  flocus: comparison(
    "Flocus",
    [
      "Flocus verbindet einen ansprechend gestalteten Browser-Startbereich mit Pomodoro-Funktionen, Hintergründen und eingebetteten Audioangeboten. Für eine gemütliche visuelle Arbeitsfläche ist das ein schlüssiges Konzept.",
      "Flow rückt den Fokusblock selbst in den Vordergrund: eigens produzierte Musik, Timer, Aufgaben, Ambient-Mixer und gemessene Sitzungsdaten arbeiten als eine gemeinsame Umgebung.",
    ],
    [
      { feature: "Musik", them: "Eingebettete Streams und Playlists", flow: "Eigens produzierte Instrumentaltitel" },
      { feature: "Fokus-Timer", them: "Pomodoro-Modi in einer visuellen Arbeitsfläche", flow: "Presets, eigene Zeiten und Aufgaben pro Sitzung" },
      { feature: "Sitzungsdaten", them: "Schlanke Auswertung", flow: "Streaks, Heatmap und gemessene Minuten" },
      { feature: "Ambient-Sounds", them: "Szenenbezogene Klangkulissen", flow: "Zwölf Ebenen mit eigener Lautstärke" },
      { feature: "Gestaltung", them: "Gemütliche Startseiten- und Wallpaper-Ästhetik", flow: "Instrumentenartige Timer-Ansichten und Szenen" },
      { feature: "Creator Music", them: "Rechte hängen von eingebundenen Quellen ab", flow: "174 berechtigte Titel; aktives Pro, Freigabe und Quellenangabe nötig" },
    ],
    [
      "Wenn du vor allem eine schöne Startseite mit Hintergrundbildern, Begrüßung und eingebetteten Playlists suchst, kann Flocus besser passen.",
      "Flow ist eher für Nutzerinnen und Nutzer gedacht, die eigens produzierte Musik und exakt gemessene Fokusblöcke in einer gemeinsamen Umgebung möchten.",
    ],
    [
      { q: "Kann ich Flow kostenlos nutzen?", a: "Ja. Timer, grundlegende Ambient-Sounds und ein Teil der Musikbibliothek sind kostenlos verfügbar." },
      { q: "Worin unterscheidet sich die Musik?", a: "Flow verwendet eigens von Virzy Guns komponierte und produzierte Titel. Bei eingebetteten Streams gelten dagegen die Bedingungen der jeweiligen Quelle." },
      { q: "Welche Oberfläche sieht besser aus?", a: "Das ist Geschmackssache. Flocus setzt auf gemütliche Startseitenästhetik, Flow auf verschiedene timerzentrierte Szenen. Beide lassen sich am besten direkt ausprobieren." },
    ],
  ),
  pomofocus: comparison(
    "Pomofocus",
    [
      "Pomofocus ist ein klarer, schneller Pomodoro-Timer mit Aufgaben und Berichten. Wer hauptsächlich eine schlanke Zeiterfassung sucht, bekommt dort ein fokussiertes Werkzeug.",
      "Flow ergänzt denselben Grundablauf um eigens produzierte Instrumentalmusik, einen mehrspurigen Ambient-Mixer und unterschiedliche Szenen, damit Timer und Klang in einem Tab starten und enden.",
    ],
    [
      { feature: "Pomodoro-Timer", them: "Presets, Aufgaben und Schätzungen", flow: "Presets, eigene Zeiten und Aufgaben pro Sitzung" },
      { feature: "Musik", them: "Keine integrierte Musik", flow: "Eigens produzierte Titel, mit dem Fokusblock verbunden" },
      { feature: "Ambient-Sounds", them: "Nicht das Kernangebot", flow: "Zwölf separat regelbare Ebenen" },
      { feature: "Auswertung", them: "Berichte und Streaks", flow: "Streaks, Heatmap und ausschließlich gemessene Minuten" },
      { feature: "Kostenloser Einstieg", them: "Timer kostenlos nutzbar", flow: "Timer, Ambient-Sounds und ein Teil der Musikbibliothek" },
    ],
    [
      "Wenn du ausschließlich einen schnellen, übersichtlichen Pomodoro-Timer brauchst oder Musik bereits anderweitig organisiert hast, kann Pomofocus die direktere Wahl sein.",
      "Flow passt besser, wenn Timer, Instrumentalmusik und Umgebungsgeräusche gemeinsam gesteuert werden sollen.",
    ],
    [
      { q: "Deckt der Flow-Timer typische Pomodoro-Funktionen ab?", a: "Ja. Flow bietet Arbeits- und Pausen-Presets, eigene Zeiten und eine Aufgabenliste pro Sitzung. Der Hauptunterschied liegt in der integrierten Musik- und Ambient-Umgebung." },
      { q: "Muss ich für Flow bezahlen?", a: "Nein. Timer, grundlegende Ambient-Sounds und ein Teil der Musikbibliothek sind kostenlos. Pro erweitert Musikbibliothek und Szenen." },
      { q: "Kann ich Flow ohne Musik verwenden?", a: "Ja. Musik und Ambient-Sounds sind optional; der Timer funktioniert auch stumm." },
    ],
  ),
  noisli: comparison(
    "Noisli",
    [
      "Noisli konzentriert sich auf kombinierbare Geräuschkulissen. Wer ausschließlich Regen, Wind, Café oder andere Geräusche fein mischen möchte, findet dort ein spezialisiertes Werkzeug.",
      "Flow nutzt Ambient-Sounds als einen Teil einer größeren Fokusumgebung und ergänzt sie um Instrumentalmusik, Pomodoro-Timer, Aufgaben und gemessene Sitzungsdaten.",
    ],
    [
      { feature: "Ambient-Sounds", them: "Kernprodukt mit kombinierbaren Geräuschen", flow: "Zwölf separat regelbare Ebenen" },
      { feature: "Musik", them: "Fokus auf Geräuschkulissen", flow: "Eigens produzierte Instrumentaltitel" },
      { feature: "Fokus-Timer", them: "Timer neben den Geräuschen", flow: "Presets, eigene Zeiten und Sitzungsaufgaben" },
      { feature: "Sitzungsdaten", them: "Nicht der Hauptschwerpunkt", flow: "Streaks, Heatmap und gemessene Minuten" },
      { feature: "Kostenloser Einstieg", them: "Nach aktuellem Angebotsmodell", flow: "Timer, Ambient-Sounds und ein Teil der Musikbibliothek" },
    ],
    [
      "Wenn du reine Geräuschkulissen sehr fein zusammenstellen und ohne Musik arbeiten möchtest, kann das spezialisierte Noisli-Konzept besser passen.",
      "Flow ist eher für dich gedacht, wenn du Musik und Ambient-Sounds kombinieren und den gesamten Arbeitsblock über denselben Timer steuern möchtest.",
    ],
    [
      { q: "Hat Flow Ambient-Sounds wie Noisli?", a: "Ja. Flow bietet zwölf separat regelbare Ebenen, darunter Regen, Café, Feuer, Fluss und Stadt. Sie können mit oder ohne Musik laufen." },
      { q: "Kann ich Flow nur als Geräuschmixer verwenden?", a: "Ja. Lass die Musik ausgeschaltet und kombiniere nur Ambient-Sounds mit dem Timer." },
      { q: "Lenkt die Musik von Flow ab?", a: "Die Titel sind instrumental und als Hintergrund für Arbeitsblöcke arrangiert. Falls Musik für dich trotzdem störend ist, kannst du sie vollständig ausschalten." },
    ],
  ),
};

for (const [slug, copy] of Object.entries(DE_ALTERNATIVE_COPY)) {
  DE_MARKET_ROUTE_COPY[`alternatives/${slug}`] = {
    metaTitle: copy.metaTitle,
    metaDescription: copy.metaDescription,
    h1: copy.h1,
    paragraphs: copy.intro,
    faq: copy.faq,
  };
}

export function deMarketRouteCopy(locale: string, path: string): MarketRouteCopy | undefined {
  return locale === "de-DE" ? DE_MARKET_ROUTE_COPY[path] : undefined;
}

export function deAlternativeCopy(
  locale: string,
  slug: AlternativeSlug,
): AlternativeCopy | undefined {
  return locale === "de-DE" ? DE_ALTERNATIVE_COPY[slug] : undefined;
}
