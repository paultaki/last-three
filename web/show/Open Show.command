#!/bin/bash
set -e
cd "$(dirname "$0")"
URL='http://127.0.0.1:8843/last-three/show/?cast=city&tape=20261009-0025&edit=story&i=82'
if ! curl -fsS 'http://127.0.0.1:8843/last-three/show/index.html' >/dev/null 2>&1; then
  nohup node tools/serve.mjs > "${TMPDIR:-/tmp}/last-three-show-server.log" 2>&1 &
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    if curl -fsS 'http://127.0.0.1:8843/last-three/show/index.html' >/dev/null 2>&1; then break; fi
    sleep 0.3
  done
fi
open "$URL"
