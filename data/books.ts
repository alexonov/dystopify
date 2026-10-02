/**
 * Books, themes, phrases, and anchor words for the daily meter.
 *
 * A headline counts for a theme only when its title contains one of that
 * theme's anchor words as a whole word, and the local entailment model
 * scores that theme's hypothesis at 0.90 or higher. A counted headline
 * adds weight 2 for that theme, once. The score is
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

export type ThemeRule = {
  hypothesis: string;
  anchors: string[];
};

export function ruleKey(bookId: string, themeId: string): string {
  return `${bookId}/${themeId}`;
}

export const themeRules: Record<string, ThemeRule> = {
  "1984/surveillance": {
    hypothesis: "This headline reports that people are being spied on.",
    anchors: ["surveillance", "spy", "snooping", "spyware"],
  },
  "1984/mutable-record": {
    hypothesis: "This headline reports that a fake image or recording is being presented as real.",
    anchors: ["deepfake", "doctored", "falsified"],
  },
  "1984/permanent-enemy": {
    hypothesis: "This headline reports that a government is maintaining a permanent enemy.",
    anchors: ["enemy", "foe"],
  },
  "brave-new-world/chemical-peace": {
    hypothesis: "This headline reports that a drug is being used to keep a population calm.",
    anchors: ["sedative", "opioid", "tranquilizer", "tranquiliser"],
  },
  "brave-new-world/conditioning": {
    hypothesis: "This headline reports that a government is conditioning people's behavior.",
    anchors: ["conditioning", "nudge", "reeducation"],
  },
  "brave-new-world/managed-pleasure": {
    hypothesis: "This headline reports that pleasure is being supplied so people stop resisting.",
    anchors: ["dopamine", "hedonism", "pleasure"],
  },
  "we/transparency": {
    hypothesis: "This headline reports that people must register under their real names.",
    anchors: ["transparency", "registration"],
  },
  "we/engineered-sameness": {
    hypothesis: "This headline reports that a social-credit system is scoring citizens.",
    anchors: ["biometric", "sameness"],
  },
  "minority-report/prediction-as-guilt": {
    hypothesis: "This headline reports that police detained someone because a model predicted a future crime.",
    anchors: ["precrime", "predictive", "pre-crime"],
  },
  "player-piano/automation-displacing-purpose": {
    hypothesis: "This headline reports that machines have replaced human workers.",
    anchors: ["automation", "layoff", "layoffs"],
  },
  "fahrenheit-451/entertainment-crowds-out-record": {
    hypothesis: "This headline reports that entertainment is crowding out the written record.",
    anchors: ["censorship", "bookburning", "bonfire"],
  },
  "the-handmaids-tale/theocratic-control-of-bodies": {
    hypothesis: "This headline reports that a religious authority is controlling people's bodies.",
    anchors: ["theocracy", "fatwa", "sterilization"],
  },
  "the-trial/process-without-charge": {
    hypothesis: "This headline reports that the state is holding people in detention.",
    anchors: ["detention", "detained", "detainee", "remand"],
  },
  "never-let-me-go/class-used-up": {
    hypothesis: "This headline reports that people are being trafficked.",
    anchors: ["trafficking", "harvesting"],
  },
  "parable-of-the-sower/gated-safety": {
    hypothesis: "This headline reports that refugees are losing protection.",
    anchors: ["refugee"],
  },
  "the-time-machine/leisured-class": {
    hypothesis: "This headline reports that a leisured class is living off other people's work.",
    anchors: ["rentier", "leisure", "idle"],
  },
  "the-time-machine/class-consumed": {
    hypothesis: "This headline reports that employers broke minimum-wage rules.",
    anchors: ["wage"],
  },
  "the-island-of-doctor-moreau/flesh-remade": {
    hypothesis: "This headline reports that an authority is surgically altering people's bodies without consent.",
    anchors: ["sterilization", "sterilisation", "mutilation"],
  },
  "the-island-of-doctor-moreau/civilized-test": {
    hypothesis: "This headline reports that a test of pain is deciding who counts as civilized.",
    anchors: ["sentience", "personhood"],
  },
  "the-iron-heel/owning-class": {
    hypothesis: "This headline reports that an oligarchy is ruling the country.",
    anchors: ["oligarchy", "oligarch", "plutocracy"],
  },
  "the-iron-heel/labor-crushed": {
    hypothesis: "This headline reports labor unrest.",
    anchors: ["strike", "union", "picket"],
  },
  "it-cant-happen-here/elected-strongman": {
    hypothesis: "This headline reports that an election installed a dictator.",
    anchors: ["dictator", "strongman", "autocrat"],
  },
  "it-cant-happen-here/militia-ordinary": {
    hypothesis: "This headline reports that armed militias are taking part in ordinary politics.",
    anchors: ["militia", "paramilitary", "vigilante"],
  },
  "the-space-merchants/ads-as-government": {
    hypothesis: "This headline reports that a state is spreading propaganda.",
    anchors: ["propaganda"],
  },
  "the-space-merchants/person-sold": {
    hypothesis: "This headline reports a legal fight over a company's privacy practices.",
    anchors: ["privacy"],
  },
  "a-clockwork-orange/aversion-conditioning": {
    hypothesis: "This headline reports that aversion therapy is being used to remove someone's ability to choose.",
    anchors: ["aversion", "castration"],
  },
  "a-clockwork-orange/youth-edited": {
    hypothesis: "This headline reports that young people are being sent to re-education.",
    anchors: ["reeducation", "indoctrination"],
  },
  "dune/resource-dependence": {
    hypothesis: "This headline reports that a government is building a fuel pipeline.",
    anchors: ["pipeline"],
  },
  "dune/religion-as-arm": {
    hypothesis: "This headline reports that a ruling family is using religion as a military force.",
    anchors: ["jihad", "theocracy", "crusade"],
  },
  "dune/dynasty-bred": {
    hypothesis: "This headline reports that a hereditary dynasty is installing its next ruler.",
    anchors: ["dynasty", "succession", "heir"],
  },
  "do-androids-dream-of-electric-sheep/personhood-test": {
    hypothesis: "This headline reports that a test is deciding who counts as a person.",
    anchors: ["personhood", "sentience", "turing"],
  },
  "do-androids-dream-of-electric-sheep/manufactured-life": {
    hypothesis: "This headline reports that gene-edited humans are being treated as property.",
    anchors: ["clone", "embryo", "crispr"],
  },
  "the-forever-war/life-consumed": {
    hypothesis: "This headline reports opposition to military conscription.",
    anchors: ["conscription"],
  },
  "the-forever-war/replaced-return": {
    hypothesis: "This headline reports that veterans came home to a country that had moved on without them.",
    anchors: ["veteran", "veterans", "homecoming"],
  },
  "high-rise/building-polity": {
    hypothesis: "This headline reports a dispute over tenants' rights.",
    anchors: ["tenants"],
  },
  "high-rise/height-as-rank": {
    hypothesis: "This headline reports that a resident's floor is being treated as their class.",
    anchors: ["penthouse", "mezzanine"],
  },
  "neuromancer/firm-as-state": {
    hypothesis: "This headline reports objections to a company holding health data.",
    anchors: ["palantir"],
  },
  "neuromancer/body-left-behind": {
    hypothesis: "This headline reports that a person is leaving their body to enter a network.",
    anchors: ["neural", "cyberspace"],
  },
  "hyperion/machine-clients": {
    hypothesis: "This headline reports that people are being kept as captive clients of a platform.",
    anchors: ["platform", "lock-in"],
  },
  "hyperion/death-leased": {
    hypothesis: "This headline reports that staying alive is being sold as a subscription.",
    anchors: ["cryonics", "longevity", "subscription"],
  },
  "the-children-of-men/missing-generation": {
    hypothesis: "This headline reports that births have collapsed.",
    anchors: ["fertility", "birthrate", "births"],
  },
  "the-children-of-men/caretaker-state": {
    hypothesis: "This headline reports that an aging autocracy is governing the country.",
    anchors: ["gerontocracy", "autocracy"],
  },
  "snow-crash/franchise-sovereignty": {
    hypothesis: "This headline reports that sovereignty is being sold as a charter city.",
    anchors: ["charter", "secession"],
  },
  "snow-crash/language-contagion": {
    hypothesis: "This headline reports that a linguistic contagion is controlling how people think.",
    anchors: ["meme", "contagion"],
  },
  "feed/mind-feed": {
    hypothesis: "This headline reports that advertising is being delivered into a person's mind.",
    anchors: ["neuromarketing", "subliminal"],
  },
  "feed/damaged-market": {
    hypothesis: "This headline reports that social media is addictive.",
    anchors: ["addiction"],
  },
  "oryx-and-crake/designed-extinction": {
    hypothesis: "This headline reports that an extinction was deliberately engineered.",
    anchors: ["extinction"],
  },
  "oryx-and-crake/made-humanity": {
    hypothesis: "This headline reports that engineered humans are replacing existing people.",
    anchors: ["crispr", "genome", "clone"],
  },
};

export function themeRule(bookId: string, themeId: string): ThemeRule | undefined {
  return themeRules[ruleKey(bookId, themeId)];
}

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}

export function bookByTitle(title: string): Book | undefined {
  return books.find((book) => book.title === title);
}
