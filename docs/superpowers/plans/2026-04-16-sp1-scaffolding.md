# Canari — Sous-projet 1 : Scaffolding + Données Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialiser le projet Expo, configurer NativeWind + Supabase, créer le dataset oiseaux, et construire la homepage fonctionnelle.

**Architecture:** Expo SDK 52 + Expo Router v4 pour la navigation, NativeWind v4 pour le styling Tailwind, Supabase pour auth + DB. Les données oiseaux sont dans un fichier `data/birds.json` statique. La homepage est le hub central avec hero photo + cards de navigation.

**Tech Stack:** Expo SDK 52, Expo Router v4, NativeWind v4, Tailwind CSS 3, @supabase/supabase-js, expo-linear-gradient, @react-native-async-storage/async-storage

> **Note :** Pas de tests automatisés dans ce sous-projet (focus contenu — les tests seront ajoutés plus tard).

---

## Fichiers créés / modifiés

| Fichier | Rôle |
|---------|------|
| `package.json` | Dépendances (généré par create-expo-app) |
| `app.json` | Config Expo (nom, icône, splash) |
| `tailwind.config.js` | Config Tailwind pour NativeWind |
| `babel.config.js` | Plugin NativeWind |
| `metro.config.js` | Metro avec NativeWind |
| `global.css` | Directives Tailwind |
| `nativewind-env.d.ts` | Types NativeWind pour TypeScript |
| `.env.local` | Variables Supabase (gitignored) |
| `.gitignore` | Ignorer .env.local et .superpowers/ |
| `lib/supabase.ts` | Client Supabase |
| `lib/types.ts` | Types TypeScript (Bird, Profile, etc.) |
| `data/birds.json` | Dataset ~35 oiseaux français |
| `app/_layout.tsx` | Root layout + session Supabase |
| `app/index.tsx` | Homepage (hero + cards) |

---

### Task 1 : Initialiser le projet Expo dans le répertoire existant

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json`, `app/_layout.tsx` (via create-expo-app)

- [ ] **Step 1 : Créer le projet Expo**

Le répertoire `/Users/I531480/SAPDevelop/git/canari` existe déjà avec `.git/` et `docs/`. Lancer create-expo-app dedans :

```bash
cd /Users/I531480/SAPDevelop/git/canari
npx create-expo-app@latest . --template blank-typescript
```

Si le prompt demande confirmation pour un répertoire non vide, répondre **Yes**.

Expected output : `✅ Your project is ready!`

- [ ] **Step 2 : Vérifier la structure générée**

```bash
ls /Users/I531480/SAPDevelop/git/canari
```

Expected : `app/`, `assets/`, `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`

- [ ] **Step 3 : Installer expo-router et ses dépendances**

```bash
cd /Users/I531480/SAPDevelop/git/canari
npx expo install expo-router expo-constants expo-linking expo-status-bar react-native-safe-area-context react-native-screens
```

- [ ] **Step 4 : Mettre à jour `app.json` pour Expo Router**

Remplacer le contenu de `app.json` par :

```json
{
  "expo": {
    "name": "Canari",
    "slug": "canari",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "canari",
    "userInterfaceStyle": "dark",
    "splash": {
      "backgroundColor": "#1c1917"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.canari.app"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#1c1917"
      },
      "package": "com.canari.app"
    },
    "web": {
      "bundler": "metro",
      "output": "static"
    },
    "plugins": ["expo-router"],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 5 : Mettre à jour `package.json` pour ajouter le main entry point**

Dans `package.json`, ajouter/modifier la clé `"main"` :

```json
{
  "main": "expo-router/entry"
}
```

- [ ] **Step 6 : Vérifier que l'app démarre**

```bash
cd /Users/I531480/SAPDevelop/git/canari
npx expo start
```

Expected : QR code affiché, pas d'erreur rouge. Appuyer `w` pour ouvrir dans le navigateur et voir l'écran de base. `Ctrl+C` pour arrêter.

- [ ] **Step 7 : Commit**

```bash
cd /Users/I531480/SAPDevelop/git/canari
git add -A
git commit -m "feat: initialize Expo project with Expo Router"
```

---

### Task 2 : Configurer NativeWind v4

**Files:**
- Create: `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`
- Modify: `babel.config.js`, `metro.config.js`

- [ ] **Step 1 : Installer NativeWind et Tailwind**

```bash
cd /Users/I531480/SAPDevelop/git/canari
npm install nativewind@^4.0.0
npm install --save-dev tailwindcss@3.3.0
```

- [ ] **Step 2 : Initialiser la config Tailwind**

```bash
cd /Users/I531480/SAPDevelop/git/canari
npx tailwindcss init
```

Expected : `tailwind.config.js` créé.

- [ ] **Step 3 : Écrire `tailwind.config.js`**

Remplacer le contenu de `tailwind.config.js` par :

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canary: {
          50: "#fffbeb",
          100: "#fef3c7",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4 : Créer `global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5 : Mettre à jour `babel.config.js`**

Remplacer le contenu par :

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: ["nativewind/babel"],
  };
};
```

- [ ] **Step 6 : Mettre à jour `metro.config.js`**

Si le fichier n'existe pas, le créer. Remplacer le contenu par :

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

- [ ] **Step 7 : Créer `nativewind-env.d.ts`**

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 8 : Mettre à jour `tsconfig.json`**

Ajouter `"nativewind-env.d.ts"` aux includes :

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.d.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

- [ ] **Step 9 : Tester NativeWind**

Ouvrir `app/index.tsx` (ou `app/(tabs)/index.tsx` selon le template) et remplacer temporairement le contenu par :

```tsx
import { View, Text } from "react-native";

export default function TestScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-stone-900">
      <Text className="text-amber-500 text-2xl font-bold">NativeWind OK ✓</Text>
    </View>
  );
}
```

```bash
npx expo start
```

Appuyer `w`. Expected : fond sombre, texte jaune "NativeWind OK ✓". `Ctrl+C`.

- [ ] **Step 10 : Commit**

```bash
cd /Users/I531480/SAPDevelop/git/canari
git add -A
git commit -m "feat: configure NativeWind v4 with Tailwind"
```

---

### Task 3 : Configurer le client Supabase

**Files:**
- Create: `.env.local`, `lib/supabase.ts`
- Modify: `.gitignore`

- [ ] **Step 1 : Installer les dépendances Supabase**

```bash
cd /Users/I531480/SAPDevelop/git/canari
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage expo-secure-store
```

- [ ] **Step 2 : Mettre à jour `.gitignore`**

Ajouter ces lignes à `.gitignore` (créer le fichier s'il n'existe pas) :

```
# Supabase
.env.local
.env.*.local

# Superpowers brainstorm
.superpowers/

# Expo
node_modules/
.expo/
dist/
web-build/
```

- [ ] **Step 3 : Créer `.env.local`**

```
EXPO_PUBLIC_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=VOTRE_ANON_KEY
```

> **Note :** Remplacer les valeurs avec les vraies clés depuis le dashboard Supabase → Settings → API. Ces valeurs ne sont jamais commitées.

- [ ] **Step 4 : Créer `lib/supabase.ts`**

```bash
mkdir -p /Users/I531480/SAPDevelop/git/canari/lib
```

```ts
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 5 : Créer les tables Supabase via le dashboard**

Aller sur [https://supabase.com](https://supabase.com) → ton projet → **SQL Editor** → coller et exécuter :

```sql
-- Profiles (créé automatiquement à l'inscription)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  streak_count int default 0,
  last_played_date date,
  created_at timestamptz default now()
);

-- Quiz scores
create table quiz_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  score int not null check (score >= 0 and score <= 10),
  played_at timestamptz default now()
);

-- Badges
create table badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz default now(),
  unique(user_id, badge_key)
);

