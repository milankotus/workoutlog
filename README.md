# Workout Log

Single-file calisthenics & nutrition tracker based on [Hybrid Calisthenics](https://www.hybridcalisthenics.com/programs).

**Live app:** https://milankotus.github.io/workoutlog/

## Features

- Weekly exercise tracking with sets/reps, history comparison (-2w, -1w)
- Exercise changes propagate to all future weeks (same day, same slot)
- Body measurements (weight, waist)
- Meal logging with calorie + protein tracking and autocomplete
- Manage saved meals (hide unwanted items from suggestions)
- Activities (running, walking, rucking, bicycling)
- Exercise mastery system (goal reps, streak tracking)
- Combined chart (weight, waist, calories) with time range selector
- Export/import JSON backups, CSV export
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
