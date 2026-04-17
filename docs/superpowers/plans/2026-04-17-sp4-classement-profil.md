# Canari — Sous-projet 4 : Classement + Profil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire les deux écrans finaux de l'app — `app/classement.tsx` (top 20 des meilleurs scores, ligne surlignée pour l'utilisateur connecté) et `app/profil.tsx` (avatar initiales, streak, grille de badges, historique 10 derniers quiz, bouton connexion/déconnexion).

**Architecture:** Deux écrans indépendants, chacun avec ses propres fetch Supabase au mount. Pas de lib partagée nécessaire. Le classement agrège les scores côté client (fetch 100 lignes, déduplication par user_id, top 20). Le profil fait 3 requêtes en parallèle (profile, badges, quiz_scores). L'auth dans le profil utilise `supabase.auth.signInWithPassword` + `signUp` avec un formulaire email/mot de passe inline, et `signOut` si déjà connecté.

**Tech Stack:** Expo SDK 54, Expo Router v4, NativeWind v4, Supabase (tables `quiz_scores`, `profiles`, `badges`), `BADGE_DEFINITIONS` depuis `lib/badges.ts`, types `Profile`, `QuizScore`, `Badge`, `BadgeKey`, `BadgeDefinition` depuis `lib/types.ts`

> **Note :** Pas de tests automatisés. La validation se fait visuellement via `npx expo start`.

---

## Fichiers créés / modifiés

| Fichier | Rôle |
|---------|------|
| `app/classement.tsx` | Remplacer le placeholder — top 20 + ligne surlignée |
| `app/profil.tsx` | Remplacer le placeholder — avatar, streak, badges, historique, auth |

---

### Task 1 : Écran Classement (`app/classement.tsx`)

**Files:**
- Modify: `app/classement.tsx` (remplacer le placeholder)

- [ ] **Step 1 : Écrire `app/classement.tsx`**

