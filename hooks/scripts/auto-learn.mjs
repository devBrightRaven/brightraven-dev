#!/usr/bin/env node
// auto-learn.mjs — Stop hook: scan session transcript for pitfall patterns.
// Detects: retries, user corrections, error-then-fix, back-and-forth edits.
// Saves findings to ~/.claude/homunculus/pitfalls.jsonl

import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const HOME = process.env.HOME || process.env.USERPROFILE;
const PITFALLS_FILE = join(HOME, '.claude', 'homunculus', 'pitfalls.jsonl');
mkdirSync(join(HOME, '.claude', 'homunculus'), { recursive: true });

// Read hook input from stdin
let input = '';
try {
  input = readFileSync(0, 'utf8');
} catch {
  process.exit(0);
}

if (!input.trim()) process.exit(0);

let hookData;
try {
  hookData = JSON.parse(input);
} catch {
  process.exit(0);
}

const transcriptPath = hookData.transcript_path;
const sessionId = hookData.session_id || 'unknown';

if (!transcriptPath || !existsSync(transcriptPath)) {
  process.exit(0);
}

// Read transcript
let transcript;
try {
  transcript = readFileSync(transcriptPath, 'utf8');
} catch {
  process.exit(0);
}

const lines = transcript.trim().split('\n').filter(Boolean);
const events = [];
for (const line of lines) {
  try {
    events.push(JSON.parse(line));
  } catch {
    // skip non-JSON lines
  }
}

if (events.length < 5) process.exit(0); // too short to analyze

const pitfalls = [];
const now = new Date().toISOString();
const today = now.slice(0, 10);

// --- Pattern 1: Retry 3+ times (same tool on same file) ---
const toolCalls = {};
for (const evt of events) {
  if (evt.type === 'tool_use' || evt.tool_name) {
    const tool = evt.tool_name || evt.type;
    const filePath = evt.tool_input?.file_path || evt.tool_input?.path || '';
    if (filePath) {
      const key = `${tool}:${filePath}`;
      toolCalls[key] = (toolCalls[key] || 0) + 1;
    }
  }
}

for (const [key, count] of Object.entries(toolCalls)) {
  if (count >= 3) {
    const [tool, file] = key.split(':', 2);
    pitfalls.push({
      type: 'retry',
      detail: `${tool} on ${file} — ${count} times`,
      count
    });
  }
}

// --- Pattern 2: User corrections (keyword detection) ---
const correctionKeywords = [
  // English
  /\bno\b.*\bthat'?s\s+wrong/i,
  /\bthat'?s\s+not\s+(right|correct|what\s+i)/i,
  /\bdon'?t\s+do\s+that/i,
  /\bstop\b/i,
  /\brevert/i,
  /\bundo/i,
  /\bwrong\s+(approach|file|path|direction)/i,
  /\bnot\s+what\s+i\s+(asked|meant|wanted)/i,
  /\bwhy\s+(did|are)\s+you/i,
  // Chinese
  /不對/,
  /錯了/,
  /改回來/,
  /不是這個/,
  /為什麼/,  // "why" — often a correction signal
  /不要/,
  /停/,
  /搞錯/,
  /弄錯/,
  /不應該/,
  /怎麼又/,
  /不可以/,
  /不需要/,
];

let correctionCount = 0;
const correctionExamples = [];

for (const evt of events) {
  // User messages
  const text = evt.content || evt.message || '';
  if (typeof text !== 'string') continue;

  // Only check user role messages (not assistant)
  if (evt.role !== 'user' && evt.type !== 'human') continue;

  for (const pattern of correctionKeywords) {
    if (pattern.test(text)) {
      correctionCount++;
      correctionExamples.push(text.slice(0, 100));
      break; // one match per message is enough
    }
  }
}

if (correctionCount > 0) {
  pitfalls.push({
    type: 'user-correction',
    detail: `${correctionCount} correction(s) detected`,
    examples: correctionExamples.slice(0, 5),
    count: correctionCount
  });
}

// --- Pattern 3: Back-and-forth edits (same file edited 3+ times) ---
const editTargets = {};
for (const evt of events) {
  const tool = evt.tool_name || '';
  if (tool === 'Edit' || tool === 'Write') {
    const file = evt.tool_input?.file_path || '';
    if (file) {
      editTargets[file] = (editTargets[file] || 0) + 1;
    }
  }
}

for (const [file, count] of Object.entries(editTargets)) {
  if (count >= 4) {
    pitfalls.push({
      type: 'back-and-forth',
      detail: `${file} edited ${count} times`,
      count
    });
  }
}

// --- Save and report ---
if (pitfalls.length === 0) process.exit(0);

const record = {
  date: today,
  timestamp: now,
  session: sessionId,
  pitfalls
};

appendFileSync(PITFALLS_FILE, JSON.stringify(record) + '\n');

// Report to stderr
process.stderr.write(`[auto-learn] Session pitfalls detected:\n`);
for (const p of pitfalls) {
  process.stderr.write(`  [${p.type}] ${p.detail}\n`);
}
