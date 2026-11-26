// The 4AM Commit — writes the winning one-line commit message to entry.txt.
//
// Winning line (from SCREENING.md, candidate 1):
//   reverted my own fix, then re-fixed my own revert. the diff is now just me arguing with me.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const COMMIT_LINE =
  "reverted my own fix, then re-fixed my own revert. the diff is now just me arguing with me.";

// Gate, enforced in code before anything is written:
// /output/entry.txt must be UTF-8, 1-200 chars, one line, not whitespace-only.
function assertGate(line: string): void {
  if (line.length < 1 || line.length > 200) {
    throw new Error(`commit line must be 1-200 chars, got ${line.length}`);
  }
  if (line.trim().length === 0) {
    throw new Error("commit line must not be whitespace-only");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("commit line must be a single line");
  }
  if (line !== line.trim()) {
    throw new Error("commit line must not start or end with whitespace");
  }
  // No control characters: a commit box at 4AM holds printable text only.
  for (const ch of line) {
    if (ch.codePointAt(0)! < 0x20 || ch.codePointAt(0) === 0x7f) {
      throw new Error("commit line must not contain control characters");
    }
  }
  // Must round-trip as UTF-8 with no replacement characters.
  if (Buffer.from(line, "utf8").toString("utf8") !== line) {
    throw new Error("commit line is not valid UTF-8 text");
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
assertGate(COMMIT_LINE);
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, COMMIT_LINE, "utf8");

// Read it back and verify byte-identical: what the judge reads is what we wrote.
const written = readFileSync(outPath, "utf8");
if (written !== COMMIT_LINE) {
  throw new Error("entry.txt read-back mismatch");
}
const bytes = Buffer.from(written, "utf8");
if (bytes.length !== Buffer.byteLength(COMMIT_LINE, "utf8")) {
  throw new Error("entry.txt byte-length mismatch");
}
console.log(`wrote ${outPath} (${COMMIT_LINE.length} chars, ${bytes.length} bytes)`);
