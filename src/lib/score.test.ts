import assert from "node:assert/strict";
import test from "node:test";
import { books, themeRule, themeRules } from "../../data/books";
import { anchorHits, counterKey, entailmentKey, phraseHits, scoreFromRaw, scoreTitleGroups, type TitleGroup } from "./score";
import { contentWords, storyRaw, storyWeight } from "./stories";

const BANNED = new Set([
  "drug",
  "drugs",
  "camera",
  "cameras",
  "ai",
  "war",
  "layoff",
  "layoffs",
  "ban",
  "bans",
  "police",
]);

test("curve matches the published table", () => {
  assert.equal(scoreFromRaw(0), 0);
  assert.equal(scoreFromRaw(3), 31);
  assert.equal(scoreFromRaw(9), 68);
  assert.equal(scoreFromRaw(24), 95);
});

const ADDED = new Set([
  "the-time-machine",
  "the-island-of-doctor-moreau",
  "the-iron-heel",
  "it-cant-happen-here",
  "the-space-merchants",
  "a-clockwork-orange",
  "dune",
  "do-androids-dream-of-electric-sheep",
  "the-forever-war",
  "high-rise",
  "neuromancer",
  "hyperion",
  "the-children-of-men",
  "snow-crash",
  "feed",
  "oryx-and-crake",
]);

const ADDED_BANNED = new Set([
  ...BANNED,
  "robot",
  "robots",
  "computer",
  "computers",
  "empire",
  "desert",
  "vote",
  "votes",
  "corporation",
  "corporations",
]);

test("phrases stay strict and weighted", () => {
  assert.equal(books.length, 26);
  const titles = new Set(books.map((book) => book.title));
  const ids = new Set<string>();
  for (const book of books) {
    assert.equal(ids.has(book.id), false, book.id);
    ids.add(book.id);
    assert.ok(book.phrase.endsWith("."), book.id);
    assert.equal(titles.has(book.neighbor), true, book.neighbor);
    assert.ok(book.themes.length > 0);
    if (ADDED.has(book.id)) assert.ok(book.themes.length >= 2 && book.themes.length <= 3, book.id);
    for (const theme of book.themes) {
      assert.ok(theme.phrases.length > 0);
      for (const phrase of theme.phrases) {
        assert.ok(phrase.weight === 2 || phrase.weight === 3);
        const tokens = phrase.text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
        if (tokens.length === 1) assert.equal(BANNED.has(tokens[0]), false, phrase.text);
        assert.equal(BANNED.has(phrase.text.toLowerCase()), false);
        if (ADDED.has(book.id)) {
          for (const token of tokens) assert.equal(ADDED_BANNED.has(token), false, `${book.id}: ${phrase.text}`);
        }
      }
      const rule = themeRule(book.id, theme.id);
      assert.ok(rule, `${book.id}/${theme.id}`);
      assert.ok(rule.anchors.length > 0 && rule.anchors.length <= 12);
      assert.ok(rule.hypothesis.length > 0);
      for (const anchor of rule.anchors) {
        assert.equal(anchor, anchor.toLowerCase().trim(), anchor);
        const tokens = anchor.split(/[^a-z0-9]+/).filter(Boolean);
        assert.ok(tokens.length > 0, anchor);
        if (tokens.length === 1) {
          assert.equal(
            ["ai", "war", "police", "ban", "drug", "robot", "computer", "drone", "camera"].includes(tokens[0]),
            false,
            anchor,
          );
        }
      }
    }
  }
  const surveillance = themeRule("1984", "surveillance");
  assert.ok(surveillance?.anchors.includes("surveillance"));
  assert.equal(Object.keys(themeRules).length, books.reduce((sum, book) => sum + book.themes.length, 0));
});

test("ordinary words do not move a meter", () => {
  const groups: TitleGroup[] = [
    {
      titleKey: "ordinary",
      titles: ["Police arrest man after drug find as AI camera ban follows layoff"],
      displayTitle: "Police arrest man after drug find as AI camera ban follows layoff",
      publishedAt: "2026-10-01T12:00:00.000Z",
    },
    {
      titleKey: "war",
      titles: ["War fears grow"],
      displayTitle: "War fears grow",
      publishedAt: "2026-10-01T12:00:00.000Z",
    },
  ];
  for (const book of books) {
    const tally = scoreTitleGroups(book, groups);
    assert.equal(tally.raw, 0, book.title);
    assert.equal(tally.score, 0, book.title);
  }
});

