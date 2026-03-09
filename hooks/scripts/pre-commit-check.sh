#!/bin/bash
# PreToolUse hook: run tests + typecheck before git commit.
# Auto-detects project type and runs appropriate checks.
# Outputs to stderr (exit 2) to block the commit if checks fail.

set -e

# Read hook input from stdin
INPUT_JSON=$(cat)

# Extract the bash command being run
COMMAND=$(echo "$INPUT_JSON" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    cmd = data.get("tool_input", {}).get("command", "")
    print(cmd)
except:
    print("")
' 2>/dev/null || echo "")

# Only intercept git commit commands
case "$COMMAND" in
  git\ commit*) ;;
  *) exit 0 ;;
esac

# Skip if commit message contains [skip-checks] or [wip]
case "$COMMAND" in
  *\[skip-checks\]*|*\[wip\]*) exit 0 ;;
esac

# Detect project root (walk up from cwd)
CWD=$(echo "$INPUT_JSON" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get("cwd", "."))
except:
    print(".")
' 2>/dev/null || echo ".")

cd "$CWD" 2>/dev/null || exit 0

# Detect project type and run checks
ERRORS=0
RESULTS=""

run_check() {
  local name="$1"
  local cmd="$2"
  if eval "$cmd" > /dev/null 2>&1; then
    RESULTS="${RESULTS}[PASS] ${name}\n"
  else
    RESULTS="${RESULTS}[FAIL] ${name}\n"
    ERRORS=$((ERRORS + 1))
  fi
}

# JavaScript/TypeScript (package.json)
if [ -f "package.json" ]; then
  LANG="JS/TS"

  # Detect package manager
  if [ -f "pnpm-lock.yaml" ]; then
    PM="pnpm"
  elif [ -f "bun.lockb" ] || [ -f "bun.lock" ]; then
    PM="bun"
  elif [ -f "yarn.lock" ]; then
    PM="yarn"
  else
    PM="npm"
  fi

  # Tests
  if grep -q '"test"' package.json 2>/dev/null; then
    run_check "tests" "$PM test -- --run 2>&1"
  elif grep -q '"vitest"' package.json 2>/dev/null; then
    run_check "tests" "npx vitest run 2>&1"
  fi

  # Typecheck
  if grep -q '"typecheck"' package.json 2>/dev/null; then
    run_check "typecheck" "$PM run typecheck 2>&1"
  elif [ -f "tsconfig.json" ] && command -v tsc &>/dev/null; then
    run_check "typecheck" "tsc --noEmit 2>&1"
  fi

  # Lint
  if grep -q '"lint"' package.json 2>/dev/null; then
    run_check "lint" "$PM run lint 2>&1"
  fi

# Python (pyproject.toml / setup.py)
elif [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
  LANG="Python"

  if command -v pytest &>/dev/null; then
    run_check "tests" "pytest --tb=no -q 2>&1"
  fi

  if command -v ruff &>/dev/null; then
    run_check "lint" "ruff check . 2>&1"
  fi

  if command -v pyright &>/dev/null; then
    run_check "typecheck" "pyright 2>&1"
  elif command -v mypy &>/dev/null; then
    run_check "typecheck" "mypy . 2>&1"
  fi

# Go (go.mod)
elif [ -f "go.mod" ]; then
  LANG="Go"

  run_check "tests" "go test ./... 2>&1"
  run_check "vet" "go vet ./... 2>&1"

  if command -v golangci-lint &>/dev/null; then
    run_check "lint" "golangci-lint run 2>&1"
  fi

# No project detected
else
  exit 0
fi

# Report results
if [ $ERRORS -gt 0 ]; then
  echo "{\"decision\": \"block\", \"reason\": \"Pre-commit checks failed ($ERRORS blockers):\\n${RESULTS}\"}" >&2
  exit 2
fi

# All passed — allow commit
exit 0
