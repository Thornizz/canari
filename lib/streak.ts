import type { SupabaseClient } from "@supabase/supabase-js";

export interface StreakResult {
  newStreak: number;
  previousStreak: number;
  wasUpdatedToday: boolean;
}

/**
 * Met à jour le streak de l'utilisateur dans Supabase.
 * Règles :
 *   - Déjà joué aujourd'hui → pas de changement
 *   - Joué hier → streak + 1
 *   - Sinon (jour sauté) → streak remis à 1
 */
export async function updateStreak(
  userId: string,
  supabase: SupabaseClient
): Promise<StreakResult> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, last_played_date")
    .eq("id", userId)
    .single();

  if (!profile) return { newStreak: 1, previousStreak: 0, wasUpdatedToday: false };

  // Dates comparées en UTC — cohérent avec le stockage Supabase (type `date` PostgreSQL)
  const today = new Date().toISOString().split("T")[0];
  const previousStreak = profile.streak_count ?? 0;

  if (profile.last_played_date === today) {
    return { newStreak: previousStreak, previousStreak, wasUpdatedToday: true };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const newStreak =
    profile.last_played_date === yesterdayStr ? previousStreak + 1 : 1;

  const { error } = await supabase
    .from("profiles")
    .update({ streak_count: newStreak, last_played_date: today })
    .eq("id", userId);

  if (error) return { newStreak: previousStreak, previousStreak, wasUpdatedToday: false };

  return { newStreak, previousStreak, wasUpdatedToday: false };
}
