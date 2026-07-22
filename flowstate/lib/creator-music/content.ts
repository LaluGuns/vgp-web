import type { CreatorGenre } from "@/lib/creator-license/policy";
import type { Locale } from "@/lib/translations/dictionaries";
import type { FaqItem } from "@/lib/marketing/seo";
import {
  DE_CREATOR_GENRES,
  DE_CREATOR_LICENSE_COPY,
  DE_CREATOR_MUSIC_COPY,
  DE_CREATOR_UI_COPY,
} from "../marketing/de-market-copy.ts";
import { esPtCreatorGrantErrorCopy, esPtCreatorUiCopy } from "../marketing/es-pt-visible-copy.ts";

export const CREATOR_MUSIC_PATH = "creator-music";
export const SPOTIFY_ARTIST_URL = "https://open.spotify.com/artist/21bxd77KSj9RR6vAqW5Hvy";
export const CREATOR_ATTRIBUTION =
  "Music: Flow Creator Music by Chill Music Division / Virzy Guns Production - https://flow.virzyguns.com/creator-music";

export function creatorUiCopy(locale: string) {
  const esPt = esPtCreatorUiCopy(locale);
  if (esPt) return esPt;
  const ja = locale === "ja" || locale === "ja-JP";
  const ko = locale === "ko" || locale === "ko-KR";
  if (locale === "de" || locale === "de-DE") return DE_CREATOR_UI_COPY;
  if (ja) return {
    creatorCatalog: "クリエイター向けカタログ", findTrack: "次の作品に合う曲を探す", eligibleTracks: "対象曲", previewPro: "試聴は自由です。ダウンロードには有効なFlow Proが必要です。", listenSpotify: "Spotifyで聴く（利用権は付与されません）", search: "曲名、アーティスト、ジャンルを検索", searchLabel: "クリエイター向け楽曲を検索", unlock: "Proダウンロードを有効にする", ready: "ライセンス発行済み", checking: "Proを確認中…", acceptFirst: "先にクリエイター音楽ライセンスへ同意してください。", clickwrap: "クリエイター音楽ライセンス creator-license-2026-07-21 を読み、同意します。帰属表示が必須であること、音源を単体で再配布できないこと、楽曲や音声フィンガープリントをContent IDなどへ登録できないことを理解しました。", readTerms: "条件全文を読む", licensedTo: "ライセンス名義（氏名・チャンネル名）", grantReady: "ライセンスを発行しました。対象曲とPDF証明書をダウンロードできます。", seePro: "Flow Proを見る", matching: "件の対象曲", previewDownload: "試聴 / MP3・PDFをダウンロード", noMatch: "検索条件に一致する対象曲はありません。", copyAttribution: "帰属表示をコピー", copied: "コピーしました", allCreatorMusic: "すべてのクリエイター音楽", readTermsCta: "ライセンス条件を読む", pairTimer: "集中タイマーと組み合わせる", browseEligible: "対象のクリエイター音楽を見る", tracks: "曲", downloadMp3: "MP3をダウンロード", downloadPdf: "ライセンスPDFをダウンロード", unlockTrack: "Flow Proダウンロードを有効にする",
  };
  if (ko) return {
    creatorCatalog: "크리에이터 카탈로그", findTrack: "다음 작품에 맞는 곡 찾기", eligibleTracks: "대상 곡", previewPro: "미리듣기는 열려 있으며 다운로드에는 활성 Flow Pro가 필요합니다.", listenSpotify: "Spotify에서 듣기(사용권은 부여되지 않음)", search: "곡명, 아티스트 또는 장르 검색", searchLabel: "크리에이터 음악 검색", unlock: "Pro 다운로드 잠금 해제", ready: "라이선스 발급 완료", checking: "Pro 확인 중…", acceptFirst: "먼저 크리에이터 음악 라이선스에 동의하세요.", clickwrap: "크리에이터 음악 라이선스 creator-license-2026-07-21을 읽고 동의합니다. 저작자 표시가 필수이며 음원을 단독으로 재배포할 수 없고 곡이나 오디오 지문을 Content ID 등에 등록할 수 없음을 이해했습니다.", readTerms: "전체 조건 읽기", licensedTo: "라이선스 명의(이름 / 채널)", grantReady: "라이선스가 발급되었습니다. 대상 곡과 PDF 인증서를 다운로드할 수 있습니다.", seePro: "Flow Pro 보기", matching: "개의 대상 곡", previewDownload: "미리듣기 / MP3·PDF 다운로드", noMatch: "검색과 일치하는 대상 곡이 없습니다.", copyAttribution: "저작자 표시 복사", copied: "복사됨", allCreatorMusic: "모든 크리에이터 음악", readTermsCta: "라이선스 조건 읽기", pairTimer: "집중 타이머와 함께 사용하기", browseEligible: "대상 크리에이터 음악 보기", tracks: "곡", downloadMp3: "MP3 다운로드", downloadPdf: "라이선스 PDF 다운로드", unlockTrack: "Flow Pro 다운로드 잠금 해제",
  };
  return undefined;
}

