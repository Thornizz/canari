# Canari — Sous-projet 2 : Mode Apprentissage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire le mode apprentissage complet : liste des familles en accordéons avec recherche, et fiche détail de chaque oiseau avec suivi de progression.

**Architecture:** `lib/birds.ts` centralise toute la logique de manipulation du dataset (groupement par famille, recherche, ordre alphabétique). `app/apprendre/index.tsx` affiche les familles en accordéons avec pourcentage découvert (si connecté). `app/apprendre/[id].tsx` affiche la fiche détail et enregistre automatiquement l'oiseau comme "vu" dans Supabase. Pas de state management global — chaque écran gère son propre état local et requête Supabase directement.

**Tech Stack:** Expo SDK 54, Expo Router v4, NativeWind v4, Supabase (table `bird_progress`), `data/birds.json` statique déjà en place, types `Bird` dans `lib/types.ts`

---

## Fichiers créés / modifiés

| Fichier | Rôle |
|---------|------|
| `lib/birds.ts` | Fonctions utilitaires : grouper par famille, trier, filtrer |
| `app/apprendre/index.tsx` | Liste familles en accordéons + barre de recherche |
| `app/apprendre/[id].tsx` | Fiche détail oiseau + marquage "vu" |

---

### Task 1 : Créer `lib/birds.ts` — utilitaires dataset

**Files:**
- Create: `lib/birds.ts`

Ce fichier expose des fonctions pures sur le dataset statique. Il n'importe que `data/birds.json` et les types.

- [ ] **Step 1 : Créer `lib/birds.ts`**

```ts
import birdsData from "@/data/birds.json";
import type { Bird } from "@/lib/types";

export const allBirds: Bird[] = birdsData as Bird[];

/** Retourne la liste triée alphabétiquement par nomFr */
export function getSortedBirds(): Bird[] {
  return [...allBirds].sort((a, b) => a.nomFr.localeCompare(b.nomFr, "fr"));
}

/** Retourne les oiseaux filtrés par recherche (nomFr ou nomSci, insensible à la casse et aux accents) */
export function searchBirds(query: string): Bird[] {
  const q = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return allBirds.filter((bird) => {
    const fr = bird.nomFr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const sci = bird.nomSci.toLowerCase();
    return fr.includes(q) || sci.includes(q);
  });
}

export interface FamilyGroup {
  famille: string;
  birds: Bird[];
}

/** Groupe les oiseaux par famille, chaque groupe trié alphabétiquement. Familles triées alphabétiquement. */
export function groupByFamily(birds: Bird[]): FamilyGroup[] {
  const map = new Map<string, Bird[]>();
  for (const bird of birds) {
    if (!map.has(bird.famille)) map.set(bird.famille, []);
    map.get(bird.famille)!.push(bird);
  }
  return Array.from(map.entries())
    .map(([famille, birds]) => ({
      famille,
      birds: birds.sort((a, b) => a.nomFr.localeCompare(b.nomFr, "fr")),
    }))
    .sort((a, b) => a.famille.localeCompare(b.famille, "fr"));
}

/** Calcule le pourcentage d'oiseaux vus dans une famille (0–100, arrondi) */
export function familyProgress(famille: string, seenIds: Set<string>): number {
  const total = allBirds.filter((b) => b.famille === famille).length;
  if (total === 0) return 0;
  const seen = allBirds.filter((b) => b.famille === famille && seenIds.has(b.id)).length;
  return Math.round((seen / total) * 100);
}

/** Trouve un oiseau par son id. Retourne undefined si non trouvé. */
export function getBirdById(id: string): Bird | undefined {
  return allBirds.find((b) => b.id === id);
}
```

- [ ] **Step 2 : Commit**

```bash
cd /Users/I531480/SAPDevelop/git/canari
git add lib/birds.ts
git commit -m "feat: add birds utility functions (search, group by family, progress)"
```

---

### Task 2 : Construire la liste des familles (`app/apprendre/index.tsx`)

**Files:**
- Modify: `app/apprendre/index.tsx` (remplacer le placeholder)

