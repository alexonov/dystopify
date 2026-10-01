export type Feed = {
  id: string;
  url: string;
  source: string;
};

export const feeds: Feed[] = [
  {
    id: "bbc-top",
    url: "https://feeds.bbci.co.uk/news/rss.xml",
    source: "BBC News",
  },
  {
    id: "bbc-world",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    source: "BBC News",
  },
  {
    id: "bbc-technology",
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    source: "BBC News",
  },
  {
    id: "bbc-health",
    url: "https://feeds.bbci.co.uk/news/health/rss.xml",
    source: "BBC News",
  },
  {
    id: "bbc-business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    source: "BBC News",
  },
  {
    id: "bbc-politics",
    url: "https://feeds.bbci.co.uk/news/politics/rss.xml",
    source: "BBC News",
  },
  {
    id: "npr-news",
    url: "https://feeds.npr.org/1001/rss.xml",
    source: "NPR",
  },
  {
    id: "npr-world",
    url: "https://feeds.npr.org/1004/rss.xml",
    source: "NPR",
  },
  {
    id: "npr-politics",
    url: "https://feeds.npr.org/1014/rss.xml",
    source: "NPR",
  },
  {
    id: "npr-business",
    url: "https://feeds.npr.org/1006/rss.xml",
    source: "NPR",
  },
  {
    id: "guardian-world",
    url: "https://www.theguardian.com/world/rss",
    source: "The Guardian",
  },
  {
    id: "guardian-technology",
    url: "https://www.theguardian.com/technology/rss",
    source: "The Guardian",
  },
  {
    id: "guardian-business",
    url: "https://www.theguardian.com/business/rss",
    source: "The Guardian",
  },
  {
    id: "guardian-society",
    url: "https://www.theguardian.com/society/rss",
    source: "The Guardian",
  },
  {
    id: "al-jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    source: "Al Jazeera",
  },
  {
    id: "france-24",
    url: "https://www.france24.com/en/rss",
    source: "France 24",
  },
  {
    id: "dw",
    url: "https://rss.dw.com/rdf/rss-en-all",
    source: "DW",
  },
];

export function sourceName(feedId: string): string {
  return feeds.find((feed) => feed.id === feedId)?.source ?? feedId;
}
