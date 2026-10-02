import { RAW_SCALE, themeRule, type Book } from "../../data/books";

export const ANCHOR_WEIGHT = 2;
export const ENTAILMENT_MIN = 0.9;

export type PhraseHit = {
  themeId: string;
  phrase: string;
  weight: 2 | 3;
};

export type TitleGroup = {
  titleKey: string;
  titles: string[];
  displayTitle: string;
  publishedAt: string;
};

export type ScoredMatch = {
  titleKey: string;
  title: string;
  publishedAt: string;
  weight: number;
  hits: PhraseHit[];
};

export type BookTally = {
  raw: number;
  score: number;
  matchedCount: number;
  themePoints: Record<string, number>;
  matches: ScoredMatch[];
};

export function scoreFromRaw(raw: number, scale = RAW_SCALE): number {
  if (raw <= 0) return 0;
  return Math.round(100 * (1 - Math.exp(-raw / scale)));
}

export function phraseHits(title: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(title);
}

export function anchorHits(title: string, anchor: string): boolean {
  return phraseHits(title, anchor);
}

export function entailmentKey(bookId: string, themeId: string, titleKey: string): string {
  return `${bookId}\u0000${themeId}\u0000${titleKey}`;
}

export function matchedAnchors(titles: string[], anchors: string[]): string[] {
  return anchors.filter((anchor) => titles.some((title) => anchorHits(title, anchor)));
}

export function premiseForAnchors(titles: string[], anchors: string[]): string {
  const hits = titles.filter((title) => anchors.some((anchor) => anchorHits(title, anchor)));
  return [...hits].sort((a, b) => b.length - a.length || a.localeCompare(b))[0] ?? titles[0];
}

export function matchTitle(title: string, book: Book): { weight: number; hits: PhraseHit[] } {
  const hits: PhraseHit[] = [];
  for (const theme of book.themes) {
    for (const phrase of theme.phrases) {
      if (phraseHits(title, phrase.text)) {
        hits.push({
          themeId: theme.id,
          phrase: phrase.text,
          weight: phrase.weight,
        });
      }
    }
  }
  const weight = hits.reduce((max, hit) => Math.max(max, hit.weight), 0);
  return { weight, hits };
}

export function scoreTitleGroups(
  book: Book,
  groups: TitleGroup[],
  entailment: ReadonlyMap<string, number> = new Map(),
  min = ENTAILMENT_MIN,
): BookTally {
  const themePoints: Record<string, number> = {};
  for (const theme of book.themes) themePoints[theme.id] = 0;

  let raw = 0;
  const matches: ScoredMatch[] = [];

  for (const group of groups) {
    const hits: PhraseHit[] = [];
    let added = 0;

    for (const theme of book.themes) {
      const rule = themeRule(book.id, theme.id);
      if (!rule) continue;
      const found = matchedAnchors(group.titles, rule.anchors);
      if (found.length === 0) continue;
      const probability = entailment.get(entailmentKey(book.id, theme.id, group.titleKey));
      if (probability == null || probability < min) continue;
      hits.push({ themeId: theme.id, phrase: found[0], weight: ANCHOR_WEIGHT });
      themePoints[theme.id] += ANCHOR_WEIGHT;
      added += ANCHOR_WEIGHT;
    }

    if (added <= 0) continue;
    raw += added;
    matches.push({
      titleKey: group.titleKey,
      title: group.displayTitle,
      publishedAt: group.publishedAt,
      weight: added,
      hits,
    });
  }

  matches.sort(
    (a, b) =>
      b.weight - a.weight ||
      b.publishedAt.localeCompare(a.publishedAt) ||
      a.title.localeCompare(b.title),
  );

  return {
    raw,
    score: scoreFromRaw(raw),
    matchedCount: matches.length,
    themePoints,
    matches,
  };
}
