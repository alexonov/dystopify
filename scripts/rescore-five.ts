import { writeFileSync } from "node:fs";
import { books, themeRule } from "../data/books";
import { openWriteDatabase } from "../src/lib/db";
import { scoreEntailment } from "../src/lib/entail";
import { sourceName } from "../src/lib/feeds";
import { entailmentPairs, headlineGroups, recomputeDate } from "../src/lib/recompute";
import { counterKey, entailmentKey, matchedAnchors, scoreFromRaw } from "../src/lib/score";
import { contentWords, storyRaw } from "../src/lib/stories";
import { combineWindow, weekWindows } from "../src/lib/week";

const CUTOFF = 0.8;
const FIVE = new Set(["1984", "brave-new-world", "the-iron-heel", "the-space-merchants", "dune"]);
const REPORT = "/cursor/stores/bc-87d8bcef-4392-40f9-870f-3f0acffb57c2/docs/rescore-five-books.md";

const PLACES: [string, string][] = [
  ["new mexico", "United States"],
  ["new england", "United States"],
  ["new south wales", "Australia"],
  ["papua new guinea", "Papua New Guinea"],
  ["united arab emirates", "United Arab Emirates"],
  ["united states", "United States"],
  ["united kingdom", "United Kingdom"],
  ["south africa", "South Africa"],
  ["new zealand", "New Zealand"],
  ["saudi arabia", "Saudi Arabia"],
  ["south korea", "South Korea"],
  ["north korea", "North Korea"],
  ["hong kong", "Hong Kong"],
  ["el salvador", "El Salvador"],
  ["costa rica", "Costa Rica"],
  ["sri lanka", "Sri Lanka"],
  ["czech republic", "Czech Republic"],
  ["dominican republic", "Dominican Republic"],
  ["puerto rico", "Puerto Rico"],
  ["sierra leone", "Sierra Leone"],
  ["burkina faso", "Burkina Faso"],
  ["ivory coast", "Ivory Coast"],
  ["côte d'ivoire", "Ivory Coast"],
  ["u.s.a.", "United States"],
  ["u.s.", "United States"],
  ["usa", "United States"],
  ["u.k.", "United Kingdom"],
  ["uk", "United Kingdom"],
  ["america", "United States"],
  ["american", "United States"],
  ["americans", "United States"],
  ["afghanistan", "Afghanistan"],
  ["afghan", "Afghanistan"],
  ["albania", "Albania"],
  ["albanian", "Albania"],
  ["algeria", "Algeria"],
  ["algerian", "Algeria"],
  ["argentina", "Argentina"],
  ["argentine", "Argentina"],
  ["argentinian", "Argentina"],
  ["armenia", "Armenia"],
  ["armenian", "Armenia"],
  ["australia", "Australia"],
  ["australian", "Australia"],
  ["austria", "Austria"],
  ["austrian", "Austria"],
  ["azerbaijan", "Azerbaijan"],
  ["bangladeshi", "Bangladesh"],
  ["bangladesh", "Bangladesh"],
  ["belarusian", "Belarus"],
  ["belarus", "Belarus"],
  ["belgium", "Belgium"],
  ["belgian", "Belgium"],
  ["bolivia", "Bolivia"],
  ["bolivian", "Bolivia"],
  ["brazil", "Brazil"],
  ["brazilian", "Brazil"],
  ["britain", "United Kingdom"],
  ["british", "United Kingdom"],
  ["bulgaria", "Bulgaria"],
  ["bulgarian", "Bulgaria"],
  ["cambodia", "Cambodia"],
  ["cambodian", "Cambodia"],
  ["cameroonian", "Cameroon"],
  ["cameroon", "Cameroon"],
  ["canada", "Canada"],
  ["canadian", "Canada"],
  ["chilean", "Chile"],
  ["chile", "Chile"],
  ["chinese", "China"],
  ["china", "China"],
  ["colombia", "Colombia"],
  ["colombian", "Colombia"],
  ["congo", "Congo"],
  ["congolese", "Congo"],
  ["cuba", "Cuba"],
  ["cuban", "Cuba"],
  ["czech", "Czech Republic"],
  ["denmark", "Denmark"],
  ["danish", "Denmark"],
  ["ecuador", "Ecuador"],
  ["ecuadorian", "Ecuador"],
  ["egypt", "Egypt"],
  ["egyptian", "Egypt"],
  ["england", "United Kingdom"],
  ["english", "United Kingdom"],
  ["estonia", "Estonia"],
  ["estonian", "Estonia"],
  ["ethiopia", "Ethiopia"],
  ["ethiopian", "Ethiopia"],
  ["finland", "Finland"],
  ["finnish", "Finland"],
  ["france", "France"],
  ["french", "France"],
  ["germany", "Germany"],
  ["german", "Germany"],
  ["germans", "Germany"],
  ["ghana", "Ghana"],
  ["ghanaian", "Ghana"],
  ["greece", "Greece"],
  ["greek", "Greece"],
  ["haiti", "Haiti"],
  ["haitian", "Haiti"],
  ["hungary", "Hungary"],
  ["hungarian", "Hungary"],
  ["india", "India"],
  ["indian", "India"],
  ["indonesia", "Indonesia"],
  ["indonesian", "Indonesia"],
  ["iranian", "Iran"],
  ["iran", "Iran"],
  ["iraq", "Iraq"],
  ["iraqi", "Iraq"],
  ["ireland", "Ireland"],
  ["irish", "Ireland"],
  ["israel", "Israel"],
  ["israeli", "Israel"],
  ["italy", "Italy"],
  ["italian", "Italy"],
  ["japan", "Japan"],
  ["japanese", "Japan"],
  ["jordanian", "Jordan"],
  ["kazakh", "Kazakhstan"],
  ["kazakhstan", "Kazakhstan"],
  ["kenya", "Kenya"],
  ["kenyan", "Kenya"],
  ["lebanon", "Lebanon"],
  ["lebanese", "Lebanon"],
  ["libya", "Libya"],
  ["libyan", "Libya"],
  ["malaysia", "Malaysia"],
  ["malaysian", "Malaysia"],
  ["mexico", "Mexico"],
  ["mexican", "Mexico"],
  ["morocco", "Morocco"],
  ["moroccan", "Morocco"],
  ["myanmar", "Myanmar"],
  ["burmese", "Myanmar"],
  ["nepal", "Nepal"],
  ["nepalese", "Nepal"],
  ["netherlands", "Netherlands"],
  ["dutch", "Netherlands"],
  ["nigeria", "Nigeria"],
  ["nigerian", "Nigeria"],
  ["norway", "Norway"],
  ["norwegian", "Norway"],
  ["pakistan", "Pakistan"],
  ["pakistani", "Pakistan"],
  ["palestine", "Palestine"],
  ["palestinian", "Palestine"],
  ["palestinians", "Palestine"],
  ["peru", "Peru"],
  ["peruvian", "Peru"],
  ["philippines", "Philippines"],
  ["philippine", "Philippines"],
  ["filipino", "Philippines"],
  ["poland", "Poland"],
  ["polish", "Poland"],
  ["portugal", "Portugal"],
  ["portuguese", "Portugal"],
  ["qatar", "Qatar"],
  ["qatari", "Qatar"],
  ["romania", "Romania"],
  ["romanian", "Romania"],
  ["russia", "Russia"],
  ["russian", "Russia"],
  ["rwanda", "Rwanda"],
  ["rwandan", "Rwanda"],
  ["saudi", "Saudi Arabia"],
  ["scotland", "United Kingdom"],
  ["scottish", "United Kingdom"],
  ["serbia", "Serbia"],
  ["serbian", "Serbia"],
  ["singapore", "Singapore"],
  ["singaporean", "Singapore"],
  ["somalia", "Somalia"],
  ["somali", "Somalia"],
  ["spain", "Spain"],
  ["spanish", "Spain"],
  ["sudan", "Sudan"],
  ["sudanese", "Sudan"],
  ["sweden", "Sweden"],
  ["swedish", "Sweden"],
  ["switzerland", "Switzerland"],
  ["swiss", "Switzerland"],
  ["syria", "Syria"],
  ["syrian", "Syria"],
  ["taiwan", "Taiwan"],
  ["taiwanese", "Taiwan"],
  ["tanzania", "Tanzania"],
  ["tanzanian", "Tanzania"],
  ["thailand", "Thailand"],
  ["thai", "Thailand"],
  ["tunisia", "Tunisia"],
  ["tunisian", "Tunisia"],
  ["türkiye", "Turkey"],
  ["turkey", "Turkey"],
  ["turkish", "Turkey"],
  ["uganda", "Uganda"],
  ["ugandan", "Uganda"],
  ["ukraine", "Ukraine"],
  ["ukrainian", "Ukraine"],
  ["venezuela", "Venezuela"],
  ["venezuelan", "Venezuela"],
  ["vietnam", "Vietnam"],
  ["vietnamese", "Vietnam"],
  ["wales", "United Kingdom"],
  ["welsh", "United Kingdom"],
  ["yemen", "Yemen"],
  ["yemeni", "Yemen"],
  ["zimbabwe", "Zimbabwe"],
  ["zimbabwean", "Zimbabwe"],
  ["korea", "Korea"],
  ["korean", "Korea"],
];

