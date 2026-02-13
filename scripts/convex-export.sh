#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/convex/_generated"
DEST_DIR="$ROOT_DIR/shared/convex-api"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Missing $SRC_DIR" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"

cp "$SRC_DIR/api.js" "$DEST_DIR/api.js"
cp "$SRC_DIR/api.d.ts" "$DEST_DIR/api.d.ts"
cp "$SRC_DIR/dataModel.d.ts" "$DEST_DIR/dataModel.d.ts"

cat > "$DEST_DIR/.generated" <<GEN
Generated on $(date -u +"%Y-%m-%dT%H:%M:%SZ")
GEN

echo "Exported Convex API to $DEST_DIR"
