#!/usr/bin/env bash
# Remove macOS AppleDouble sidecars (`._*`) from the source tree.
#
# This project lives on an exFAT volume, where macOS stores extended attributes
# in `._<name>` sidecars. Metro's resolver blocks them (metro.config.js), but
# they still clutter the tree and confuse other tooling.
#
# Deliberately does NOT touch files at the repo root: running `xattr` over
# metro.config.js rewrites its mtime, and Metro then reports a config change and
# asks to be restarted on every run.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
find "$ROOT/src" "$ROOT/scripts" "$ROOT/assets" -name '._*' -delete 2>/dev/null || true
