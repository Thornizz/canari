import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { generateQuiz } from "@/lib/quiz";
import { quizSession } from "@/lib/quizSession";

export default function QuizIndexScreen() {
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        loadBestScore(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserId(session.user.id);
        loadBestScore(session.user.id);
      } else {
        setUserId(null);
        setBestScore(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadBestScore = async (uid: string) => {
    const { data } = await supabase
      .from("quiz_scores")
      .select("score")
      .eq("user_id", uid)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setBestScore(data.score);
  };

  const handleStart = () => {
    const questions = generateQuiz();
    quizSession.start(questions);
    router.push("/quiz/0");
  };

  return (
    <View className="flex-1 bg-stone-900">
      {/* Header */}
      <View className="pt-14 pb-3 px-4 flex-row items-center gap-3 border-b border-stone-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Text className="text-amber-500 text-lg">‹</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">Mode Quiz</Text>
      </View>

      {/* Contenu centré */}
      <View className="flex-1 items-center justify-center px-6 gap-6">
        {/* Icône */}
        <Text className="text-7xl">🎯</Text>

        {/* Description */}
        <View className="items-center gap-2">
          <Text className="text-white text-2xl font-bold text-center">
            Teste tes connaissances
          </Text>
          <Text className="text-stone-400 text-base text-center">
            10 questions · 15 secondes par question
          </Text>
          <Text className="text-stone-500 text-sm text-center">
            4 propositions, 1 seule bonne réponse
          </Text>
        </View>

        {/* Meilleur score */}
        {bestScore !== null && (
          <View className="bg-amber-500/10 border border-amber-500/25 rounded-2xl px-8 py-4 items-center">
            <Text className="text-amber-400 text-xs uppercase tracking-widest mb-1">
              Ton meilleur score
            </Text>
            <Text className="text-white text-4xl font-black">
              {bestScore}
              <Text className="text-stone-400 text-xl font-normal">/10</Text>
            </Text>
          </View>
        )}

        {/* Bouton Commencer */}
        <TouchableOpacity
          className="bg-amber-500 rounded-2xl px-12 py-4 w-full items-center"
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text className="text-stone-900 text-xl font-black">Commencer</Text>
        </TouchableOpacity>

        {!userId && (
          <Text className="text-stone-600 text-xs text-center">
            Connecte-toi pour sauvegarder ton score
          </Text>
        )}
      </View>
    </View>
  );
}