export function creatorGrantErrorCopy(locale: string, code: string): string | undefined {
  const esPt = esPtCreatorGrantErrorCopy(locale, code);
  if (esPt) return esPt;
  const de: Record<string, string> = {
    login_required: "Melde dich an und kehre zu dieser Seite zurück, um die Lizenzfreigabe zu erstellen.",
    active_pro_required: "Creator-Downloads erfordern ein aktives Flow-Pro-Abo.",
    creator_license_not_enabled: "Creator-Downloads sind derzeit nicht verfügbar.",
    terms_acceptance_required: "Akzeptiere zuerst die Creator Music License.",
    terms_version_mismatch: "Die Bedingungen wurden aktualisiert. Lies und akzeptiere die aktuelle Fassung.",
    catalog_version_mismatch: "Der berechtigte Katalog wurde aktualisiert. Lade die Seite neu.",
    invalid_licensee_name: "Gib einen gültigen Namen mit 2 bis 100 Zeichen ein; E-Mail-Adressen sind nicht zulässig.",
    fallback: "Die Lizenzfreigabe konnte gerade nicht erstellt werden. Versuche es später erneut.",
  };
  const ja: Record<string, string> = {
    login_required: "先にログインしてから、このページに戻ってライセンスを発行してください。",
    active_pro_required: "クリエイター向けダウンロードには有効なFlow Proが必要です。",
    creator_license_not_enabled: "クリエイター向けダウンロードは現在利用できません。",
    terms_acceptance_required: "ライセンス発行前にクリエイター音楽ライセンスへ同意してください。",
    terms_version_mismatch: "ライセンス条件が更新されました。最新版を確認して同意してください。",
    catalog_version_mismatch: "対象カタログが更新されました。ページを再読み込みしてください。",
    invalid_licensee_name: "証明書に表示する有効な名前を2〜100文字で入力してください。メールアドレスは使用できません。",
    fallback: "現在クリエイターライセンスを発行できません。時間を置いてもう一度お試しください。",
  };
  const ko: Record<string, string> = {
    login_required: "먼저 로그인한 뒤 이 페이지로 돌아와 라이선스를 발급하세요.",
    active_pro_required: "크리에이터 다운로드에는 활성 Flow Pro가 필요합니다.",
    creator_license_not_enabled: "크리에이터 다운로드를 현재 이용할 수 없습니다.",
    terms_acceptance_required: "라이선스 발급 전에 크리에이터 음악 라이선스에 동의하세요.",
    terms_version_mismatch: "라이선스 조건이 변경되었습니다. 최신 조건을 확인하고 동의하세요.",
    catalog_version_mismatch: "대상 카탈로그가 변경되었습니다. 페이지를 새로고침하세요.",
    invalid_licensee_name: "인증서에 표시할 유효한 이름을 2~100자로 입력하세요. 이메일 주소는 사용할 수 없습니다.",
    fallback: "현재 크리에이터 라이선스를 발급할 수 없습니다. 잠시 후 다시 시도하세요.",
  };
  if (locale === "de" || locale === "de-DE") return de[code] ?? de.fallback;
  if (locale === "ja" || locale === "ja-JP") return ja[code] ?? ja.fallback;
  if (locale === "ko" || locale === "ko-KR") return ko[code] ?? ko.fallback;
  return undefined;
}

