import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { quizSession } from "@/lib/quizSession";
import { generateQuiz, QUIZ_TOTAL } from "@/lib/quiz";
import { updateStreak } from "@/lib/streak";
import { checkNewBadges, BADGE_DEFINITIONS } from "@/lib/badges";
import type { QuizResult, BadgeKey, BadgeDefinition } from "@/lib/types";

function getScoreColor(score: number): string {
  if (score >= 8) return "#f59e0b";
  if (score >= 5) return "#3b82f6";
  return "#ef4444";
}

export default function QuizResultatsScreen() {
  const results: QuizResult[] = quizSession.getResults();
  const score = results.filter((r) => r.correct).length;

  const [streak, setStreak] = useState(0);
  const [newBadges, setNewBadges] = useState<BadgeDefinition[]>([]);

  // Redirect if no session data — keep hooks unconditional, guard after
  useEffect(() => {
    if (results.length === 0) router.replace("/quiz");
  }, []);

  useEffect(() => {
    if (results.length === 0) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) saveResults(session.user.id);
    }).catch((e) => console.error("[QuizResultats] getSession:", e));
  }, []);

  const saveResults = async (userId: string) => {
    try {
      // 1. Save score
      const { error: scoreError } = await supabase.from("quiz_scores").insert({ user_id: userId, score });
      if (scoreError) console.error("[QuizResultats] save score:", scoreError);

      // 2. Update streak
      const { newStreak } = await updateStreak(userId, supabase);
      setStreak(newStreak);

      // 3. Fetch data for badge check
      const [badgesRes, progressRes] = await Promise.all([
        supabase.from("badges").select("badge_key").eq("user_id", userId),
        supabase.from("bird_progress").select("bird_id").eq("user_id", userId),
      ]);

      const earnedKeys = (badgesRes.data ?? []).map((b) => b.badge_key as BadgeKey);
      const seenBirdIds = (progressRes.data ?? []).map((p) => p.bird_id as string);
      // isFirstQuiz: true only if the premier_quiz badge was never earned
      const isFirstQuiz = !earnedKeys.includes("premier_quiz");

      // 4. Check new badges
      const newKeys = checkNewBadges({ score, streak: newStreak, seenBirdIds, earnedKeys, isFirstQuiz });

      // 5. Insert new badges
      if (newKeys.length > 0) {
        const { error: badgeError } = await supabase.from("badges").insert(
          newKeys.map((badge_key) => ({ user_id: userId, badge_key }))
        );
        if (!badgeError) {
          const defs = newKeys
            .map((key) => BADGE_DEFINITIONS.find((d) => d.key === key))
            .filter((d): d is BadgeDefinition => d !== undefined);
          setNewBadges(defs);
        }
      }
    } catch (e) {
      console.error("[QuizResultats] saveResults:", e);
    }
  };

  // Prevent flash while the redirect effect fires
  if (results.length === 0) return null;

  const scoreColor = getScoreColor(score);

  return (
    <ScrollView className="flex-1 bg-stone-900" bounces={false}>
      {/* Score header */}
      <View
        className="pt-16 pb-8 px-6 items-center"
        style={{ backgroundColor: scoreColor + "22" }}
      >
        <Text className="text-stone-400 text-xs uppercase tracking-widest mb-2">
          Score final
        </Text>
        <View className="flex-row items-end gap-1 mb-3">
          <Text
            className="font-black"
            style={{ fontSize: 80, lineHeight: 88, color: scoreColor }}
          >
            {score}
          </Text>
          <Text className="text-stone-400 text-2xl mb-4">/{QUIZ_TOTAL}</Text>
        </View>
        {streak > 1 && (
          <View className="bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-1.5">
            <Text className="text-amber-400 text-sm font-semibold">
              🔥 Série de {streak} jours !
            </Text>
          </View>
        )}
      </View>

      <View className="px-4 pt-4 pb-10 gap-4">
        {/* New badges */}
        {newBadges.length > 0 && (
          <View className="bg-stone-800 border border-amber-500/30 rounded-2xl p-4 gap-3">
            <Text className="text-amber-400 text-xs uppercase tracking-widest font-semibold">
              Badge{newBadges.length > 1 ? "s" : ""} débloqué{newBadges.length > 1 ? "s" : ""} !
            </Text>
            {newBadges.map((badge) => (
              <View key={badge.key} className="flex-row items-center gap-3">
                <Text className="text-4xl">{badge.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">{badge.label}</Text>
                  <Text className="text-stone-400 text-xs">{badge.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recap */}
        <View className="gap-2">
          <Text className="text-stone-400 text-xs uppercase tracking-widest font-semibold mb-1">
            Récapitulatif
          </Text>
          {results.map((result) => (
            <View
              key={result.question.bird.id}
              className="flex-row items-center justify-between bg-stone-800 rounded-xl px-4 py-3"
            >
              <View className="flex-1">
                <Text className="text-white text-sm font-medium">
                  {result.question.bird.nomFr}
                </Text>
                {!result.correct && result.selectedIndex !== null && (
                  <Text className="text-stone-500 text-xs">
                    Répondu : {result.question.choices[result.selectedIndex].nomFr}
                  </Text>
                )}
                {!result.correct && result.selectedIndex === null && (
                  <Text className="text-stone-500 text-xs">Temps écoulé</Text>
                )}
              </View>
              <Text
                className={`text-lg font-bold ${result.correct ? "text-emerald-400" : "text-red-400"}`}
              >
                {result.correct ? "✓" : "✗"}
              </Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3 mt-2">
          <TouchableOpacity
            className="flex-1 bg-amber-500 rounded-2xl py-4 items-center"
            onPress={() => {
              const questions = generateQuiz();
              quizSession.start(questions);
              router.replace("/quiz/0");
            }}
            activeOpacity={0.85}
          >
            <Text className="text-stone-900 font-black text-base">🎯 Rejouer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-stone-800 border border-stone-700 rounded-2xl py-4 items-center"
            onPress={() => router.push("/classement")}
            activeOpacity={0.85}
          >
            <Text className="text-white font-semibold text-base">🏆 Classement</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
