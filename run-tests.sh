#!/usr/bin/env bash
# Run test.html in headless Chrome under several timezones (DST edge cases).
# Usage: ./run-tests.sh [TZ...]   e.g. ./run-tests.sh Asia/Jerusalem
set -euo pipefail
cd "$(dirname "$0")"

CHROME=${CHROME:-$(command -v google-chrome || command -v chromium || command -v chromium-browser)}
ZONES=("$@")
[ ${#ZONES[@]} -eq 0 ] && ZONES=(Asia/Jerusalem Europe/London America/New_York Australia/Sydney UTC)

status=0
for tz in "${ZONES[@]}"; do
  html=$(TZ=$tz "$CHROME" --headless --no-sandbox --disable-gpu --dump-dom \
           "file://$PWD/test.html" 2>/dev/null)
  summary=$(grep -o '\(PASS\|FAIL\): [^<]*' <<<"$html" | head -1)
  echo "$tz: ${summary:-no result (page crashed?)}"
  if [[ $summary != PASS* ]]; then
    status=1
    # Show failing tests (strip tags).
    sed -n '/<pre id="out">/,/<\/pre>/p' <<<"$html" | sed 's/<[^>]*>//g' | grep -A1 '^✗' | sed 's/^/  /'
  fi
done
exit $status
