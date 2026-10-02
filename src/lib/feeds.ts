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
  {
    id: "nyt-world",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    source: "The New York Times",
  },
  {
    id: "nyt-politics",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
    source: "The New York Times",
  },
  {
    id: "nyt-technology",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    source: "The New York Times",
  },
  {
    id: "cbc-top",
    url: "https://rss.cbc.ca/lineup/topstories.xml",
    source: "CBC",
  },
  {
    id: "cbc-world",
    url: "https://rss.cbc.ca/lineup/world.xml",
    source: "CBC",
  },
  {
    id: "abc-australia",
    url: "https://www.abc.net.au/news/feed/51120/rss.xml",
    source: "ABC Australia",
  },
  {
    id: "politico",
    url: "https://rss.politico.com/politics-news.xml",
    source: "Politico",
  },
  {
    id: "cbs-news",
    url: "https://www.cbsnews.com/latest/rss/main",
    source: "CBS News",
  },
  {
    id: "dw-world",
    url: "https://rss.dw.com/rdf/rss-en-world",
    source: "DW",
  },
  {
    id: "pbs-newshour",
    url: "https://www.pbs.org/newshour/feeds/rss/headlines",
    source: "PBS NewsHour",
  },
  {
    id: "npr-technology",
    url: "https://feeds.npr.org/1019/rss.xml",
    source: "NPR",
  },
  {
    id: "guardian-politics",
    url: "https://www.theguardian.com/politics/rss",
    source: "The Guardian",
  },
  {
    id: "abc-news",
    url: "https://abcnews.go.com/abcnews/topstories",
    source: "ABC News",
  },
  {
    id: "nbc-news",
    url: "https://feeds.nbcnews.com/nbcnews/public/news",
    source: "NBC News",
  },
  {
    id: "un-news",
    url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
    source: "UN News",
  },
];

export function sourceName(feedId: string): string {
  return feeds.find((feed) => feed.id === feedId)?.source ?? feedId;
}
