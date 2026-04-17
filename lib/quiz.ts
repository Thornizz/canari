import { allBirds } from "@/lib/birds";
import type { QuizQuestion } from "@/lib/types";

export const QUIZ_TOTAL = 10;

/** Mélange un tableau en place (Fisher-Yates) et le retourne */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Génère 10 questions de quiz.
 * Pour chaque oiseau tiré : 3 distracteurs choisis en priorité dans la même famille,
 * complétés par des oiseaux d'autres familles si nécessaire.
 */
export function generateQuiz(): QuizQuestion[] {
  const selected = shuffle(allBirds).slice(0, QUIZ_TOTAL);

  return selected.map((bird): QuizQuestion => {
    const sameFamily = allBirds.filter(
      (b) => b.famille === bird.famille && b.id !== bird.id
    );
    const otherBirds = allBirds.filter((b) => b.famille !== bird.famille);
    const distractorPool = shuffle([...sameFamily, ...otherBirds]);
    const distractors = distractorPool.slice(0, 3);

    // Insère l'oiseau correct à une position aléatoire dans les 4 choix
    const correctIndex = Math.floor(Math.random() * 4);
    const choices = [...distractors];
    choices.splice(correctIndex, 0, bird);

    return { bird, choices, correctIndex };
  });
}
