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
  const book = bookById(bookId);
  if (themeId && !book.themes.some((theme) => theme.id === themeId)) return false;
  const tally = scoreTitleGroups(book, titles.map(groupFor), scores);
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

const PROPOSED: LockedCase[] = [
  { id: "P1", title: "Labor ministry pulls a decade of jobless figures from its website after official's order", bookId: "1984", themeId: "mutable-record", expect: "counts" },
  { id: "P2", title: "Inflation series vanishes from central bank archive weeks before election, economists say", bookId: "1984", themeId: "mutable-record", expect: "counts" },
  { id: "P3", title: "Statistics office trims second-quarter GDP growth to 1.8% in scheduled revision", bookId: "1984", themeId: "mutable-record", expect: "does-not-count" },
  { id: "P4", title: "Junta that toppled president on vow to end privilege keeps his secret police chief", bookId: "1984", themeId: "class-wheel", expect: "counts" },
  { id: "P5", title: "Former rebels who pledged rule by the poor hand top security posts to old regime officers", bookId: "1984", themeId: "class-wheel", expect: "counts" },
  { id: "P6", title: "Interim government disbands ousted leader's intelligence service and opens its files", bookId: "1984", themeId: "class-wheel", expect: "does-not-count" },
  { id: "P7", title: "Leaked files show interior ministry tapped phones of opposition lawmakers and editors", bookId: "1984", themeId: "surveillance", expect: "counts" },
  { id: "P8", title: "City council approves 200 new traffic cameras for downtown intersections", bookId: "1984", themeId: "surveillance", expect: "does-not-count" },
  { id: "P9", title: "Weight-loss injections now prescribed to 12 million as health service widens eligibility", bookId: "brave-new-world", themeId: "chemical-peace", expect: "counts" },
  { id: "P10", title: "Antidepressant prescriptions for adults double in a decade, national data show", bookId: "brave-new-world", themeId: "chemical-peace", expect: "counts" },
  { id: "P11", title: "Singer opens up about her years on antidepressants in new memoir", bookId: "brave-new-world", themeId: "chemical-peace", expect: "does-not-count" },
  { id: "P12", title: "Heat wave pushes air-conditioning sales to record high across the Midwest", bookId: "brave-new-world", expect: "does-not-count" },
  { id: "P13", title: "Chiefs open training camp with brutal strength and conditioning drills", bookId: "brave-new-world", expect: "does-not-count" },
  { id: "P14", title: "Oakland city workers walk off the job over stalled pay talks", bookId: "the-iron-heel", expect: "does-not-count" },
  { id: "P15", title: "Lyon transit staff strike for third day over pension changes", bookId: "the-iron-heel", expect: "does-not-count" },
  { id: "P16", title: "President wins 99.7% in vote where ballots were cast in open view of officials", bookId: "we", expect: "counts" },
  { id: "P17", title: "Parliament passes transparency law requiring ministers to publish their assets", bookId: "we", expect: "does-not-count" },
  { id: "P18", title: "Parole board denies release on predictive risk score as officials cite falling crime", bookId: "minority-report", expect: "counts" },
  { id: "P19", title: "Police department buys predictive software to decide which blocks to patrol", bookId: "minority-report", expect: "does-not-count" },
  { id: "P20", title: "Automation firm films senior machinists to train the robots that will replace them", bookId: "player-piano", expect: "counts" },
  { id: "P21", title: "Retailer announces 1,200 layoffs after weak holiday quarter", bookId: "player-piano", expect: "does-not-count" },
  { id: "P22", title: "Ratings climb after state broadcaster replaces war bulletins with game shows", bookId: "fahrenheit-451", expect: "counts" },
  { id: "P23", title: "Hundreds pack school board meeting to protest censorship of award-winning novel", bookId: "fahrenheit-451", expect: "does-not-count" },
  { id: "P24", title: "Women barred from jobs and bank accounts days after takeover; morality police deployed", bookId: "the-handmaids-tale", expect: "counts" },
  { id: "P25", title: "State senate passes six-week abortion limit; governor expected to sign", bookId: "the-handmaids-tale", expect: "does-not-count" },
  { id: "P26", title: "Former mayor charged with bribery and held on remand until trial next month", bookId: "the-trial", expect: "does-not-count" },
  { id: "P27", title: "State keeps prisoner kidney-donation-for-early-release program, adds medical oversight", bookId: "never-let-me-go", expect: "counts" },
  { id: "P28", title: "Police break up organ trafficking ring that lured victims with fake job offers", bookId: "never-let-me-go", expect: "does-not-count" },
  { id: "P29", title: "Fire crews let homes burn in rural district after owners missed subscription fee", bookId: "parable-of-the-sower", expect: "counts" },
  { id: "P30", title: "Government tightens refugee rules, cutting asylum appeal window to 14 days", bookId: "parable-of-the-sower", expect: "does-not-count" },
  { id: "P31", title: "Luxury estate's staff must use service tunnels and work only after dark, contracts show", bookId: "the-time-machine", expect: "counts" },
  { id: "P32", title: "Restaurant chain fined $2 million for paying staff below minimum wage", bookId: "the-time-machine", expect: "does-not-count" },
  { id: "P33", title: "Leaked files show island lab ran painful chimera surgeries on primates beyond any oversight", bookId: "the-island-of-doctor-moreau", expect: "counts" },
  { id: "P34", title: "Court hears bid to grant zoo elephant personhood and release her to a sanctuary", bookId: "the-island-of-doctor-moreau", expect: "does-not-count" },
  { id: "P35", title: "Undercover officers urged dock strikers to riot, leaked police files show", bookId: "the-iron-heel", expect: "counts" },
  { id: "P36", title: "President suspends parliament and gives ruling party's militia police powers", bookId: "it-cant-happen-here", expect: "counts" },
  { id: "P37", title: "Opposition labels president a strongman in heated budget debate", bookId: "it-cant-happen-here", expect: "does-not-count" },
  { id: "P38", title: "Ad agency drafted the government's vaping rules word for word, emails show", bookId: "the-space-merchants", themeId: "ads-as-government", expect: "counts" },
  { id: "P39", title: "Prisoners offered early release if they accept aversion therapy, months before election", bookId: "a-clockwork-orange", expect: "counts" },
  { id: "P40", title: "Judge orders chemical castration for repeat sex offender under new sentencing law", bookId: "a-clockwork-orange", expect: "does-not-count" },
  { id: "P41", title: "Exporter vows oil embargo will last until neighbor's government steps down", bookId: "dune", themeId: "resource-dependence", expect: "counts" },
  { id: "P42", title: "Asylum seekers deported after failing border AI's emotion test; coaching firms sell ways to beat it", bookId: "do-androids-dream-of-electric-sheep", expect: "counts" },
  { id: "P43", title: "Chatbot passes Turing test in university study", bookId: "do-androids-dream-of-electric-sheep", expect: "does-not-count" },
  { id: "P44", title: "Wounded troops sent back to the front as service terms extended by decree for third time", bookId: "the-forever-war", expect: "counts" },
  { id: "P45", title: "Thousands march against new conscription law in capital", bookId: "the-forever-war", expect: "does-not-count" },
  { id: "P46", title: "Penthouse owners lock lower floors out of rooftop pool as feud in luxury tower turns violent", bookId: "high-rise", expect: "counts" },
  { id: "P47", title: "Affordable-housing tenants win fight against 'poor door' at new tower", bookId: "high-rise", expect: "does-not-count" },
  { id: "P48", title: "Mining company runs its own courts and armed guards in concession town, report finds", bookId: "neuromancer", expect: "counts" },
  { id: "P49", title: "Hospital trusts object to Palantir handling patient records", bookId: "neuromancer", expect: "does-not-count" },
  { id: "P50", title: "Government can no longer audit its own tax system after handing it to AI vendor, watchdog says", bookId: "hyperion", expect: "counts" },
  { id: "P51", title: "Streaming platform raises subscription price for the second time this year", bookId: "hyperion", expect: "does-not-count" },
  { id: "P52", title: "Care-worker visas to bar settlement and require departure at 60 under new rules", bookId: "the-children-of-men", expect: "counts" },
  { id: "P53", title: "Births fall to record low for third straight year, statistics office says", bookId: "the-children-of-men", expect: "does-not-count" },
  { id: "P54", title: "Telecom that owns region's only fiber network blocks critics' sites, regulator says", bookId: "snow-crash", expect: "counts" },
  { id: "P55", title: "Investors pitch charter city on Caribbean island to lawmakers", bookId: "snow-crash", expect: "does-not-count" },
  { id: "P56", title: "Implant maker refuses to repair patient's device after profile scores her as low-value customer", bookId: "feed", expect: "counts" },
  { id: "P57", title: "School districts sue social media firms, claiming apps fuel teen addiction", bookId: "feed", expect: "does-not-count" },
  { id: "P58", title: "Prosecutors say drugmaker seeded contaminated supplements, then sold the treatment", bookId: "oryx-and-crake", expect: "counts" },
  { id: "P59", title: "Habitat loss drives rare frog to extinction, scientists confirm", bookId: "oryx-and-crake", expect: "does-not-count" },
];

