#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

PROMPT_FILE=".ralph/prompt.md"

echo "🚀 Starting Ralph Loop with Claude Code..."
echo "Working directory: $(pwd)"
echo "Prompt file: $PROMPT_FILE"

while true; do
  echo ""
  echo "🔁 Ralph Loop iteration starting..."
  echo "-------------------------------------------"

  # Run Claude Code in headless mode with the prompt
  claude \
    -p \
    --dangerously-skip-permissions \
    "$(cat "$PROMPT_FILE")"

  # Optional: run CodeRabbit review after each iteration
  echo ""
  echo "🐇 Running CodeRabbit review..."
  coderabbit review --agent || echo "CodeRabbit review failed or found no changes; continuing."

  echo "✅ Iteration complete. Sleeping 2s before next loop..."
  sleep 2
done
