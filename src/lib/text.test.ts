import assert from "node:assert/strict";
import test from "node:test";
import { canonicalLink, cutDescription, itemKey, titleKey } from "./text";

test("title keys drop outlet suffixes and punctuation", () => {
  assert.equal(titleKey("Mass layoff wave - NPR"), titleKey("Mass layoff wave - The Guardian"));
  assert.equal(titleKey("Mass layoff wave | BBC News"), "mass layoff wave");
  assert.equal(titleKey("Don't stop — BBC"), "dont stop");
  assert.equal(titleKey("A real headline - not an outlet"), "a real headline not an outlet");
});

test("canonical links drop tracking and fragments", () => {
  assert.equal(
    canonicalLink("https://Example.com/Path?utm_source=rss&id=1&fbclid=abc#story"),
    "https://example.com/path?id=1",
  );
  assert.equal(
    canonicalLink("https://example.com/a?gclid=1&utm_medium=x&b=2"),
    "https://example.com/a?b=2",
  );
});

test("item key prefers guid", () => {
  assert.equal(itemKey("guid-1", "https://example.com/a"), "guid-1");
  assert.equal(itemKey("  ", "https://example.com/a"), "https://example.com/a");
  assert.equal(itemKey(undefined, "https://example.com/a"), "https://example.com/a");
});

test("descriptions are stripped and cut at 280", () => {
  const html = `<p>Hello&nbsp;&amp;&nbsp;${"x".repeat(300)}</p><p>tail</p>`;
  const cut = cutDescription(html);
  assert.ok(cut);
  assert.equal(cut.length, 280);
  assert.equal(cut.startsWith("Hello & "), true);
  assert.equal(cut.includes("<p>"), false);
  assert.equal(cutDescription("   "), null);
  assert.equal(cutDescription(undefined), null);
});