-- Bird progress
create table bird_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  bird_id text not null,
  seen_at timestamptz default now(),
  unique(user_id, bird_id)
);

-- RLS: chaque utilisateur ne voit que ses propres données
alter table profiles enable row level security;
alter table quiz_scores enable row level security;
alter table badges enable row level security;
alter table bird_progress enable row level security;

create policy "Profil visible par son propriétaire" on profiles
  for all using (auth.uid() = id);

create policy "Scores visibles par leur propriétaire" on quiz_scores
  for all using (auth.uid() = user_id);

create policy "Badges visibles par leur propriétaire" on badges
  for all using (auth.uid() = user_id);

create policy "Progression visible par son propriétaire" on bird_progress
  for all using (auth.uid() = user_id);

-- Leaderboard: tout le monde peut lire les scores (uniquement score + username)
create policy "Scores publics pour le leaderboard" on quiz_scores
  for select using (true);

create policy "Profils publics (username uniquement)" on profiles
  for select using (true);

-- Trigger: créer le profil automatiquement à l'inscription
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

- [ ] **Step 6 : Vérifier la connexion Supabase**

Dans `app/index.tsx`, ajouter temporairement ce test (à retirer après vérification) :

```tsx
import { useEffect } from "react";
import { View, Text } from "react-native";
import { supabase } from "@/lib/supabase";

export default function TestScreen() {
  useEffect(() => {
    supabase.from("profiles").select("count").then(({ error }) => {
      if (error) console.error("Supabase KO:", error.message);
      else console.log("Supabase OK ✓");
    });
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-stone-900">
      <Text className="text-amber-500 text-2xl font-bold">Supabase test</Text>
    </View>
  );
}
```

```bash
npx expo start
```

Appuyer `w`. Ouvrir la console du navigateur. Expected : `Supabase OK ✓`. `Ctrl+C`.

- [ ] **Step 7 : Commit**

```bash
cd /Users/I531480/SAPDevelop/git/canari
git add -A
git commit -m "feat: configure Supabase client and create DB tables"
```

---

### Task 4 : Définir les types TypeScript

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1 : Créer `lib/types.ts`**

```ts
export interface Bird {
  id: string;
  nomFr: string;
  nomSci: string;
  famille: string;
  ordre: string;
  description: string;
  taille: string;
  envergure: string;
  poids: string;
  habitat: string[];
  statut: "Sédentaire" | "Migrateur" | "Hivernant" | "Estivant" | "Erratique";
  imageUrl: string;
  anecdote: string;
}

export interface Profile {
  id: string;
  username: string | null;
  streak_count: number;
  last_played_date: string | null;
  created_at: string;
}

export interface QuizScore {
  id: string;
  user_id: string;
  score: number;
  played_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_key: BadgeKey;
  earned_at: string;
}

export type BadgeKey =
  | "premier_quiz"
  | "score_parfait"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "score_7"
  | "oiseaux_50"
  | "oiseaux_100"
  | "famille_complete";

export interface BadgeDefinition {
  key: BadgeKey;
  label: string;
  description: string;
  emoji: string;
}

export interface QuizQuestion {
  bird: Bird;
  choices: Bird[];
  correctIndex: number;
}

export interface QuizResult {
  question: QuizQuestion;
  selectedIndex: number | null; // null = timeout
  correct: boolean;
}
```

- [ ] **Step 2 : Commit**

```bash
cd /Users/I531480/SAPDevelop/git/canari
git add lib/types.ts
git commit -m "feat: add TypeScript types for Bird, Profile, Quiz and Badges"
```

---

### Task 5 : Créer le dataset birds.json

**Files:**
- Create: `data/birds.json`

- [ ] **Step 1 : Créer le répertoire data**

```bash
mkdir -p /Users/I531480/SAPDevelop/git/canari/data
```

- [ ] **Step 2 : Créer `data/birds.json`**

