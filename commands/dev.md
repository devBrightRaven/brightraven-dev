---
description: Use when developing hirameki — change propagation checklist, test reminders, vault sync, session wrap
---

# Hirameki Development Workflow

## Step 0 — Resolve paths

Read `## Vault Structure` from `~/.claude/CLAUDE.md`. Extract: `vault`.
If missing, stop and respond: "Setup not complete. Please run `/hirameki:__init` first."

Detect the hirameki repo root: search for the nearest ancestor of the current working directory that contains `.claude-plugin/plugin.json` with `"name": "hirameki"`, or fall back to the directory where `commands/*.md` and `tests/validate_commands.py` exist.
Let `{repo}` = the detected repo root.
Let `{vault}` = the vault path from CLAUDE.md.

## When to use this skill

Invoke when:
- Working in a hirameki repo clone
- Modifying any `commands/*.md` file
- About to end a hirameki dev session
- Asking "what do I need to update after changing X?"

---

## Change propagation rules

When `commands/*.md` is modified, the following may also need updating — check each:

| Changed | Must update | Optional |
|---------|-------------|----------|
| Any `commands/*.md` | Run `python tests/validate_commands.py` | — |
| Command logic, structure, or sections | All 3 ref docs: `_hirameki_cmds/hirameki-cmds-full.md`, `hirameki-cmds-full-zh-TW.md`, `hirameki-cmds-full-ja.md` | Short versions if user-facing summary changed |
| Command added or removed | README (all 3 language sections) + all 6 ref docs | — |
| After pushing to GitHub | Sync vault: copy `{repo}/_hirameki_cmds/*.md` → `{vault}/_hirameki_cmds/` | — |

Run the check after every modification, before committing:
```bash
cd {repo} && PYTHONUTF8=1 python tests/validate_commands.py
```

---

## Session end checklist

Before closing a hirameki dev session, verify:

- [ ] `python tests/validate_commands.py` → all passed
- [ ] Reference docs updated if command logic changed
- [ ] Vault `_hirameki_cmds/` in sync with repo
- [ ] Committed and pushed

Then suggest: `/hirameki:wrap` to record the session.

---

## Key paths

| Location | Path |
|----------|------|
| Repo | `{repo}/` |
| Commands | `{repo}/commands/` |
| Reference docs (repo) | `{repo}/_hirameki_cmds/` |
| Reference docs (vault) | `{vault}/_hirameki_cmds/` |
| Validation script | `{repo}/tests/validate_commands.py` |
| CI workflow | `{repo}/.github/workflows/validate.yml` |

---

## What stays as a command (do NOT automate)

- `wrap`, `journal` — user-initiated, has side effects, needs confirmation
- `explore`, `decide`, `harvest`, `tidy`, `status`, `catchup` — deliberate, user-driven
- Vault file writes of any kind — always confirm before writing

---

<!-- Quick references (validator compliance) -->
<!-- Vault setup: `~/.claude/CLAUDE.md` → `## Vault Structure` -->
<!-- If not configured: `/hirameki:__init` -->
<!-- Output language follows vault Language setting -->