export type CreatorGenreContent = {
  slug: string;
  genre: CreatorGenre;
  title: string;
  description: string;
  h1: string;
  intro: string;
  useCases: string[];
  primaryQuery: string;
};

const enGenres: CreatorGenreContent[] = [
  {
    slug: "city-pop",
    genre: "City Pop",
    title: "City Pop Background Music for Videos",
    description: "City Pop background music for videos, streams, and creative edits. License eligible Flow tracks with an active Pro plan.",
    h1: "City Pop background music for your videos",
    intro: "Warm chords, night-drive bass, and polished rhythm for retro visual edits, vlogs, and relaxed creator work. These tracks are part of Flow Creator Music, curated by Chill Music Division.",
    useCases: ["Retro and anime-inspired edits", "Travel vlogs and night-drive visuals", "Lifestyle, design, and creative process videos"],
    primaryQuery: "city pop background music",
  },
  {
    slug: "cyberpunk-jazz",
    genre: "Cyberpunk Jazz",
    title: "Cyberpunk Jazz Background Music for Streams",
    description: "Cyberpunk jazz background music for streams, futuristic videos, and night-city visuals. Creator downloads require active Flow Pro.",
    h1: "Cyberpunk jazz for futuristic creator work",
    intro: "Noir chords, digital texture, and late-night rhythm for cyberpunk ambience, technology stories, and live coding scenes. License eligible through an active Flow Pro creator plan.",
    useCases: ["Cyberpunk ambience and futuristic visuals", "Technology explainers and live coding", "Night-city streams and motion graphics"],
    primaryQuery: "cyberpunk jazz background music",
  },
  {
    slug: "neo-synthwave",
    genre: "Neo Synthwave",
    title: "Neo Synthwave Music for Coding Videos",
    description: "Neo synthwave music for coding videos, streams, and technology content. Creator downloads require an active Flow Pro plan.",
    h1: "Neo synthwave for coding and technology content",
    intro: "Forward-moving synth lines and clean electronic momentum for build videos, product launches, and long coding sessions. Download access is included with an active Flow Pro creator license.",
    useCases: ["Coding videos and developer livestreams", "Product demos and technology reviews", "Futuristic motion graphics and game dev diaries"],
    primaryQuery: "neo synthwave music for coding videos",
  },
];

const idGenres: CreatorGenreContent[] = [
  {
    ...enGenres[0],
    title: "Musik City Pop untuk Video",
    description: "Musik City Pop untuk video, stream, dan edit kreatif. Download kreator tersedia dengan Flow Pro aktif.",
    h1: "Musik City Pop untuk video kamu",
    intro: "Chord hangat, bass night-drive, dan ritme rapi untuk edit retro, vlog, serta proses kreatif. Semua bagian dari Flow Creator Music yang dikurasi Chill Music Division.",
    useCases: ["Edit retro dan terinspirasi anime", "Vlog perjalanan dan visual night-drive", "Video lifestyle, desain, dan proses kreatif"],
  },
  {
    ...enGenres[1],
    title: "Musik Cyberpunk Jazz untuk Stream",
    description: "Musik Cyberpunk Jazz untuk stream, video futuristik, dan visual kota malam. Download kreator perlu Flow Pro aktif.",
    h1: "Cyberpunk Jazz untuk karya kreator futuristik",
    intro: "Chord noir, tekstur digital, dan ritme larut malam untuk ambience cyberpunk, cerita teknologi, dan live coding. Lisensi tersedia melalui Flow Pro aktif.",
    useCases: ["Ambience cyberpunk dan visual futuristik", "Video teknologi dan live coding", "Stream kota malam dan motion graphic"],
  },
  {
    ...enGenres[2],
    title: "Musik Neo Synthwave untuk Video Coding",
    description: "Musik Neo Synthwave untuk video coding, stream, dan konten teknologi. Download kreator perlu Flow Pro aktif.",
    h1: "Neo Synthwave untuk konten coding dan teknologi",
    intro: "Synth yang bergerak maju dan energi elektronik bersih untuk video membangun produk, launch, dan sesi coding panjang. Download tersedia dengan Flow Pro aktif.",
    useCases: ["Video coding dan livestream developer", "Demo produk dan review teknologi", "Motion graphic futuristik dan game dev diary"],
  },
];

