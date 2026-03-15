# brightraven-dev

A personal development workflow plugin for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), built for the Bright Raven ecosystem. Provides session-aware quality gates, documentation hygiene tools, multi-agent version tracking, and automated pitfall detection.

**Version:** 1.1.1
**Author:** devBrightRaven / Bright Raven
**Repository:** https://github.com/devBrightRaven/brightraven-dev

---

## Overview

brightraven-dev is a Claude Code plugin that embeds development best practices directly into the AI-assisted coding workflow. Rather than relying on memory or discipline, it automates pre-commit checks, tracks skill file modifications, and learns from session pitfalls -- turning the coding agent into a workflow-aware assistant.

The plugin is organized into two layers:

- **Commands** -- slash commands invoked on demand for specific tasks (quality checks, documentation audits, vault syncing, security analysis).
- **Hooks** -- background scripts that run automatically on tool use and session events (pre-commit gating, skill change tracking, pitfall detection).

---

## Features

- Auto-detect project language and run tests, lint, and typecheck before commits
- Track coding agent versions across Claude Code, Copilot CLI, Gemini CLI, Codex CLI, and Kiro
- Audit documentation for stale paths, wrong versions, and broken references
- One-way sync project docs to an Obsidian vault with frontmatter injection
- Generate a GitHub repo index as an Obsidian-compatible markdown file
- Validate deny-list coverage by simulating dangerous commands against `settings.json` patterns
- Detect session pitfalls (retries, user corrections, back-and-forth edits) and log them for review
- Monitor skill/command file changes and remind when a stocktake is due

---

## Commands

All commands are invoked as `/brightraven-dev:<command>` within a Claude Code session.

### `/brightraven-dev:pre-commit-check`

Pre-commit quality gate. Auto-detects the project's language and toolchain, runs all checks, and outputs a go/no-go verdict.

- **Supported languages:** JS/TS (vitest/jest/mocha, eslint, tsc), Python (pytest, ruff/flake8, pyright/mypy), Go (go test, golangci-lint, go vet), Rust (cargo test, cargo clippy), C# (dotnet test, dotnet format)
- **Verdict:** PASS / WARN (coverage < 80% or lint warnings) / FAIL (test failure or typecheck error)
- **Flags:** `--staged` to check only staged files where possible
- Read-only -- reports the verdict but does not commit or fix issues automatically.

### `/brightraven-dev:agents-check`

Scans all installed coding agents and reports their version status.

- **Agents checked:** Claude Code, GitHub Copilot CLI, Gemini CLI, Codex CLI, Kiro
- Compares installed version against latest from npm registry or GitHub releases.
- **Flags:** `--update` shows update commands and asks for confirmation before running them.
- Read-only by default -- does not update or install agents automatically.

### `/brightraven-dev:docs-audit`

Audits project documentation for references that do not match the actual codebase.

- Scans `README.md`, `CLAUDE.md`, `DEVELOPMENT.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, and `docs/**/*.md`.
- Checks file paths, version numbers, command examples, and internal URL references.
- **Flags:** `--fix` suggests corrections but waits for confirmation before editing.
- Read-only by default.

### `/brightraven-dev:project-sync`

One-way sync of project documentation to an Obsidian vault.

- **Direction:** project to vault only. Never writes back to the project.
- Scans `docs/`, `openspec/`, `CLAUDE.md`, `README.md`, `DEVELOPMENT.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `AGENTS.md`.
- Adds YAML frontmatter (tags, status, source, synced_from, synced_at) to files that lack it.
- Maps code repo paths to vault target directories based on configurable path patterns.
- **Usage:** `/brightraven-dev:project-sync {project-path}`

### `/brightraven-dev:repo-index`

Generates a GitHub repository index as an Obsidian-compatible markdown file.

- Uses `gh repo list` to fetch all repos for a given GitHub account.
- Groups repos by visibility (private/public), sorted by last push date.
- Outputs with wiki-link formatting for Obsidian cross-referencing.
- Includes stats: total repos, most active, language distribution.
- **Usage:** `/brightraven-dev:repo-index [github-username]` (defaults to `devBrightRaven`)

### `/brightraven-dev:security-check`

Validates deny-list coverage in `~/.claude/settings.json` by simulating dangerous commands.

- Tests predefined dangerous commands (destructive file ops, git force-push, remote code execution, privilege escalation, etc.) against configured deny patterns.
- Uses the same glob-to-regex logic as `deny-check.mjs`.
- Reports gaps and suggests new deny patterns to add.
- **Flags:** Pass a specific command string as an argument to test it in addition to the predefined list.
- Read-only -- does not modify `settings.json` without confirmation.

