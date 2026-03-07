---
description: Check installed versions of all coding agents (Claude, Copilot, Gemini, Codex) and report updates
---

Scan all installed coding agents and report their version status.

## Step 1 — Detect installed agents

Check for each agent by running its version command:

| Agent | Version command | Update check |
|-------|----------------|--------------|
| Claude Code | `claude --version` | `npm show @anthropic-ai/claude-code version` |
| GitHub Copilot CLI | `copilot --version` | `npm show @githubnext/github-copilot-cli version` |
| Gemini CLI | `gemini --version` | `npm show @anthropic-ai/gemini-cli version` or check GitHub releases |
| Codex CLI | `codex --version` | `npm show @openai/codex version` or check GitHub releases |
| Kiro | `kiro --version` | check GitHub releases |

For agents not found in PATH, mark as `[NOT INSTALLED]`.

## Step 2 — Compare versions

For each installed agent:
1. Get installed version from the version command
2. Get latest version from npm registry or GitHub API
3. Compare: same = OK, different = UPDATE available

If npm/GitHub check fails (offline, rate limited), mark latest as `[UNKNOWN]`.

## Step 3 — Output

```
=== Coding Agent Status ===

Agent          Installed    Latest       Status
claude         2.1.0        2.1.0        [OK]
copilot        1.8.3        1.9.0        [UPDATE]
gemini         0.5.1        0.5.1        [OK]
codex          —            —            [NOT INSTALLED]
kiro           —            —            [NOT INSTALLED]

Summary: N installed, N up to date, N updates available
```

Rules:
- Read-only by default — do NOT update agents automatically
- If $ARGUMENTS contains `--update`, show the update commands but ask for confirmation before running them
- Update commands should respect the platform (npm on all, winget/brew as alternatives)
- Do NOT install agents that aren't already installed
