---
description: Audit documentation for stale paths, wrong version numbers, and broken references
---

Scan project documentation for references that don't match the actual codebase.

## Step 1 — Identify project

Input: $ARGUMENTS (optional — path to project root. If empty, use current working directory)

Verify the path exists and contains at least one of: `package.json`, `setup.py`, `go.mod`, `Cargo.toml`, `*.csproj`, or `CLAUDE.md`.
If none found, respond: "No project detected at {path}."

## Step 2 — Collect documentation files

Read all markdown files that serve as documentation:
- `README.md`
- `CLAUDE.md`
- `DEVELOPMENT.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `docs/**/*.md`

## Step 3 — Extract references

From each doc file, extract:
1. **File paths**: any string that looks like a relative path (e.g., `src/components/Foo.tsx`, `scripts/build.sh`)
2. **Version numbers**: patterns like `v1.2.3`, `"version": "1.2.3"`, `@1.2.3`
3. **Command examples**: lines starting with `$`, ` ``` `, or indented code blocks with CLI commands
4. **URLs**: internal links, API endpoints mentioned

## Step 4 — Verify

For each extracted reference:
1. **File paths**: check if the file exists at that path relative to project root
2. **Version numbers**: compare against `package.json` version, `Cargo.toml` version, etc.
3. **Command examples**: verify the referenced scripts/binaries exist
4. **URLs**: skip external URLs, verify internal path references

## Step 5 — Output

```
=== Docs Audit: {project-name} ===

[STALE] README.md:15 — 路徑 "src/renderer/components/JournalScreen.tsx" 不存在
        可能的正確路徑：src/renderer/screens/JournalScreen.tsx
[STALE] CLAUDE.md:8 — 版本 "0.1.0" 但 package.json 是 "0.2.1"
[STALE] DEVELOPMENT.md:42 — 指令 "npm run build" 但 package.json 用 pnpm
[OK]    docs/plans/igdb-design.md — 路徑和版本皆正確

Issues: N stale references
Files checked: N
```

Rules:
- Read-only — do NOT modify any files
- Only report issues with high confidence (file clearly doesn't exist, version clearly mismatched)
- Skip vague references like "the config file" — only check concrete paths
- If $ARGUMENTS contains `--fix`, suggest corrections but still wait for confirmation before editing
