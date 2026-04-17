export interface Bird {
  id: string;
  nomFr: string;
  nomSci: string;
  famille: string;
  ordre: string;
  description: string;
  taille: string;
  envergure: string;
  poids: string;
  habitat: string[];
  statut: "Sédentaire" | "Migrateur" | "Hivernant" | "Estivant" | "Erratique";
  imageUrl: string;
  anecdote: string;
}

export interface Profile {
  id: string;
  username: string | null;
  streak_count: number;
  last_played_date: string | null;
  created_at: string;
}

export interface QuizScore {
  id: string;
  user_id: string;
  score: number;
  played_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_key: BadgeKey;
  earned_at: string;
}

export type BadgeKey =
  | "premier_quiz"
  | "score_parfait"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "score_7"
  | "oiseaux_50"
  | "oiseaux_100"
  | "famille_complete";

export interface BadgeDefinition {
  key: BadgeKey;
  label: string;
  description: string;
  emoji: string;
}

export interface QuizQuestion {
  bird: Bird;
  choices: Bird[];
  correctIndex: number;
}

export interface QuizResult {
  question: QuizQuestion;
  selectedIndex: number | null;
  correct: boolean;
}