const jaGenres: CreatorGenreContent[] = [
  {
    ...enGenres[0],
    title: "動画向けCity Pop背景音楽49曲",
    description: "動画、Vlog、配信に使えるCity Pop背景音楽49曲。新規ライセンス付与とダウンロードには有効なFlow Proが必要です。",
    h1: "動画向けCity Pop背景音楽49曲",
    intro: "温かいコード、夜のドライブを思わせるベース、軽快なリズムを備えた49曲。動画や配信の背景音楽として利用できます。",
    useCases: ["レトロ・アニメ風の映像編集", "旅行Vlogや夜のドライブ映像", "ライフスタイル、デザイン、制作過程の動画"],
    primaryQuery: "動画向けCity Pop背景音楽",
  },
  {
    ...enGenres[1],
    title: "配信向けCyberpunk Jazz 43曲",
    description: "近未来動画、夜景、ライブ配信に使えるCyberpunk Jazz 43曲。ダウンロードには有効なFlow Proが必要です。",
    h1: "配信向けCyberpunk Jazz 43曲",
    intro: "ノワール調のコード、デジタルな質感、深夜のリズムを備えた43曲。テクノロジー動画やライブ配信の背景に使えます。",
    useCases: ["サイバーパンクの雰囲気や近未来映像", "テクノロジー解説やライブコーディング", "夜景配信やモーショングラフィックス"],
    primaryQuery: "配信向けCyberpunk Jazz背景音楽",
  },
  {
    ...enGenres[2],
    title: "動画向けNeo Synthwave 82曲",
    description: "コーディング動画、製品紹介、配信に使えるNeo Synthwave 82曲。新規ダウンロードには有効なFlow Proが必要です。",
    h1: "動画向けNeo Synthwave 82曲",
    intro: "前進感のあるシンセと明快な電子音を備えた82曲。コーディング動画、製品紹介、ゲーム開発記録の背景に使えます。",
    useCases: ["コーディング動画や開発配信", "製品デモやテクノロジーレビュー", "近未来のモーショングラフィックスや開発記録"],
    primaryQuery: "コーディング動画向けNeo Synthwave",
  },
];