Cet écran affiche :
1. Un header "Mode Apprentissage" avec bouton retour
2. Une barre de recherche
3. La liste des familles en accordéons (tap pour ouvrir/fermer)
4. Pour chaque famille : nombre d'espèces + % vu (si connecté)
5. Pour chaque oiseau dans la famille : miniature colorée (première lettre), nom FR, nom sci, point vert si vu

L'écran charge les IDs des oiseaux vus depuis `bird_progress` si l'utilisateur est connecté.

- [ ] **Step 1 : Écrire `app/apprendre/index.tsx`**

```tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { allBirds, searchBirds, groupByFamily, familyProgress, FamilyGroup } from "@/lib/birds";

// Couleurs distinctes pour les initiales de familles
const FAMILY_COLORS: Record<string, string> = {
  "Passéridés": "#b45309",
  "Muscicapidés": "#7c3aed",
  "Paridés": "#0369a1",
  "Turdidés": "#1d4ed8",
  "Fringillidés": "#15803d",
  "Hirundinidés": "#0e7490",
  "Motacillidés": "#475569",
  "Sylviidés": "#be185d",
  "Corvidés": "#1e293b",
  "Accipitridés": "#b91c1c",
  "Falconidés": "#92400e",
  "Strigidés": "#4a044e",
  "Tytonidés": "#134e4a",
  "Anatidés": "#1e40af",
  "Ardéidés": "#166534",
  "Laridés": "#075985",
  "Picidés": "#3f6212",
  "Columbidés": "#713f12",
  "Ciconiidés": "#881337",
  "Alcédinidés": "#0c4a6e",
};

const DEFAULT_COLOR = "#44403c";

export default function ApprendreScreen() {
  const [query, setQuery] = useState("");
  const [openFamilies, setOpenFamilies] = useState<Set<string>>(new Set());
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        loadProgress(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserId(session.user.id);
        loadProgress(session.user.id);
      } else {
        setUserId(null);
        setSeenIds(new Set());
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProgress = async (uid: string) => {
    const { data } = await supabase
      .from("bird_progress")
      .select("bird_id")
      .eq("user_id", uid);
    if (data) setSeenIds(new Set(data.map((r) => r.bird_id)));
  };

  const toggleFamily = useCallback((famille: string) => {
    setOpenFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(famille)) next.delete(famille);
      else next.add(famille);
      return next;
    });
  }, []);

  const filteredBirds = query.trim().length > 0 ? searchBirds(query) : allBirds;
  const groups: FamilyGroup[] = groupByFamily(filteredBirds);
  // En mode recherche, tout ouvrir automatiquement
  const effectiveOpen = query.trim().length > 0
    ? new Set(groups.map((g) => g.famille))
    : openFamilies;

  return (
    <View className="flex-1 bg-stone-900">
      {/* Header */}
      <View className="pt-14 pb-3 px-4 flex-row items-center gap-3 border-b border-stone-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Text className="text-amber-500 text-lg">‹</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">Mode Apprentissage</Text>
        <Text className="text-stone-500 text-sm">{allBirds.length} espèces</Text>
      </View>

      {/* Barre de recherche */}
      <View className="px-4 py-3">
        <View className="bg-stone-800 rounded-xl flex-row items-center px-3 gap-2">
          <Text className="text-stone-400 text-base">🔍</Text>
          <TextInput
            className="flex-1 text-white py-2.5 text-sm"
            placeholder="Rechercher un oiseau..."
            placeholderTextColor="#78716c"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Text className="text-stone-400 text-base">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Liste des familles */}
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {groups.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-stone-500 text-base">Aucun oiseau trouvé</Text>
          </View>
        ) : (
          groups.map((group) => {
            const isOpen = effectiveOpen.has(group.famille);
            const progress = userId ? familyProgress(group.famille, seenIds) : null;
            const color = FAMILY_COLORS[group.famille] ?? DEFAULT_COLOR;

            return (
              <View key={group.famille} className="border-b border-stone-800">
                {/* Header famille */}
                <TouchableOpacity
                  className="flex-row items-center px-4 py-3 gap-3"
                  onPress={() => toggleFamily(group.famille)}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-8 h-8 rounded-lg items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Text className="text-white text-xs font-bold">
                      {group.famille.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-sm">{group.famille}</Text>
                    <Text className="text-stone-500 text-xs">
                      {group.birds.length} espèce{group.birds.length > 1 ? "s" : ""}
                      {progress !== null ? ` · ${progress}% découvert` : ""}
                    </Text>
                  </View>
                  <Text className="text-stone-500 text-lg">
                    {isOpen ? "∨" : "›"}
                  </Text>
                </TouchableOpacity>

                {/* Liste oiseaux */}
                {isOpen && (
                  <View className="bg-stone-950/50">
                    {group.birds.map((bird) => {
                      const isSeen = seenIds.has(bird.id);
                      return (
                        <TouchableOpacity
                          key={bird.id}
                          className="flex-row items-center px-4 py-3 gap-3 border-t border-stone-800/50"
                          onPress={() => router.push(`/apprendre/${bird.id}`)}
                          activeOpacity={0.7}
                        >
                          <View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: color + "33" }}
                          >
                            <Text className="text-xs font-bold" style={{ color }}>
                              {bird.nomFr.charAt(0)}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-white text-sm font-medium">{bird.nomFr}</Text>
                            <Text className="text-stone-500 text-xs italic">{bird.nomSci}</Text>
                          </View>
                          {isSeen && (
                            <View className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
cd /Users/I531480/SAPDevelop/git/canari
git add app/apprendre/index.tsx
git commit -m "feat: build learning mode list with family accordions and search"
```

