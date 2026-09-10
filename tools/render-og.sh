#!/usr/bin/env bash
# Renders images/og.html into the three social cards used by the og:image tags.
# Requires chromium (or google-chrome) and ImageMagick. Run from the repo root:
#
#   bash tools/render-og.sh
#
# images/og.html is the source of truth. The PNGs are generated; never hand-edit
# them, and never hand-edit a card's copy without changing the HTML too.
set -euo pipefail

CHROME="${CHROME:-chromium}"
cd "$(dirname "$0")/.."

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

"$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,1890 \
  --virtual-time-budget=8000 \
  --screenshot="$tmp/all.png" "file://$PWD/images/og.html" >/dev/null 2>&1

# three stacked 1200x630 cards, in the order they appear in og.html
magick "$tmp/all.png" -crop 1200x630+0+0     +repage images/og.png
magick "$tmp/all.png" -crop 1200x630+0+630   +repage images/og-transformer.png
magick "$tmp/all.png" -crop 1200x630+0+1260  +repage images/og-resume-screener.png

magick identify -format '%f %wx%h %[size]\n' images/og.png images/og-transformer.png images/og-resume-screener.png
