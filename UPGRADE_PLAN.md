# Workout Log — Upgrade Plan: Multi-User + Android App

> **Status**: Planning only. Not implementing now (single user).
> **Last updated**: 2026-03-30

## Current Architecture

```
Browser (localStorage) ──PUT/GET──▸ Cloudflare Worker ──▸ JSONBin.io
                                     (validates PIN)      (single JSON bin)
```

- One bin, one user, one blob — entire `state` object read/written as a whole
- PIN sent as `Authorization: Bearer {pin}`, Worker checks against `AUTH_PIN` secret
- Sync: "last write wins", no conflict resolution, no versioning
- `cloudLoad()` on page open overwrites local; `cloudSave()` debounced 3s on every edit

## Phase 1: PWA (Progressive Web App)

Make the app installable on Android without any store. Same codebase, zero rewrite.

**What to add:**
- `manifest.json` (~15 lines) — app name, icon, theme color, `"display": "standalone"`
- `sw.js` (Service Worker, ~30 lines) — caches the HTML file for offline use
- `<link rel="manifest">` in index.html

**Result:** User visits URL on Android → Chrome shows "Add to Home Screen" → opens fullscreen like a native app. Works offline.

## Phase 2: Auth (PIN → email/password + JWT)

Replace PIN with proper credentials. Keep everything in Cloudflare ecosystem.

**Worker changes:**
- New endpoints: `POST /register`, `POST /login`
- Hash password with bcrypt, store user record in Cloudflare KV
- On login, return a signed JWT token (contains `userId`, expires in ~30 days)
- All data requests use `Authorization: Bearer {jwt}` instead of PIN
- Worker validates JWT signature on every request

**Frontend changes:**
- Login screen (simple HTML form) before main UI
- Store JWT in localStorage
- Send JWT with all sync requests

## Phase 3: Storage (JSONBin → Cloudflare KV)

Drop-in replacement. Keeps the "one blob per user" pattern.

**Worker changes:**
- Replace JSONBin API calls with Cloudflare KV reads/writes
- Key: `user:{userId}` → Value: entire state JSON
- Remove `JSONBIN_KEY` and `JSONBIN_BIN` secrets

**Free tier limits (more than enough):**
- 100k reads/day
- 1k writes/day

**Future option — Cloudflare D1 (SQLite):**
- Tables: `users`, `exercises`, `days`, `meals`, `activities`
- Partial reads/writes (fetch only the displayed week)
- Better for large datasets over years
- More migration work, needs Worker API redesign

## Phase 4: Conflict Handling

Current "last write wins" risks data loss with simultaneous multi-device editing.

**Timestamp check (recommended first step):**
- Save `lastModified` timestamp with each write
- Before writing, check if server timestamp is newer than what was loaded
- If newer: reload first, then merge/warn user
- Covers 90% of real-world conflicts

**Future — merge by day:**
- Each day gets its own timestamp
- Only overwrite days that actually changed
- More granular, less data loss risk

## Why PWA Over Native App

- App is already a single HTML file optimized for mobile
- PWA = same codebase, no rewrite, no app store, no build pipeline
- Android treats installed PWAs like native apps (home screen icon, splash screen, no browser chrome)
- Only go native (React Native/Capacitor) if needing push notifications, watch integration, or health app sync

## Migration Notes

- Each phase is independent and incremental
- Frontend (index.html) barely changes — most work is in the Cloudflare Worker
- Phase 1 is ~30 minutes, Phases 2-3 are a few hours total
- No need to change data structure — KV stores the same JSON blob as JSONBin