const OUTLET_COUNTRY: Record<string, string> = {
  "cbc-top": "Canada",
  "abc-australia": "Australia",
  "politico": "United States",
  "pbs-newshour": "United States",
  "cbs-news": "United States",
  "abc-news": "United States",
  "nbc-news": "United States",
  "npr-news": "United States",
  "npr-politics": "United States",
  "npr-business": "United States",
  "npr-technology": "United States",
  "nyt-politics": "United States",
  "bbc-politics": "United Kingdom",
  "guardian-politics": "United Kingdom",
};

type Hit = { start: number; end: number; name: string };

function countriesIn(text: string): string[] {
  const hits: Hit[] = [];
  for (const [phrase, name] of PLACES) {
    const pattern = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    for (const match of text.matchAll(pattern)) {
      const start = match.index ?? 0;
      hits.push({ start, end: start + match[0].length, name });
    }
  }
  const kept = hits.filter(
    (hit) =>
      !hits.some(
        (other) =>
          other !== hit &&
          other.end - other.start > hit.end - hit.start &&
          other.start <= hit.start &&
          other.end >= hit.end,
      ),
  );
  return [...new Set(kept.map((hit) => hit.name))];
}

function placeLabel(title: string, description: string | null, feedIds: string[]): { label: string; local: boolean; via: string } {
  const named = countriesIn(title);
  if (named.length === 1) return { label: named[0], local: true, via: "title" };
  if (named.length > 1) return { label: named.join(", "), local: false, via: "title" };
  const described = description ? countriesIn(description) : [];
  if (described.length === 1) return { label: described[0], local: true, via: "description" };
  if (described.length > 1) return { label: described.join(", "), local: false, via: "description" };
  const homes = [...new Set(feedIds.map((id) => OUTLET_COUNTRY[id]).filter((name): name is string => Boolean(name)))];
  if (homes.length === 1) return { label: homes[0], local: true, via: "outlet" };
  return { label: "", local: false, via: "" };
}

