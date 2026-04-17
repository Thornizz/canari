import birdsData from "@/data/birds.json";
import type { Bird } from "@/lib/types";

export const allBirds: Bird[] = birdsData as Bird[];

/** Retourne la liste triée alphabétiquement par nomFr */
export function getSortedBirds(): Bird[] {
  return [...allBirds].sort((a, b) => a.nomFr.localeCompare(b.nomFr, "fr"));
}

/** Retourne les oiseaux filtrés par recherche (nomFr ou nomSci, insensible à la casse et aux accents) */
export function searchBirds(query: string): Bird[] {
  const q = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return allBirds.filter((bird) => {
    const fr = bird.nomFr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const sci = bird.nomSci.toLowerCase();
    return fr.includes(q) || sci.includes(q);
  });
}

export interface FamilyGroup {
  famille: string;
  birds: Bird[];
}

/** Groupe les oiseaux par famille, chaque groupe trié alphabétiquement. Familles triées alphabétiquement. */
export function groupByFamily(birds: Bird[]): FamilyGroup[] {
  const map = new Map<string, Bird[]>();
  for (const bird of birds) {
    if (!map.has(bird.famille)) map.set(bird.famille, []);
    map.get(bird.famille)!.push(bird);
  }
  return Array.from(map.entries())
    .map(([famille, birds]) => ({
      famille,
      birds: birds.sort((a, b) => a.nomFr.localeCompare(b.nomFr, "fr")),
    }))
    .sort((a, b) => a.famille.localeCompare(b.famille, "fr"));
}

/** Calcule le pourcentage d'oiseaux vus dans une famille (0–100, arrondi) */
export function familyProgress(famille: string, seenIds: Set<string>): number {
  const total = allBirds.filter((b) => b.famille === famille).length;
  if (total === 0) return 0;
  const seen = allBirds.filter((b) => b.famille === famille && seenIds.has(b.id)).length;
  return Math.round((seen / total) * 100);
}

/** Trouve un oiseau par son id. Retourne undefined si non trouvé. */
export function getBirdById(id: string): Bird | undefined {
  return allBirds.find((b) => b.id === id);
}
