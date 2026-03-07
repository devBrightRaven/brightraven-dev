---
description: Update GitHub repo index in Obsidian vault — scans all repos under a GitHub account and writes a summary
---

Scan all GitHub repos for a given account and update the index file in the vault.

## Step 1 — Read vault config

Read `## Vault Structure` from `~/.claude/CLAUDE.md`.
Extract: `vault`, `language`.
If missing, stop and respond: "Setup not complete. Please run `/hirameki:__init` first."

## Step 2 — Determine account

Input: $ARGUMENTS (optional — GitHub username. Default: `devBrightRaven`)

## Step 3 — Fetch repos

Run:
```bash
gh repo list {username} --json name,description,visibility,pushedAt,primaryLanguage --limit 100
```

If `gh` is not available or not authenticated, respond with the error.

## Step 4 — Generate index

Target file: `{vault}/Project/Repo/{username}-repos.md`

Format:

```markdown
---
tags:
  - github
  - index
  - {username}
status: reference
source: claude-code
updated: YYYY-MM-DD
---

# {username} GitHub Repos

> Last updated: YYYY-MM-DD

## Private

| Repo | 語言 | 說明 | 最近 push |
|------|------|------|-----------|
| [[repo-name]] | language | description | YYYY-MM-DD |

## Public

| Repo | 語言 | 說明 | 最近 push |
|------|------|------|-----------|
| [[repo-name]] | language | description | YYYY-MM-DD |

## 統計

- 總計：N repos（N private / N public）
- 最活躍：top 3 by pushedAt
- 語言分佈：language (count), ...
```

## Step 5 — Write

- If the file already exists, overwrite it entirely (this is an index, not append-only)
- Update the `updated:` field in frontmatter to today's date
- Show the file path and a brief summary of changes (new repos, removed repos) before writing
- Print the full path after writing

Rules:
- Repo names should be wrapped in `[[wiki links]]` for Obsidian
- Sort repos within each section by `pushedAt` descending (most recent first)
- If description is empty, use `—`
- If primaryLanguage is null, use `—`
- Truncate pushedAt to date only (YYYY-MM-DD)
