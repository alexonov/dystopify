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
    ],
  );
  assert.equal(sourceName("bbc-world"), "BBC News");
  assert.equal(sourceName("guardian-society"), "The Guardian");
});
