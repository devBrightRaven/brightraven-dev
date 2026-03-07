---
description: Aggregate next actions from daily notes and journal open items into a prioritized, deduplicated list
---

Scan recent daily notes and journal entries to produce a single prioritized action list.

## Step 1 — Read vault config

Read `## Vault Structure` from `~/.claude/CLAUDE.md`.
Extract: `vault`, `daily-notes`, `logs`, `language`.
If missing, stop and respond: "Setup not complete. Please run `/hirameki:__init` first."

## Step 2 — Collect sources

1. **Daily notes**: Read `{vault}/{daily-notes}/YYYY-MM-DD.md` for today and the past 2 days (3 files max). From each Wrap block, extract all items under「下一步」/「Next」.
2. **Journal logs**: Read all `{vault}/{logs}/YYYY-MM-DD-*.md` files from today and yesterday. From each file, extract all items under「Open items」that are NOT marked with "✓ Done".

If no files exist, respond: "No recent notes found."

## Step 3 — Deduplicate and rank

1. Normalize items: trim whitespace, remove leading `- `.
2. Group items that refer to the same task (fuzzy match — same project name + similar action). Keep the most detailed wording.
3. Count how many times each unique item appears across all sources.
4. Sort by: occurrence count (descending), then most recent appearance (descending).

## Step 4 — Output

Print the action list in the vault's configured language. Format:

```
=== What Next ===

1. [×N] item description
   └ 來源：MM-DD wrap, MM-DD wrap, MM-DD journal
2. [×N] item description
   └ 來源：...
3. item description (single occurrence — no count)
   └ 來源：...

---
掃描範圍：N 個 daily notes, M 個 journal entries
```

Rules:
- Items appearing 3+ times: prepend ⚠ to signal potential procrastination
- Do NOT modify any source files — this is read-only
- Do NOT ask for input — run immediately and output the list
- Keep output concise — no explanations, just the list
