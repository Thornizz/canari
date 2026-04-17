# Canari

**Apprenez à reconnaître les oiseaux de France** — application mobile (iOS/Android) et web avec mode apprentissage, quiz gamifié et suivi de progression.

---

## Screenshots / Demo

_(coming soon)_

---

## Features

- **Mode Apprentissage** — browse ~400–500 French bird species organised by family, with photos, scientific names, stats, habitats and anecdotes
- **Search** — filter birds by French or scientific name across all families
- **Bird progress tracking** — each species is marked "seen" when you open its card
- **Quiz mode** — 10 questions, 15 s per question, 4-choice grid with instant visual feedback
- **Leaderboard** — global top-20 based on each player's best score
- **Profile** — badges grid, quiz history, streak counter
- **Streaks** — daily streak incremented for every quiz day; resets on a missed day
- **Badges** — nine unlockable badges for milestones (see [Gamification](#gamification))
- **Auth** — email/password + Google OAuth via Supabase; anonymous browsing supported

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 + Expo Router v4 |
| Styling | NativeWind v4 (Tailwind CSS on React Native) |
| Language | TypeScript |
| Auth + DB | Supabase (Auth, Postgres, RLS) |
| Bird data | Static `data/birds.json` (~400–500 species) |
| Bird images | Wikipedia Commons URLs (stored in JSON) |
| Native builds | EAS Build (App Store + Google Play) |
| Web | Expo Router → Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- `npx` / npm 10+
- A [Supabase](https://supabase.com) project (free tier works)

### Install

```bash
git clone https://github.com/your-org/canari.git
cd canari
npm install
```

### Environment

Create a `.env.local` file at the project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Run the dev server

```bash
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or `w` for web.

### Supabase setup

Run the SQL snippets in the [Database](#database) section below in your Supabase SQL editor, then enable Row Level Security on each table and configure Google OAuth in the Supabase Auth dashboard if needed.

---

## Project Structure

```
app/
  index.tsx                  # Homepage — hero + navigation cards
  apprendre/
    index.tsx                # Learning mode — family accordions
    [id].tsx                 # Bird detail card
  quiz/
    index.tsx                # Quiz launch screen
    [questionIndex].tsx      # Quiz question
    resultats.tsx            # Results + badge unlock
  classement.tsx             # Global leaderboard
  profil.tsx                 # User profile
data/
  birds.json                 # Static bird dataset
lib/
  supabase.ts                # Supabase client
  quiz.ts                    # Random question logic
  badges.ts                  # Badge definitions and evaluation
  streak.ts                  # Daily streak logic
```

---

## Database

Four Supabase tables (all with RLS enabled):

| Table | Purpose |
|---|---|
| `profiles` | username, streak_count, last_played_date |
| `quiz_scores` | one row per quiz attempt (score 0–10) |
| `badges` | earned badge keys per user |
| `bird_progress` | one row per bird seen per user |

---

## Gamification

### Daily Streak

Incremented by 1 each day the user completes at least one quiz. Resets to 0 on a missed day. Stored in `profiles.streak_count` / `profiles.last_played_date`.

### Badges

| Key | Condition | Label |
|---|---|---|
| `premier_quiz` | First quiz completed | Premier envol 🐣 |
| `score_parfait` | Score 10/10 | Ornithologue parfait 🎯 |
| `streak_3` | Streak ≥ 3 days | 3 jours de suite 🔥 |
| `streak_7` | Streak ≥ 7 days | Une semaine ! 🔥🔥 |
| `streak_30` | Streak ≥ 30 days | Passionné 🏆 |
| `score_7` | Score ≥ 7 for the first time | Apprenti ornithologue 🏅 |
| `oiseaux_50` | 50 birds seen | Explorateur 🌿 |
| `oiseaux_100` | 100 birds seen | Grand explorateur 🌍 |
| `famille_complete` | All birds in a family seen | Expert [famille] ⭐ |

---

## License

MIT
