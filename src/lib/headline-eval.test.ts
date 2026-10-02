import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import test from "node:test";
import { books, themeRule } from "../../data/books";
import { scoreEntailment } from "./entail";
import { entailmentPairs } from "./recompute";
import {
  ANCHOR_WEIGHT,
  ENTAILMENT_MIN,
  counterKey,
  entailmentKey,
  scoreTitleGroups,
  type TitleGroup,
} from "./score";
import { contentWords, storyRaw, storyWeight } from "./stories";
import { titleKey } from "./text";

const RESULTS = "/cursor/stores/bc-87d8bcef-4392-40f9-870f-3f0acffb57c2/docs/headline-eval-results.md";

type Expectation = "counts" | "does-not-count" | "may-count";

type LockedCase = {
  id: string;
  title: string;
  bookId: string;
  themeId?: string;
  expect: Expectation;
};

const CASES: LockedCase[] = [
  {
    id: "L1",
    title: "Moroccan intelligence uses surveillance to \u2018silence\u2019 journalists: Amnesty",
    bookId: "1984",
    themeId: "surveillance",
    expect: "counts",
  },
  {
    id: "L2",
    title: "Benue strengthens surveillance to contain diphtheria",
    bookId: "1984",
    themeId: "surveillance",
    expect: "does-not-count",
  },
  {
    id: "L3",
    title: "The Supreme Court\u2019s Summer Break Vanishes, Erased by Emergencies",
    bookId: "1984",
    themeId: "mutable-record",
    expect: "does-not-count",
  },
  {
    id: "L4",
    title: "AI deepfake of BBC report falsely links Indians to FlyDubai hijacking attempt",
    bookId: "1984",
    themeId: "mutable-record",
    expect: "does-not-count",
  },
  {
    id: "L5",
    title: "Solvang City Workers Remain on Strike",
    bookId: "the-iron-heel",
    expect: "does-not-count",
  },
  {
    id: "L6",
    title: "City Colleges of Chicago faculty union plans to announce strike",
    bookId: "the-iron-heel",
    expect: "does-not-count",
  },
  {
    id: "L7",
    title: "Fourth nationwide school strike in Germany: 45,000 protest against conscription",
    bookId: "the-iron-heel",
    expect: "does-not-count",
  },
  {
    id: "L8",
    title: "Canada\u2019s Proposed Oil Pipeline Offers Carney Relief From Domestic and Global Turmoil",
    bookId: "dune",
    expect: "does-not-count",
  },
  {
    id: "L9",
    title: "Canada to fast track oil pipeline meant to diversify economy away from US",
    bookId: "dune",
    expect: "does-not-count",
  },
  {
    id: "L10",
    title: "New Mexico jury finds Facebook liable for deceiving users about privacy protections",
    bookId: "the-space-merchants",
    themeId: "person-sold",
    expect: "may-count",
  },
  {
    id: "L11",
    title: "Jury: Facebook liable for deceiving users about privacy protections",
    bookId: "the-space-merchants",
    themeId: "person-sold",
    expect: "may-count",
  },
  {
    id: "L12",
    title: "Russian classroom propaganda glorifies dying for your country, students say",
    bookId: "the-space-merchants",
    themeId: "ads-as-government",
    expect: "does-not-count",
  },
  {
    id: "L13",
    title: "Palestinian children in Israeli military detention",
    bookId: "the-trial",
    themeId: "process-without-charge",
    expect: "counts",
  },
];

function groupFor(title: string): TitleGroup {
  return {
    titleKey: titleKey(title),
    titles: [title],
    displayTitle: title,
    publishedAt: "2026-10-01T12:00:00.000Z",
  };
}

function bookById(id: string) {
  const book = books.find((item) => item.id === id);
  if (!book) throw new Error(`missing book ${id}`);
  return book;
}

function counted(
  bookId: string,
  titles: string[],
  scores: Map<string, number>,
  themeId?: string,
): boolean {
  const tally = scoreTitleGroups(
    bookById(bookId),
    titles.map(groupFor),
    scores,
  );
  if (themeId) return (tally.themePoints[themeId] ?? 0) > 0;
  return tally.raw > 0;
}

