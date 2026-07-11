#!/usr/bin/env node

/**
 * ARDESIA full-goal traceability gate.
 *
 * The frozen mandate lives outside the repository. `--write` creates a
 * lossless, line-addressable mirror in the JSONL matrix only after verifying
 * the approved source hashes. Normal mode validates the committed matrix even
 * when the external attachments are unavailable; when they are available it
 * also compares every line to the frozen source.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const tracePath = resolve(repoRoot, "docs/ops/ARDESIA-FULL-TRACEABILITY.jsonl");

const sources = [
  {
    key: "CANON",
    path: process.env.ARDESIA_CANON_SOURCE ?? "/Users/andreamarro/.codex/attachments/3765288a-1527-43c5-a5cb-13de9c2da1e6/pasted-text-1.txt",
    sha256: "4a59deec58d0e1ca23720da3a958a6d30148e71224f4be15ebc18476ea86916b",
  },
  {
    key: "ADDENDUM",
    path: process.env.ARDESIA_ADDENDUM_SOURCE ?? "/Users/andreamarro/.codex/attachments/c1f75ee2-e5ee-467e-b69a-02ca9ddf9742/pasted-text.txt",
    sha256: "17000115531d1bacc62d06025f89a3bea5e1ac0342f364dd00ff8805e0186a50",
  },
];

const isWrite = process.argv.includes("--write");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function splitLosslessly(text) {
  const terminalNewline = text.endsWith("\n");
  const lines = text.split("\n");
  if (terminalNewline) lines.pop();
  return { lines, terminalNewline };
}

function milestoneFor(line, current) {
  const match = line.match(/\b(G0|M[0-9](?:\+)?|M[0-9][A-Z]?|V1_GREEN|PILOT_READY|FULL_GOAL_GREEN)\b/);
  return match?.[1] ?? current;
}

function rowFor(source, rawLine, line, milestone, terminalNewline) {
  const nonblank = rawLine.trim().length > 0;
  return {
    id: `${source.key}:L${line}`,
    source: source.key,
    sourceLine: line,
    rawLine,
    terminalNewline,
    kind: nonblank ? "source-unit" : "blank-context",
    milestone,
    proof: nonblank ? "Evidence required on canonical runtime or human protocol." : "Not applicable.",
    status: nonblank ? "UNKNOWN" : "NOT_APPLICABLE",
  };
}

async function readFrozenSources() {
  const loaded = [];
  for (const source of sources) {
    const content = await readFile(source.path, "utf8");
    const actualHash = sha256(content);
    if (actualHash !== source.sha256) {
      throw new Error(`${source.key} hash mismatch: expected ${source.sha256}, received ${actualHash}`);
    }
    loaded.push({ ...source, content, ...splitLosslessly(content) });
  }
  return loaded;
}

function parseMatrix(content) {
  const lines = content.trimEnd().split("\n");
  if (lines.length === 0 || lines[0] === "") throw new Error("traceability matrix is empty");
  return lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch {
      throw new Error(`matrix row ${index + 1} is not JSON`);
    }
  });
}

function validateRows(rows) {
  // `wc -l` counts newline delimiters. Both frozen inputs intentionally omit
  // the final delimiter, so their lossless logical line counts are one higher.
  const expectedRows = sources.map((source) => ({ source, lineCount: source.key === "CANON" ? 6939 : 174 }));
  const seen = new Set();
  const perSource = new Map(sources.map((source) => [source.key, []]));
  for (const row of rows) {
    if (!sources.some((source) => source.key === row.source)) throw new Error(`unknown matrix source ${String(row.source)}`);
    if (typeof row.id !== "string" || typeof row.sourceLine !== "number" || typeof row.rawLine !== "string") {
      throw new Error(`invalid schema for ${String(row.id)}`);
    }
    const expectedId = `${row.source}:L${row.sourceLine}`;
    if (row.id !== expectedId) throw new Error(`non-canonical id ${row.id}; expected ${expectedId}`);
    if (seen.has(row.id)) throw new Error(`duplicate matrix id ${row.id}`);
    seen.add(row.id);
    perSource.get(row.source).push(row);
  }
  for (const { source, lineCount } of expectedRows) {
    const sourceRows = perSource.get(source.key).sort((a, b) => a.sourceLine - b.sourceLine);
    if (sourceRows.length !== lineCount) throw new Error(`${source.key} has ${sourceRows.length} rows; expected ${lineCount}`);
    for (let index = 0; index < sourceRows.length; index += 1) {
      if (sourceRows[index].sourceLine !== index + 1) throw new Error(`${source.key} misses L${index + 1}`);
    }
    const terminalNewline = sourceRows.at(-1).terminalNewline === true;
    const reconstructed = `${sourceRows.map((row) => row.rawLine).join("\n")}${terminalNewline ? "\n" : ""}`;
    const actualHash = sha256(reconstructed);
    if (actualHash !== source.sha256) throw new Error(`${source.key} committed mirror hash mismatch`);
  }
  return { rows: rows.length, nonblank: rows.filter((row) => row.kind === "source-unit").length };
}

async function externalSourcesAvailable() {
  try {
    await Promise.all(sources.map((source) => access(source.path)));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (isWrite) {
    const loaded = await readFrozenSources();
    const rows = [];
    for (const source of loaded) {
      let milestone = "FULL_GOAL_GREEN";
      for (const [index, rawLine] of source.lines.entries()) {
        milestone = milestoneFor(rawLine, milestone);
        rows.push(rowFor(source, rawLine, index + 1, milestone, index === source.lines.length - 1 && source.terminalNewline));
      }
    }
    await writeFile(tracePath, `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`, "utf8");
    console.log(`traceability: wrote ${rows.length} rows (${rows.filter((row) => row.kind === "source-unit").length} nonblank source units)`);
    return;
  }

  const rows = parseMatrix(await readFile(tracePath, "utf8"));
  const result = validateRows(rows);
  if (await externalSourcesAvailable()) {
    const loaded = await readFrozenSources();
    const bySource = new Map(sources.map((source) => [source.key, rows.filter((row) => row.source === source.key)]));
    for (const source of loaded) {
      const matrixLines = bySource.get(source.key).sort((a, b) => a.sourceLine - b.sourceLine);
      source.lines.forEach((line, index) => {
        if (matrixLines[index].rawLine !== line) throw new Error(`${source.key}:L${index + 1} differs from frozen source`);
      });
    }
    console.log(`traceability: OK ${result.rows} rows, ${result.nonblank} nonblank source units; frozen sources match`);
  } else {
    console.log(`traceability: OK ${result.rows} rows, ${result.nonblank} nonblank source units; frozen attachments unavailable, committed hashes verified`);
  }
}

main().catch((error) => {
  console.error(`traceability: FAIL ${error.message}`);
  process.exitCode = 1;
});