test("word boundaries and anchor plus entailment", () => {
  assert.equal(phraseHits("Facial recognition expands", "facial recognition"), true);
  assert.equal(phraseHits("interfacial recognition expands", "facial recognition"), false);
  assert.equal(anchorHits("Moroccan intelligence uses surveillance to silence journalists", "surveillance"), true);
  assert.equal(anchorHits("antisurveillance bill", "surveillance"), false);

  const headline = "Moroccan intelligence uses surveillance to silence journalists";
  const groups: TitleGroup[] = [
    {
      titleKey: "morocco",
      titles: [headline],
      displayTitle: headline,
      publishedAt: "2026-10-01T15:00:00.000Z",
    },
  ];
  const book = books[0];
  assert.equal(scoreTitleGroups(book, groups).raw, 0);

  const low = new Map([[entailmentKey(book.id, "surveillance", "morocco"), 0.89]]);
  assert.equal(scoreTitleGroups(book, groups, low).raw, 0);

  const high = new Map([
    [entailmentKey(book.id, "surveillance", "morocco"), 0.992],
    [counterKey(book.id, "surveillance", "morocco"), 0.1],
  ]);
  const tally = scoreTitleGroups(book, groups, high);
  assert.equal(tally.raw, 2);
  assert.equal(tally.score, 22);
  assert.equal(tally.matchedCount, 1);
  assert.equal(tally.themePoints.surveillance, 2);
  assert.equal(tally.matches[0].hits[0].phrase, "surveillance");
});

test("the counts claim has to beat its twin", () => {
  const book = books.find((item) => item.id === "the-iron-heel");
  assert.ok(book);
  const groups: TitleGroup[] = [
    {
      titleKey: "strike",
      titles: ["City workers remain on strike"],
      displayTitle: "City workers remain on strike",
      publishedAt: "2026-10-01T12:00:00.000Z",
    },
  ];
  const loses = new Map([
    [entailmentKey(book.id, "labor-crushed", "strike"), 0.95],
    [counterKey(book.id, "labor-crushed", "strike"), 0.97],
  ]);
  assert.equal(scoreTitleGroups(book, groups, loses, 0.8).raw, 0);
  const tie = new Map([
    [entailmentKey(book.id, "labor-crushed", "strike"), 0.95],
    [counterKey(book.id, "labor-crushed", "strike"), 0.95],
  ]);
  assert.equal(scoreTitleGroups(book, groups, tie, 0.8).raw, 0);
  const wins = new Map([
    [entailmentKey(book.id, "labor-crushed", "strike"), 0.95],
    [counterKey(book.id, "labor-crushed", "strike"), 0.4],
  ]);
  assert.equal(scoreTitleGroups(book, groups, wins, 0.8).raw, 2);
});

test("two shared content words are one story and later stories add half as much", () => {
  assert.equal(storyWeight(0), 0);
  assert.equal(storyWeight(1), 2);
  assert.equal(storyWeight(2), 3);
  assert.equal(storyWeight(3), 3.5);

  const privacy = ["privacy"];
  const first = contentWords(
    "New Mexico jury finds Facebook liable for deceiving users about privacy protections",
    privacy,
  );
  const second = contentWords("Jury: Facebook liable for deceiving users about privacy protections", privacy);
  const other = contentWords("Cameroon teachers remain on strike over pay", ["strike", "union"]);
  assert.equal(storyRaw([{ words: first }, { words: second }]), 2);
  assert.equal(storyRaw([{ words: first }, { words: second }, { words: other }]), 3);

  const canada = contentWords("Canada's proposed oil pipeline offers relief", ["pipeline"]);
  const fast = contentWords("Canada to fast track oil pipeline meant to diversify", ["pipeline"]);
  assert.equal(storyRaw([{ words: canada }, { words: fast }]), 2);
});

test("a repeated title counts once", () => {
  const groups: TitleGroup[] = [
    {
      titleKey: "same",
      titles: ["Predictive policing trial", "Predictive policing trial - extra"],
      displayTitle: "Predictive policing trial",
      publishedAt: "2026-10-01T15:00:00.000Z",
    },
  ];
  const minority = books.find((book) => book.id === "minority-report");
  assert.ok(minority);
  const entailment = new Map([[entailmentKey(minority.id, "prediction-as-guilt", "same"), 0.95]]);
  const tally = scoreTitleGroups(minority, groups, entailment);
  assert.equal(tally.raw, 2);
  assert.equal(tally.matchedCount, 1);
  assert.equal(tally.matches[0].hits.length, 1);
});
