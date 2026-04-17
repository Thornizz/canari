import { allBirds } from "@/lib/birds";
import type { BadgeKey, BadgeDefinition } from "@/lib/types";

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { key: "premier_quiz",    label: "Premier envol",          description: "1er quiz complété",                   emoji: "🐣" },
  { key: "score_parfait",   label: "Ornithologue parfait",   description: "Score 10/10",                         emoji: "🎯" },
  { key: "streak_3",        label: "3 jours de suite",       description: "Streak ≥ 3 jours",                   emoji: "🔥" },
  { key: "streak_7",        label: "Une semaine !",          description: "Streak ≥ 7 jours",                   emoji: "🔥🔥" },
  { key: "streak_30",       label: "Passionné",              description: "Streak ≥ 30 jours",                  emoji: "🏆" },
  { key: "score_7",         label: "Apprenti ornithologue",  description: "Score ≥ 7 pour la 1ère fois",        emoji: "🏅" },
  { key: "oiseaux_50",      label: "Explorateur",            description: "50 oiseaux vus",                     emoji: "🌿" },
  { key: "oiseaux_100",     label: "Grand explorateur",      description: "100 oiseaux vus",                    emoji: "🌍" },
  { key: "famille_complete",label: "Expert famille",         description: "Tous les oiseaux d'une famille vus", emoji: "⭐" },
];

export interface BadgeCheckParams {
  score: number;
  streak: number;
  seenBirdIds: string[];
  earnedKeys: BadgeKey[];
  isFirstQuiz: boolean;
}

/** Retourne les clés des badges nouvellement débloqués (pas encore dans earnedKeys) */
export function checkNewBadges(params: BadgeCheckParams): BadgeKey[] {
  const { score, streak, seenBirdIds, earnedKeys, isFirstQuiz } = params;
  const earned = new Set(earnedKeys);
  const newBadges: BadgeKey[] = [];

  const earn = (key: BadgeKey) => {
    if (!earned.has(key)) {
      newBadges.push(key);
      earned.add(key);
    }
  };

  if (isFirstQuiz)      earn("premier_quiz");
  if (score === 10)     earn("score_parfait");
  if (score >= 7)       earn("score_7");
  if (streak >= 3)      earn("streak_3");
  if (streak >= 7)      earn("streak_7");
  if (streak >= 30)     earn("streak_30");
  if (seenBirdIds.length >= 50)  earn("oiseaux_50");
  if (seenBirdIds.length >= 100) earn("oiseaux_100");

  const seenSet = new Set(seenBirdIds);
  const families = [...new Set(allBirds.map((b) => b.famille))];
  const hasCompleteFamily = families.some((famille) =>
    allBirds.filter((b) => b.famille === famille).every((b) => seenSet.has(b.id))
  );
  if (hasCompleteFamily) earn("famille_complete");

  return newBadges;
}
