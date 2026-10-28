# Machine Rental

```
mobile/   React Native (Expo) shell — native Header, Footer, Skeleton
web/      Next.js (TypeScript) — beech ka content, WebView me load hota hai
```

## Run (dev)

Terminal 1 — web (hamesha port **3100**; 3000 dusre Next projects le lete hain):
```bash
cd web && npm run dev
```

### Android emulator (Android Studio) — recommended
Pehli baar (ya `app.json` / native packages badalne pe) native app banao:
```bash
cd mobile && npm run android        # = expo run:android → android/ banata hai, build + install
```
Uske baad roz:
```bash
cd mobile && npm run emulator       # adb reverse (8081 + 3100) + Metro; app localhost se web kholta hai
```
- Android Studio me chalana ho: **Open → `mobile/android`** → emulator chuno → **Run ▶**. Metro (`npm run emulator`) chalu rakho.
- `adb reverse` ki wajah se Mac ka IP / Wi-Fi badle to bhi emulator chalta hai.
- `mobile/android/` generated hai (gitignored) — haath se edit mat karo; `npx expo prebuild --clean` se dobara banta hai.
- Emulator ki GPS location set karni ho: `adb emu geo fix 77.3218 28.5706`

### Expo Go (phone / emulator)
Project Expo SDK 58 hai → Expo Go 58 chahiye (Play Store wala latest hai).
```bash
cd mobile && npx expo start         # phone same Wi-Fi pe, QR scan karo
```
Phone pe web Mac ke LAN IP se khulta hai (Expo apne aap nikalta hai).

Production ke liye `mobile/.env` me:
```
EXPO_PUBLIC_WEB_URL=https://your-web-app.com
```

## Kaise juda hai

- App flow: native splash (location) → `/login` (OTP) → `/onboarding` (naya user) → `/client/home`
- Customer app ke saare pages `web/src/app/client/<route>/` me (routes: `web/src/lib/routes.ts`): home, search, equipment/[id], book/[id], book/[id]/delivery, book/[id]/review, bookings (My bookings), bookings/view, bookings/confirmed, orders, profile (+ edit, id-proof, addresses), notifications
- Chal rahi booking ho to har page pe footer ke upar native tracker bar (Swiggy jaisa) — `mobile/src/components/TrackerBar.tsx`. Data `/api/active-booking` se, har 30s refresh
- Footer tabs: Home, Bookings, Liked, Profile. Liked (`/client/liked`) = ❤️ wali machines (`web/src/lib/saved.ts`, abhi device pe). Inbox (`/client/notifications`) sirf home header me, abhi "Coming soon"
- Profile: account, ID proof (KYC — Aadhaar/PAN/DL/GST, status `lib/kyc.ts`), saved sites, logout
- My bookings: Upcoming / Ongoing / Completed / Cancelled (status tareekh se). Detail me cancel + refund. Demo data `lib/bookingsStore.ts` → `demoBookings` (API aane pe hatao)
- Home → search (`/client/search?q=&category=`) ya card/suggestion → detail (`/client/equipment/[id]`) → Book Now → dates (`/client/book/[id]`) → delivery (`/client/book/[id]/delivery`) → review & pay (`/client/book/[id]/review`) → confirmed (`/client/bookings/confirmed?id=`)
- Browser me `/` pe web splash dikhta hai, phir `/login`
- Footer tab dabao → WebView us route ko load karta hai
- Load hone tak native `Skeleton` dikhta hai
- Web ke andar navigation hone pe `web/src/components/NativeBridge.tsx` native ko
  `{ type: 'route', path, title }` bhejta hai → header title aur active tab sync

## Header / Footer config (bina app update ke)

Header, footer aur theme ka config **`web/src/app-config.ts`** me hai, jo
`/api/app-config` pe serve hota hai. App launch pe aur foreground me aane pe ise fetch
karta hai, phone me cache karta hai, aur fail hone pe cached ya bundled default use karta hai.

Isme se ye sab sirf web deploy karke badal sakte ho:
- footer tabs jodna/hatana/reorder karna (`label`, Ionicons `icon`, `path`)
- app kis page se shuru ho (`startPath`, default `/login`)
- tracker bar on/off aur kin pages pe chhupe (`tracker.visible`, `tracker.hiddenOn`)
- kin pages pe location + logo wala header dikhe (`header.brandOn`, default `/client/home`)
- header actions (jaise notification bell) aur unka `badge`. Page bhi `NativeBadge` se count bhej sakta hai
- header ka title, back button, right side ke action icons
- header/footer ko poora hide karna, ya kuch paths pe hide karna (`hiddenOn`)
- theme colors

Naya page: `web/src/app/<route>/page.tsx` banao, phir `app-config.ts` me tab/action add karo.
Icon names: https://icons.expo.fyi (Ionicons). Naam galat ho to fallback icon dikhta hai.

Naya *type* ka native element (jaise search bar ya badge) chahiye ho to wo native code
hai, uske liye app update lagega.
