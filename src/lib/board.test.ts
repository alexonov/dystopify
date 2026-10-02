import assert from "node:assert/strict";
import test from "node:test";
import { listedHistory } from "./board";

test("book history lists only days in the window that counted", () => {
  const points = [
    { date: "2026-09-26", score: 0 },
    { date: "2026-10-01", score: 22 },
    { date: "2026-10-02", score: 0 },
  ];
  assert.deepEqual(listedHistory(points), [{ date: "2026-10-01", score: 22 }]);
});