---

### Task 3 : Construire la fiche détail oiseau (`app/apprendre/[id].tsx`)

**Files:**
- Create: `app/apprendre/[id].tsx`

Cet écran :
1. Récupère `id` depuis les params de route
2. Charge l'oiseau depuis `lib/birds.ts` (getBirdById)
3. Affiche la grande photo, le nom FR (gras), nom scientifique (italique), famille + ordre, stats (taille / envergure / poids), habitats (badges), statut, description, anecdote
4. Si connecté : marque automatiquement l'oiseau comme "vu" dans `bird_progress` (upsert)

- [ ] **Step 1 : Créer `app/apprendre/[id].tsx`**

```tsx
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getBirdById } from "@/lib/birds";
import type { Bird } from "@/lib/types";

const STATUT_COLOR: Record<string, string> = {
  "Sédentaire": "#16a34a",
  "Migrateur": "#2563eb",
  "Hivernant": "#7c3aed",
  "Estivant": "#d97706",
  "Erratique": "#dc2626",
};

export default function BirdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bird: Bird | undefined = getBirdById(id);
  const [isSeen, setIsSeen] = useState(false);

  useEffect(() => {
    if (!bird) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      markAsSeen(session.user.id, bird.id);
    });
  }, [bird?.id]);

  const markAsSeen = async (userId: string, birdId: string) => {
    const { error } = await supabase.from("bird_progress").upsert(
      { user_id: userId, bird_id: birdId },
      { onConflict: "user_id,bird_id" }
    );
    if (!error) setIsSeen(true);
  };

  if (!bird) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-900">
        <Text className="text-stone-400 text-base">Oiseau introuvable</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-amber-500">← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statutColor = STATUT_COLOR[bird.statut] ?? "#78716c";

  return (
    <View className="flex-1 bg-stone-900">
      {/* Bouton retour flottant */}
      <TouchableOpacity
        className="absolute top-14 left-4 z-10 bg-stone-900/80 rounded-full w-10 h-10 items-center justify-center"
        onPress={() => router.back()}
      >
        <Text className="text-white text-lg">‹</Text>
      </TouchableOpacity>

      {/* Indicateur vu (coin haut droit) */}
      {isSeen && (
        <View className="absolute top-14 right-4 z-10 bg-emerald-500/90 rounded-full px-3 py-1">
          <Text className="text-white text-xs font-semibold">✓ Vu</Text>
        </View>
      )}

      <ScrollView className="flex-1" bounces={false}>
        {/* Grande photo */}
        <Image
          source={{ uri: bird.imageUrl }}
          className="w-full"
          style={{ height: 300 }}
          resizeMode="cover"
        />

        {/* Contenu */}
        <View className="px-4 pt-5 pb-10">
          {/* Nom français + scientifique */}
          <Text className="text-white text-3xl font-black leading-tight">
            {bird.nomFr}
          </Text>
          <Text className="text-stone-400 text-base italic mt-0.5 mb-3">
            {bird.nomSci}
          </Text>

          {/* Famille + Ordre */}
          <View className="flex-row gap-2 mb-4 flex-wrap">
            <View className="bg-stone-800 rounded-lg px-3 py-1.5">
              <Text className="text-stone-300 text-xs">
                <Text className="text-stone-500">Famille · </Text>
                {bird.famille}
              </Text>
            </View>
            <View className="bg-stone-800 rounded-lg px-3 py-1.5">
              <Text className="text-stone-300 text-xs">
                <Text className="text-stone-500">Ordre · </Text>
                {bird.ordre}
              </Text>
            </View>
          </View>

          {/* Stats chips */}
          <View className="flex-row gap-3 mb-4 flex-wrap">
            <StatChip label="Taille" value={bird.taille} />
            <StatChip label="Envergure" value={bird.envergure} />
            <StatChip label="Poids" value={bird.poids} />
          </View>

          {/* Statut */}
          <View
            className="self-start rounded-full px-3 py-1 mb-4"
            style={{ backgroundColor: statutColor + "22", borderColor: statutColor + "55", borderWidth: 1 }}
          >
            <Text className="text-xs font-semibold" style={{ color: statutColor }}>
              {bird.statut}
            </Text>
          </View>

          {/* Habitats */}
          <View className="flex-row flex-wrap gap-2 mb-5">
            {bird.habitat.map((h) => (
              <View key={h} className="bg-stone-800 rounded-full px-3 py-1">
                <Text className="text-stone-300 text-xs">{h}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text className="text-stone-300 text-sm leading-6 mb-5">
            {bird.description}
          </Text>

          {/* Anecdote */}
          <View className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4">
            <Text className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-2">
              Le saviez-vous ?
            </Text>
            <Text className="text-stone-300 text-sm leading-6 italic">
              {bird.anecdote}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-stone-800 rounded-xl px-3 py-2 items-center min-w-[80px]">
      <Text className="text-stone-500 text-[10px] uppercase tracking-wide mb-0.5">{label}</Text>
      <Text className="text-white text-sm font-semibold">{value}</Text>
    </View>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
cd /Users/I531480/SAPDevelop/git/canari
git add app/apprendre/[id].tsx
git commit -m "feat: build bird detail screen with stats, habitats and auto-seen marking"
```

