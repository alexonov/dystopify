import { RAW_SCALE, themeRule, type Book } from "../../data/books";
import { contentWords, storyClusters, storyWeight } from "./stories";

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

export function counterKey(bookId: string, themeId: string, titleKey: string): string {
  return `${entailmentKey(bookId, themeId, titleKey)}\u0001counter`;
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

type Qualified = {
  group: TitleGroup;
  themeId: string;
  anchor: string;
};

function byTime(left: Qualified, right: Qualified): number {
  return left.group.publishedAt.localeCompare(right.group.publishedAt) || left.group.titleKey.localeCompare(right.group.titleKey);
}

export function scoreTitleGroups(
  book: Book,
  groups: TitleGroup[],
  entailment: ReadonlyMap<string, number> = new Map(),
  min = ENTAILMENT_MIN,
): BookTally {
  const themePoints: Record<string, number> = {};
  for (const theme of book.themes) themePoints[theme.id] = 0;

  const qualified: Qualified[] = [];
  for (const group of groups) {
    for (const theme of book.themes) {
      const rule = themeRule(book.id, theme.id);
      if (!rule) continue;
      const found = matchedAnchors(group.titles, rule.anchors);
      if (found.length === 0) continue;
      const probability = entailment.get(entailmentKey(book.id, theme.id, group.titleKey));
      if (probability == null || probability < min) continue;
      if (rule.counter) {
        const ordinary = entailment.get(counterKey(book.id, theme.id, group.titleKey));
        if (ordinary == null || probability <= ordinary) continue;
      }
      qualified.push({ group, themeId: theme.id, anchor: found[0] });
    }
  }

  const carried = new Map<string, number>();
  const hitsByTitle = new Map<string, PhraseHit[]>();
  for (const theme of book.themes) {
    const rows = qualified.filter((item) => item.themeId === theme.id);
    const anchors = themeRule(book.id, theme.id)?.anchors ?? [];
    const indexed = rows.map((row) => ({
      row,
      words: contentWords(row.group.displayTitle, anchors),
    }));
    const clusters = storyClusters(indexed)
      .map((indexes) => indexes.map((index) => indexed[index].row).sort(byTime))
      .sort((left, right) => byTime(left[0], right[0]));
    themePoints[theme.id] = storyWeight(clusters.length);
    clusters.forEach((cluster, storyIndex) => {
      const weight = ANCHOR_WEIGHT / 2 ** storyIndex;
      const lead = cluster[0];
      carried.set(lead.group.titleKey, (carried.get(lead.group.titleKey) ?? 0) + weight);
      for (const row of cluster) {
        const hits = hitsByTitle.get(row.group.titleKey) ?? [];
        hits.push({ themeId: row.themeId, phrase: row.anchor, weight: ANCHOR_WEIGHT });
        hitsByTitle.set(row.group.titleKey, hits);
      }
    });
  }

  const seen = new Map<string, TitleGroup>();
  for (const item of qualified) seen.set(item.group.titleKey, item.group);
  const matches: ScoredMatch[] = [...seen.values()].map((group) => ({
    titleKey: group.titleKey,
    title: group.displayTitle,
    publishedAt: group.publishedAt,
    weight: carried.get(group.titleKey) ?? 0,
    hits: hitsByTitle.get(group.titleKey) ?? [],
  }));
  matches.sort(
    (a, b) =>
      b.weight - a.weight ||
      b.publishedAt.localeCompare(a.publishedAt) ||
      a.title.localeCompare(b.title),
  );
  const raw = book.themes.reduce((sum, theme) => sum + (themePoints[theme.id] ?? 0), 0);

  return {
    raw,
    score: scoreFromRaw(raw),
    matchedCount: matches.length,
    themePoints,
    matches,
  };
}
