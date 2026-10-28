#!/usr/bin/env bash
# Emulator / USB device ke liye dev: Metro (8081) aur web (3100) adb reverse se — Mac ka IP / Wi-Fi badle to bhi chale.
# Use: npm run emulator   (pehle `cd web && npm run dev` chalu rakho)
set -euo pipefail

WEB_PORT="${EXPO_PUBLIC_WEB_PORT:-3100}"
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
ADB="$(command -v adb || echo "$SDK/platform-tools/adb")"

if [ ! -x "$ADB" ]; then
  echo "adb nahi mila. ANDROID_HOME set karo ya Android SDK platform-tools install karo." >&2
  exit 1
fi
if ! "$ADB" get-state >/dev/null 2>&1; then
  echo "Koi emulator / device connected nahi. Android Studio se emulator chalu karo." >&2
  exit 1
fi

"$ADB" reverse tcp:8081 tcp:8081
"$ADB" reverse "tcp:$WEB_PORT" "tcp:$WEB_PORT"
echo "adb reverse: 8081 (Metro), $WEB_PORT (web) → is Mac"

EXPO_PUBLIC_WEB_URL="http://localhost:$WEB_PORT" exec npx expo start "$@"
