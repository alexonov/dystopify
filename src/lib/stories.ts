const STOP = new Set([
  "the",
  "of",
  "to",
  "says",
  "said",
  "over",
  "a",
  "an",
  "and",
  "or",
  "in",
  "on",
  "for",
  "with",
  "from",
  "by",
  "at",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "it",
  "its",
  "their",
  "his",
  "her",
  "who",
  "what",
  "when",
  "where",
  "how",
  "that",
  "this",
  "these",
  "those",
  "after",
  "before",
  "into",
  "about",
  "than",
  "then",
  "also",
  "will",
  "has",
  "have",
  "had",
  "not",
  "no",
  "but",
  "if",
  "out",
  "up",
  "via",
  "amid",
  "during",
  "while",
  "between",
  "against",
  "under",
  "per",
  "vs",
  "new",
  "more",
  "its",
  "our",
  "your",
  "they",
  "them",
  "he",
  "she",
  "we",
  "you",
  "can",
  "may",
  "could",
  "would",
  "should",
  "just",
  "into",
  "across",
  "within",
  "without",
  "because",
  "since",
  "until",
  "among",
]);

function stem(word: string): string {
  if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

export function contentWords(title: string, anchors: string[]): Set<string> {
  const blocked = new Set<string>();
  for (const anchor of anchors) {
    for (const token of tokensOf(anchor)) blocked.add(token);
  }
  const words = new Set<string>();
  for (const token of tokensOf(title)) {
    if (token.length < 3 || STOP.has(token) || blocked.has(token)) continue;
    words.add(token);
  }
  return words;
}

function tokensOf(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['’]s\b/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(stem);
}

function shared(left: Set<string>, right: Set<string>): number {
  let count = 0;
  for (const word of left) if (right.has(word)) count += 1;
  return count;
}

export function storyWeight(storyCount: number): number {
  let total = 0;
  let add = 2;
  for (let i = 0; i < storyCount; i += 1) {
    total += add;
    add /= 2;
  }
  return total;
}

export function storyClusters(groups: { words: Set<string> }[]): number[][] {
  const parent = groups.map((_, index) => index);
  const find = (index: number): number => {
    let cursor = index;
    while (parent[cursor] !== cursor) {
      parent[cursor] = parent[parent[cursor]];
      cursor = parent[cursor];
    }
    return cursor;
  };
  for (let i = 0; i < groups.length; i += 1) {
    for (let j = i + 1; j < groups.length; j += 1) {
      if (shared(groups[i].words, groups[j].words) < 2) continue;
      const left = find(i);
      const right = find(j);
      if (left !== right) parent[left] = right;
    }
  }
  const buckets = new Map<number, number[]>();
  for (let index = 0; index < groups.length; index += 1) {
    const root = find(index);
    const list = buckets.get(root) ?? [];
    list.push(index);
    buckets.set(root, list);
  }
  return [...buckets.values()];
}

export function storyRaw(groups: { words: Set<string> }[]): number {
  return storyWeight(storyClusters(groups).length);
}
