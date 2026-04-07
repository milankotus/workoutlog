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
- Cloud sync across devices (Cloudflare Worker + JSONBin.io)
- Mobile responsive layout

## Cloud Sync

Data syncs across devices via a **Cloudflare Worker** proxy that forwards to JSONBin.io.

- **Worker:** `workout-sync` on Cloudflare (holds JSONBin API key server-side)
- **Storage:** JSONBin.io bin `69c52ee6aa77b81da920538e`
- **Auth:** PIN sent as `Authorization: Bearer <PIN>` header, validated by the Worker
- **Sync:** localStorage for instant saves, debounced cloud PUT every 3 seconds

### Cloudflare Worker secrets

| Variable | Description |
|---|---|
| `JSONBIN_KEY` | JSONBin.io X-Master-Key |
| `JSONBIN_BIN` | JSONBin.io bin ID |
| `AUTH_PIN` | PIN for client authentication |

### Architecture

```
Browser (GitHub Pages)
   ├── localStorage (instant, offline fallback)
   └── fetch() ──→ Cloudflare Worker ──→ JSONBin.io
                    (validates PIN)       (stores JSON)
```

## Development

The entire app is a single `index.html` file. To modify:

1. Edit `index.html`
2. Push to `main` branch
3. GitHub Pages auto-deploys within ~1 minute

### Code style

**All code changes must be commented.** Every function, significant block, and non-obvious logic should have clear comments explaining what it does and why. This ensures the codebase remains understandable for future modifications.
