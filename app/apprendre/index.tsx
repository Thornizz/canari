import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
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

  // Reload progress when navigating back from a bird detail screen
  useFocusEffect(
    useCallback(() => {
      if (userId) loadProgress(userId);
    }, [userId])
  );

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
                      {progress === null ? "" : ` · ${progress}% découvert`}
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
