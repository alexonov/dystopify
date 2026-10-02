import assert from "node:assert/strict";
import test from "node:test";
import { books } from "../../data/books";
import { counterKey, entailmentKey, scoreFromRaw, scoreTitleGroups, type TitleGroup } from "./score";
import { gdeltArtListUrl, parseGdeltArtList, titleFromGkgLine } from "./gdelt";
import { combineWindow, formatWindowNote, weekWindows } from "./week";

test("a quiet day does not erase the rest of the week", () => {
  const days = [
    { raw: 0, matched: 0 },
    { raw: 0, matched: 0 },
    { raw: 2, matched: 1 },
    { raw: 0, matched: 0 },
    { raw: 0, matched: 0 },
    { raw: 2, matched: 1 },
    { raw: 0, matched: 0 },
  ];
  const week = combineWindow(days);
  assert.equal(week.raw, 4);
  assert.equal(week.score, scoreFromRaw(4));
  assert.equal(week.matched, 2);
  assert.ok(week.score > 0);
});

test("the windows are the last seven days and the seven before", () => {
  const { previous, current } = weekWindows("2026-10-02");
  assert.deepEqual(previous, [
    "2026-09-19",
    "2026-09-20",
    "2026-09-21",
    "2026-09-22",
    "2026-09-23",
    "2026-09-24",
    "2026-09-25",
  ]);
  assert.deepEqual(current, [
    "2026-09-26",
    "2026-09-27",
    "2026-09-28",
    "2026-09-29",
    "2026-09-30",
    "2026-10-01",
    "2026-10-02",
  ]);
});

test("the header names the window and the title count", () => {
  assert.equal(
    formatWindowNote("2026-09-26", "2026-10-02", 1842),
    "26 September 2026 to 2 October 2026. 1,842 titles.",
  );
});

test("gdelt artlist keeps the title and the link", () => {
  const url = gdeltArtListUrl("2026-10-01");
  assert.match(url, /query=sourcelang%3Aenglish/);
  assert.match(url, /mode=artlist/);
  assert.equal(url.includes("surveillance"), false);
  const items = parseGdeltArtList(
    JSON.stringify({
      articles: [
        {
          title: "City council sets the budget",
          url: "https://example.com/budget",
          seendate: "20261001143000",
        },
      ],
    }),
    "2026-10-01",
  );
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "City council sets the budget");
  assert.equal(items[0].seen.toISOString(), "2026-10-01T14:30:00.000Z");
  const row = [
    "id",
    "20261001000000",
    "1",
    "example.com",
    "https://example.com/story",
    ...Array(20).fill(""),
    "",
    "<PAGE_TITLE>Council adopts the city budget</PAGE_TITLE>",
  ].join("\t");
  assert.equal(titleFromGkgLine(row)?.title, "Council adopts the city budget");
  const encoded = row.replace("Council adopts the city budget", "T&#xFC;rkiye sets the budget");
  assert.equal(titleFromGkgLine(encoded)?.title, "Türkiye sets the budget");
  const arabic = row.replace(
    "Council adopts the city budget",
    "&#x645;&#x648;&#x62C;&#x632; &#x623;&#x62E;&#x628;&#x627;&#x631;",
  );
  assert.equal(titleFromGkgLine(arabic), null);
  const translated = row.replace("\t\t<", "\tsrclc:spa\t<");
  assert.equal(titleFromGkgLine(translated), null);
});

test("a score under 0.90 does not count", () => {
  const book = books[0];
  const groups: TitleGroup[] = [
    {
      titleKey: "morocco",
      titles: ["Moroccan intelligence uses surveillance to silence journalists"],
      displayTitle: "Moroccan intelligence uses surveillance to silence journalists",
      publishedAt: "2026-10-01T15:00:00.000Z",
    },
  ];
  const scores = new Map([
    [entailmentKey(book.id, "surveillance", "morocco"), 0.85],
    [counterKey(book.id, "surveillance", "morocco"), 0.1],
  ]);
  assert.equal(scoreTitleGroups(book, groups, scores).raw, 0);
  const high = new Map([
    [entailmentKey(book.id, "surveillance", "morocco"), 0.95],
    [counterKey(book.id, "surveillance", "morocco"), 0.1],
  ]);
  assert.equal(scoreTitleGroups(book, groups, high).raw, 2);
});
