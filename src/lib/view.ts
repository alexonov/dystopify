export type HistoryPoint = {
  date: string;
  score: number;
};

export type ThemePoint = {
  id: string;
  name: string;
  points: number;
};

export type BookScoreView = {
  id: string;
  title: string;
  author: string;
  year: number;
  phrase: string;
  neighbor: string;
  raw: number;
  score: number;
  matchedCount: number;
  headlinesRead: number;
  themes: ThemePoint[];
  history: HistoryPoint[];
  listedHistory: HistoryPoint[];
};

export type Banner = {
  failedAt: string;
  error: string;
  lastSuccessAt: string | null;
};

export type MatchLink = {
  source: string;
  href: string;
};

export type MatchHit = {
  themeName: string;
  phrase: string;
  weight: number;
};

export type MatchView = {
  title: string;
  description: string | null;
  publishedAt: string;
  weight: number;
  links: MatchLink[];
  hits: MatchHit[];
};

export type DayView =
  | { kind: "empty"; banner: Banner | null; lastSuccessAt: string | null }
  | {
      kind: "ready";
      date: string;
      headlinesRead: number;
      rows: BookScoreView[];
      banner: Banner | null;
      lastSuccessAt: string | null;
    };
