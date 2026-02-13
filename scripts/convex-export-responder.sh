#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/shared/convex-api"
RESPONDER_DIR="/Users/juliennewman/Documents/slack-responder/shared/convex-api"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Missing $SRC_DIR" >&2
  exit 1
fi

mkdir -p "$RESPONDER_DIR"

cp "$SRC_DIR/api.js" "$RESPONDER_DIR/api.js"
cp "$SRC_DIR/api.d.ts" "$RESPONDER_DIR/api.d.ts"
cp "$SRC_DIR/dataModel.d.ts" "$RESPONDER_DIR/dataModel.d.ts"

cat > "$RESPONDER_DIR/.generated" <<GEN
Generated on $(date -u +"%Y-%m-%dT%H:%M:%SZ")
GEN

echo "Synced Convex API to $RESPONDER_DIR"
