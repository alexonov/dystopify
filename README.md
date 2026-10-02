# Dystopify

A daily meter of how much of the public headline record sits inside twenty-six dystopian pressures. Each book is scored on its own scale from 0 to 100. The number is a count of hand-chosen phrases in titles, drawn as a curve. No model is called. Model fees are $0.

The meter is how much of that UTC day's headlines are about the pressure the book names. It is not a forecast that the plot is happening. Two books can both sit high. Nothing forces the scores to add up to 100%.

## Run ingest

Ingest is the only writer. It requests the public RSS feeds named for this meter (BBC News, NPR, The Guardian, Al Jazeera, France 24, and DW), stores a thin copy of each headline, and recomputes scores for the current UTC date and the day before. Rows older than 45 days are deleted.

```bash
npm install
npm run ingest
```

The database is `data/dystopify.sqlite`. A failed run leaves the last good scores in place and records the error. The page shows that error, and the time of the last ingest that finished cleanly.

Books, themes, and phrases live in `data/books.ts`. Weights are 2 or 3. Matching is case-insensitive, on the title only, with word boundaries. A title contributes its strongest matched weight to a book once, after the same title from two outlets is counted once. The score is `100 × (1 − e^(−raw / 8))`, rounded to the nearest whole number.

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