```tsx
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface LeaderboardEntry {
  userId: string;
  username: string;
  bestScore: number;
  lastPlayed: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export default function ClassementScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEntry, setCurrentUserEntry] = useState<(LeaderboardEntry & { rank: number }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user.id ?? null);
    });
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("quiz_scores")
        .select("score, played_at, user_id, profiles(username)")
        .order("score", { ascending: false })
        .limit(100);

      if (error || !data) return;

      const seen = new Set<string>();
      const deduped: LeaderboardEntry[] = [];
      for (const row of data) {
        if (seen.has(row.user_id)) continue;
        seen.add(row.user_id);
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        deduped.push({
          userId: row.user_id,
          username: (profile as { username: string } | null)?.username ?? "Anonyme",
          bestScore: row.score,
          lastPlayed: row.played_at,
        });
      }

      const top20 = deduped.slice(0, 20);
      setEntries(top20);

      supabase.auth.getSession().then(({ data: { session } }) => {
        const uid = session?.user.id;
        if (!uid) return;
        const userIndex = deduped.findIndex((e) => e.userId === uid);
        if (userIndex >= 20) {
          setCurrentUserEntry({ ...deduped[userIndex], rank: userIndex + 1 });
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-stone-900">
      <View className="pt-14 pb-3 px-4 flex-row items-center gap-3 border-b border-stone-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Text className="text-amber-500 text-lg">‹</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">Classement</Text>
        <Text className="text-stone-500 text-sm">Top 20</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#f59e0b" size="large" />
        </View>
      ) : entries.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">🏆</Text>
          <Text className="text-white text-lg font-semibold text-center mb-2">
            Aucun score pour l'instant
          </Text>
          <Text className="text-stone-400 text-sm text-center">
            Joue un quiz pour apparaître dans le classement !
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1" bounces={false}>
          <View className="flex-row px-4 pt-3 pb-2 border-b border-stone-800">
            <Text className="text-stone-500 text-xs w-10 text-center">#</Text>
            <Text className="text-stone-500 text-xs flex-1 ml-2">Joueur</Text>
            <Text className="text-stone-500 text-xs w-14 text-right">Score</Text>
            <Text className="text-stone-500 text-xs w-20 text-right">Date</Text>
          </View>

          {entries.map((entry, index) => {
            const rank = index + 1;
            const isMe = entry.userId === currentUserId;
            const isTop3 = rank <= 3;
            const medalEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

            return (
              <View
                key={entry.userId}
                className={`flex-row items-center px-4 py-3 border-b border-stone-800/60 ${isMe ? "bg-amber-500/10" : ""}`}
              >
                <View className="w-10 items-center">
                  {medalEmoji ? (
                    <Text className="text-base">{medalEmoji}</Text>
                  ) : (
                    <Text className={`text-sm font-bold ${isMe ? "text-amber-400" : "text-stone-500"}`}>
                      {rank}
                    </Text>
                  )}
                </View>
                <View className="flex-1 ml-2">
                  <Text
                    className={`text-sm font-semibold ${isMe ? "text-amber-400" : "text-white"}`}
                    numberOfLines={1}
                  >
                    {entry.username}{isMe ? " (moi)" : ""}
                  </Text>
                </View>
                <View className="w-14 items-end">
                  <Text className={`text-sm font-black ${isMe ? "text-amber-400" : isTop3 ? "text-amber-300" : "text-white"}`}>
                    {entry.bestScore}<Text className="text-stone-500 font-normal text-xs">/10</Text>
                  </Text>
                </View>
                <View className="w-20 items-end">
                  <Text className="text-stone-500 text-xs">{formatDate(entry.lastPlayed)}</Text>
                </View>
              </View>
            );
          })}

          {currentUserEntry && (
            <>
              <View className="py-2 items-center">
                <Text className="text-stone-600 text-xs">· · ·</Text>
              </View>
              <View className="flex-row items-center px-4 py-3 bg-amber-500/10 border border-amber-500/20 mx-4 rounded-xl mb-4">
                <View className="w-10 items-center">
                  <Text className="text-amber-400 text-sm font-bold">{currentUserEntry.rank}</Text>
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-amber-400 text-sm font-semibold" numberOfLines={1}>
                    {currentUserEntry.username} (moi)
                  </Text>
                </View>
                <View className="w-14 items-end">
                  <Text className="text-amber-400 text-sm font-black">
                    {currentUserEntry.bestScore}<Text className="text-stone-500 font-normal text-xs">/10</Text>
                  </Text>
                </View>
                <View className="w-20 items-end">
                  <Text className="text-stone-500 text-xs">{formatDate(currentUserEntry.lastPlayed)}</Text>
                </View>
              </View>
            </>
          )}

          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
cd /Users/I531480/SAPDevelop/git/canari
git add app/classement.tsx
git commit -m "feat: build leaderboard screen with top 20 and current user highlight"
```

---

### Task 2 : Écran Profil (`app/profil.tsx`)

**Files:**
- Modify: `app/profil.tsx` (remplacer le placeholder)

- [ ] **Step 1 : Écrire `app/profil.tsx`**