const koGenres: CreatorGenreContent[] = [
  {
    ...enGenres[0],
    title: "영상용 City Pop 배경음악 49곡",
    description: "영상, 브이로그, 방송에 쓸 수 있는 City Pop 배경음악 49곡. 새 라이선스 발급과 다운로드에는 활성 Flow Pro가 필요합니다.",
    h1: "영상용 City Pop 배경음악 49곡",
    intro: "따뜻한 코드, 야간 드라이브를 닮은 베이스, 매끄러운 리듬을 담은 49곡을 영상과 방송의 배경음악으로 사용할 수 있습니다.",
    useCases: ["레트로·애니메이션 감성 편집", "여행 브이로그와 야간 드라이브 영상", "라이프스타일, 디자인, 제작 과정 영상"],
    primaryQuery: "영상용 City Pop 배경음악",
  },
  {
    ...enGenres[1],
    title: "방송용 Cyberpunk Jazz 43곡",
    description: "미래 도시 영상, 야경, 라이브 방송에 쓸 수 있는 Cyberpunk Jazz 43곡. 다운로드에는 활성 Flow Pro가 필요합니다.",
    h1: "방송용 Cyberpunk Jazz 43곡",
    intro: "누아르 코드, 디지털 질감, 심야 리듬을 담은 43곡을 기술 영상과 라이브 방송의 배경음악으로 사용할 수 있습니다.",
    useCases: ["사이버펑크 분위기와 미래 도시 영상", "기술 설명과 라이브 코딩", "야간 도시 방송과 모션 그래픽"],
    primaryQuery: "방송용 Cyberpunk Jazz 배경음악",
  },
  {
    ...enGenres[2],
    title: "영상용 Neo Synthwave 82곡",
    description: "코딩 영상, 제품 소개, 방송에 쓸 수 있는 Neo Synthwave 82곡. 새 다운로드에는 활성 Flow Pro가 필요합니다.",
    h1: "영상용 Neo Synthwave 82곡",
    intro: "전진감 있는 신스와 선명한 전자 리듬을 담은 82곡을 코딩 영상, 제품 소개, 게임 개발 기록의 배경음악으로 사용할 수 있습니다.",
    useCases: ["코딩 영상과 개발자 라이브 방송", "제품 데모와 기술 리뷰", "미래형 모션 그래픽과 게임 개발 기록"],
    primaryQuery: "코딩 영상용 Neo Synthwave",
  },
];

export function creatorGenres(locale: Locale): CreatorGenreContent[] {
  if (locale === "id") return idGenres;
  if (locale === "ja") return jaGenres;
  if (locale === "ko") return koGenres;
  if (locale === "de") return DE_CREATOR_GENRES;
  return enGenres;
}

export function creatorGenreBySlug(locale: Locale, slug: string) {
  return creatorGenres(locale).find((item) => item.slug === slug);
}

export function creatorMusicCopy(locale: Locale) {
  if (locale === "de") return DE_CREATOR_MUSIC_COPY;
  if (locale === "ja") {
    return {
      title: "クリエイター向け音楽174曲 — City Pop、Cyberpunk Jazz、Neo Synthwave",
      description: "動画や配信向けの対象曲174曲。City Pop 49曲、Cyberpunk Jazz 43曲、Neo Synthwave 82曲。Lofiは対象外です。",
      h1: "動画・配信向けのクリエイター音楽174曲",
      intro: "対象カタログはCity Pop 49曲、Cyberpunk Jazz 43曲、Neo Synthwave 82曲の合計174曲です。Lofi楽曲は対象外です。新規ライセンス付与とダウンロードには有効なFlow Proが必要です。",
      catalogHeading: "クリエイター向けカタログを探す",
      licenseHeading: "ライセンスの利用手順",
      licenseSteps: ["Flow Proを有効にします。", "Flowでクリエイターライセンスを発行します。", "対象曲をダウンロードし、必須の帰属表示を記載します。"],
    };
  }
  if (locale === "ko") {
    return {
      title: "크리에이터 음악 174곡 — City Pop, Cyberpunk Jazz, Neo Synthwave",
      description: "영상과 방송을 위한 대상 곡 174곡. City Pop 49곡, Cyberpunk Jazz 43곡, Neo Synthwave 82곡이며 Lofi는 제외됩니다.",
      h1: "영상과 방송을 위한 크리에이터 음악 174곡",
      intro: "대상 카탈로그는 City Pop 49곡, Cyberpunk Jazz 43곡, Neo Synthwave 82곡으로 총 174곡입니다. Lofi는 제외됩니다. 새 라이선스 발급과 다운로드에는 활성 Flow Pro가 필요합니다.",
      catalogHeading: "크리에이터 카탈로그 둘러보기",
      licenseHeading: "라이선스 이용 방법",
      licenseSteps: ["Flow Pro를 활성화합니다.", "Flow에서 크리에이터 라이선스를 발급합니다.", "대상 곡을 다운로드하고 필수 저작자 표시를 넣습니다."],
    };
  }
  const isId = locale === "id";
  return {
    title: isId ? "Musik untuk Kreator — City Pop, Cyberpunk Jazz & Neo Synthwave" : "Music for Creators — City Pop, Cyberpunk Jazz & Neo Synthwave",
    description: isId
      ? "Musik City Pop, Cyberpunk Jazz, dan Neo Synthwave untuk video dan stream. Download kreator tersedia dengan lisensi Flow Pro aktif."
      : "City Pop, Cyberpunk Jazz, and Neo Synthwave music for videos and streams. Creator downloads are available with an active Flow Pro license.",
    h1: isId ? "Musik berlisensi untuk video, stream, dan karya kreator" : "Licensed music for videos, streams, and creator work",
    intro: isId
      ? "Flow Creator Music dikurasi oleh Chill Music Division — sebuah division dari Virzy Guns Production. Pilih tiga genre yang dibuat untuk visual kreator; gunakan dengan lisensi Flow Pro aktif."
      : "Flow Creator Music is curated by Chill Music Division — a division of Virzy Guns Production. Choose from three genres made for creator visuals, with an active Flow Pro creator license.",
    catalogHeading: isId ? "Cari katalog kreator" : "Browse the creator catalog",
    licenseHeading: isId ? "Cara kerja lisensinya" : "How the license works",
    licenseSteps: isId
      ? ["Aktifkan Flow Pro.", "Buat grant lisensi kreator di Flow.", "Download track dan cantumkan atribusi."]
      : ["Keep an active Flow Pro plan.", "Create your creator-license grant in Flow.", "Download tracks and include the attribution."],
  };
}

