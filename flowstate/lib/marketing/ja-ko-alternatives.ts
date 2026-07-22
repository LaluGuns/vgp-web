import type { AlternativeCopy, AlternativeSlug } from "@/lib/translations/pages/alternatives";

const competitorNames: Record<AlternativeSlug, string> = {
  brainfm: "Brain.fm",
  endel: "Endel",
  flocus: "Flocus",
  pomofocus: "Pomofocus",
  noisli: "Noisli",
};

function japaneseCopy(name: string): AlternativeCopy {
  return {
    metaTitle: `${name}の代替候補：Flowを比較`,
    metaDescription: `${name}とFlowの現在の提供内容、タイマー、音楽、セッション記録、クリエイター向けライセンスの違いを慎重に確認できます。`,
    h1: `${name}の代替候補としてFlowを比較`,
    intro: [
      `${name}は、集中や作業を支える独自の製品体験を提供しています。機能、対応環境、料金、規約は変わる可能性があるため、判断前に${name}の公式サイトで最新情報を確認してください。`,
      "Flowは、ブラウザのポモドーロタイマー、タスク、一人の音楽家が自社制作した完成楽曲、調整可能な環境音、実測時間にもとづくセッション記録を組み合わせます。これは作業方法の違いであり、どちらかが常に優れているという主張ではありません。",
    ],
    competitorName: name,
    tableHeading: "現在の提供内容を比較",
    rows: [
      { feature: "現在のプラン", them: `内容は変わる可能性があります。${name}の現在の提供内容を確認してください`, flow: "無料のタイマー利用と有料Proプラン。Flowの現在の料金ページを確認してください" },
      { feature: "音声・音楽", them: `${name}の現在の音声・音楽機能を公式サイトで確認してください`, flow: "一人の音楽家が自社制作した完成楽曲と調整可能な環境音" },
      { feature: "集中ワークフロー", them: `${name}の現在のタイマー、タスク、記録機能を確認してください`, flow: "ポモドーロのプリセット、カスタム時間、タスク、実測時間の記録" },
      { feature: "対応環境", them: `${name}の現在の対応端末とブラウザを確認してください`, flow: "ブラウザベース。利用する端末とブラウザで事前に動作確認してください" },
      { feature: "クリエイターライセンス", them: `${name}の現在のライセンス規約を確認してください`, flow: "Freeには含まれません。対象は正確に174曲。新しいダウンロードまたはライセンスごとに有効なProと曲別の有効なGrant Recordが必要です。表示義務と公開規約が適用され、SpotifyやYouTubeで聴くだけではクリエイター利用権は得られません" },
    ],
    whenHeading: `${name}が向いている場合`,
    whenParagraphs: [
      `${name}の現在の体験やワークフローが自分の習慣に合うなら、有力な候補です。機能、プラン、対応環境、規約は${name}から直接確認してください。`,
      "ブラウザ内でタイマー、タスク、自社制作音楽、環境音、実測セッション記録をまとめたい場合はFlowを検討できます。Flowは医学的効果、神経科学的効果、生産性向上を保証しません。",
    ],
    faq: [
      { q: "どちらの料金が安いですか？", a: `料金とプラン内容は変わる可能性があります。Flowと${name}の現在の料金ページを直接比較してください。` },
      { q: "Flowはどの環境で使えますか？", a: "Flowはブラウザベースですが、互換性は端末、ブラウザ、設定によって異なる場合があります。契約前に公開タイマーで確認してください。" },
      { q: "Flowの音楽を動画や配信に使えますか？", a: "Flow Creator Musicを通じた場合に限ります。Free、Spotify、YouTubeで聴くだけでは利用権は得られません。対象は正確に174曲で、新しいダウンロードまたはライセンスごとに有効なProと曲別の有効なGrant Recordが必要です。表示義務と公開規約が適用されます。" },
    ],
  };
}

