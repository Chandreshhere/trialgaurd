#!/usr/bin/env bash
# Turn an app route into a URL the booted simulator can open.
#
#   scripts/link.sh /dev/kitchen-sink?section=type
#
# Expo Go does not own the `trialguard://` scheme — links have to be tunnelled
# through the dev server as exp://HOST/--/<route>. A dev-client or release build
# does own the scheme, so set TG_LINK_MODE=scheme once we move off Expo Go.
set -euo pipefail
ROUTE="${1:?usage: link.sh <route>}"
ROUTE="/${ROUTE#/}"
HOST="${TG_DEV_HOST:-127.0.0.1:8081}"

case "${TG_LINK_MODE:-expo-go}" in
  scheme) printf 'trialguard://%s\n' "${ROUTE#/}" ;;
  *)      printf 'exp://%s/--%s\n' "$HOST" "$ROUTE" ;;
esac
