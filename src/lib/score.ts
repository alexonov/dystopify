import { RAW_SCALE, type Book } from "../../data/books";

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

export function scoreTitleGroups(book: Book, groups: TitleGroup[]): BookTally {
  const themePoints: Record<string, number> = {};
  for (const theme of book.themes) themePoints[theme.id] = 0;

  let raw = 0;
  const matches: ScoredMatch[] = [];

  for (const group of groups) {
    let best = 0;
    const hitMap = new Map<string, PhraseHit>();
    const themeBest: Record<string, number> = {};

    for (const title of group.titles) {
      const matched = matchTitle(title, book);
      if (matched.weight > best) best = matched.weight;
      for (const hit of matched.hits) {
        hitMap.set(`${hit.themeId}\u0000${hit.phrase}`, hit);
        themeBest[hit.themeId] = Math.max(themeBest[hit.themeId] ?? 0, hit.weight);
      }
    }

    if (best <= 0) continue;
    raw += best;
    for (const [themeId, points] of Object.entries(themeBest)) {
      themePoints[themeId] += points;
    }
    matches.push({
      titleKey: group.titleKey,
      title: group.displayTitle,
      publishedAt: group.publishedAt,
      weight: best,
      hits: [...hitMap.values()].sort(
        (a, b) => b.weight - a.weight || a.phrase.localeCompare(b.phrase),
      ),
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
