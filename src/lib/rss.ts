import { XMLParser } from "fast-xml-parser";
import { cutDescription } from "./text";

export type ParsedItem = {
  title: string;
  link: string;
  guid?: string;
  published: Date;
  description: string | null;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  trimValues: true,
});

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function textOf(node: unknown): string {
  if (typeof node === "string" || typeof node === "number") return String(node).trim();
  if (Array.isArray(node)) {
    for (const part of node) {
      const text = textOf(part);
      if (text) return text;
    }
    return "";
  }
  if (node && typeof node === "object") {
    const record = node as Record<string, unknown>;
    if (typeof record["#text"] === "string" || typeof record["#text"] === "number") {
      return String(record["#text"]).trim();
    }
  }
  return "";
}

function linkOf(node: unknown): string {
  if (typeof node === "string") return node.trim();
  if (Array.isArray(node)) {
    let fallback = "";
    for (const part of node) {
      const href = linkOf(part);
      if (!href) continue;
      const rel =
        part && typeof part === "object" ? String((part as Record<string, unknown>).rel ?? "") : "";
      if (rel === "" || rel === "alternate") return href;
      if (!fallback) fallback = href;
    }
    return fallback;
  }
  if (node && typeof node === "object") {
    const record = node as Record<string, unknown>;
    if (typeof record.href === "string" && record.href.trim()) return record.href.trim();
    return textOf(record);
  }
  return "";
}

function recordOf(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function collectItems(doc: Record<string, unknown>): unknown[] {
  const rss = recordOf(doc.rss);
  const channel = recordOf(rss?.channel);
  if (channel?.item) return asArray(channel.item);

  const rdf = recordOf(doc.RDF);
  if (rdf?.item) return asArray(rdf.item);

  const feed = recordOf(doc.feed);
  if (feed?.entry) return asArray(feed.entry);

  return [];
}

function publishedOf(item: Record<string, unknown>): Date | null {
  const raw =
    textOf(item.pubDate) ||
    textOf(item.date) ||
    textOf(item.published) ||
    textOf(item.updated) ||
    textOf(item.issued);
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function parseFeed(xml: string): ParsedItem[] {
  const doc = parser.parse(xml) as Record<string, unknown>;
  const items: ParsedItem[] = [];

  for (const node of collectItems(doc)) {
    const item = recordOf(node);
    if (!item) continue;
    const title = textOf(item.title).replace(/\s+/g, " ").trim();
    const link = linkOf(item.link);
    const published = publishedOf(item);
    if (!title || !link || !published) continue;
    const guid = textOf(item.guid) || textOf(item.id) || undefined;
    const description = cutDescription(textOf(item.description) || textOf(item.summary));
    items.push({ title, link, guid, published, description });
  }

  return items;
}
