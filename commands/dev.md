---
description: Use when developing hirameki (C:/Code/hirameki) — change propagation checklist, test reminders, vault sync, session wrap
---

# Hirameki Development Workflow

## When to use this skill

Invoke when:
- Working in `C:/Code/hirameki`
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
| After pushing to GitHub | Sync vault: copy `C:/Code/hirameki/_hirameki_cmds/*.md` → `D:/Obsidian/br-os-vault/_hirameki_cmds/` | — |

Run the check after every modification, before committing:
```bash
cd C:/Code/hirameki && PYTHONUTF8=1 python tests/validate_commands.py
```

---

## Session end checklist

Before closing a hirameki dev session, verify:

- [ ] `python tests/validate_commands.py` → all passed
- [ ] Reference docs updated if command logic changed
- [ ] Vault `_hirameki_cmds/` in sync with repo
- [ ] Committed and pushed to `devBrightRaven/hirameki`

Then suggest: `/hirameki:wrap` to record the session.

---

## Key paths

| Location | Path |
|----------|------|
| Repo | `C:/Code/hirameki/` |
| Commands | `C:/Code/hirameki/commands/` |
| Reference docs (repo) | `C:/Code/hirameki/_hirameki_cmds/` |
| Reference docs (vault) | `D:/Obsidian/br-os-vault/_hirameki_cmds/` |
| Validation script | `C:/Code/hirameki/tests/validate_commands.py` |
| CI workflow | `C:/Code/hirameki/.github/workflows/validate.yml` |

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