```json
[
  {
    "id": "moineau-domestique",
    "nomFr": "Moineau domestique",
    "nomSci": "Passer domesticus",
    "famille": "Passéridés",
    "ordre": "Passériformes",
    "description": "Le moineau domestique est l'un des oiseaux les plus communs en Europe. Il vit au contact direct de l'homme, dans les villes, villages et fermes. Grégaire et bruyant, il forme souvent de petits groupes animés.",
    "taille": "14-16 cm",
    "envergure": "21-25 cm",
    "poids": "24-39 g",
    "habitat": ["urbain", "jardins", "campagne"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Passer_domesticus_male_%28Denmark%29.jpg/320px-Passer_domesticus_male_%28Denmark%29.jpg",
    "anecdote": "Le mâle se reconnaît à sa bavette noire caractéristique et sa calotte grise. La femelle est beige striée, souvent difficile à distinguer des autres moineaux."
  },
  {
    "id": "rouge-gorge",
    "nomFr": "Rouge-gorge familier",
    "nomSci": "Erithacus rubecula",
    "famille": "Muscicapidés",
    "ordre": "Passériformes",
    "description": "Le rouge-gorge est un petit passereau très reconnaissable grâce à sa gorge et sa poitrine orange vif. Très présent dans les jardins et forêts, il est l'un des symboles de Noël en Grande-Bretagne.",
    "taille": "13-14 cm",
    "envergure": "20-22 cm",
    "poids": "14-21 g",
    "habitat": ["forêts", "jardins", "haies"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Erithacus_rubecula_with_cocked_head.jpg/320px-Erithacus_rubecula_with_cocked_head.jpg",
    "anecdote": "Très territorial, le rouge-gorge chante même en hiver pour défendre son domaine. Il suit souvent les jardiniers pour attraper les vers de terre retournés par la bêche."
  },
  {
    "id": "mesange-charbonniere",
    "nomFr": "Mésange charbonnière",
    "nomSci": "Parus major",
    "famille": "Paridés",
    "ordre": "Passériformes",
    "description": "La plus grande des mésanges européennes. Facilement reconnaissable à sa tête noire et blanche et à sa cravate noire sur fond jaune. Très commune dans les jardins et forêts.",
    "taille": "13-15 cm",
    "envergure": "22-26 cm",
    "poids": "14-22 g",
    "habitat": ["forêts", "jardins", "parcs", "bocage"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Parus_major_Luc_Viatour.jpg/320px-Parus_major_Luc_Viatour.jpg",
    "anecdote": "La mésange charbonnière est capable d'apprendre à ouvrir des bouteilles de lait pour en consommer la crème. Ce comportement, observé en Angleterre dans les années 1920, s'est propagé culturellement entre individus."
  },
  {
    "id": "mesange-bleue",
    "nomFr": "Mésange bleue",
    "nomSci": "Cyanistes caeruleus",
    "famille": "Paridés",
    "ordre": "Passériformes",
    "description": "Petite mésange colorée au plumage bleu, jaune et blanc. Très agile, elle se suspend souvent la tête en bas pour chercher sa nourriture. Fréquente les jardins équipés de mangeoires.",
    "taille": "11-12 cm",
    "envergure": "17-20 cm",
    "poids": "9-12 g",
    "habitat": ["forêts", "jardins", "parcs"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Blaumeise_Cyanistes_caeruleus.jpg/320px-Blaumeise_Cyanistes_caeruleus.jpg",
    "anecdote": "La mésange bleue peut mémoriser plusieurs centaines d'emplacements où elle a caché des graines pour l'hiver."
  },
  {
    "id": "merle-noir",
    "nomFr": "Merle noir",
    "nomSci": "Turdus merula",
    "famille": "Turdidés",
    "ordre": "Passériformes",
    "description": "Le merle noir est un des oiseaux chanteurs les plus habiles. Le mâle est entièrement noir avec un bec et un cercle oculaire orange vif. La femelle est brune. Très commun dans les jardins.",
    "taille": "24-25 cm",
    "envergure": "34-38 cm",
    "poids": "80-125 g",
    "habitat": ["jardins", "forêts", "parcs", "bocage"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Common_Blackbird.jpg/320px-Common_Blackbird.jpg",
    "anecdote": "Le chant du merle est l'un des plus mélodieux de nos oiseaux. Il commence à chanter dès le début du printemps, souvent perché en hauteur sur un arbre ou une antenne."
  },
  {
    "id": "pinson-des-arbres",
    "nomFr": "Pinson des arbres",
    "nomSci": "Fringilla coelebs",
    "famille": "Fringillidés",
    "ordre": "Passériformes",
    "description": "L'un des oiseaux les plus communs en Europe. Le mâle a une tête bleue-grise, une poitrine rose-orangée et deux barres blanches sur les ailes. Présent dans tous les milieux boisés.",
    "taille": "14-16 cm",
    "envergure": "24-29 cm",
    "poids": "18-29 g",
    "habitat": ["forêts", "jardins", "parcs", "bocage"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Chaffinch_4.jpg/320px-Chaffinch_4.jpg",
    "anecdote": "Le pinson des arbres a des dialectes régionaux : les individus d'une même région chantent de manière légèrement différente de ceux d'une autre région, comme les accents humains."
  },
  {
    "id": "chardonneret-elegant",
    "nomFr": "Chardonneret élégant",
    "nomSci": "Carduelis carduelis",
    "famille": "Fringillidés",
    "ordre": "Passériformes",
    "description": "Le chardonneret est l'un des plus beaux oiseaux d'Europe avec sa face rouge, sa calotte noire et ses ailes noires barrées de jaune. Il se nourrit principalement de graines de chardons.",
    "taille": "12-13 cm",
    "envergure": "21-25 cm",
    "poids": "14-17 g",
    "habitat": ["jardins", "campagne", "friches", "vergers"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Carduelis_carduelis_close_up.jpg/320px-Carduelis_carduelis_close_up.jpg",
    "anecdote": "Longtemps capturé pour sa beauté et son chant, le chardonneret est désormais protégé. Des populations ont été décimées par le braconnage, notamment en Méditerranée."
  },
  {
    "id": "hirondelle-rustique",
    "nomFr": "Hirondelle rustique",
    "nomSci": "Hirundo rustica",
    "famille": "Hirundinidés",
    "ordre": "Passériformes",
    "description": "L'hirondelle rustique est un migrateur qui arrive en France en avril. Reconnaissable à son front roux, sa gorge rouge et sa longue queue fourchue. Elle niche dans les étables et granges.",
    "taille": "17-19 cm",
    "envergure": "32-34 cm",
    "poids": "16-22 g",
    "habitat": ["campagne", "fermes", "étangs", "zones humides"],
    "statut": "Migrateur",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hirundo_rustica_-Garaet_Hadj_Tahar%2C_Skikda%2C_Algeria-8.jpg/320px-Hirundo_rustica_-Garaet_Hadj_Tahar%2C_Skikda%2C_Algeria-8.jpg",
    "anecdote": "L'hirondelle rustique migre jusqu'en Afrique du Sud, parcourant jusqu'à 10 000 km. Elle revient chaque année nicher au même endroit grâce à une mémoire spatiale remarquable."
  },
  {
    "id": "bergeronnette-grise",
    "nomFr": "Bergeronnette grise",
    "nomSci": "Motacilla alba",
    "famille": "Motacillidés",
    "ordre": "Passériformes",
    "description": "Petit oiseau noir et blanc très remuant, reconnaissable à sa longue queue qu'il agite constamment. Très adaptable, elle fréquente les bords de l'eau, les toits et les zones urbaines.",
    "taille": "16-19 cm",
    "envergure": "25-30 cm",
    "poids": "19-27 g",
    "habitat": ["bords de l'eau", "jardins", "urbain", "campagne"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Motacilla_alba_alba_-_Ranthambore_National_Park.jpg/320px-Motacilla_alba_alba_-_Ranthambore_National_Park.jpg",
    "anecdote": "Les bergeronnettes grises aiment souvent dormir en dortoirs communs, parfois dans des arbres en ville. Des rassemblements de plusieurs centaines d'individus ont été observés."
  },
  {
    "id": "fauvette-tete-noire",
    "nomFr": "Fauvette à tête noire",
    "nomSci": "Sylvia atricapilla",
    "famille": "Sylviidés",
    "ordre": "Passériformes",
    "description": "La fauvette à tête noire est connue pour son chant flûté mélodieux. Le mâle porte une calotte noire, la femelle une calotte rousse. Elle niche dans les buissons et haies épaisses.",
    "taille": "13-15 cm",
    "envergure": "20-23 cm",
    "poids": "14-20 g",
    "habitat": ["forêts", "haies", "jardins", "parcs"],
    "statut": "Migrateur",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Sylvia_atricapilla_male.jpg/320px-Sylvia_atricapilla_male.jpg",
    "anecdote": "Certaines populations hivernent désormais en Grande-Bretagne au lieu de migrer en Afrique, une adaptation évolutive récente liée aux mangeoires et au réchauffement climatique."
  },
  {
    "id": "corneille-noire",
    "nomFr": "Corneille noire",
    "nomSci": "Corvus corone",
    "famille": "Corvidés",
    "ordre": "Passériformes",
    "description": "Grand oiseau entièrement noir, plus petit que le corbeau freux. Très intelligent, il vit en couple toute l'année et défend son territoire contre les intrus, y compris les rapaces.",
    "taille": "45-47 cm",
    "envergure": "93-104 cm",
    "poids": "370-650 g",
    "habitat": ["campagne", "bocage", "urbain", "littoral"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Corvus_corone_-_01.jpg/320px-Corvus_corone_-_01.jpg",
    "anecdote": "Les corneilles sont capables de reconnaître les visages humains et de se souvenir de ceux qui les ont menacées. Elles transmettent cette information à leurs congénères."
  },
  {
    "id": "pie-bavarde",
    "nomFr": "Pie bavarde",
    "nomSci": "Pica pica",
    "famille": "Corvidés",
    "ordre": "Passériformes",
    "description": "La pie est reconnaissable à son plumage noir et blanc contrasté et sa très longue queue. Très intelligente, elle est capable de se reconnaître dans un miroir, ce qui est rare chez les oiseaux.",
    "taille": "44-46 cm",
    "envergure": "52-60 cm",
    "poids": "200-250 g",
    "habitat": ["campagne", "bocage", "jardins", "urbain"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Pica_pica_-_Ranthambore_National_Park.jpg/320px-Pica_pica_-_Ranthambore_National_Park.jpg",
    "anecdote": "Contrairement à sa réputation, la pie n'est pas plus attirée par les objets brillants que les autres oiseaux. Ce mythe a été démystifié par des études scientifiques."
  },
  {
    "id": "geai-des-chenes",
    "nomFr": "Geai des chênes",
    "nomSci": "Garrulus glandarius",
    "famille": "Corvidés",
    "ordre": "Passériformes",
    "description": "Le geai est un corvidé coloré aux ailes ornées d'un miroir bleu strié. Il est le principal disséminateur des glands de chêne, jouant un rôle clé dans la régénération des forêts.",
    "taille": "32-35 cm",
    "envergure": "52-58 cm",
    "poids": "140-190 g",
    "habitat": ["forêts", "parcs", "jardins boisés"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Garrulus-glandarius.jpg/320px-Garrulus-glandarius.jpg",
    "anecdote": "Un seul geai peut stocker jusqu'à 5 000 glands par automne pour l'hiver. Il retrouve la majorité de ses cachettes grâce à sa mémoire spatiale, contribuant ainsi à la plantation de milliers de chênes."
  },
  {
    "id": "buse-variable",
    "nomFr": "Buse variable",
    "nomSci": "Buteo buteo",
    "famille": "Accipitridés",
    "ordre": "Accipitriformes",
    "description": "La buse variable est le rapace diurne le plus commun en France. Son plumage est très variable (d'où son nom), allant du brun foncé presque uniforme au blanc crème. Elle chasse campagnols et mulots.",
    "taille": "51-57 cm",
    "envergure": "109-140 cm",
    "poids": "550-1300 g",
    "habitat": ["forêts", "bocage", "prairies", "campagne"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Buteo_buteo_1_Luc_Viatour.jpg/320px-Buteo_buteo_1_Luc_Viatour.jpg",
    "anecdote": "La buse peut attendre des heures perchée sur un poteau ou un arbre mort pour repérer ses proies. Elle chasse aussi en planant et est capable de voir les traces d'urine des rongeurs en ultraviolet."
  },
  {
    "id": "faucon-crecerelle",
    "nomFr": "Faucon crécerelle",
    "nomSci": "Falco tinnunculus",
    "famille": "Falconidés",
    "ordre": "Falconiformes",
    "description": "Le faucon crécerelle est célèbre pour son vol stationnaire caractéristique, tête fixe face au vent, à la recherche de petits rongeurs. Le mâle a la tête et la queue grises, le dos roux tacheté.",
    "taille": "32-35 cm",
    "envergure": "65-82 cm",
    "poids": "136-252 g",
    "habitat": ["campagne", "bocage", "urbain", "falaises"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Falco_tinnunculus_-Ranthambore_National_Park%2C_Rajasthan%2C_India-8.jpg/320px-Falco_tinnunculus_-Ranthambore_National_Park%2C_Rajasthan%2C_India-8.jpg",
    "anecdote": "Le faucon crécerelle est l'un des rares oiseaux capables de percevoir les ultraviolets. Il détecte les pistes urinaires des campagnols, invisibles à l'œil humain, pour localiser ses proies."
  },
  {
    "id": "faucon-pelerin",
    "nomFr": "Faucon pèlerin",
    "nomSci": "Falco peregrinus",
    "famille": "Falconidés",
    "ordre": "Falconiformes",
    "description": "Le faucon pèlerin est le plus rapide de tous les animaux. Il plonge en piqué sur ses proies aviaires à des vitesses dépassant 300 km/h. Il niche sur les falaises et de plus en plus sur les buildings en ville.",
    "taille": "36-48 cm",
    "envergure": "95-115 cm",
    "poids": "600-1300 g",
    "habitat": ["falaises", "urbain", "montagne"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Peregrine_falcon_Kielder_2011.jpg/320px-Peregrine_falcon_Kielder_2011.jpg",
    "anecdote": "En piqué, le faucon pèlerin peut atteindre 389 km/h, ce qui en fait l'animal le plus rapide de la planète. Ses narines sont pourvues de tubercules qui réduisent la pression de l'air pendant le piqué."
  },
  {
    "id": "epervier-d-europe",
    "nomFr": "Épervier d'Europe",
    "nomSci": "Accipiter nisus",
    "famille": "Accipitridés",
    "ordre": "Accipitriformes",
    "description": "L'épervier est un petit rapace forestier qui chasse les passereaux avec une agilité remarquable entre les arbres. Le mâle est gris ardoise dessus, avec le dessous barré de roux.",
    "taille": "28-38 cm",
    "envergure": "55-77 cm",
    "poids": "110-342 g",
    "habitat": ["forêts", "bocage", "jardins"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Sparrow_Hawk_-_natures_pics.jpg/320px-Sparrow_Hawk_-_natures_pics.jpg",
    "anecdote": "L'épervier présente un fort dimorphisme sexuel : la femelle peut être presque deux fois plus lourde que le mâle. Ce dimorphisme inverse est typique des rapaces qui chassent des proies agiles."
  },
  {
    "id": "milan-noir",
    "nomFr": "Milan noir",
    "nomSci": "Milvus migrans",
    "famille": "Accipitridés",
    "ordre": "Accipitriformes",
    "description": "Le milan noir est un rapace migrateur reconnaissable à sa queue légèrement fourchue. Il plane souvent au-dessus des rivières et des décharges, se nourrissant de charognes et de déchets.",
    "taille": "55-60 cm",
    "envergure": "140-165 cm",
    "poids": "630-1100 g",
    "habitat": ["bords de l'eau", "forêts", "campagne"],
    "statut": "Migrateur",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Milvus_migrans_-_01.jpg/320px-Milvus_migrans_-_01.jpg",
    "anecdote": "Le milan noir est l'un des rapaces les plus abondants au monde. Des rassemblements de milliers d'individus ont été observés dans certaines régions d'Afrique lors des migrations."
  },
  {
    "id": "chouette-hulotte",
    "nomFr": "Chouette hulotte",
    "nomSci": "Strix aluco",
    "famille": "Strigidés",
    "ordre": "Strigiformes",
    "description": "La chouette hulotte est le rapace nocturne le plus commun d'Europe. Son hululement caractéristique 'hou-hou-houuuu' est le son nocturne le plus familier des forêts françaises.",
    "taille": "37-43 cm",
    "envergure": "94-104 cm",
    "poids": "330-590 g",
    "habitat": ["forêts", "parcs", "jardins boisés"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tawny_Owl_Lincolnshire.jpg/320px-Tawny_Owl_Lincolnshire.jpg",
    "anecdote": "Les yeux de la chouette hulotte sont fixes dans leurs orbites. Pour regarder sur le côté, elle doit tourner la tête, ce qu'elle peut faire à 270°. Elle voit avec 100 fois moins de lumière qu'un humain."
  },
  {
    "id": "effraie-des-clochers",
    "nomFr": "Effraie des clochers",
    "nomSci": "Tyto alba",
    "famille": "Tytonidés",
    "ordre": "Strigiformes",
    "description": "L'effraie est reconnaissable à son visage blanc en forme de cœur et son plumage blanc-dorsal orangé. Elle niche dans les clochers, greniers et granges. Son cri est un sifflement rauque.",
    "taille": "33-35 cm",
    "envergure": "80-95 cm",
    "poids": "187-400 g",
    "habitat": ["campagne", "fermes", "clochers", "bâtiments"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Tyto_alba_-_Ranthambore_National_Park.jpg/320px-Tyto_alba_-_Ranthambore_National_Park.jpg",
    "anecdote": "L'effraie possède l'ouïe la plus fine parmi tous les oiseaux testés. Elle peut localiser et capturer une souris dans l'obscurité totale, guidée uniquement par le bruit de ses déplacements."
  },
  {
    "id": "canard-colvert",
    "nomFr": "Canard colvert",
    "nomSci": "Anas platyrhynchos",
    "famille": "Anatidés",
    "ordre": "Anseriformes",
    "description": "Le canard colvert est le canard le plus commun d'Europe et l'ancêtre de la plupart des races de canards domestiques. Le mâle a une tête vert métallique brillante et un collier blanc.",
    "taille": "50-65 cm",
    "envergure": "81-98 cm",
    "poids": "750-1575 g",
    "habitat": ["étangs", "rivières", "marais", "parcs"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Mallard-interaction.jpg/320px-Mallard-interaction.jpg",
    "anecdote": "Le 'coin-coin' que tout le monde connaît est en réalité uniquement le cri de la femelle. Le mâle émet un cri plus discret et rauque, souvent moins connu du grand public."
  },
  {
    "id": "cygne-tubercule",
    "nomFr": "Cygne tuberculé",
    "nomSci": "Cygnus olor",
    "famille": "Anatidés",
    "ordre": "Anseriformes",
    "description": "Le cygne tuberculé est le plus grand oiseau d'Europe. Reconnaissable à son bec orange avec un tubercule noir à la base. Il est devenu semi-domestique dans de nombreux parcs et lacs.",
    "taille": "125-170 cm",
    "envergure": "208-238 cm",
    "poids": "7000-14300 g",
    "habitat": ["lacs", "étangs", "rivières", "estuaires"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Mute_swan_Vrhnika.jpg/320px-Mute_swan_Vrhnika.jpg",
    "anecdote": "Le cygne tuberculé peut être agressif pour défendre son nid. Il est capable de briser le bras d'un adulte avec ses ailes puissantes lors d'une attaque. Malgré son nom, il émet des sons variés."
  },
  {
    "id": "heron-cendre",
    "nomFr": "Héron cendré",
    "nomSci": "Ardea cinerea",
    "famille": "Ardéidés",
    "ordre": "Pélécaniformes",
    "description": "Le héron cendré est le plus grand héron d'Europe. Il se tient immobile pendant de longues minutes au bord de l'eau, attendant patiemment qu'un poisson passe à portée de son long bec.",
    "taille": "84-102 cm",
    "envergure": "155-175 cm",
    "poids": "1020-2073 g",
    "habitat": ["rivières", "étangs", "marais", "estuaires"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Ardea_cinerea_Luc_Viatour.jpg/320px-Ardea_cinerea_Luc_Viatour.jpg",
    "anecdote": "Le héron peut avaler un poisson d'une taille surprenante d'un seul coup. Il existe des cas documentés de hérons s'étant étouffés en tentant d'avaler une proie trop grande."
  },
  {
    "id": "grande-aigrette",
    "nomFr": "Grande Aigrette",
    "nomSci": "Ardea alba",
    "famille": "Ardéidés",
    "ordre": "Pélécaniformes",
    "description": "La grande aigrette est entièrement blanche avec un long bec jaune et des pattes noires. Sa population a failli s'éteindre au XIXe siècle en raison de la chasse pour ses plumes ornementales.",
    "taille": "85-102 cm",
    "envergure": "140-170 cm",
    "poids": "700-1500 g",
    "habitat": ["zones humides", "rivières", "marais", "estuaires"],
    "statut": "Hivernant",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Ardea_alba_-_Washington%2C_DC%2C_USA_-_20110904.jpg/320px-Ardea_alba_-_Washington%2C_DC%2C_USA_-_20110904.jpg",
    "anecdote": "Au XIXe siècle, la grande aigrette était chassée presque jusqu'à l'extinction pour ses plumes nuptiales blanches utilisées pour décorer les chapeaux des femmes. Sa protection est à l'origine du mouvement de conservation moderne."
  },
  {
    "id": "goelaend-argente",
    "nomFr": "Goéland argenté",
    "nomSci": "Larus argentatus",
    "famille": "Laridés",
    "ordre": "Charadriiformes",
    "description": "Le goéland argenté est le goéland le plus commun des côtes françaises. Adaptable et opportuniste, il fréquente les ports, plages, décharges et villes côtières. Reconnaissable à son bec jaune avec une tache rouge.",
    "taille": "54-60 cm",
    "envergure": "123-148 cm",
    "poids": "750-1250 g",
    "habitat": ["littoral", "ports", "décharges", "champs"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Herring_Gull_Larus_argentatus.jpg/320px-Herring_Gull_Larus_argentatus.jpg",
    "anecdote": "Le goéland argenté met jusqu'à 4 ans pour atteindre son plumage adulte. Il passe par plusieurs étapes de mues avec des plumages bruns et blancs mélangés, ce qui rend difficile l'identification des jeunes."
  },
  {
    "id": "mouette-rieuse",
    "nomFr": "Mouette rieuse",
    "nomSci": "Chroicocephalus ridibundus",
    "famille": "Laridés",
    "ordre": "Charadriiformes",
    "description": "La mouette rieuse est la plus petite et la plus commune des mouettes françaises. En été, sa tête est brun chocolat (et non noire). On la trouve aussi bien sur les côtes qu'à l'intérieur des terres.",
    "taille": "38-44 cm",
    "envergure": "94-105 cm",
    "poids": "200-340 g",
    "habitat": ["littoral", "lacs", "rivières", "champs", "urbain"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Laughing_Gull_Chroicocephalus_ridibundus.jpg/320px-Laughing_Gull_Chroicocephalus_ridibundus.jpg",
    "anecdote": "Contrairement à ce que son nom laisse supposer, la mouette rieuse n'est pas particulièrement hilare ! Son nom vient du latin 'ridibundus' qui signifie simplement 'qui rit', en référence à ses cris."
  },
  {
    "id": "pic-vert",
    "nomFr": "Pic vert",
    "nomSci": "Picus viridis",
    "famille": "Picidés",
    "ordre": "Piciformes",
    "description": "Le pic vert est reconnaissable à son plumage vert, sa calotte rouge et sa moustache rouge (chez le mâle) ou noire (chez la femelle). Son cri sonore 'pluu-pluu-pluu' ressemble à un rire.",
    "taille": "30-36 cm",
    "envergure": "45-51 cm",
    "poids": "150-214 g",
    "habitat": ["forêts claires", "parcs", "jardins", "bocage"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Picus_viridis_-_04.jpg/320px-Picus_viridis_-_04.jpg",
    "anecdote": "Le pic vert se nourrit principalement de fourmis. Sa langue extensible peut mesurer 10 cm et est recouverte d'une substance gluante. Il peut ainsi capturer jusqu'à 2 000 fourmis par jour."
  },
  {
    "id": "pic-epeiche",
    "nomFr": "Pic épeiche",
    "nomSci": "Dendrocopos major",
    "famille": "Picidés",
    "ordre": "Piciformes",
    "description": "Le pic épeiche est le pic le plus commun de France. Son tambourinage sur les arbres au printemps est caractéristique. Noir et blanc avec une tache rouge sur la nuque (mâle) et sur le bas du ventre.",
    "taille": "22-23 cm",
    "envergure": "34-39 cm",
    "poids": "70-98 g",
    "habitat": ["forêts", "parcs", "jardins boisés"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Dendrocopos_major_-_Randers_Regnskov.jpg/320px-Dendrocopos_major_-_Randers_Regnskov.jpg",
    "anecdote": "Le pic peut frapper l'écorce des arbres 20 fois par seconde, soit 12 000 coups par jour. Son cerveau est protégé par des amortisseurs naturels et son bec est légèrement décalé pour absorber les chocs."
  },
  {
    "id": "pigeon-ramier",
    "nomFr": "Pigeon ramier",
    "nomSci": "Columba palumbus",
    "famille": "Columbidés",
    "ordre": "Columbiformes",
    "description": "Le pigeon ramier est le plus grand des colombidés européens. Il se distingue par ses taches blanches sur les côtés du cou et ses bandes blanches sur les ailes en vol. Son roucoulement grave est familier.",
    "taille": "38-43 cm",
    "envergure": "68-77 cm",
    "poids": "300-615 g",
    "habitat": ["forêts", "bocage", "jardins", "parcs", "champs"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Columba_palumbus_-_01.jpg/320px-Columba_palumbus_-_01.jpg",
    "anecdote": "Le pigeon ramier produit du 'lait de jabot', une sécrétion nutritive produite dans son jabot pour nourrir ses poussins. Cette caractéristique est partagée par tous les colombidés et les flamants roses."
  },
  {
    "id": "tourterelle-turque",
    "nomFr": "Tourterelle turque",
    "nomSci": "Streptopelia decaocto",
    "famille": "Columbidés",
    "ordre": "Columbiformes",
    "description": "La tourterelle turque est une belle réussite de colonisation : inconnue en France avant 1950, elle est aujourd'hui présente partout en Europe. Beige rosé avec un demi-collier noir, son chant 'kou-kouh-kou' est caractéristique.",
    "taille": "31-33 cm",
    "envergure": "47-55 cm",
    "poids": "150-220 g",
    "habitat": ["urbain", "jardins", "campagne", "fermes"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Streptopelia_decaocto_2.jpg/320px-Streptopelia_decaocto_2.jpg",
    "anecdote": "La tourterelle turque a colonisé toute l'Europe occidentale en moins de 50 ans, se déplaçant de la Turquie jusqu'aux îles Britanniques. C'est l'une des expansions territoriales les plus rapides jamais documentées chez un oiseau."
  },
  {
    "id": "cigogne-blanche",
    "nomFr": "Cigogne blanche",
    "nomSci": "Ciconia ciconia",
    "famille": "Ciconiidés",
    "ordre": "Ciconiiformes",
    "description": "La cigogne blanche est un grand oiseau blanc aux ailes noires et au bec rouge. Elle niche sur les toits, cheminées et pylônes. Migrateur, elle hiverne en Afrique subsaharienne.",
    "taille": "100-115 cm",
    "envergure": "195-215 cm",
    "poids": "2300-4400 g",
    "habitat": ["prairies humides", "marais", "bocage", "campagne"],
    "statut": "Migrateur",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/White_stork_%28Ciconia_ciconia%29_2.jpg/320px-White_stork_%28Ciconia_ciconia%29_2.jpg",
    "anecdote": "La cigogne blanche claquète du bec pour communiquer (elle est pratiquement muette). Un couple se retrouve chaque année au même nid, qui peut peser plusieurs centaines de kilogrammes après des années d'ajout de matériaux."
  },
  {
    "id": "martin-pecheur",
    "nomFr": "Martin-pêcheur d'Europe",
    "nomSci": "Alcedo atthis",
    "famille": "Alcédinidés",
    "ordre": "Coraciiformes",
    "description": "Le martin-pêcheur est l'un des oiseaux les plus colorés d'Europe avec son dos bleu-vert iridescent et son ventre orange vif. Il plonge verticalement dans l'eau pour capturer des poissons.",
    "taille": "16-17 cm",
    "envergure": "24-26 cm",
    "poids": "34-46 g",
    "habitat": ["rivières", "ruisseaux", "étangs", "canaux"],
    "statut": "Sédentaire",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Common_Kingfisher_-_Ranthambore_National_Park.jpg/320px-Common_Kingfisher_-_Ranthambore_National_Park.jpg",
    "anecdote": "Le train à grande vitesse japonais Shinkansen a été redessiné en s'inspirant du bec du martin-pêcheur, qui entre dans l'eau sans éclabousser. Cela a permis de réduire le bruit et la consommation d'énergie."
  }
]
```

