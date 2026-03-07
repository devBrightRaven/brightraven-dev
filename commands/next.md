---
description: Orient after resuming a session — summarise what was done, what's open, and what to do next
---

Scan the current session and produce a concise orientation summary.

## Scan sources

- Task list (all tasks and their status)
- Session activity: files created or modified, decisions made, commits pushed
- Any open items, blockers, or unresolved questions raised during the session

## Output format

Respond in the language the user wrote in (default: 繁體中文).

### 做了什麼 / Done
Bullet list of what was accomplished this session. Max 5 items. Be specific — name files, features, or decisions, not vague summaries.

### 還開著的 / Open
Bullet list of things that are in-progress, blocked, or explicitly deferred. If nothing, write "無".

### 下一步 / Next
2–4 concrete, actionable options ranked by naturalness:
- Continue the most obvious incomplete thread
- A smaller side task that could be done quickly
- If both main tracks are done: suggest ending the session

### 該結束了嗎 / Wrap up?
One sentence: either "還有明確的下一步，繼續吧。" or "這個 session 已到自然結束點。建議執行 `/hirameki:wrap`。"

## Rules

- Do not ask clarifying questions — infer everything from session context
- Keep each section tight: no padding, no filler
- If the task list is empty and session activity is minimal, say so directly and suggest wrapping
