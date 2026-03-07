---
description: Merge wrap blocks from parallel sessions into a unified, deduplicated summary
---

Merge multiple Wrap blocks from today's daily note into a single unified summary.

## Step 1 — Read vault config

Read `## Vault Structure` from `~/.claude/CLAUDE.md`.
Extract: `vault`, `daily-notes`, `language`.
If missing, stop and respond: "Setup not complete. Please run `/hirameki:__init` first."

## Step 2 — Read today's daily note

Read `{vault}/{daily-notes}/YYYY-MM-DD.md` for today.
If no file exists, respond: "No daily note found for today."

Parse all Wrap blocks. For each block, extract:
- Timestamp
- 「完成」/「Done」items
- 「進行中」/「In progress」items
- 「下一步」/「Next」items

## Step 3 — Merge

1. **完成**: Union of all items across all Wrap blocks. Deduplicate items that describe the same action (fuzzy match). Keep the most detailed wording. Preserve chronological order.
2. **進行中**: Union. If an item appears in「進行中」in an earlier wrap and「完成」in a later wrap, keep it only in「完成」.
3. **下一步**: Union. Deduplicate. If an item appears in「下一步」in an earlier wrap and「完成」in a later wrap, remove it from「下一步」.

## Step 4 — Output

Print the merged summary:

```
=== 合併摘要：YYYY-MM-DD ===
來源：N 個 Wrap blocks ([HH:MM], [HH:MM], ...)

### 完成 (N items)
- item
- item

### 進行中
- item (or "None")

### 下一步 (N items)
- item
- item

---
重複項已移除：N 個
已完成的「下一步」已移除：N 個
```

Rules:
- Read-only — do NOT modify the daily note
- Show the merged result and ask if the user wants to append it as a new Wrap block
- If user confirms, append as a new `## Wrap [HH:MM] (merged)` block