- [ ] **Step 3 : Commit**

```bash
cd /Users/I531480/SAPDevelop/git/canari
git add data/birds.json
git commit -m "feat: add French birds dataset (35 species)"
```

---

### Task 6 : Construire le root layout

**Files:**
- Create/Modify: `app/_layout.tsx`

- [ ] **Step 1 : Installer expo-linear-gradient**

```bash
cd /Users/I531480/SAPDevelop/git/canari
npx expo install expo-linear-gradient
```

- [ ] **Step 2 : Écrire `app/_layout.tsx`**

```tsx
import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#1c1917" },
          animation: "slide_from_right",
        }}
      />
    </>
  );
}
```

- [ ] **Step 3 : Vérifier**

```bash
npx expo start
```

Appuyer `w`. Expected : l'app charge sans erreur, fond sombre. `Ctrl+C`.

- [ ] **Step 4 : Commit**

```bash
cd /Users/I531480/SAPDevelop/git/canari
git add app/_layout.tsx
git commit -m "feat: add root layout with Supabase session and dark theme"
```

---

### Task 7 : Construire la homepage

**Files:**
- Create: `app/index.tsx`

- [ ] **Step 1 : Écrire `app/index.tsx`**

```tsx
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const CANARY_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Serinus_canaria_-Santa_Cruz_de_Tenerife%2C_Spain-8.jpg/640px-Serinus_canaria_-Santa_Cruz_de_Tenerife%2C_Spain-8.jpg";

export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadStreak(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadStreak(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadStreak = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("streak_count")
      .eq("id", userId)
      .single();
    if (data) setStreak(data.streak_count);
  };

  return (
    <ScrollView className="flex-1 bg-stone-950" bounces={false}>
      {/* Hero */}
      <ImageBackground
        source={{ uri: CANARY_IMAGE }}
        className="w-full"
        style={{ height: 380 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(28,25,23,0.7)", "#1c1917"]}
          locations={[0, 0.6, 1]}
          className="flex-1 justify-end pb-6 px-6"
        >
          {/* Streak badge */}
          {session && streak > 0 && (
            <View className="absolute top-12 right-4 bg-amber-500/90 rounded-full px-3 py-1 flex-row items-center">
              <Text className="text-stone-900 font-bold text-sm">🔥 {streak} jour{streak > 1 ? "s" : ""}</Text>
            </View>
          )}

          {/* Title */}
          <Text className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-1">
            Bienvenue sur
          </Text>
          <Text className="text-white text-5xl font-black tracking-widest mb-1">
            CANARI
          </Text>
          <Text className="text-stone-400 text-base">
            Découvrez les oiseaux de France
          </Text>
        </LinearGradient>
      </ImageBackground>

      {/* Cards */}
      <View className="px-4 -mt-2 pb-8">
        {/* Bannière connexion */}
        {!session && (
          <TouchableOpacity
            className="mb-4 bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 flex-row items-center justify-between"
            onPress={() => router.push("/profil")}
          >
            <Text className="text-stone-400 text-sm">
              Connecte-toi pour sauvegarder ta progression
            </Text>
            <Text className="text-amber-500 text-sm font-semibold">→</Text>
          </TouchableOpacity>
        )}

        {/* Mode Apprentissage */}
        <TouchableOpacity
          className="mb-4 rounded-2xl overflow-hidden"
          onPress={() => router.push("/apprendre")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#1e3a5f", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-5"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-3xl mb-2">📚</Text>
                <Text className="text-white text-xl font-bold mb-1">
                  Mode Apprentissage
                </Text>
                <Text className="text-blue-200 text-sm">
                  Explorer les oiseaux par famille
                </Text>
              </View>
              <Text className="text-white/40 text-3xl">›</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Mode Quiz */}
        <TouchableOpacity
          className="mb-4 rounded-2xl overflow-hidden"
          onPress={() => router.push("/quiz")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#7c2d12", "#ea580c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-5"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-3xl mb-2">🎯</Text>
                <Text className="text-white text-xl font-bold mb-1">
                  Mode Quiz
                </Text>
                <Text className="text-orange-200 text-sm">
                  10 questions · 15 secondes · Teste-toi !
                </Text>
              </View>
              <Text className="text-white/40 text-3xl">›</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Classement + Profil */}
        <View className="flex-row gap-4">
          <TouchableOpacity
            className="flex-1 bg-stone-800 border border-stone-700 rounded-2xl p-4 items-center"
            onPress={() => router.push("/classement")}
            activeOpacity={0.85}
          >
            <Text className="text-3xl mb-2">🏆</Text>
            <Text className="text-white font-semibold">Classement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-stone-800 border border-stone-700 rounded-2xl p-4 items-center"
            onPress={() => router.push("/profil")}
            activeOpacity={0.85}
          >
            <Text className="text-3xl mb-2">👤</Text>
            <Text className="text-white font-semibold">
              {session ? "Profil" : "Connexion"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 2 : Créer les pages placeholder pour éviter les erreurs de navigation**

```bash
mkdir -p /Users/I531480/SAPDevelop/git/canari/app/apprendre
mkdir -p /Users/I531480/SAPDevelop/git/canari/app/quiz
```

Créer `app/apprendre/index.tsx` :

```tsx
import { View, Text } from "react-native";

