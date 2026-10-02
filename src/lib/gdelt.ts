export const GDELT_FEED_ID = "gdelt-doc";
export const GDELT_QUERY = "sourcelang:english";
export const GDELT_MODE = "artlist";
export const GDELT_MAX_TITLES = 250;

export type GdeltArticle = {
  title: string;
  url: string;
  seen: Date;
};

export function gdeltArtListUrl(day: string): string {
  const compact = day.replaceAll("-", "");
  const params = new URLSearchParams({
    query: GDELT_QUERY,
    mode: GDELT_MODE,
    format: "json",
    maxrecords: String(GDELT_MAX_TITLES),
    startdatetime: `${compact}000000`,
    enddatetime: `${compact}235959`,
  });
  return `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;
}

export function parseGdeltArtList(body: string, fallbackDay: string): GdeltArticle[] {
  const trimmed = body.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    throw new Error(trimmed.slice(0, 180));
  }
  const data = JSON.parse(trimmed) as { articles?: unknown };
  const articles = Array.isArray(data.articles) ? data.articles : [];
  const parsed: GdeltArticle[] = [];
  for (const item of articles) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const url = typeof record.url === "string" ? record.url.trim() : "";
    if (!title || !url) continue;
    const seen = parseSeen(typeof record.seendate === "string" ? record.seendate : "", fallbackDay);
    parsed.push({ title, url, seen });
  }
  return parsed;
}

const STOP = new Set([
  "that",
  "this",
  "with",
  "from",
  "have",
  "after",
  "about",
  "their",
  "there",
  "would",
  "could",
  "says",
  "said",
  "will",
  "into",
  "over",
  "than",
  "them",
  "they",
  "been",
  "were",
  "what",
  "when",
  "your",
  "more",
  "also",
  "just",
  "news",
  "today",
  "which",
  "while",
  "where",
  "these",
  "those",
  "other",
]);

export function dominantTopic(titles: string[]): { word: string; share: number } | null {
  if (titles.length < 40) return null;
  const counts = new Map<string, number>();
  for (const title of titles) {
    const words = new Set(
      title
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((word) => word.length > 4 && !STOP.has(word)),
    );
    for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  let best = "";
  let count = 0;
  for (const [word, seen] of counts) {
    if (seen > count) {
      best = word;
      count = seen;
    }
  }
  const share = count / titles.length;
  if (share >= 0.45) return { word: best, share };
  return null;
}

export function titleFromGkgLine(line: string): { title: string; url: string; seen: string | null } | null {
  const parts = line.split("\t");
  if (parts.length < 27) return null;
  if (parts[25].trim()) return null;
  const url = parts[4].trim();
  const extras = parts[26];
  const start = extras.indexOf("<PAGE_TITLE>");
  const end = extras.indexOf("</PAGE_TITLE>");
  if (!url || start < 0 || end <= start) return null;
  const title = decodeXml(extras.slice(start + "<PAGE_TITLE>".length, end))
    .replace(/\s+/g, " ")
    .trim();
  if (!title) return null;
  const letters = [...title].filter((character) => /\p{L}/u.test(character));
  if (letters.length < 3) return null;
  const latin = letters.filter((character) => character.charCodeAt(0) < 128).length / letters.length;
  if (latin < 0.9) return null;
  const stamp = extras.match(/<PAGE_PRECISEPUBTIMESTAMP>(\d{14})<\/PAGE_PRECISEPUBTIMESTAMP>/);
  return { title, url, seen: stamp?.[1] ?? null };
}

function decodeXml(input: string): string {
  return input.replace(/&#x([0-9a-fA-F]+);|&#(\d+);|&amp;|&lt;|&gt;|&quot;|&apos;|&nbsp;/g, (full, hex: string, dec: string) => {
    if (hex) return String.fromCodePoint(Number.parseInt(hex, 16));
    if (dec) return String.fromCodePoint(Number.parseInt(dec, 10));
    if (full === "&amp;") return "&";
    if (full === "&lt;") return "<";
    if (full === "&gt;") return ">";
    if (full === "&quot;") return '"';
    if (full === "&apos;") return "'";
    return " ";
  });
}

function parseSeen(value: string, fallbackDay: string): Date {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 14) {
    const year = Number(digits.slice(0, 4));
    const month = Number(digits.slice(4, 6));
    const day = Number(digits.slice(6, 8));
    const hour = Number(digits.slice(8, 10));
    const minute = Number(digits.slice(10, 12));
    const second = Number(digits.slice(12, 14));
    const seen = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    if (!Number.isNaN(seen.getTime())) return seen;
  }
  return new Date(`${fallbackDay}T12:00:00.000Z`);
}
