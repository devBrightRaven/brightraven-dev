---
description: Find tasks that keep appearing in "Next" without completion — help decide to act, split, or drop them
---

Scan daily notes over a date range to find recurring unfinished tasks.

## Step 1 — Read vault config

Read `## Vault Structure` from `~/.claude/CLAUDE.md`.
Extract: `vault`, `daily-notes`, `logs`, `language`.
If missing, stop and respond: "Setup not complete. Please run `/hirameki:__init` first."

## Step 2 — Collect data

Input: $ARGUMENTS (optional — number of days to look back, default 7)

1. **Daily notes**: Read `{vault}/{daily-notes}/YYYY-MM-DD.md` for the past N days. From each Wrap block, extract:
   - All items under「下一步」/「Next」
   - All items under「完成」/「Done」
2. **Journal logs**: Read all `{vault}/{logs}/YYYY-MM-DD-*.md` for the same date range. Extract items under「Open items」.

## Step 3 — Identify recurring items

1. Normalize items: trim whitespace, remove leading `- `, `[ ]`, `[x]`.
2. Group items that refer to the same task (fuzzy match — same project name + similar action verb + similar target).
3. For each unique task:
   - Count appearances in「下一步」sections
   - Check if it ever appeared in「完成」sections
   - Check if it was marked "✓ Done" in journal open items
4. Filter: keep only items appearing in「下一步」2+ times AND never appearing in「完成」.

## Step 4 — Categorize

For each recurring item, assign a category:
- **blocked**: item mentions a dependency, external person, or "待..." / "pending"
- **deferred**: item appeared then disappeared then reappeared (skipped some days)
- **forgotten**: item appeared in early days but not in recent days
- **persistent**: item appears continuously including the most recent note

## Step 5 — Output

Print in the vault's configured language:

```
=== 重複未完成任務 (過去 N 天) ===

persistent:
  1. [×N] task description
     └ 首次：MM-DD → 最近：MM-DD
     └ 建議：拆分成更小的任務？有 blocker？

blocked:
  2. [×N] task description
     └ 首次：MM-DD → 最近：MM-DD
     └ 阻擋：[inferred blocker]

deferred:
  3. [×N] task description
     └ 出現：MM-DD, MM-DD（跳過 MM-DD ~ MM-DD）

forgotten:
  (none or listed items)

---
掃描範圍：N 個 daily notes, M 個 journal entries
總計：X 個重複任務
```

Rules:
- Read-only — do NOT modify any files
- Do NOT ask for input — run immediately
- If no recurring tasks found, respond: "過去 N 天沒有重複未完成的任務。"