---

### Self-Review

Après avoir écrit ce plan, voici la vérification contre la spec :

**Spec coverage :**
- ✅ Barre de recherche filtrant nomFr et nomSci
- ✅ Liste des familles en accordéons (header famille + tap → ouvre la liste)
- ✅ Header famille : icône (lettre colorée), nom, nombre espèces, % découvert (si connecté)
- ✅ Chaque ligne oiseau : miniature colorée, nom FR, nom sci, indicateur vu/non vu (point vert)
- ✅ Tri alphabétique par défaut dans chaque famille (géré dans `groupByFamily`)
- ✅ Grande photo Wikipedia Commons en haut (plein largeur)
- ✅ Nom français (grand, gras) + nom scientifique (italique, gris)
- ✅ Famille et ordre
- ✅ Stats sous forme de chips : taille, envergure, poids
- ✅ Habitats sous forme de badges colorés
- ✅ Statut (Sédentaire, Migrateur, etc.) avec couleur indicative
- ✅ Description paragraphe
- ✅ Anecdote mise en avant (fond jaune subtil)
- ✅ Marqué automatiquement "vu" à l'ouverture (si connecté → enregistré dans `bird_progress`)

**Placeholder scan :** Aucun TBD, TODO, ou description vague sans code. ✅

**Type consistency :** `FamilyGroup` est défini dans `lib/birds.ts` Task 1 et importé dans Task 2. `getBirdById` défini Task 1, utilisé Task 3. `Bird` vient de `lib/types.ts` (déjà existant). ✅
