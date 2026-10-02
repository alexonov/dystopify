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
  phrase: string;
  neighbor: string;
  themes: Theme[];
};

export const RAW_SCALE = 8;

export const books: Book[] = [
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    year: 1949,
    phrase: "A watched life and a record that can be rewritten.",
    neighbor: "We",
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
    phrase: "Comfort and chemistry instead of force.",
    neighbor: "A Clockwork Orange",
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
    phrase: "A life with no private interior.",
    neighbor: "1984",
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
    phrase: "A forecast treated as guilt.",
    neighbor: "The Trial",
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
    phrase: "Kept fed, pushed out of the work.",
    neighbor: "Feed",
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
    phrase: "Spectacle in place of the record.",
    neighbor: "Feed",
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
    phrase: "Creed in charge of bodies.",
    neighbor: "The Children of Men",
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
    phrase: "A process with no charge you can answer.",
    neighbor: "Minority Report",
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
    phrase: "A class raised to be used up.",
    neighbor: "Do Androids Dream of Electric Sheep?",
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
    phrase: "Walls up while the institutions fail.",
    neighbor: "High-Rise",
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
  {
    id: "the-time-machine",
    title: "The Time Machine",
    author: "H. G. Wells",
    year: 1895,
    phrase: "A future split into the idle and the eaten.",
    neighbor: "High-Rise",
    themes: [
      {
        id: "leisured-class",
        name: "A leisured class",
        phrases: [
          { text: "leisure class", weight: 3 },
          { text: "rentier class", weight: 3 },
          { text: "idle rich", weight: 2 },
        ],
      },
      {
        id: "class-consumed",
        name: "A class kept below and consumed",
        phrases: [
          { text: "debt peonage", weight: 3 },
          { text: "bonded labor", weight: 3 },
          { text: "bonded labour", weight: 3 },
          { text: "sweatshop labor", weight: 3 },
          { text: "sweatshop labour", weight: 3 },
        ],
      },
    ],
  },
  {
    id: "the-island-of-doctor-moreau",
    title: "The Island of Doctor Moreau",
    author: "H. G. Wells",
    year: 1896,
    phrase: "Bodies recut to satisfy a law.",
    neighbor: "Do Androids Dream of Electric Sheep?",
    themes: [
      {
        id: "flesh-remade",
        name: "Flesh remade by authority",
        phrases: [
          { text: "forced sterilization", weight: 3 },
          { text: "forced sterilisation", weight: 3 },
          { text: "nonconsensual surgery", weight: 3 },
          { text: "genital cutting", weight: 3 },
        ],
      },
      {
        id: "civilized-test",
        name: "Speech and pain as the test of being civilized",
        phrases: [
          { text: "animal personhood", weight: 3 },
          { text: "great ape personhood", weight: 3 },
          { text: "sentience hearing", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "the-iron-heel",
    title: "The Iron Heel",
    author: "Jack London",
    year: 1908,
    phrase: "An oligarchy that calls itself destiny.",
    neighbor: "Neuromancer",
    themes: [
      {
        id: "owning-class",
        name: "Rule by an owning class",
        phrases: [
          { text: "ruling oligarchy", weight: 3 },
          { text: "billionaire oligarchs", weight: 3 },
          { text: "plutocratic rule", weight: 2 },
          { text: "owning class", weight: 3 },
        ],
      },
      {
        id: "labor-crushed",
        name: "Labor crushed as policy",
        phrases: [
          { text: "union busting", weight: 3 },
          { text: "union-busting", weight: 3 },
          { text: "outlawed unions", weight: 3 },
          { text: "broke the strike", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "it-cant-happen-here",
    title: "It Can't Happen Here",
    author: "Sinclair Lewis",
    year: 1935,
    phrase: "A vote that builds the dictatorship.",
    neighbor: "1984",
    themes: [
      {
        id: "elected-strongman",
        name: "An elected strongman",
        phrases: [
          { text: "elected strongman", weight: 3 },
          { text: "elected dictator", weight: 3 },
          { text: "strongman rule", weight: 2 },
        ],
      },
      {
        id: "militia-ordinary",
        name: "Militia politics made ordinary",
        phrases: [
          { text: "armed militia", weight: 3 },
          { text: "citizen militia", weight: 2 },
          { text: "militia parade", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "the-space-merchants",
    title: "The Space Merchants",
    author: "Frederik Pohl and C. M. Kornbluth",
    year: 1953,
    phrase: "The advertising agency is the state.",
    neighbor: "Feed",
    themes: [
      {
        id: "ads-as-government",
        name: "Ads as government",
        phrases: [
          { text: "state propaganda", weight: 3 },
          { text: "official propaganda", weight: 3 },
          { text: "government propaganda", weight: 3 },
          { text: "astroturf campaign", weight: 2 },
        ],
      },
      {
        id: "person-sold",
        name: "The person as the thing being sold",
        phrases: [
          { text: "data broker", weight: 3 },
          { text: "selling personal data", weight: 3 },
          { text: "personal data sold", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "a-clockwork-orange",
    title: "A Clockwork Orange",
    author: "Anthony Burgess",
    year: 1962,
    phrase: "The part of you that chooses, removed.",
    neighbor: "Brave New World",
    themes: [
      {
        id: "aversion-conditioning",
        name: "Aversion conditioning",
        phrases: [
          { text: "aversion therapy", weight: 3 },
          { text: "aversion conditioning", weight: 3 },
          { text: "chemical castration", weight: 3 },
        ],
      },
      {
        id: "youth-edited",
        name: "Youth treated as material to edit",
        phrases: [
          { text: "re-education camp", weight: 3 },
          { text: "reeducation camp", weight: 3 },
          { text: "youth reeducation", weight: 2 },
          { text: "behavior modification program", weight: 2 },
          { text: "behaviour modification program", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "dune",
    title: "Dune",
    author: "Frank Herbert",
    year: 1965,
    phrase: "Spice, faith, and a throne that breeds its heir.",
    neighbor: "The Handmaid's Tale",
    themes: [
      {
        id: "resource-dependence",
        name: "A resource the powerful cannot drop",
        phrases: [
          { text: "resource curse", weight: 3 },
          { text: "rare earth monopoly", weight: 3 },
          { text: "strategic mineral", weight: 2 },
        ],
      },
      {
        id: "religion-as-arm",
        name: "Religion used as the arm of a house",
        phrases: [
          { text: "state religion", weight: 3 },
          { text: "theocratic dynasty", weight: 3 },
          { text: "religious dynasty", weight: 2 },
        ],
      },
      {
        id: "dynasty-bred",
        name: "A dynasty breeding the next ruler",
        phrases: [
          { text: "dynastic succession", weight: 3 },
          { text: "hereditary succession", weight: 3 },
          { text: "dynastic heir", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "do-androids-dream-of-electric-sheep",
    title: "Do Androids Dream of Electric Sheep?",
    author: "Philip K. Dick",
    year: 1968,
    phrase: "A test decides who counts as alive.",
    neighbor: "Never Let Me Go",
    themes: [
      {
        id: "personhood-test",
        name: "A test for personhood",
        phrases: [
          { text: "personhood test", weight: 3 },
          { text: "turing test", weight: 2 },
          { text: "legal personhood", weight: 3 },
        ],
      },
      {
        id: "manufactured-life",
        name: "Manufactured life treated as property",
        phrases: [
          { text: "synthetic embryo", weight: 3 },
          { text: "gene-edited baby", weight: 3 },
          { text: "gene edited baby", weight: 3 },
          { text: "artificial womb", weight: 3 },
        ],
      },
    ],
  },
  {
    id: "the-forever-war",
    title: "The Forever War",
    author: "Joe Haldeman",
    year: 1974,
    phrase: "You come home to a country that moved on without you.",
    neighbor: "Player Piano",
    themes: [
      {
        id: "life-consumed",
        name: "A war that consumes a life",
        phrases: [
          { text: "repeated deployment", weight: 3 },
          { text: "multiple combat tours", weight: 3 },
          { text: "decades-long deployment", weight: 2 },
        ],
      },
      {
        id: "replaced-return",
        name: "Return to a society that replaced you",
        phrases: [
          { text: "homeless veterans", weight: 3 },
          { text: "homeless veteran", weight: 3 },
          { text: "abandoned veterans", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "high-rise",
    title: "High-Rise",
    author: "J. G. Ballard",
    year: 1975,
    phrase: "The floor you live on is your class.",
    neighbor: "The Time Machine",
    themes: [
      {
        id: "building-polity",
        name: "A building as a polity",
        phrases: [
          { text: "poor door", weight: 3 },
          { text: "poor doors", weight: 3 },
          { text: "segregated entrance", weight: 3 },
        ],
      },
      {
        id: "height-as-rank",
        name: "Height as rank",
        phrases: [
          { text: "vertical segregation", weight: 3 },
          { text: "penthouse class", weight: 2 },
          { text: "floors by income", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "neuromancer",
    title: "Neuromancer",
    author: "William Gibson",
    year: 1984,
    phrase: "Companies set above countries.",
    neighbor: "Snow Crash",
    themes: [
      {
        id: "firm-as-state",
        name: "A firm with the power of a state",
        phrases: [
          { text: "corporate sovereignty", weight: 3 },
          { text: "private government", weight: 3 },
          { text: "company state", weight: 2 },
        ],
      },
      {
        id: "body-left-behind",
        name: "The body left behind for a network",
        phrases: [
          { text: "neural interface", weight: 3 },
          { text: "mind uploading", weight: 3 },
          { text: "consciousness upload", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "hyperion",
    title: "Hyperion",
    author: "Dan Simmons",
    year: 1989,
    phrase: "Humanity kept on as a client of its machines.",
    neighbor: "Neuromancer",
    themes: [
      {
        id: "machine-clients",
        name: "People retained as clients of a machine power",
        phrases: [
          { text: "platform dependency", weight: 2 },
          { text: "captive platform", weight: 2 },
          { text: "algorithmic landlord", weight: 3 },
        ],
      },
      {
        id: "death-leased",
        name: "Death leased back at a price",
        phrases: [
          { text: "cryonic suspension", weight: 3 },
          { text: "longevity subscription", weight: 2 },
          { text: "subscription medicine", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "the-children-of-men",
    title: "The Children of Men",
    author: "P. D. James",
    year: 1992,
    phrase: "No children left, and a state to manage the waiting.",
    neighbor: "The Handmaid's Tale",
    themes: [
      {
        id: "missing-generation",
        name: "A generation that will not arrive",
        phrases: [
          { text: "fertility collapse", weight: 3 },
          { text: "birth rate collapse", weight: 3 },
          { text: "birth-rate collapse", weight: 3 },
          { text: "population collapse", weight: 3 },
        ],
      },
      {
        id: "caretaker-state",
        name: "An authoritarian caretaker government",
        phrases: [
          { text: "gerontocracy", weight: 3 },
          { text: "aging autocracy", weight: 2 },
          { text: "ageing autocracy", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "snow-crash",
    title: "Snow Crash",
    author: "Neal Stephenson",
    year: 1992,
    phrase: "The country broken into franchises.",
    neighbor: "Neuromancer",
    themes: [
      {
        id: "franchise-sovereignty",
        name: "Sovereignty sold as a franchise",
        phrases: [
          { text: "charter city", weight: 3 },
          { text: "private city", weight: 3 },
          { text: "franchise governance", weight: 2 },
        ],
      },
      {
        id: "language-contagion",
        name: "Language used as a contagion",
        phrases: [
          { text: "language virus", weight: 3 },
          { text: "memetic virus", weight: 2 },
          { text: "linguistic contagion", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "feed",
    title: "Feed",
    author: "M. T. Anderson",
    year: 2002,
    phrase: "Your thoughts arrive with a sponsor.",
    neighbor: "The Space Merchants",
    themes: [
      {
        id: "mind-feed",
        name: "A commercial feed in the mind",
        phrases: [
          { text: "neuromarketing", weight: 3 },
          { text: "neural advertising", weight: 3 },
          { text: "brain advertising", weight: 2 },
        ],
      },
      {
        id: "damaged-market",
        name: "A damaged person as a market",
        phrases: [
          { text: "addiction by design", weight: 3 },
          { text: "designed to be addictive", weight: 2 },
          { text: "engagement addiction", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "oryx-and-crake",
    title: "Oryx and Crake",
    author: "Margaret Atwood",
    year: 2003,
    phrase: "The world cleared to make room for a replacement.",
    neighbor: "The Island of Doctor Moreau",
    themes: [
      {
        id: "designed-extinction",
        name: "A designed extinction",
        phrases: [
          { text: "designed extinction", weight: 3 },
          { text: "deliberate extinction", weight: 3 },
          { text: "gene drive extinction", weight: 3 },
        ],
      },
      {
        id: "made-humanity",
        name: "A made humanity put in the old one's place",
        phrases: [
          { text: "designer baby", weight: 3 },
          { text: "designer babies", weight: 3 },
          { text: "genetically engineered humans", weight: 3 },
          { text: "genetically engineered human", weight: 3 },
        ],
      },
    ],
  },
];

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}

export function bookByTitle(title: string): Book | undefined {
  return books.find((book) => book.title === title);
}
