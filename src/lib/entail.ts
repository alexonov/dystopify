import { spawn } from "node:child_process";
import path from "node:path";
import type { EntailmentPair } from "./recompute";

export function scoreEntailment(pairs: EntailmentPair[]): Promise<Map<string, number>> {
  if (pairs.length === 0) return Promise.resolve(new Map());

  return new Promise((resolve, reject) => {
    const child = spawn("python3", [path.join(process.cwd(), "scripts", "entail.py")], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => out.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => err.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(err).toString() || `entail.py exited ${code}`));
        return;
      }
      const parsed = JSON.parse(Buffer.concat(out).toString()) as Record<string, number>;
      resolve(new Map(Object.entries(parsed)));
    });
    child.stdin.end(JSON.stringify({ pairs }));
  });
}