function claimText(bookId: string, themeId: string | undefined, title: string, scores: Map<string, number>): string {
  const book = bookById(bookId);
  const themes = themeId ? book.themes.filter((theme) => theme.id === themeId) : book.themes;
  const parts: string[] = [];
  const key = titleKey(title);
  for (const theme of themes) {
    const counts = scores.get(entailmentKey(bookId, theme.id, key));
    if (counts == null) continue;
    const counter = scores.get(counterKey(bookId, theme.id, key));
    const twin = counter == null ? "" : `, does-not-count claim ${counter.toFixed(3)}`;
    parts.push(`${theme.name} counts claim ${counts.toFixed(3)}${twin}`);
  }
  if (parts.length === 0) return "No anchor, so the model was not asked.";
  return `${parts.join(". ")}.`;
}

function oneStory(left: string, right: string, bookId: string, themeId: string): boolean {
  const anchors = themeRule(bookId, themeId)?.anchors ?? [];
  return (
    storyRaw([{ words: contentWords(left, anchors) }, { words: contentWords(right, anchors) }]) ===
    storyWeight(1)
  );
}

test("locked headline cases", async () => {
  const groups = CASES.map((item) => groupFor(item.title));
  const scores = await scoreEntailment(entailmentPairs(groups));
  const byId = new Map(CASES.map((item) => [item.id, item]));
  const duneStory = oneStory(byId.get("L8")!.title, byId.get("L9")!.title, "dune", "resource-dependence");
  const privacyBook = bookById("the-space-merchants");
  const privacyPoints =
    scoreTitleGroups(privacyBook, [groupFor(byId.get("L10")!.title), groupFor(byId.get("L11")!.title)], scores)
      .themePoints["person-sold"] ?? 0;
  const privacyTwice = privacyPoints > ANCHOR_WEIGHT;

  const rows = CASES.map((item) => {
    const did = counted(item.bookId, [item.title], scores, item.themeId);
    const model = claimText(item.bookId, item.themeId, item.title, scores);
    let pass = true;
    let detail = model;
    if (item.expect === "counts" && !did) {
      pass = false;
      detail = `Does not count for ${bookById(item.bookId).title}. ${model}`;
    } else if (item.expect === "does-not-count" && did) {
      pass = false;
      detail = `Counts for ${bookById(item.bookId).title}. ${model}`;
    } else if (item.expect === "counts") {
      detail = `Counts for ${bookById(item.bookId).title}. ${model}`;
    } else if (item.expect === "does-not-count") {
      detail = `Does not count for ${bookById(item.bookId).title}. ${model}`;
    } else {
      detail = `${did ? "Counts" : "Does not count"} for ${bookById(item.bookId).title}. ${model}`;
    }
    if (item.id === "L8" || item.id === "L9") {
      if (!duneStory) {
        pass = false;
        detail += " L8 and L9 are not one story.";
      } else {
        detail += " L8 and L9 are one story.";
      }
    }
    if (item.id === "L10" || item.id === "L11") {
      if (privacyTwice) {
        pass = false;
        detail += ` Together they add ${privacyPoints}, two full counts.`;
      } else {
        detail += ` Together they add ${privacyPoints}, not two full counts.`;
      }
    }
    return { id: item.id, pass, detail };
  });

  const passed = rows.filter((row) => row.pass).length;
  const lines = [
    "# Headline eval results",
    "",
    `L1–L13 ran through the current matcher. A headline counts when the title has an anchor and the counts claim scores ${ENTAILMENT_MIN.toFixed(2)} or higher, and higher than the does-not-count claim when the theme has one. The scoring rules were not changed.`,
    "",
    `${passed} of ${rows.length} passed.`,
    "",
    "| ID | Result | Matcher |",
    "| --- | --- | --- |",
    ...rows.map((row) => `| ${row.id} | ${row.pass ? "Pass" : "Fail"} | ${row.detail.replaceAll("|", "\\|")} |`),
    "",
  ];
  writeFileSync(RESULTS, lines.join("\n"));

  const failed = rows.filter((row) => !row.pass);
  assert.deepEqual(
    failed.map((row) => row.id),
    [],
    failed.map((row) => `${row.id}: ${row.detail}`).join("\n"),
  );
});
