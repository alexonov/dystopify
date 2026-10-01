/**
 * Books, themes, and phrases for the daily meter.
 *
 * Matching is case-insensitive, on the headline title only, with word
 * boundaries. Weights are 2 or 3. A title contributes its strongest matched
 * weight to a book once. The score is
 * round(100 * (1 - e^(-raw / RAW_SCALE))).
 */

export type Phrase = {
  text: string;
  weight: 2 | 3;
};

export type Theme = {
  id: string;
  name: string;
  phrases: Phrase[];
};

export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  gloss: string;
  lens: string;
  themes: Theme[];
};

export const RAW_SCALE = 8;

export const books: Book[] = [
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    year: 1949,
    gloss: "Surveillance, a mutable record, a permanent enemy",
    lens: "The pressure is a watch on ordinary life, a record that can be revised after the fact, and an enemy that never leaves so the watch can continue.",
    themes: [
      {
        id: "surveillance",
        name: "Surveillance",
        phrases: [
          { text: "mass surveillance", weight: 3 },
          { text: "facial recognition", weight: 3 },
          { text: "warrantless surveillance", weight: 3 },
          { text: "pegasus spyware", weight: 2 },
        ],
      },
      {
        id: "mutable-record",
        name: "Mutable record",
        phrases: [
          { text: "memory hole", weight: 3 },
          { text: "rewriting history", weight: 2 },
          { text: "doctored footage", weight: 2 },
        ],
      },
      {
        id: "permanent-enemy",
        name: "Permanent enemy",
        phrases: [
          { text: "enemy of the state", weight: 3 },
          { text: "perpetual war", weight: 2 },
          { text: "designated enemy", weight: 2 },
          { text: "forever war", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "brave-new-world",
    title: "Brave New World",
    author: "Aldous Huxley",
    year: 1932,
    gloss: "Chemical peace, conditioning, managed pleasure",
    lens: "The pressure is peace kept with chemistry, training that starts before a person can refuse it, and pleasure supplied so that wanting anything else feels unnecessary.",
    themes: [
      {
        id: "chemical-peace",
        name: "Chemical peace",
        phrases: [
          { text: "chemical pacification", weight: 3 },
          { text: "mood-altering drug", weight: 2 },
          { text: "mood altering drug", weight: 2 },
        ],
      },
      {
        id: "conditioning",
        name: "Conditioning",
        phrases: [
          { text: "behavioral nudge", weight: 3 },
          { text: "behavioural nudge", weight: 3 },
          { text: "nudge unit", weight: 2 },
        ],
      },
      {
        id: "managed-pleasure",
        name: "Managed pleasure",
        phrases: [
          { text: "mandatory happiness", weight: 3 },
          { text: "dopamine trap", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "we",
    title: "We",
    author: "Yevgeny Zamyatin",
    year: 1924,
    gloss: "Transparency and engineered sameness",
    lens: "The pressure is a life conducted in the open, and a sameness that is designed rather than chosen.",
    themes: [
      {
        id: "transparency",
        name: "Transparency",
        phrases: [
          { text: "real-name registration", weight: 3 },
          { text: "real name registration", weight: 3 },
          { text: "mandatory transparency", weight: 2 },
        ],
      },
      {
        id: "engineered-sameness",
        name: "Engineered sameness",
        phrases: [
          { text: "social credit", weight: 3 },
          { text: "biometric identity", weight: 3 },
          { text: "emotion recognition", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "minority-report",
    title: "Minority Report",
    author: "Philip K. Dick",
    year: 1956,
    gloss: "Prediction treated as guilt",
    lens: "The pressure is a forecast treated as if the person had already done the thing.",
    themes: [
      {
        id: "prediction-as-guilt",
        name: "Prediction treated as guilt",
        phrases: [
          { text: "predictive policing", weight: 3 },
          { text: "pre-crime", weight: 3 },
          { text: "precrime", weight: 3 },
          { text: "predictive arrest", weight: 2 },
          { text: "risk score", weight: 2 },
          { text: "future crime", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "player-piano",
    title: "Player Piano",
    author: "Kurt Vonnegut",
    year: 1952,
    gloss: "Automation displacing purpose",
    lens: "The pressure is machines taking the work, while the people who used to do it are left fed and unneeded.",
    themes: [
      {
        id: "automation-displacing-purpose",
        name: "Automation displacing purpose",
        phrases: [
          { text: "replaced by machines", weight: 3 },
          { text: "replaced by AI", weight: 3 },
          { text: "universal basic income", weight: 3 },
          { text: "mass layoff", weight: 2 },
          { text: "mass layoffs", weight: 2 },
          { text: "jobless recovery", weight: 2 },
          { text: "automation wave", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "fahrenheit-451",
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    year: 1953,
    gloss: "Entertainment crowding out the record",
    lens: "The pressure is entertainment that fills the day until the written record is something people no longer miss.",
    themes: [
      {
        id: "entertainment-crowds-out-record",
        name: "Entertainment crowding out the record",
        phrases: [
          { text: "book burning", weight: 3 },
          { text: "banned books", weight: 3 },
          { text: "book bans", weight: 3 },
          { text: "book ban", weight: 3 },
          { text: "attention economy", weight: 2 },
          { text: "doomscrolling", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "the-handmaids-tale",
    title: "The Handmaid's Tale",
    author: "Margaret Atwood",
    year: 1985,
    gloss: "Theocratic control of bodies",
    lens: "The pressure is a religious authority deciding what a body is for, and who is allowed to refuse.",
    themes: [
      {
        id: "theocratic-control-of-bodies",
        name: "Theocratic control of bodies",
        phrases: [
          { text: "forced pregnancy", weight: 3 },
          { text: "forced birth", weight: 3 },
          { text: "morality police", weight: 3 },
          { text: "gender apartheid", weight: 3 },
          { text: "compulsory motherhood", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "the-trial",
    title: "The Trial",
    author: "Franz Kafka",
    year: 1925,
    gloss: "Process without an accountable charge",
    lens: "The pressure is a process that moves a person along without an accountable charge they can answer.",
    themes: [
      {
        id: "process-without-charge",
        name: "Process without an accountable charge",
        phrases: [
          { text: "held without charge", weight: 3 },
          { text: "detained without charge", weight: 3 },
          { text: "indefinite detention", weight: 3 },
          { text: "administrative detention", weight: 3 },
          { text: "secret trial", weight: 3 },
          { text: "without due process", weight: 2 },
          { text: "extrajudicial detention", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "never-let-me-go",
    title: "Never Let Me Go",
    author: "Kazuo Ishiguro",
    year: 2005,
    gloss: "A class managed to be used up",
    lens: "The pressure is a class of people who are looked after, sorted, and then used up.",
    themes: [
      {
        id: "class-used-up",
        name: "A class managed to be used up",
        phrases: [
          { text: "organ trafficking", weight: 3 },
          { text: "organ harvesting", weight: 3 },
          { text: "debt bondage", weight: 3 },
          { text: "forced labor camp", weight: 3 },
          { text: "forced labour camp", weight: 3 },
          { text: "disposable workers", weight: 2 },
          { text: "expendable workforce", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "parable-of-the-sower",
    title: "Parable of the Sower",
    author: "Octavia E. Butler",
    year: 1993,
    gloss: "Gated safety while institutions fail",
    lens: "The pressure is safety that can be bought as a gate, while schools, water, and other public institutions outside that gate stop working.",
    themes: [
      {
        id: "gated-safety",
        name: "Gated safety while institutions fail",
        phrases: [
          { text: "climate refugees", weight: 3 },
          { text: "private militia", weight: 3 },
          { text: "institutional collapse", weight: 3 },
          { text: "climate refugee", weight: 2 },
          { text: "failed state", weight: 2 },
          { text: "company town", weight: 2 },
        ],
      },
    ],
  },
];

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}
