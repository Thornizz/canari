import type { QuizQuestion, QuizResult } from "@/lib/types";

let _questions: QuizQuestion[] = [];
let _results: QuizResult[] = [];

export const quizSession = {
  /** Démarre une nouvelle session avec les questions générées */
  start(questions: QuizQuestion[]): void {
    _questions = questions;
    _results = [];
  },

  /** Retourne la question à l'index donné, ou undefined si hors limites */
  getQuestion(index: number): QuizQuestion | undefined {
    return _questions[index];
  },

  /** Enregistre le résultat d'une question */
  recordResult(result: QuizResult): void {
    _results.push(result);
  },

  /** Retourne une copie des résultats enregistrés */
  getResults(): QuizResult[] {
    return [..._results];
  },

  totalQuestions(): number {
    return _questions.length;
  },
};
