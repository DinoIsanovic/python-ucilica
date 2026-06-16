#!/bin/bash
# Skript za popravljanje Electron instalacije
set -e

echo "🔧 Popravljam Electron instalaciju..."

# 1. Obriši pokvareni Electron
rm -rf node_modules/electron

# 2. Postavi mirror za brže preuzimanje (GitHub je spor u nekim regijama)
export ELECTRON_MIRROR="https://github.com/electron/electron/releases/download/"

# 3. Postavi timeout i retry
export npm_config_fetch_timeout=120000
export npm_config_fetch_retry_maxtimeout=120000
export npm_config_fetch_retries=5

# 4. Reinstaliraj samo Electron
npm install electron --save-dev

echo "✅ Electron instaliran!"
echo ""
echo "Sada možeš pokrenuti:"
echo "  npm start    ← za test"
echo "  npm run make ← za build"
