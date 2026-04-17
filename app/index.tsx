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
