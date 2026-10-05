#!/usr/bin/env sh
# Copy the canonical library files into the WordPress plugin and build a zip.
# Usage: sh scripts/sync-wordpress.sh [--check]
#   --check  fail (exit 1) if the plugin copies differ from the sources (used in CI)
# Author: Pradip Subedi (@sprasapradip) - https://github.com/sprasapradip/unicode-nepali
set -eu
ROOT=$(cd "$(dirname "$0")/.." && pwd)
P="$ROOT/wordpress/nepali-unicode-converter"
PAIRS="src/nepali-converter.js:assets/nepali-converter.js
embed/nepali-converter-element.js:assets/nepali-converter-element.js
php/src/NepaliConverter.php:includes/NepaliConverter.php"

status=0
for pair in $PAIRS; do
  src="$ROOT/${pair%%:*}"; dst="$P/${pair#*:}"
  if [ "${1:-}" = "--check" ]; then
    cmp -s "$src" "$dst" || { echo "out of date: ${pair#*:} (run scripts/sync-wordpress.sh)"; status=1; }
  else
    cp "$src" "$dst"
  fi
done
[ "${1:-}" = "--check" ] && exit $status

mkdir -p "$ROOT/dist"
rm -f "$ROOT/dist/nepali-unicode-converter.zip"
(cd "$ROOT/wordpress" && zip -qr "$ROOT/dist/nepali-unicode-converter.zip" nepali-unicode-converter)
echo "built dist/nepali-unicode-converter.zip"
