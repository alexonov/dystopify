export const tickers: Record<string, string> = {
  "1984": "1984",
  "brave-new-world": "BNW",
  we: "WE",
  "minority-report": "MNRPT",
  "player-piano": "PIANO",
  "fahrenheit-451": "F451",
  "the-handmaids-tale": "HMAD",
  "the-trial": "TRIAL",
  "never-let-me-go": "NLMG",
  "parable-of-the-sower": "SOWER",
};

export function tickerFor(id: string): string {
  return tickers[id] ?? id.slice(0, 6).toUpperCase();
}

export function coverSrc(id: string): string {
  return `/covers/${id}.jpg`;
}
