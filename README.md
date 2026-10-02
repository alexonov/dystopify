# Dystopify

A daily meter of how much of the public headline record matches twenty-six books. Each book is scored on its own scale from 0 to 100. A headline counts for a theme only when the title contains that theme's anchor word and a local entailment check scores the theme's claim at 0.90 or higher. A counted headline adds weight 2, once. The score is still `100 × (1 − e^(−raw / 8))`, rounded. Model fees are $0.

The number is how much of that UTC day's headlines match the book. It is not a forecast that the plot is happening. Two books can both sit high. Nothing forces the scores to add up to 100%.

## Run ingest

Ingest is the only writer. It requests the public RSS feeds named for this meter (BBC News, NPR, The Guardian, Al Jazeera, France 24, and DW), stores a thin copy of each headline, and recomputes scores for the current UTC date and the day before. Rows older than 45 days are deleted.

```bash
npm install
npm run ingest
```

The database is `data/dystopify.sqlite`. A failed run leaves the last good scores in place and records the error. The page shows that error, and the time of the last ingest that finished cleanly.

Books, themes, anchor words, and claims live in `data/books.ts`. An anchor has to appear as a whole word in the title. The entailment check uses a local model already on disk, `MoritzLaurer/deberta-v3-base-zeroshot-v2.0`. The same title from two outlets is counted once. The page does not call the model.

Run ingest again when you want the file to catch up. The page does not fetch news. To rescore headlines already stored, without fetching, run `npx tsx scripts/recompute.ts`.

## Run the app

The site only reads the database.

```bash
npm run dev
```

Then open http://127.0.0.1:41731.

```bash
npm test
```
