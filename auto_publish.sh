#!/bin/bash
# ============================================================
# MUKIMUKI trade Blog Auto Publish Script
# ============================================================

# Get directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Set up logging
LOG_FILE="$DIR/auto_publish.log"
echo "=== Deployment started at $(date) ===" >> "$LOG_FILE"

# Make sure brew / nvm node are in PATH
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:$PATH"
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
fi

# Log node & npm version
echo "Node version: $(node -v 2>&1)" >> "$LOG_FILE"
echo "Npm version: $(npm -v 2>&1)" >> "$LOG_FILE"

# Run import, build, and deploy
echo "Running performance import..." >> "$LOG_FILE"
node scripts/import-performance-report.mjs >> "$LOG_FILE" 2>&1

echo "Building site..." >> "$LOG_FILE"
npm run build >> "$LOG_FILE" 2>&1

echo "Deploying to Cloudflare Pages..." >> "$LOG_FILE"
npm run deploy >> "$LOG_FILE" 2>&1

echo "=== Deployment finished at $(date) ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
