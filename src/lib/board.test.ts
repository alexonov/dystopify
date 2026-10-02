import assert from "node:assert/strict";
import test from "node:test";
import { listedHistory } from "./board";

test("book history keeps counted days and the latest day", () => {
  const points = [
    { date: "2026-09-01", score: 0 },
    { date: "2026-09-15", score: 22 },
    { date: "2026-09-30", score: 0 },
    { date: "2026-10-01", score: 0 },
  ];
  const counted = new Set(["2026-09-15", "2026-09-20"]);
  assert.deepEqual(listedHistory(points, "2026-10-01", counted), [
    { date: "2026-09-15", score: 22 },
    { date: "2026-10-01", score: 0 },
  ]);
});
