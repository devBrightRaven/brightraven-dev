#!/usr/bin/env node
// PostToolUse hook: detect when skill/command files are modified.
// Tracks changes in a log file. When 3+ skill files have been modified
// since the last stocktake, stderr reminds to run /skill-stocktake.

import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const HOME = process.env.HOME || process.env.USERPROFILE;
const TRACKER_FILE = join(HOME, '.claude', 'homunculus', 'skill-changes.jsonl');
const STOCKTAKE_RESULTS = join(HOME, '.claude', 'skills', 'skill-stocktake', 'results.json');

mkdirSync(join(HOME, '.claude', 'homunculus'), { recursive: true });

// Read hook input from stdin
let input = '';
try {
  input = readFileSync(0, 'utf8');
} catch {
  process.exit(0);
}

if (!input.trim()) process.exit(0);

let data;
try {
  data = JSON.parse(input);
} catch {
  process.exit(0);
}

// Check if the tool modified a skill/command file
const toolInput = data.tool_input || data.input || {};
const filePath = toolInput.file_path || toolInput.path || '';

// Patterns that indicate a skill/command file
const isSkillFile =
  /[/\\]skills[/\\]/.test(filePath) ||
  /[/\\]commands[/\\]/.test(filePath) ||
  /SKILL\.md$/i.test(filePath) ||
  /[/\\]plugins[/\\]marketplaces[/\\]/.test(filePath);

if (!isSkillFile) process.exit(0);

// Log this change
const entry = {
  timestamp: new Date().toISOString(),
  file: filePath,
  tool: data.tool_name || 'unknown'
};
appendFileSync(TRACKER_FILE, JSON.stringify(entry) + '\n');

// Count unique files changed since last stocktake
let lastStocktakeTime = '2000-01-01T00:00:00Z';
if (existsSync(STOCKTAKE_RESULTS)) {
  try {
    const results = JSON.parse(readFileSync(STOCKTAKE_RESULTS, 'utf8'));
    lastStocktakeTime = results.evaluated_at || lastStocktakeTime;
  } catch { /* ignore */ }
}

if (!existsSync(TRACKER_FILE)) process.exit(0);

const lines = readFileSync(TRACKER_FILE, 'utf8').trim().split('\n').filter(Boolean);
const changedFiles = new Set();

for (const line of lines) {
  try {
    const e = JSON.parse(line);
    if (e.timestamp > lastStocktakeTime) {
      changedFiles.add(e.file);
    }
  } catch { /* skip */ }
}

if (changedFiles.size >= 3) {
  process.stderr.write(
    `[skill-tracker] ${changedFiles.size} skill/command 檔案自上次 stocktake 後被修改。考慮跑 /skill-stocktake\n`
  );
}
