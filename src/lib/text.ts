const OUTLETS = [
  "bbc news",
  "the guardian",
  "al jazeera",
  "france 24",
  "deutsche welle",
  "guardian",
  "npr",
  "bbc",
  "dw",
];

const SEPARATORS = [" - ", " – ", " — ", " | "];

const TRACKING = new Set(["fbclid", "gclid"]);

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ldquo: "\u201c",
  rdquo: "\u201d",
  lsquo: "\u2018",
  rsquo: "\u2019",
  mdash: "\u2014",
  ndash: "\u2013",
  hellip: "\u2026",
};

export function titleKey(title: string): string {
  let text = title.trim().toLowerCase();
  let stripped = true;
  while (stripped) {
    stripped = false;
    for (const separator of SEPARATORS) {
      const index = text.lastIndexOf(separator);
      if (index === -1) continue;
      const tail = text.slice(index + separator.length).trim();
      if (OUTLETS.includes(tail)) {
        text = text.slice(0, index).trim();
        stripped = true;
      }
    }
  }
  text = text.replace(/[^\p{L}\p{N}\s]/gu, "");
  return text.replace(/\s+/g, " ").trim();
}

export function canonicalLink(input: string): string {
  const trimmed = input.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return trimmed.toLowerCase();
  }
  url.hash = "";
  const kept = new URLSearchParams();
  for (const [key, value] of url.searchParams) {
    const lower = key.toLowerCase();
    if (lower.startsWith("utm_") || TRACKING.has(lower)) continue;
    kept.append(lower, value);
  }
  kept.sort();
  const query = kept.toString();
  url.search = query;
  return url.toString().toLowerCase();
}

export function itemKey(guid: string | undefined, canonical: string): string {
  const trimmed = guid?.trim();
  return trimmed ? trimmed : canonical;
}

function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (full, body: string) => {
    if (body.startsWith("#x") || body.startsWith("#X")) {
      const code = Number.parseInt(body.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : full;
    }
    if (body.startsWith("#")) {
      const code = Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : full;
    }
    return NAMED_ENTITIES[body] ?? full;
  });
}

export function cutDescription(input: string | undefined | null): string | null {
  if (!input) return null;
  const text = decodeEntities(input.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.slice(0, 280);
}
