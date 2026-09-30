# Workout Log

Single-file calisthenics & nutrition tracker based on [Hybrid Calisthenics](https://www.hybridcalisthenics.com/programs).

**Live app:** https://milankotus.github.io/workoutlog/

## Features

- Weekly exercise tracking with sets/reps, history comparison (-2, -1 sessions)
- Exercise changes propagate to all future weeks (same day, same slot)
- Skip exercises (today, future, or retroactively in the past)
- Exercise mastery system (goal reps, streak tracking — skips don't break streaks)
- Exercise archiving (hide from dropdowns, preserve history)
- Body measurements (weight, waist)
- Meal logging with calorie + protein tracking, autocomplete, and daily goals
- Manage saved meals (hide unwanted items from suggestions)
- Activities: built-in types (running, walking, rucking, bicycling) + custom user-defined types
- Custom activities support configurable fields (km, min, kg, elevation)
- Combined chart (weight, waist, calories, protein) with time range selector
- Export/import JSON backups, CSV export
- Cloud sync across devices (Cloudflare Worker + Cloudflare KV)
- Mobile responsive layout

## Cloud Sync

Data syncs across devices via a **Cloudflare Worker** that stores the app state directly in **Cloudflare KV** (migrated off JSONBin.io on 2026-05-26).

- **Worker:** `workout-sync` (https://workout-sync.milan-kotus.workers.dev), source in [`worker/`](worker/)
- **Storage:** KV namespace bound as `WORKOUT_KV`, single key `state`
- **Auth:** PIN sent as `Authorization: Bearer <PIN>` header, validated by the Worker
- **API:** `GET` returns the stored JSON (or `{}`), `PUT` validates and stores JSON
- **Sync:** localStorage for instant saves, debounced cloud PUT every 3 seconds

### Cloudflare Worker configuration

| Name | Kind | Description |
|---|---|---|
| `AUTH_PIN` | Secret | PIN for client authentication |
| `WORKOUT_KV` | KV binding | Namespace holding the app state |

> **Gotcha:** deploying from the Cloudflare dashboard's "Edit code" editor strips KV bindings.
> Manage bindings only in **Settings → Bindings** (and deploy from there), or deploy with `wrangler deploy`.
> A missing binding shows up as HTTP 500 / `error code: 1101` without CORS headers, so the app reports "offline".

See [`worker/README.md`](worker/README.md) for setup and deployment.

### Architecture

```
Browser (GitHub Pages)
   ├── localStorage (instant, offline fallback)
   └── fetch() ──→ Cloudflare Worker ──→ Cloudflare KV
                    (validates PIN)       (stores JSON)
```

## Development

The entire app is a single `index.html` file. To modify:

1. Edit `index.html`
2. Push to `main` branch
3. GitHub Pages auto-deploys within ~1 minute

### Code style

**All code changes must be commented.** Every function, significant block, and non-obvious logic should have clear comments explaining what it does and why. This ensures the codebase remains understandable for future modifications.
