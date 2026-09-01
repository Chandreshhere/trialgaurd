#!/usr/bin/env bash
# Capture the booted iOS Simulator to shots/<name>.png
#
#   scripts/shoot.sh shield-dashboard
#   scripts/shoot.sh review-low-conf /add/review?fixture=low
#
# Passing a route navigates there first and waits for the transition to settle,
# so a phase's whole screen set can be captured unattended.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAME="${1:?usage: shoot.sh <name> [route]}"
ROUTE="${2:-}"
SETTLE="${TG_SETTLE:-2.2}"

mkdir -p "$ROOT/shots"

if [ -n "$ROUTE" ]; then
  xcrun simctl openurl booted "$("$ROOT/scripts/link.sh" "$ROUTE")" >/dev/null
  sleep "$SETTLE"
fi

xcrun simctl io booted screenshot --type=png "$ROOT/shots/$NAME.png" >/dev/null
echo "$ROOT/shots/$NAME.png"