```tsx
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import type { Profile, Badge, QuizScore, BadgeKey } from "@/lib/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function getInitials(username: string | null): string {
  if (!username) return "?";
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password.trim()) {
      setError("Remplis tous les champs.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) setError("Email ou mot de passe incorrect.");
        else onSuccess();
      } else {
        const { error: authError } = await supabase.auth.signUp({ email: email.trim(), password });
        if (authError) {
          setError(authError.message);
        } else {
          setInfo("Compte créé ! Vérifie ton email pour confirmer, puis connecte-toi.");
          setMode("login");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View className="px-6 gap-6">
          <View className="items-center">
            <Text className="text-6xl mb-3">🐦</Text>
            <Text className="text-white text-2xl font-black text-center">
              {mode === "login" ? "Connexion" : "Créer un compte"}
            </Text>
            <Text className="text-stone-400 text-sm text-center mt-1">
              {mode === "login"
                ? "Connecte-toi pour sauvegarder ta progression"
                : "Rejoins la communauté Canari"}
            </Text>
          </View>

          <View className="gap-3">
            <View className="bg-stone-800 border border-stone-700 rounded-xl px-4 py-3">
              <TextInput
                className="text-white text-base"
                placeholder="Email"
                placeholderTextColor="#78716c"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
            <View className="bg-stone-800 border border-stone-700 rounded-xl px-4 py-3">
              <TextInput
                className="text-white text-base"
                placeholder="Mot de passe"
                placeholderTextColor="#78716c"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          </View>

          {error && (
            <View className="bg-red-900/40 border border-red-700/50 rounded-xl px-4 py-3">
              <Text className="text-red-300 text-sm text-center">{error}</Text>
            </View>
          )}
          {info && (
            <View className="bg-emerald-900/40 border border-emerald-700/50 rounded-xl px-4 py-3">
              <Text className="text-emerald-300 text-sm text-center">{info}</Text>
            </View>
          )}

          <TouchableOpacity
            className="bg-amber-500 rounded-2xl py-4 items-center"
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#1c1917" />
            ) : (
              <Text className="text-stone-900 font-black text-base">
                {mode === "login" ? "Se connecter" : "Créer le compte"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setInfo(null); }}
            className="items-center py-2"
          >
            <Text className="text-stone-400 text-sm">
              {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
              <Text className="text-amber-500 font-semibold">
                {mode === "login" ? "S'inscrire" : "Se connecter"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface ProfileData {
  profile: Profile | null;
  badges: Badge[];
  scores: QuizScore[];
  bestScore: number | null;
}

function ConnectedProfile({ userId, onSignOut }: { userId: string; onSignOut: () => void }) {
  const [data, setData] = useState<ProfileData>({ profile: null, badges: [], scores: [], bestScore: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfileData(); }, [userId]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [profileRes, badgesRes, scoresRes] = await Promise.all([
        supabase.from("profiles").select("id, username, streak_count, last_played_date, created_at").eq("id", userId).single(),
        supabase.from("badges").select("id, user_id, badge_key, earned_at").eq("user_id", userId),
        supabase.from("quiz_scores").select("id, user_id, score, played_at").eq("user_id", userId).order("played_at", { ascending: false }).limit(10),
      ]);

      const { data: bestScoreRow } = await supabase
        .from("quiz_scores").select("score").eq("user_id", userId).order("score", { ascending: false }).limit(1).maybeSingle();

      setData({
        profile: profileRes.data ?? null,
        badges: (badgesRes.data ?? []) as Badge[],
        scores: (scoresRes.data ?? []) as QuizScore[],
        bestScore: bestScoreRow?.score ?? null,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#f59e0b" size="large" />
      </View>
    );
  }

  const { profile, badges, scores, bestScore } = data;
  const earnedKeys = new Set(badges.map((b) => b.badge_key as BadgeKey));
  const username = profile?.username ?? "Utilisateur";
  const streak = profile?.streak_count ?? 0;

  return (
    <ScrollView className="flex-1" bounces={false}>
      <View className="items-center pt-8 pb-6 px-6 border-b border-stone-800">
        <View className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/40 items-center justify-center mb-3">
          <Text className="text-amber-400 text-2xl font-black">{getInitials(username)}</Text>
        </View>
        <Text className="text-white text-xl font-bold">{username}</Text>
        <Text className="text-stone-500 text-xs mt-1">
          Membre depuis {profile?.created_at ? formatDate(profile.created_at) : "–"}
        </Text>
      </View>

      <View className="px-4 pt-4 gap-5 pb-10">
        <View className="flex-row gap-3">
          <View className="flex-1 bg-stone-800 border border-stone-700 rounded-2xl p-4 items-center gap-1">
            <Text className="text-2xl">🔥</Text>
            <Text className="text-white text-2xl font-black">{streak}</Text>
            <Text className="text-stone-400 text-xs text-center">Série actuelle</Text>
          </View>
          <View className="flex-1 bg-stone-800 border border-stone-700 rounded-2xl p-4 items-center gap-1">
            <Text className="text-2xl">🏆</Text>
            <Text className="text-white text-2xl font-black">
              {bestScore !== null ? `${bestScore}/10` : "–"}
            </Text>
            <Text className="text-stone-400 text-xs text-center">Meilleur score</Text>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-stone-400 text-xs uppercase tracking-widest font-semibold">
            Badges ({badges.length}/{BADGE_DEFINITIONS.length})
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {BADGE_DEFINITIONS.map((def) => {
              const earned = earnedKeys.has(def.key);
              return (
                <View
                  key={def.key}
                  className={`w-[30%] rounded-2xl p-3 items-center gap-1 border ${
                    earned ? "bg-amber-500/10 border-amber-500/30" : "bg-stone-800 border-stone-700"
                  }`}
                >
                  <Text className="text-2xl" style={{ opacity: earned ? 1 : 0.25 }}>{def.emoji}</Text>
                  <Text
                    className={`text-xs font-semibold text-center leading-tight ${earned ? "text-amber-300" : "text-stone-600"}`}
                    numberOfLines={2}
                  >
                    {def.label}
                  </Text>
                  {earned && <Text className="text-amber-500/60 text-xs">✓</Text>}
                </View>
              );
            })}
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-stone-400 text-xs uppercase tracking-widest font-semibold">
            Derniers quiz
          </Text>
          {scores.length === 0 ? (
            <View className="bg-stone-800 border border-stone-700 rounded-2xl p-4 items-center">
              <Text className="text-stone-500 text-sm">Aucun quiz joué pour l'instant</Text>
            </View>
          ) : (
            <View className="gap-2">
              {scores.map((score) => {
                const scoreColor = score.score >= 8 ? "#f59e0b" : score.score >= 5 ? "#3b82f6" : "#ef4444";
                return (
                  <View
                    key={score.id}
                    className="flex-row items-center justify-between bg-stone-800 border border-stone-700/50 rounded-xl px-4 py-3"
                  >
                    <Text className="text-stone-400 text-sm">{formatDate(score.played_at)}</Text>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-base font-black" style={{ color: scoreColor }}>{score.score}</Text>
                      <Text className="text-stone-500 text-sm">/10</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <TouchableOpacity
          className="bg-stone-800 border border-stone-700 rounded-2xl py-4 items-center mt-2"
          onPress={async () => { await supabase.auth.signOut(); onSignOut(); }}
          activeOpacity={0.85}
        >
          <Text className="text-red-400 font-semibold text-base">Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function ProfilScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthChecked(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <View className="flex-1 bg-stone-900">
      <View className="pt-14 pb-3 px-4 flex-row items-center gap-3 border-b border-stone-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Text className="text-amber-500 text-lg">‹</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">Profil</Text>
      </View>

      {!authChecked ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#f59e0b" />
        </View>
      ) : session ? (
        <ConnectedProfile userId={session.user.id} onSignOut={() => setSession(null)} />
      ) : (
        <AuthForm onSuccess={() => {/* session updated via onAuthStateChange */}} />
      )}
    </View>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
cd /Users/I531480/SAPDevelop/git/canari
git add app/profil.tsx
git commit -m "feat: build profile screen with auth form, badges grid, streak and quiz history"
```

---

### Self-Review

**Classement — couverture spec :**
- ✅ Top 20 meilleurs scores (1 par utilisateur) : fetch 100 lignes, déduplication côté client, `slice(0, 20)`
- ✅ Chaque ligne : rang, username, score, date
- ✅ Ligne utilisateur connecté surlignée en amber si hors top 20
- ✅ Bouton retour header
- ✅ État vide géré
- ✅ Médailles 🥇🥈🥉 pour les 3 premiers

**Profil — couverture spec :**
- ✅ Avatar initiales par défaut dans un cercle amber
- ✅ Username + date d'inscription
- ✅ 🔥 Série actuelle + meilleur score all-time
- ✅ Grille de badges (grisés / colorés)
- ✅ Historique 10 derniers quiz avec couleur de score
- ✅ Formulaire email/mot de passe (login + signup) si non connecté
- ✅ Bouton "Se déconnecter" si connecté
- ✅ Bouton retour header

**Type consistency :**
- ✅ `Profile`, `Badge`, `QuizScore`, `BadgeKey` depuis `lib/types.ts`
- ✅ `BADGE_DEFINITIONS` depuis `lib/badges.ts`
- ✅ `Session` depuis `@supabase/supabase-js`
