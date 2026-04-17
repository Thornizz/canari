# Canari — Design Spec

**Date:** 2026-04-16  
**Statut:** Approuvé

---

## Objectif

Canari est une application mobile (iOS/Android) et web permettant d'apprendre à reconnaître les oiseaux observés en France. Elle propose un mode apprentissage par famille et un mode quiz gamifié avec suivi de progression.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Expo SDK 52 + Expo Router v4 |
| Styling | NativeWind v4 (Tailwind sur React Native) |
| Auth + DB | Supabase (auth email/password + OAuth Google) |
| Données oiseaux | `data/birds.json` statique (~400–500 espèces) |
| Images | URLs Wikipedia Commons stockées dans le JSON |
| Build natif | EAS Build (App Store + Google Play) |
| Web | Expo Router web → Vercel |
| Langue | Français intégral |

---

## Thème visuel

- **Nom :** Canari
- **Couleur principale :** Jaune `#f59e0b` (amber-500)
- **Fond :** Sombre `#1c1917` (stone-900)
- **Style :** Sombre & moderne, accent jaune lumineux
- **Homepage :** Hero avec photo de canari en fond, dégradé jaune→brun sombre, titre CANARI en grand
- **Inspiration :** Style Duolingo — grande zone photo en haut, cartes d'action en dessous

---

## Structure de navigation

Navigation en **stack** (pas de tab bar). La homepage est le hub central avec des grandes cards pour accéder à chaque section. Retour arrière natif iOS/Android.

```
Homepage (index.tsx)
├── Mode Apprentissage (apprendre/index.tsx)
│   └── Fiche oiseau (apprendre/[id].tsx)
├── Mode Quiz (quiz/index.tsx)
│   ├── Question (quiz/[questionIndex].tsx)
│   └── Résultats (quiz/resultats.tsx)
├── Classement (classement.tsx)
└── Profil (profil.tsx)
```

---

## Structure de fichiers

```
app/
  index.tsx                  ← Homepage
  apprendre/
    index.tsx                ← Liste familles (accordéons)
    [id].tsx                 ← Fiche détail oiseau
  quiz/
    index.tsx                ← Écran de lancement
    [questionIndex].tsx      ← Question en cours
    resultats.tsx            ← Score final + badge
  classement.tsx             ← Leaderboard global
  profil.tsx                 ← Profil utilisateur
data/
  birds.json                 ← Dataset statique
lib/
  supabase.ts                ← Client Supabase
  quiz.ts                    ← Logique tirage aléatoire
  badges.ts                  ← Définitions et calcul des badges
  streak.ts                  ← Logique de streak journalier
```

---

## Modèle de données

### birds.json — structure d'une entrée

```json
{
  "id": "moineau-domestique",
  "nomFr": "Moineau domestique",
  "nomSci": "Passer domesticus",
  "famille": "Passéridés",
  "ordre": "Passériformes",
  "description": "Petit passereau très commun en milieu urbain et rural...",
  "taille": "14-16 cm",
  "envergure": "21-25 cm",
  "poids": "24-39 g",
  "habitat": ["urbain", "jardins", "campagne"],
  "statut": "Sédentaire",
  "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/...",
  "anecdote": "Le mâle se reconnaît à sa bavette noire caractéristique."
}
```

Familles couvertes : Passériformes, Rapaces diurnes, Rapaces nocturnes, Anatidés, Ardéidés, Laridés, Picidés, Columbidés, Rallidés, Sylviidés, Muscicapidés, Turdidés, Fringillidés, Emberizidés, et autres familles présentes en France. Total visé : 400–500 espèces.

### Supabase — tables

**`profiles`**
```sql
id          uuid references auth.users primary key
username    text
streak_count      int default 0
last_played_date  date
created_at  timestamptz default now()
```

**`quiz_scores`**
```sql
id          uuid primary key default gen_random_uuid()
user_id     uuid references profiles(id)
score       int  -- 0 à 10
played_at   timestamptz default now()
```

**`badges`**
```sql
id          uuid primary key default gen_random_uuid()
user_id     uuid references profiles(id)
badge_key   text  -- ex: "premier_quiz", "score_parfait", "streak_7"
earned_at   timestamptz default now()
```

**`bird_progress`**
```sql
id          uuid primary key default gen_random_uuid()
user_id     uuid references profiles(id)
bird_id     text  -- correspond à birds.json[].id
seen_at     timestamptz default now()
```

---

## Pages

### Homepage (`app/index.tsx`)

- Zone hero plein écran : image de canari en fond (dégradé jaune→sombre), titre **CANARI** en grand, sous-titre "Découvrez les oiseaux de France"
- Sous le hero :
  - Grande card **Mode Apprentissage** (bleu, icône 📚)
  - Grande card **Mode Quiz** (orange, icône 🎯, sous-titre "10 questions · Teste-toi !")
  - Deux petites cards côte à côte : **Classement** 🏆 et **Profil** 👤
- Si connecté : streak du jour affiché dans le header (🔥 N jours)
- Si non connecté : bannière discrète "Connecte-toi pour sauvegarder ta progression"

### Mode Apprentissage — Liste (`app/apprendre/index.tsx`)