type MatchRow = {
  date: string;
  bookId: string;
  titleKey: string;
  title: string;
  themeId: string;
  anchor: string;
};

async function main(): Promise<void> {
  const db = openWriteDatabase();
  try {
    const latest = db.prepare(`SELECT MAX(published_date) AS date FROM headlines`).get() as { date: string };
    const { current } = weekWindows(latest.date);
    const start = current[0];
    const end = current[current.length - 1];
    const titleCount = (
      db.prepare(`SELECT COUNT(DISTINCT title_key) AS n FROM headlines WHERE published_date >= ? AND published_date <= ?`).get(start, end) as { n: number }
    ).n;

    const oldRows = db
      .prepare(`SELECT date, book_id AS bookId, raw, matched_count AS matched FROM scores WHERE date >= ? AND date <= ?`)
      .all(start, end) as { date: string; bookId: string; raw: number; matched: number }[];
    const oldByBook = new Map<string, { date: string; raw: number; matched: number }[]>();
    for (const row of oldRows) {
      const list = oldByBook.get(row.bookId) ?? [];
      list.push(row);
      oldByBook.set(row.bookId, list);
    }

    const oldMatches = db
      .prepare(
        `SELECT m.date AS date, m.book_id AS bookId, m.title_key AS titleKey, m.title AS title,
                p.theme_id AS themeId, p.phrase AS anchor
         FROM score_matches m
         JOIN score_match_phrases p
           ON p.date = m.date AND p.book_id = m.book_id AND p.title_key = m.title_key
         WHERE m.date >= ? AND m.date <= ?`,
      )
      .all(start, end) as MatchRow[];

    const computedAt = new Date().toISOString();
    const judged: {
      date: string;
      bookId: string;
      themeId: string;
      titleKey: string;
      title: string;
      anchor: string;
      counts: number;
      counter: number | null;
    }[] = [];

    for (const day of current) {
      const groups = headlineGroups(db, day);
      const pairs = entailmentPairs(groups);
      console.log(`${day}: titles ${groups.length} pairs ${pairs.length}`);
      const scores = await scoreEntailment(pairs);
      recomputeDate(db, day, computedAt, scores, CUTOFF);
      const byKey = new Map(groups.map((group) => [group.titleKey, group]));
      for (const book of books) {
        for (const theme of book.themes) {
          const rule = themeRule(book.id, theme.id);
          if (!rule) continue;
          for (const group of groups) {
            const counts = scores.get(entailmentKey(book.id, theme.id, group.titleKey));
            if (counts == null) continue;
            const found = matchedAnchors(group.titles, rule.anchors);
            judged.push({
              date: day,
              bookId: book.id,
              themeId: theme.id,
              titleKey: group.titleKey,
              title: byKey.get(group.titleKey)?.displayTitle ?? group.displayTitle,
              anchor: found[0] ?? "",
              counts,
              counter: rule.counter ? (scores.get(counterKey(book.id, theme.id, group.titleKey)) ?? null) : null,
            });
          }
        }
      }
    }

    const fresh = db
      .prepare(`SELECT date, book_id AS bookId, raw, matched_count AS matched FROM scores WHERE date >= ? AND date <= ?`)
      .all(start, end) as { date: string; bookId: string; raw: number; matched: number }[];
    const newByBook = new Map<string, { date: string; raw: number; matched: number }[]>();
    for (const row of fresh) {
      const list = newByBook.get(row.bookId) ?? [];
      list.push(row);
      newByBook.set(row.bookId, list);
    }
    const newMatches = db
      .prepare(
        `SELECT m.date AS date, m.book_id AS bookId, m.title_key AS titleKey, m.title AS title,
                p.theme_id AS themeId, p.phrase AS anchor
         FROM score_matches m
         JOIN score_match_phrases p
           ON p.date = m.date AND p.book_id = m.book_id AND p.title_key = m.title_key
         WHERE m.date >= ? AND m.date <= ?`,
      )
      .all(start, end) as MatchRow[];

    const headlineMeta = db.prepare(
      `SELECT feed_id AS feedId, description FROM headlines WHERE published_date = ? AND title_key = ?`,
    );

    function meta(date: string, titleKey: string): { feeds: string[]; description: string | null; outlets: string[] } {
      const rows = headlineMeta.all(date, titleKey) as { feedId: string; description: string | null }[];
      return {
        feeds: rows.map((row) => row.feedId),
        description: rows.find((row) => row.description)?.description ?? null,
        outlets: [...new Set(rows.map((row) => sourceName(row.feedId)))],
      };
    }

    function weekOf(rows: { date: string; raw: number; matched: number }[] | undefined): { raw: number; score: number } {
      const byDate = new Map((rows ?? []).map((row) => [row.date, row]));
      const combined = combineWindow(
        current.map((date) => {
          const row = byDate.get(date);
          return { raw: row?.raw ?? 0, matched: row?.matched ?? 0 };
        }),
      );
      return { raw: combined.raw, score: combined.score };
    }

    function storyFor(bookId: string): { raw: number; score: number; stories: number } {
      const mine = newMatches.filter((row) => row.bookId === bookId);
      const byTheme = new Map<string, { words: Set<string> }[]>();
      for (const row of mine) {
        const anchors = themeRule(bookId, row.themeId)?.anchors ?? [];
        const list = byTheme.get(row.themeId) ?? [];
        list.push({ words: contentWords(row.title, anchors) });
        byTheme.set(row.themeId, list);
      }
      let raw = 0;
      for (const group of byTheme.values()) raw += storyRaw(group);
      return { raw, score: scoreFromRaw(raw), stories: byTheme.size };
    }

    const lines: string[] = [];
    lines.push("# Five-book rescore");
    lines.push("");
    lines.push(
      `${formatRange(start, end)}. ${titleCount.toLocaleString("en-GB")} stored titles. Cutoff 0.80. No new headlines were fetched.`,
    );
    lines.push("");
    lines.push(
      "The Iron Heel, Dune, The Space Merchants, 1984, and Brave New World now have a counts claim and a does-not-count claim on the themes named below. A headline counts when its title contains an anchor and the counts claim scores 0.80 or higher and higher than the does-not-count claim. Every other book is unchanged. The board uses this claims score.",
    );
    lines.push("");
    lines.push(
      "The last column is not on the board. Within one theme, headlines that share two words, ignoring the anchor and common words such as \"the\" and \"says\", are one story. The first story adds 2. Each further story in that theme adds half as much. That total uses the same curve.",
    );
    lines.push("");
    lines.push("## Scores");
    lines.push("");
    lines.push("| Book | Old | Claims only | Claims and stories |");
    lines.push("| --- | ---: | ---: | ---: |");

    const ranked = books
      .map((book) => {
        const oldScore = weekOf(oldByBook.get(book.id));
        const claims = weekOf(newByBook.get(book.id));
        const stories = storyFor(book.id);
        return { book, oldScore, claims, stories };
      })
      .sort((a, b) => b.claims.score - a.claims.score || a.book.year - b.book.year || a.book.title.localeCompare(b.book.title));

    for (const row of ranked) {
      lines.push(
        `| ${row.book.title} | ${row.oldScore.score} | ${row.claims.score} | ${row.stories.score} |`,
      );
    }
    lines.push("");

    const above = ranked.filter((row) => row.claims.score > 0).length;
    lines.push(`${above} books are above 0 on the claims score.`);
    lines.push("");
    lines.push("## Claims");
    lines.push("");
    for (const book of books.filter((item) => FIVE.has(item.id))) {
      lines.push(`### ${book.title}`);
      lines.push("");
      for (const theme of book.themes) {
        const rule = themeRule(book.id, theme.id);
        if (!rule?.counter) {
          lines.push(`- ${theme.name}. Left as it was. Anchors: ${rule?.anchors.join(", ") ?? ""}.`);
          continue;
        }
        lines.push(`- ${theme.name}. Counts: ${rule.hypothesis} Does not count: ${rule.counter} Anchors: ${rule.anchors.join(", ")}.`);
      }
      lines.push("");
    }

    const judgedKey = (row: { date: string; bookId: string; themeId: string; titleKey: string }) =>
      `${row.date}\u0000${row.bookId}\u0000${row.themeId}\u0000${row.titleKey}`;
    const judgedBy = new Map(judged.map((row) => [judgedKey(row), row]));

    const counted = newMatches.filter((row) => FIVE.has(row.bookId));
    const countedKeys = new Set(counted.map(judgedKey));
    const dropped = oldMatches.filter((row) => FIVE.has(row.bookId) && !countedKeys.has(judgedKey(row)));

    lines.push("## Headlines that count");
    lines.push("");
    if (counted.length === 0) lines.push("None.");
    const byBook = groupBy(counted, (row) => row.bookId);
    let local = 0;
    const seenPlace = new Set<string>();
    for (const book of books.filter((item) => FIVE.has(item.id))) {
      const rows = byBook.get(book.id) ?? [];
      if (rows.length === 0) continue;
      lines.push(`### ${book.title}`);
      lines.push("");
      for (const row of rows.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))) {
        const score = judgedBy.get(judgedKey(row));
        const info = meta(row.date, row.titleKey);
        const place = placeLabel(row.title, info.description, info.feeds);
        const placeKey = `${row.bookId}\u0000${row.titleKey}\u0000${row.date}`;
        if (!seenPlace.has(placeKey)) {
          seenPlace.add(placeKey);
          if (place.local) local += 1;
        }
        const theme = book.themes.find((item) => item.id === row.themeId)?.name ?? row.themeId;
        const where = place.label ? `${place.label}${place.via === "outlet" ? " (from the outlet)" : ""}` : "country not obvious";
        const claimText =
          score?.counter == null
            ? `Counts ${score ? score.counts.toFixed(3) : "missing"}. This theme has no does-not-count claim.`
            : `Counts ${score.counts.toFixed(3)}. Does not count ${score.counter.toFixed(3)}.`;
        lines.push(
          `${row.date}. ${theme}. Anchor: ${row.anchor}. ${claimText} ${where}. ${info.outlets.join(", ") || "unknown outlet"}.`,
        );
        lines.push("");
        lines.push(row.title);
        lines.push("");
      }
    }

    lines.push("## Headlines that dropped off");
    lines.push("");
    if (dropped.length === 0) lines.push("None.");
    const droppedBy = groupBy(dropped, (row) => row.bookId);
    for (const book of books.filter((item) => FIVE.has(item.id))) {
      const rows = droppedBy.get(book.id) ?? [];
      if (rows.length === 0) continue;
      lines.push(`### ${book.title}`);
      lines.push("");
      for (const row of rows.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))) {
        const score = judgedBy.get(judgedKey(row));
        const theme = book.themes.find((item) => item.id === row.themeId)?.name ?? row.themeId;
        lines.push(`${row.date}. ${theme}. Anchor was: ${row.anchor}.`);
        lines.push("");
        lines.push(row.title);
        lines.push("");
        if (!score) {
          lines.push("The title does not contain an anchor for this theme, so it was not scored.");
        } else {
          const counterText = score.counter == null ? "no twin" : score.counter.toFixed(3);
          lines.push(`Counts ${score.counts.toFixed(3)}. Does not count ${counterText}.`);
        }
        lines.push("");
      }
    }

    lines.push("## Country");
    lines.push("");
    lines.push(
      `${local} of ${seenPlace.size} headlines that count are local to one country. A country is noted when the title, the stored description, or a national outlet makes one country obvious. The board is not filtered by country.`,
    );
    lines.push("");

    writeFileSync(REPORT, lines.join("\n"));
    console.log(`report ${REPORT}`);
    console.log(`above ${above}`);
    console.log(`counted ${counted.length} dropped ${dropped.length} local ${local}`);
  } finally {
    db.close();
  }
}

function groupBy<T>(rows: T[], key: (row: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const id = key(row);
    const list = map.get(id) ?? [];
    list.push(row);
    map.set(id, list);
  }
  return map;
}

function formatRange(start: string, end: string): string {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(`${iso}T00:00:00Z`),
    );
  return `${fmt(start)} to ${fmt(end)}`;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
