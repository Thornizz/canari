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
      initSeen(session.user.id, bird.id);
    });
  }, [bird?.id]);

  const initSeen = async (userId: string, birdId: string) => {
    // Check if already seen (shows badge immediately for returning users)
    const { data } = await supabase
      .from("bird_progress")
      .select("bird_id")
      .eq("user_id", userId)
      .eq("bird_id", birdId)
      .maybeSingle();
    if (data) {
      setIsSeen(true);
      return;
    }
    // Not seen yet — record it
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