export function creatorLicenseCopy(locale: Locale) {
  if (locale === "de") return DE_CREATOR_LICENSE_COPY;
  if (locale === "ja") {
    return {
      title: "Flow Proクリエイター音楽ライセンス",
      description: "City Pop 49曲、Cyberpunk Jazz 43曲、Neo Synthwave 82曲の計174曲を背景音楽として使うための条件。Lofiは対象外です。",
      h1: "Flow Proクリエイター音楽ライセンス",
      intro: "有効なFlow Proユーザーは、対象174曲を公開するクリエイター作品の背景音楽として利用できます。ライセンスは非独占的かつ譲渡不能で、所有権や著作権は移転しません。",
      allowedHeading: "許可される利用",
      allowed: ["収益化動画、ライブ配信、ポッドキャスト、study-with-me、コーディングコンテンツの背景音楽。", "適切にライセンスされたクリエイター作品での、回数制限のない再生・配信。", "Flow Proが有効な間に、有効なGrant Recordが存在し、条件を遵守して最初に公開した作品。通常の解約後もその作品のライセンスは継続します。"],
      notAllowedHeading: "許可されない利用",
      notAllowed: ["楽曲、派生物、音声フィンガープリントをContent IDなどの権利管理システムへ登録すること。", "音源ファイルを単体でアップロード、転売、サブライセンス、再配布すること。", "楽曲の所有権を主張したり、サンプリング、リミックス、派生楽曲を作成したり、自分名義でDSPへ配信すること。", "別途許可なく、音源ライブラリ、テンプレート販売、アプリ、ゲームへ組み込むこと。"],
      attributionHeading: "帰属表示は必須です",
      attributionBody: "動画の説明欄、配信パネル、ポッドキャストのノートに、次の表記を記載してください。",
      finePrint: "新しいライセンス付与とダウンロードには有効なFlow Proが必要です。SpotifyやYouTubeでの視聴だけでは利用権は付与されません。権利は該当する権利者に帰属します。通常の解約または適法な消費者返金だけで有効なライセンスが自動的に消滅することはありません。不正または重大な違反は取消しの根拠となる場合があります。",
      faq: [
        { q: "Flow Proは必要ですか？", a: "はい。新しいクリエイターライセンスの発行と対象曲のダウンロードには有効なFlow Proが必要です。" },
        { q: "Flow Proを解約するとどうなりますか？", a: "Proが有効な間に有効なGrant Recordの下で条件を遵守して最初に公開した作品は、ライセンスが継続します。新しい作品にはProを再開して新しいライセンスを発行してください。" },
        { q: "Content IDへ登録できますか？", a: "いいえ。楽曲や音声フィンガープリントの登録、権利主張、単体での再配布は禁止されています。" },
      ],
    };
  }
  if (locale === "ko") {
    return {
      title: "Flow Pro 크리에이터 음악 라이선스",
      description: "City Pop 49곡, Cyberpunk Jazz 43곡, Neo Synthwave 82곡으로 구성된 174곡을 배경음악으로 쓰는 조건. Lofi는 제외됩니다.",
      h1: "Flow Pro 크리에이터 음악 라이선스",
      intro: "활성 Flow Pro 사용자는 대상 174곡을 공개하는 크리에이터 작품의 배경음악으로 사용할 수 있습니다. 라이선스는 비독점적이고 양도할 수 없으며 소유권이나 저작권은 이전되지 않습니다.",
      allowedHeading: "허용되는 사용",
      allowed: ["수익화 영상, 라이브 방송, 팟캐스트, study-with-me, 코딩 콘텐츠의 배경음악.", "적법하게 라이선스된 크리에이터 작품의 조회와 스트리밍. 횟수 제한이 없습니다.", "Flow Pro가 활성 상태일 때 유효한 Grant Record가 존재하고 약관을 준수해 처음 공개한 작품. 정상 해지 후에도 해당 작품의 라이선스는 유지됩니다."],
      notAllowedHeading: "허용되지 않는 사용",
      notAllowed: ["곡, 파생물, 오디오 지문을 Content ID 등 권리 관리 시스템에 등록하는 행위.", "음원 파일을 단독으로 업로드, 재판매, 재라이선스 또는 재배포하는 행위.", "곡의 소유권을 주장하거나 샘플링, 리믹스, 파생곡 제작 또는 본인 명의로 DSP에 배포하는 행위.", "별도 허가 없이 음원 라이브러리, 템플릿 마켓, 앱 또는 게임에 넣는 행위."],
      attributionHeading: "저작자 표시는 필수입니다",
      attributionBody: "영상 설명, 방송 패널 또는 팟캐스트 노트에 아래 문구를 포함하세요.",
      finePrint: "새 라이선스 발급과 다운로드에는 활성 Flow Pro가 필요합니다. Spotify나 YouTube에서 듣는 것만으로는 사용권이 생기지 않습니다. 권리는 해당 권리자에게 남습니다. 정상 해지 또는 적법한 소비자 환불만으로 유효한 라이선스가 자동 소멸하지 않으며, 사기나 중대한 약관 위반은 취소 사유가 될 수 있습니다.",
      faq: [
        { q: "Flow Pro가 필요한가요?", a: "네. 새 크리에이터 라이선스 발급과 대상 곡 다운로드에는 활성 Flow Pro가 필요합니다." },
        { q: "Flow Pro를 해지하면 어떻게 되나요?", a: "Pro가 활성 상태일 때 유효한 Grant Record에 따라 약관을 준수해 처음 공개한 작품은 라이선스가 유지됩니다. 새 작품에는 Pro를 다시 활성화하고 새 라이선스를 발급하세요." },
        { q: "Content ID에 등록할 수 있나요?", a: "아니요. 곡이나 오디오 지문 등록, 권리 주장, 음원 단독 재배포는 금지됩니다." },
      ],
    };
  }
  const isId = locale === "id";
  const faq: FaqItem[] = isId
    ? [
        { q: "Apakah Flow Pro diperlukan?", a: "Ya. Lisensi kreator dan download berlaku untuk user dengan Flow Pro aktif." },
        { q: "Apa yang terjadi jika saya membatalkan Pro?", a: "Konten yang pertama kali dipublikasikan saat Pro aktif tetap berlisensi jika memiliki Grant Record yang valid dan mematuhi ketentuan. Untuk karya baru, aktifkan Pro lagi." },
        { q: "Bolehkah saya mendaftarkan musik ke Content ID?", a: "Tidak. Kamu tidak boleh mendaftarkan, mengklaim, menjual ulang, atau mendistribusikan ulang musik." },
      ]
    : [
        { q: "Do I need Flow Pro?", a: "Yes. Creator licensing and downloads are for users with an active Flow Pro plan." },
        { q: "What happens if I cancel Pro?", a: "Content first published while Pro was active stays licensed when a valid Grant Record existed and the terms were followed. New work needs Pro to be active again." },
        { q: "Can I register the music with Content ID?", a: "No. You may not register, claim, resell, or redistribute the music." },
      ];
  return {
    title: isId ? "Lisensi Musik Kreator Flow Pro" : "Flow Pro Creator Music License",
    description: isId ? "Syarat lisensi Flow Pro untuk musik City Pop, Cyberpunk Jazz, dan Neo Synthwave bagi kreator." : "The Flow Pro license terms for City Pop, Cyberpunk Jazz, and Neo Synthwave creator music.",
    h1: isId ? "Lisensi musik kreator Flow Pro" : "Flow Pro creator music license",
    intro: isId
      ? "Lisensi ini memberi pengguna Flow Pro aktif izin terbatas untuk memakai katalog City Pop, Cyberpunk Jazz, dan Neo Synthwave yang eligible sebagai musik latar. Ini bukan transfer hak cipta atau lisensi bebas tanpa batas."
      : "This license gives active Flow Pro users a limited right to use eligible City Pop, Cyberpunk Jazz, and Neo Synthwave tracks as background music. It is not a transfer of copyright or an unlimited free license.",
    allowedHeading: isId ? "Boleh digunakan untuk" : "You may use it for",
    allowed: isId
      ? ["Video monetized, livestream, podcast, study-with-me, dan konten coding.", "Konten sosial dan video kreator dengan jumlah views atau stream tanpa batas.", "Konten yang pertama kali dipublikasikan ketika Flow Pro aktif, dengan Grant Record valid dan tetap mematuhi ketentuan, bahkan setelah pembatalan normal."]
      : ["Monetized videos, livestreams, podcasts, study-with-me, and coding content.", "Social and creator videos with unlimited views or streams.", "Content first published while Flow Pro was active, with a valid Grant Record and continued compliance, even after a normal cancellation."],
    notAllowedHeading: isId ? "Tidak boleh" : "You may not",
    notAllowed: isId
      ? ["Mendaftarkan musik atau karya turunan ke Content ID atau sistem rights-management.", "Mengunggah, menjual ulang, menyublisensikan, atau mendistribusikan file sebagai musik standalone.", "Me-sample, me-remix, membuat lagu turunan, atau mengunggahnya ke DSP atas nama kamu.", "Menggunakan musik untuk library, marketplace template, app, atau game tanpa izin terpisah."]
      : ["Register the music or a derivative work with Content ID or another rights-management system.", "Upload, resell, sublicense, or redistribute the files as standalone music.", "Sample, remix, make a derivative song, or upload it to a DSP under your name.", "Use the music in a library, template marketplace, app, or game without separate permission."],
    attributionHeading: isId ? "Atribusi wajib" : "Required attribution",
    attributionBody: isId ? "Cantumkan baris ini di deskripsi video, panel stream, atau catatan podcast:" : "Include this line in your video description, stream panel, or podcast notes:",
    finePrint: isId
      ? "Hak tetap berada pada pemegang hak yang relevan. Pembatalan biasa atau refund konsumen yang sah tidak otomatis menghapus lisensi yang valid; fraud atau pelanggaran material dapat menjadi dasar pencabutan grant terkait."
      : "Rights remain with the relevant rights holder. An ordinary cancellation or lawful consumer refund does not automatically erase a valid licence; fraud or material breach may support revocation of the related grant.",
    faq,
  };
}

export function creatorOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Chill Music Division",
    parentOrganization: { "@type": "Organization", name: "Virzy Guns Production" },
    sameAs: [SPOTIFY_ARTIST_URL],
    url: "https://flow.virzyguns.com/creator-music",
  };
}
