import assert from "node:assert/strict";
import test from "node:test";
import { feeds, sourceName } from "./feeds";

test("the reader uses every feed named in the plan", () => {
  assert.deepEqual(
    feeds.map((feed) => feed.url),
    [
      "https://feeds.bbci.co.uk/news/rss.xml",
      "https://feeds.bbci.co.uk/news/world/rss.xml",
      "https://feeds.bbci.co.uk/news/technology/rss.xml",
      "https://feeds.bbci.co.uk/news/health/rss.xml",
      "https://feeds.bbci.co.uk/news/business/rss.xml",
      "https://feeds.bbci.co.uk/news/politics/rss.xml",
      "https://feeds.npr.org/1001/rss.xml",
      "https://feeds.npr.org/1004/rss.xml",
      "https://feeds.npr.org/1014/rss.xml",
      "https://feeds.npr.org/1006/rss.xml",
      "https://www.theguardian.com/world/rss",
      "https://www.theguardian.com/technology/rss",
      "https://www.theguardian.com/business/rss",
      "https://www.theguardian.com/society/rss",
      "https://www.aljazeera.com/xml/rss/all.xml",
      "https://www.france24.com/en/rss",
      "https://rss.dw.com/rdf/rss-en-all",
      "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
      "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
      "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
      "https://rss.cbc.ca/lineup/topstories.xml",
      "https://rss.cbc.ca/lineup/world.xml",
      "https://www.abc.net.au/news/feed/51120/rss.xml",
      "https://rss.politico.com/politics-news.xml",
      "https://www.cbsnews.com/latest/rss/main",
      "https://rss.dw.com/rdf/rss-en-world",
      "https://www.pbs.org/newshour/feeds/rss/headlines",
      "https://feeds.npr.org/1019/rss.xml",
      "https://www.theguardian.com/politics/rss",
      "https://abcnews.go.com/abcnews/topstories",
      "https://feeds.nbcnews.com/nbcnews/public/news",
      "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
    ],
  );
  assert.equal(sourceName("bbc-world"), "BBC News");
  assert.equal(sourceName("guardian-society"), "The Guardian");
  assert.equal(sourceName("dw-world"), "DW");
});
