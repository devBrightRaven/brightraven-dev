---
description: Compare project docs against vault copies — find missing, outdated, or drifted documentation
---

Compare a project's documentation files against their vault copies to detect drift.

## Step 1 — Read vault config

Read `## Vault Structure` from `~/.claude/CLAUDE.md`.
Extract: `vault`, `analysis`, `language`.
If missing, stop and respond: "Setup not complete. Please run `/hirameki:__init` first."

## Step 2 — Identify project

Input: $ARGUMENTS (required — path to project root, e.g., `C:/Code/bright-raven-codex`)

If $ARGUMENTS is empty, respond: "Usage: /brightraven-dev:project-sync {project-path}"

Scan the project for documentation files:
- `docs/**/*.md`
- `README.md`
- `CLAUDE.md`
- `DEVELOPMENT.md`
- `CHANGELOG.md`
- `docs/plans/*.md`
- `docs/openspec/*.yaml`

## Step 3 — Find vault copies

For each project doc, search the vault for matching files:
1. Check `{vault}/{analysis}/` for files with matching names
2. Check `{vault}/_inbox/` for files with matching names
3. Check `{vault}/Project/` or `{vault}/Notes/` for related content

Match by: exact filename, or filename slug similarity > 80%.

## Step 4 — Compare

For each pair (project file vs vault copy):
- **NEW**: exists in project but not in vault
- **UPDATE**: exists in both, but project file has newer modification time
- **OK**: exists in both, content appears in sync (same size ± 10%)
- **VAULT-ONLY**: exists in vault but not in project (may be vault-specific analysis)

For files with no vault match, mark as NEW.

## Step 5 — Output

```
=== Project Sync: {project-name} ===

[NEW]    docs/plans/2026-03-05-igdb-design.md — 未匯入 vault
[UPDATE] README.md — project 版本比 vault 新 (project: 2026-03-07, vault: 2026-03-03)
[OK]     CLAUDE.md — 已同步
[SKIP]   node_modules/, dist/, .git/ — 排除

Plan: N new, N update, N ok, N skipped
```

Rules:
- Read-only — do NOT copy or modify any files
- Exclude: `node_modules/`, `dist/`, `.git/`, `*.lock`, binary files
- After showing the report, ask if the user wants to import NEW files to vault
- If confirmed, copy files to `{vault}/{analysis}/{project-name}/` with YAML frontmatter added