function koreanCopy(name: string): AlternativeCopy {
  return {
    metaTitle: `${name} 대안으로 Flow 비교하기`,
    metaDescription: `${name}과 Flow의 현재 제공 내용, 타이머, 음악, 세션 기록, 크리에이터 라이선스 차이를 신중하게 확인하세요.`,
    h1: `${name} 대안으로 Flow 비교하기`,
    intro: [
      `${name}은 집중과 작업을 돕는 고유한 제품 경험을 제공합니다. 기능, 지원 환경, 요금, 약관은 바뀔 수 있으므로 결정하기 전에 ${name} 공식 사이트에서 최신 정보를 확인하세요.`,
      "Flow는 브라우저 포모도로 타이머, 할 일, 한 명의 음악가가 자체 제작한 완성곡, 조절 가능한 앰비언트 사운드, 실측 시간 기반 세션 기록을 결합합니다. 이는 작업 방식의 차이이며 어느 제품이 항상 더 낫다는 주장이 아닙니다.",
    ],
    competitorName: name,
    tableHeading: "현재 제공 내용 비교",
    rows: [
      { feature: "현재 플랜", them: `내용은 바뀔 수 있습니다. ${name}의 현재 제공 내용을 확인하세요`, flow: "무료 타이머 이용과 유료 Pro 플랜. Flow의 현재 요금 페이지를 확인하세요" },
      { feature: "오디오·음악", them: `${name}의 현재 오디오·음악 기능을 공식 사이트에서 확인하세요`, flow: "한 명의 음악가가 자체 제작한 완성곡과 조절 가능한 앰비언트 사운드" },
      { feature: "집중 워크플로", them: `${name}의 현재 타이머, 할 일, 기록 기능을 확인하세요`, flow: "포모도로 프리셋, 사용자 설정 시간, 할 일, 실측 시간 기록" },
      { feature: "지원 환경", them: `${name}의 현재 지원 기기와 브라우저를 확인하세요`, flow: "브라우저 기반. 사용할 기기와 브라우저에서 먼저 확인하세요" },
      { feature: "크리에이터 라이선스", them: `${name}의 현재 라이선스 약관을 확인하세요`, flow: "Free에는 포함되지 않습니다. 대상은 정확히 174곡입니다. 새 다운로드 또는 라이선스마다 활성 Pro와 곡별 유효한 Grant Record가 필요합니다. 저작자 표시와 공개 약관이 적용되며 Spotify나 YouTube에서 듣는 것만으로는 크리에이터 이용 권한이 생기지 않습니다" },
    ],
    whenHeading: `${name}이 더 잘 맞는 경우`,
    whenParagraphs: [
      `${name}의 현재 경험과 워크플로가 습관에 맞는다면 좋은 후보일 수 있습니다. 기능, 플랜, 지원 환경, 약관은 ${name}에서 직접 확인하세요.`,
      "브라우저 안에서 타이머, 할 일, 자체 제작 음악, 앰비언트 사운드, 실측 세션 기록을 함께 쓰고 싶다면 Flow를 고려할 수 있습니다. Flow는 의학적 효과, 신경과학적 효과, 생산성 향상을 보장하지 않습니다.",
    ],
    faq: [
      { q: "어느 쪽이 더 저렴한가요?", a: `요금과 플랜 내용은 바뀔 수 있습니다. Flow와 ${name}의 현재 요금 페이지를 직접 비교하세요.` },
      { q: "Flow는 어떤 환경에서 작동하나요?", a: "Flow는 브라우저 기반이지만 호환성은 기기, 브라우저, 설정에 따라 다를 수 있습니다. 구독 전에 공개 타이머로 확인하세요." },
      { q: "Flow 음악을 영상이나 스트리밍에 쓸 수 있나요?", a: "Flow Creator Music을 통하는 경우에만 가능합니다. Free, Spotify, YouTube에서 듣는 것만으로는 이용 권한이 생기지 않습니다. 대상은 정확히 174곡이며 새 다운로드 또는 라이선스마다 활성 Pro와 곡별 유효한 Grant Record가 필요합니다. 저작자 표시와 공개 약관이 적용됩니다." },
    ],
  };
}

export function getJaKoAlternativeCopy(locale: string, slug: AlternativeSlug): AlternativeCopy | undefined {
  const name = competitorNames[slug];
  if (locale === "ja-JP") return japaneseCopy(name);
  if (locale === "ko-KR") return koreanCopy(name);
  return undefined;
}
