#!/usr/bin/env bash
# Bring the simulator to a state the capture and tap scripts can use: device
# booted, Simulator.app showing its window, Expo Go connected to the dev server.
#
# The device shuts itself down periodically in this environment, and a booted
# device with no visible window silently breaks tap automation — a synthetic
# click needs a window to land on. Both are checked, not assumed.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UDID="${TG_SIM_UDID:-79613A33-AE30-4C9B-8F32-6D2037132A32}"
HOST="${TG_DEV_HOST:-127.0.0.1:8081}"

booted() { xcrun simctl list devices booted | grep -q "$UDID"; }
windows() {
  osascript -e 'tell application "System Events" to tell process "Simulator" to get count of windows' 2>/dev/null || echo 0
}

if ! booted; then
  killall Simulator 2>/dev/null || true
  sleep 2
  xcrun simctl boot "$UDID" >/dev/null 2>&1 || true
  for _ in $(seq 1 20); do booted && break; sleep 1; done
fi

if [ "$(windows)" -lt 1 ]; then
  open -a Simulator
  for _ in $(seq 1 20); do [ "$(windows)" -ge 1 ] && break; sleep 1; done
fi

booted || { echo "simulator failed to boot" >&2; exit 1; }
[ "$(windows)" -ge 1 ] || echo "warning: Simulator has no window; taps will not land" >&2

if ! curl -s -m 3 -o /dev/null "http://$HOST/status"; then
  echo "warning: Metro is not responding on $HOST" >&2
  exit 1
fi

# Reconnect Expo Go if the app is not running or lost the server.
xcrun simctl openurl booted "exp://$HOST" >/dev/null 2>&1 || true
sleep "${TG_BOOT_SETTLE:-18}"
echo "simulator ready"
