#!/usr/bin/env bash
# Tap the booted Simulator at a point in device points. See sim_input.py.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec python3 "$ROOT/scripts/sim_input.py" tap "$@"
