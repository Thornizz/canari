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

function getMedalEmoji(rank: number): string | null {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

function getScoreTextClass(isMe: boolean, isTop3: boolean): string {
  if (isMe) return "text-amber-400";
  if (isTop3) return "text-amber-300";
  return "text-white";
}

export default function ClassementScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEntry, setCurrentUserEntry] = useState<(LeaderboardEntry & { rank: number }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user.id ?? null;
      setCurrentUserId(uid);
      loadLeaderboard(uid);
    }).catch(() => loadLeaderboard(null));
  }, []);

  const loadLeaderboard = async (uid: string | null) => {
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
        const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        const username =
          p !== null && typeof p === "object" && "username" in p
            ? String((p as { username: unknown }).username)
            : "Anonyme";
        deduped.push({
          userId: row.user_id,
          username,
          bestScore: row.score,
          lastPlayed: row.played_at,
        });
      }

      setEntries(deduped.slice(0, 20));

      if (uid) {
        const userIndex = deduped.findIndex((e) => e.userId === uid);
        if (userIndex >= 20) {
          setCurrentUserEntry({ ...deduped[userIndex], rank: userIndex + 1 });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  function renderBody() {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#f59e0b" size="large" />
        </View>
      );
    }

    if (entries.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">🏆</Text>
          <Text className="text-white text-lg font-semibold text-center mb-2">
            Aucun score pour l'instant
          </Text>
          <Text className="text-stone-400 text-sm text-center">
            Joue un quiz pour apparaître dans le classement !
          </Text>
        </View>
      );
    }

    return (
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
          const medalEmoji = getMedalEmoji(rank);
          const scoreClass = getScoreTextClass(isMe, isTop3);
          const rankTextClass = isMe ? "text-amber-400" : "text-stone-500";
          const nameClass = isMe ? "text-amber-400" : "text-white";
          const rowClass = isMe
            ? "flex-row items-center px-4 py-3 border-b border-stone-800/60 bg-amber-500/10"
            : "flex-row items-center px-4 py-3 border-b border-stone-800/60";

          return (
            <View key={entry.userId} className={rowClass}>
              <View className="w-10 items-center">
                {medalEmoji ? (
                  <Text className="text-base">{medalEmoji}</Text>
                ) : (
                  <Text className={`text-sm font-bold ${rankTextClass}`}>{rank}</Text>
                )}
              </View>
              <View className="flex-1 ml-2">
                <Text className={`text-sm font-semibold ${nameClass}`} numberOfLines={1}>
                  {entry.username}{isMe ? " (moi)" : ""}
                </Text>
              </View>
              <View className="w-14 items-end">
                <Text className={`text-sm font-black ${scoreClass}`}>
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
    );
  }

  return (
    <View className="flex-1 bg-stone-900">
      <View className="pt-14 pb-3 px-4 flex-row items-center gap-3 border-b border-stone-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Text className="text-amber-500 text-lg">‹</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">Classement</Text>
        <Text className="text-stone-500 text-sm">Top 20</Text>
      </View>

      {renderBody()}
    </View>
  );
}
