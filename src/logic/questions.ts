import type { Question, Rng, TirageQuestion } from '../domain/types';
import { entierAleatoire } from './aleatoire';

/**
 * Choisit une question pas encore posée dans le thème.
 * Quand le thème est épuisé, le cycle recommence (en évitant de reposer la dernière question).
 * Renvoie null si le thème ne contient aucune question.
 */
export function choisirQuestion(
  pool: readonly Question[],
  posees: readonly string[],
  rng: Rng,
): TirageQuestion | null {
  if (pool.length === 0) return null;

  let disponibles = pool.filter((q) => !posees.includes(q.id));
  let historique: string[] = [...posees];

  if (disponibles.length === 0) {
    const derniere = posees[posees.length - 1];
    disponibles = pool.length > 1 ? pool.filter((q) => q.id !== derniere) : [...pool];
    historique = [];
  }

  const question = disponibles[entierAleatoire(disponibles.length, rng)];
  return { question, posees: [...historique, question.id] };
}

/** Vérifie la structure d'une question (2 à 4 réponses, une seule correcte). */
export function estQuestionValide(q: unknown): q is Question {
  if (typeof q !== 'object' || q === null) return false;
  const o = q as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.themeId !== 'string') return false;
  if (typeof o.question !== 'string' || o.question.trim() === '') return false;
  if (typeof o.explication !== 'string' || o.explication.trim() === '') return false;
  if (typeof o.aValider !== 'boolean') return false;
  if (!Array.isArray(o.reponses) || o.reponses.length < 2 || o.reponses.length > 4) return false;
  const reponsesOk = o.reponses.every(
    (r: unknown) =>
      typeof r === 'object' &&
      r !== null &&
      typeof (r as Record<string, unknown>).texte === 'string' &&
      typeof (r as Record<string, unknown>).correcte === 'boolean',
  );
  if (!reponsesOk) return false;
  return (o.reponses as { correcte: boolean }[]).filter((r) => r.correcte).length === 1;
}