### `/brightraven-dev:dev`

Development workflow assistant for the hirameki plugin. Provides change propagation checklists, test reminders, vault sync guidance, and session wrap procedures when working in a hirameki repo.

- Detects the hirameki repo root automatically.
- Tracks which files need updating when `commands/*.md` files change.
- Includes a session-end checklist for validation, reference doc sync, and commit verification.

---

## Hooks

Hooks run automatically during Claude Code sessions. They are defined in `hooks/hooks.json`.

### PreToolUse: Pre-Commit Check

- **Trigger:** Any `Bash` tool invocation that runs a `git commit` command.
- **Behavior:** Auto-detects the project type (JS/TS, Python, Go) and runs tests, typecheck, and lint. If any check fails, the commit is blocked (exit code 2).
- **Bypass:** Include `[skip-checks]` or `[wip]` in the commit message to skip.
- **Script:** `hooks/scripts/pre-commit-check.sh`

### PostToolUse: Skill Change Tracker

- **Trigger:** Any `Write` or `Edit` tool invocation that modifies a file under `skills/`, `commands/`, or `plugins/marketplaces/`, or a file named `SKILL.md`.
- **Behavior:** Logs the change to `~/.claude/homunculus/skill-changes.jsonl`. When 3 or more skill files have been modified since the last stocktake, outputs a reminder to stderr.
- **Script:** `hooks/scripts/track-skill-changes.mjs`

### Stop: Auto-Learn

- **Trigger:** Session end.
- **Behavior:** Scans the session transcript for pitfall patterns:
  - **Retries** -- same tool called on the same file 3+ times.
  - **User corrections** -- keywords like "that's wrong", "revert", "undo", "stop" (English and Chinese).
  - **Back-and-forth edits** -- same file edited 4+ times.
- Saves detected pitfalls to `~/.claude/homunculus/pitfalls.jsonl` for later review.
- **Script:** `hooks/scripts/auto-learn.mjs`

---

## Installation

This plugin is distributed via the Claude Code plugin marketplace.

1. Ensure [Claude Code](https://docs.anthropic.com/en/docs/claude-code) is installed and configured.
2. Install the plugin:
   ```
   claude plugin add brightraven-dev
   ```
   Or clone manually into your plugins directory:
   ```bash
   git clone https://github.com/devBrightRaven/brightraven-dev.git \
     ~/.claude/plugins/marketplaces/brightraven-dev
   ```

### Prerequisites

- **Node.js** (for hook scripts: `auto-learn.mjs`, `track-skill-changes.mjs`)
- **Python 3** (used by `pre-commit-check.sh` for JSON parsing)
- **gh CLI** (required by `repo-index` -- must be installed and authenticated)
- **Obsidian vault** configured in `~/.claude/CLAUDE.md` under `## Vault Structure` (required by `project-sync` and `repo-index`)

---

## Usage

Commands are invoked from within a Claude Code session:

```
/brightraven-dev:pre-commit-check
/brightraven-dev:agents-check
/brightraven-dev:agents-check --update
/brightraven-dev:docs-audit
/brightraven-dev:docs-audit --fix
/brightraven-dev:project-sync C:/Code/bright-raven/codex/apps/005_maida
/brightraven-dev:repo-index
/brightraven-dev:repo-index devBrightRaven
/brightraven-dev:security-check
/brightraven-dev:dev
```

Hooks run automatically and require no manual invocation. Pitfall logs and skill change logs are stored in `~/.claude/homunculus/`.

---

## Current Limitations

1. **Personal workflow tool.** Commands are tailored to devBrightRaven's specific project structure and Obsidian vault layout. Path mapping in `project-sync` and vault references assume a particular directory hierarchy.
2. **pre-commit-check auto-detects project language** but may not support all frameworks or test runners. Edge cases in monorepos with multiple project markers are not handled.
3. **project-sync is one-way** (code repo to vault). There is no reverse sync mechanism from vault back to the project.
4. **repo-index depends on `gh` CLI** being installed and authenticated. If `gh` is unavailable or the token is expired, the command will fail.
5. **agents-check depends on specific CLI tools** being installed (`claude`, `copilot`, `gemini`, `codex`, `kiro`). Missing agents are reported as `[NOT INSTALLED]` but the update check requires npm registry access.
6. **Hooks run on every session and tool use.** There is no per-project opt-out mechanism -- the pre-commit hook intercepts all `git commit` commands in all projects.
7. **No tests included** in the plugin. Hook scripts and commands are validated manually.

---

## License

MIT
