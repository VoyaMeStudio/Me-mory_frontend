#!/bin/sh
# Run once per clone to enable the commit message template.
# Usage: ./scripts/setup-templates.sh   or   sh scripts/setup-templates.sh
cd "$(dirname "$0")/.." || exit 1
git config core.hooksPath .githooks
echo "✅ Commit template enabled. Use 'git commit' from the terminal (without -m) to see it."
echo ""
echo "📌 PR template: GitHub only loads it from the default branch (e.g. main)."
echo "   Merge this branch into main (or your default branch) once. After that, new PRs will show the template."