- Barre de recherche en haut (filtre sur `nomFr` et `nomSci`)
- Liste des familles en accordéons :
  - Header famille : icône, nom, nombre d'espèces, % découvert (si connecté)
  - Tap → ouvre la liste des oiseaux de cette famille
  - Chaque ligne : miniature colorée, nom FR, nom scientifique, indicateur vu/non vu (point vert si vu)
- Tri alphabétique par défaut au sein de chaque famille

### Mode Apprentissage — Fiche oiseau (`app/apprendre/[id].tsx`)

- Grande photo Wikipedia Commons en haut (plein largeur)
- Nom français (grand, gras) + nom scientifique (italique, gris)
- Famille et ordre
- Stats sous forme de chips : taille, envergure, poids
- Habitats sous forme de badges colorés
- Statut (Sédentaire, Migrateur, Hivernant, etc.)
- Description paragraphe
- Anecdote mise en avant (fond jaune subtil)
- Marqué automatiquement "vu" à l'ouverture (si connecté → enregistré dans `bird_progress`)

### Mode Quiz — Lancement (`app/quiz/index.tsx`)

- Présentation du quiz : "10 questions · 15 secondes par question"
- Meilleur score personnel affiché (si connecté)
- Bouton "Commencer" jaune

### Mode Quiz — Question (`app/quiz/[questionIndex].tsx`)

- Barre de progression en haut (ex: 3/10) + timer 15s (barre qui se vide)
- Grande photo de l'oiseau plein écran (Wikipedia Commons)
- Question : "Quel est cet oiseau ?"
- 4 propositions en grille 2×2 (1 correcte + 3 distracteurs de la même famille)
- Tap → feedback coloré immédiat : vert (correct) / rouge (incorrect), la bonne réponse reste visible
- Après 1s → question suivante automatiquement
- Si timer expire → compte comme faux, passage automatique

### Mode Quiz — Résultats (`app/quiz/resultats.tsx`)

- Header coloré dégradé jaune/orange avec score large (ex: **7/10**)
- Streak mis à jour + message (ex: "🔥 Série de 3 jours !")
- Badge débloqué si applicable : carte mise en avant avec animation
- Liste scrollable des 10 questions : nom de l'oiseau, ✓ ou ✗, nom correct si erreur
- Deux boutons : **Rejouer** (jaune) et **Classement** (gris)

### Classement (`app/classement.tsx`)

- Top 20 des meilleurs scores (1 score par utilisateur = son meilleur score)
- Chaque ligne : rang, username, score, date
- Position de l'utilisateur connecté mise en surbrillance jaune si hors top 20

### Profil (`app/profil.tsx`)

- Avatar (initiales par défaut), username
- 🔥 Streak actuel + record personnel
- Grille de badges (grisés si non obtenus, colorés si débloqués)
- Historique des 10 derniers quiz (score + date)
- Bouton Connexion / Déconnexion

---

## Gamification

### Streak journalier
- Incrémenté de 1 si l'utilisateur joue au moins un quiz dans la journée
- Remis à 0 si un jour est sauté
- Calculé à la fin de chaque quiz via `streak.ts`
- Stocké dans `profiles.streak_count` et `profiles.last_played_date`

### Leaderboard global
- Basé sur `MAX(score)` par utilisateur dans `quiz_scores`
- Rafraîchi à chaque fin de quiz
- Affiché dans `classement.tsx`

### Badges
| Clé | Condition | Label |
|-----|-----------|-------|
| `premier_quiz` | 1er quiz complété | Premier envol 🐣 |
| `score_parfait` | Score 10/10 | Ornithologue parfait 🎯 |
| `streak_3` | Streak ≥ 3 jours | 3 jours de suite 🔥 |
| `streak_7` | Streak ≥ 7 jours | Une semaine ! 🔥🔥 |
| `streak_30` | Streak ≥ 30 jours | Passionné 🏆 |
| `score_7` | Score ≥ 7 pour la 1ère fois | Apprenti ornithologue 🏅 |
| `oiseaux_50` | 50 oiseaux vus | Explorateur 🌿 |
| `oiseaux_100` | 100 oiseaux vus | Grand explorateur 🌍 |
| `famille_complete` | Tous les oiseaux d'une famille vus | Expert [famille] ⭐ |

### Progression par famille
- Calculée côté client : `bird_progress` records ÷ total espèces famille × 100
- Affichée en % dans les accordéons du mode apprentissage

---

## Authentification

- Supabase Auth : email/password + OAuth Google
- Anonyme possible (toutes les fonctionnalités sauf sauvegarde)
- À la connexion : profil créé automatiquement dans `profiles` si inexistant (trigger Supabase)
- Row Level Security (RLS) activé sur toutes les tables utilisateur

---

## PWA / Mobile natif

- EAS Build pour générer les binaires iOS (.ipa) et Android (.apk/.aab)
- `app.json` configuré avec icône jaune canari, splash screen sombre
- Support web via Expo Router → déployable sur Vercel
- `.gitignore` inclut `.superpowers/`

---

## Hors scope (v1)

- Chant des oiseaux (audio)
- Mode hors ligne complet (cache local)
- Partage social des scores
- Notifications push (rappel streak)
- Carte géographique de distribution
- Contenu contributeur / édition admin
