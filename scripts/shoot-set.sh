#!/usr/bin/env bash
# Capture a named set of routes in one pass.
#
#   scripts/shoot-set.sh p1 type:/dev/kitchen-sink?section=type actions:/dev/kitchen-sink?section=actions
#
# Each argument is "<name>:<route>". Output lands in shots/<prefix>-<name>.png.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PREFIX="${1:?usage: shoot-set.sh <prefix> <name:route>...}"
shift

for spec in "$@"; do
  "$ROOT/scripts/shoot.sh" "$PREFIX-${spec%%:*}" "${spec#*:}" >/dev/null
  echo "$PREFIX-${spec%%:*}"
done