export default function ApprendreScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-stone-900">
      <Text className="text-amber-500 text-xl font-bold">Mode Apprentissage</Text>
      <Text className="text-stone-400 mt-2">Sous-projet 2</Text>
    </View>
  );
}
```

Créer `app/quiz/index.tsx` :

```tsx
import { View, Text } from "react-native";

export default function QuizScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-stone-900">
      <Text className="text-amber-500 text-xl font-bold">Mode Quiz</Text>
      <Text className="text-stone-400 mt-2">Sous-projet 3</Text>
    </View>
  );
}
```

Créer `app/classement.tsx` :

```tsx
import { View, Text } from "react-native";

export default function ClassementScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-stone-900">
      <Text className="text-amber-500 text-xl font-bold">Classement</Text>
      <Text className="text-stone-400 mt-2">Sous-projet 4</Text>
    </View>
  );
}
```

Créer `app/profil.tsx` :

```tsx
import { View, Text } from "react-native";

export default function ProfilScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-stone-900">
      <Text className="text-amber-500 text-xl font-bold">Profil</Text>
      <Text className="text-stone-400 mt-2">Sous-projet 4</Text>
    </View>
  );
}
```

- [ ] **Step 3 : Vérifier la homepage**

```bash
cd /Users/I531480/SAPDevelop/git/canari
npx expo start
```

Appuyer `w`. Vérifier :
- Hero avec image canari + dégradé sombre en bas
- Titre CANARI en grand blanc
- Sous-titre en gris
- Card bleue "Mode Apprentissage" → tap → page placeholder
- Card orange "Mode Quiz" → tap → page placeholder
- Cards "Classement" et "Profil" côte à côte
- Bannière "Connecte-toi" visible si non connecté

`Ctrl+C`.

- [ ] **Step 4 : Commit final**

```bash
cd /Users/I531480/SAPDevelop/git/canari
git add -A
git commit -m "feat: build homepage with hero, navigation cards and streak display"
```
