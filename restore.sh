#!/bin/sh
set -eu
cd "$(dirname "$0")"
if [ ! -f pack/x00 ]; then
  echo "missing pack/x00" >&2
  exit 1
fi
cat pack/x?? | base64 -d | tar -xz --strip-components=1
echo "ok. next:"
echo "  export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1"
echo "  npm install"
echo "  npm run dev"
