import assert from "node:assert/strict";
import test from "node:test";
import { feeds } from "./feeds";
import { parseFeed } from "./rss";

const RSS = `<?xml version="1.0"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <item>
      <title>Facial recognition trial</title>
      <link>https://example.com/a?utm_source=rss</link>
      <guid isPermaLink="false">abc</guid>
      <pubDate>Thu, 01 Oct 2026 15:04:00 GMT</pubDate>
      <description>Short &amp; plain</description>
      <content:encoded><![CDATA[<p>ARTICLE BODY THAT MUST NOT BE KEPT</p>]]></content:encoded>
    </item>
  </channel>
</rss>`;

const ATOM = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Predictive policing pilot</title>
    <link rel="alternate" href="https://example.com/atom"/>
    <id>tag:example:1</id>
    <updated>2026-10-01T18:00:00Z</updated>
    <summary>A summary line.</summary>
  </entry>
</feed>`;

const RDF = `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns="http://purl.org/rss/1.0/">
  <item rdf:about="https://example.com/dw">
    <title>Climate refugees arrive</title>
    <link>https://example.com/dw</link>
    <description>A short line.</description>
    <dc:date>2026-10-01T08:00:00Z</dc:date>
  </item>
</rdf:RDF>`;

test("every feed named in the plan, BBC attributed as BBC News", () => {
  assert.equal(feeds.length, 17);
  assert.equal(new Set(feeds.map((feed) => feed.url)).size, 17);
  for (const feed of feeds.filter((item) => item.id.startsWith("bbc-"))) {
    assert.equal(feed.source, "BBC News");
  }
});

test("rss keeps a short description and drops the article body", () => {
  const [item] = parseFeed(RSS);
  assert.equal(item.title, "Facial recognition trial");
  assert.equal(item.guid, "abc");
  assert.equal(item.link, "https://example.com/a?utm_source=rss");
  assert.equal(item.description, "Short & plain");
  assert.equal(item.description?.includes("ARTICLE BODY"), false);
  assert.equal(item.published.toISOString(), "2026-10-01T15:04:00.000Z");
});

test("atom and rdf items parse", () => {
  const atom = parseFeed(ATOM);
  assert.equal(atom.length, 1);
  assert.equal(atom[0].title, "Predictive policing pilot");
  assert.equal(atom[0].link, "https://example.com/atom");
  assert.equal(atom[0].guid, "tag:example:1");
  assert.equal(atom[0].description, "A summary line.");

  const rdf = parseFeed(RDF);
  assert.equal(rdf.length, 1);
  assert.equal(rdf[0].title, "Climate refugees arrive");
  assert.equal(rdf[0].published.toISOString(), "2026-10-01T08:00:00.000Z");
});