function judgeCase(
  item: LockedCase,
  scores: Map<string, number>,
  duneStory: boolean,
  privacyTwice: boolean,
  privacyPoints: number,
): { id: string; pass: boolean; detail: string } {
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
  if (item.id === "L3") {
    const probability = scores.get(entailmentKey(item.bookId, "mutable-record", titleKey(item.title)));
    if (probability != null && probability >= 0.5) {
      pass = false;
      detail += " The counts claim is still high on this metaphor.";
    }
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
}

function table(rows: { id: string; pass: boolean; detail: string }[]): string[] {
  return [
    "| ID | Result | Matcher |",
    "| --- | --- | --- |",
    ...rows.map((row) => `| ${row.id} | ${row.pass ? "Pass" : "Fail"} | ${row.detail.replaceAll("|", "\\|")} |`),
  ];
}

test("locked headline cases", async () => {
  const groups = [...CASES, ...PROPOSED].map((item) => groupFor(item.title));
  const scores = await scoreEntailment(entailmentPairs(groups));
  const byId = new Map(CASES.map((item) => [item.id, item]));
  const duneStory = oneStory(byId.get("L8")!.title, byId.get("L9")!.title, "dune", "resource-dependence");
  const privacyBook = bookById("the-space-merchants");
  const privacyPoints =
    scoreTitleGroups(privacyBook, [groupFor(byId.get("L10")!.title), groupFor(byId.get("L11")!.title)], scores)
      .themePoints["person-sold"] ?? 0;
  const privacyTwice = privacyPoints > ANCHOR_WEIGHT;

  const rows = CASES.map((item) => judgeCase(item, scores, duneStory, privacyTwice, privacyPoints));
  const proposed = PROPOSED.map((item) => judgeCase(item, scores, duneStory, privacyTwice, privacyPoints));
  const passed = rows.filter((row) => row.pass).length;
  const proposedPassed = proposed.filter((row) => row.pass).length;
  const lines = [
    "# Headline eval results",
    "",
    `L1–L13 ran through the current matcher. A headline counts when the title has an anchor and the counts claim scores ${ENTAILMENT_MIN.toFixed(2)} or higher, and higher than the does-not-count claim when the theme has one. Within one theme, headlines that share two words besides the anchor are one story. The first story adds 2. Each further story adds half as much.`,
    "",
    `${passed} of ${rows.length} locked cases passed.`,
    "",
    ...table(rows),
    "",
    "Stored headline rows have no country column. A place filter is blocked on that.",
    "",
    `Proposed cases P1–P59 were scored with the same matcher and were not relabeled. ${proposedPassed} of ${proposed.length} passed. A failure stays when the repair is ambiguous.`,
    "",
    ...table(proposed),
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
