#!/usr/bin/env bash

# Exit immediately if cd fails
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Cleanup background processes on Ctrl+C or script exit
cleanup() {
  echo ""
  echo "🛑 Shutting down servers..."
  trap - SIGINT SIGTERM EXIT
  if [ -n "$WEB_PID" ]; then
    kill "$WEB_PID" 2>/dev/null || true
  fi
  # Kill any lingering background jobs
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "========================================"
echo "🚀 1/2: Starting Next.js Web server..."
echo "========================================"
(cd "$DIR/web" && npm run dev) &
WEB_PID=$!

# Wait briefly for Next.js to start
sleep 2

echo ""
echo "========================================"
echo "📱 2/2: Starting Expo Mobile app..."
echo "========================================"
echo "💡 Commands inside Expo:"
echo "   - Scan QR code with Expo Go (Android) or Camera (iOS)"
echo "   - Press 'a' for Android Emulator"
echo "   - Press 'i' for iOS Simulator"
echo "   - Press 'w' for Web Preview"
echo "   - Press 'Ctrl + C' to stop both servers"
echo "========================================"
echo ""

cd "$DIR/mobile" && npx expo start
