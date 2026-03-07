---
description: Run tests, coverage, lint, and typecheck before committing — auto-detects project language and tools
---

Pre-commit quality gate. Auto-detects the project's language and toolchain, runs all checks, and outputs a go/no-go verdict.

## Step 1 — Detect project

Scan the current working directory for project markers:

| File | Language | Test runner | Linter | Typecheck |
|------|----------|-------------|--------|-----------|
| `package.json` | JS/TS | vitest / jest / mocha (read scripts) | eslint | tsc |
| `setup.py` / `pyproject.toml` | Python | pytest | ruff / flake8 | pyright / mypy |
| `go.mod` | Go | go test | golangci-lint | go vet |
| `Cargo.toml` | Rust | cargo test | cargo clippy | (built-in) |
| `*.csproj` | C# | dotnet test | dotnet format | (built-in) |

If no project marker found, respond: "No project detected in current directory."

## Step 2 — Run checks

Run each check sequentially. For each:
1. Print what you're running
2. Execute the command
3. Capture exit code and summary output

Checks to run (in order):
1. **Tests**: Run the detected test command
2. **Coverage**: Parse coverage output if available (look for % in output)
3. **Lint**: Run the detected linter
4. **Typecheck**: Run the detected type checker

If a tool is not installed, mark as `[SKIP]` and continue.

## Step 3 — Output

```
=== Pre-Commit Check ===
Project: {name} ({language})

[PASS/FAIL] tests: N/M passing
[PASS/WARN/SKIP] coverage: N% (target: 80%)
[PASS/FAIL/SKIP] lint: N errors, M warnings
[PASS/FAIL/SKIP] typecheck: N errors

Verdict: PASS / WARN (N issues) / FAIL (N blockers)
```

## Verdict rules

- **PASS**: all checks pass, coverage >= 80%
- **WARN**: all tests pass but coverage < 80% or lint warnings exist
- **FAIL**: any test failure or typecheck error

Rules:
- Do NOT commit automatically — only report the verdict
- Do NOT fix issues — only report them
- If $ARGUMENTS contains `--staged`, only check staged files where possible (e.g., `eslint --cached`)
