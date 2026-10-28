import { THEME_VRAI_FAUX } from '../config/content';
import type { Historique, Question, Rng, Theme, TirageQuestion } from '../domain/types';
import { entierAleatoire } from './aleatoire';

/**
 * Choisit une question du thème :
 * - jamais une question déjà posée dans la partie en cours ;
 * - pas de répétition sur la journée tant que le thème n'est pas épuisé.
 * Thème épuisé : un nouveau cycle commence (sans reposer la dernière question).
 * Renvoie null si aucune question n'est possible.
 */
export function choisirQuestion(
  pool: readonly Question[],
  poseesJour: readonly string[],
  poseesPartie: readonly string[],
  rng: Rng,
): TirageQuestion | null {
  const horsPartie = pool.filter((q) => !poseesPartie.includes(q.id));
  if (horsPartie.length === 0) return null;

  let disponibles = horsPartie.filter((q) => !poseesJour.includes(q.id));
  let historique: string[] = [...poseesJour];

  if (disponibles.length === 0) {
    const derniere = poseesJour[poseesJour.length - 1];
    disponibles = horsPartie.length > 1 ? horsPartie.filter((q) => q.id !== derniere) : [...horsPartie];
    historique = [];
  }

  const question = disponibles[entierAleatoire(disponibles.length, rng)];
  return { question, posees: [...historique, question.id] };
}

/** Mélange de Fisher-Yates (copie). */
export function melanger<T>(liste: readonly T[], rng: Rng): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = entierAleatoire(i + 1, rng);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

const rangVraiFaux = (texte: string) => (texte.trim().toLocaleLowerCase('fr') === 'vrai' ? 0 : 1);

/** Ordre d'affichage des réponses : mélangé, sauf pour le vrai-faux (Vrai puis Faux). Texte inchangé. */
export function ordonnerReponses(q: Question, rng: Rng): Question {
  const reponses =
    q.themeId === THEME_VRAI_FAUX
      ? [...q.reponses].sort((a, b) => rangVraiFaux(a.texte) - rangVraiFaux(b.texte))
      : melanger(q.reponses, rng);
  return { ...q, reponses };
}

/** Vérifie la structure d'une question (2 à 4 réponses, une seule correcte, explication non vide). */
export function estQuestionValide(q: unknown): q is Question {
  if (typeof q !== 'object' || q === null) return false;
  const o = q as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.themeId !== 'string') return false;
  if (typeof o.question !== 'string' || o.question.trim() === '') return false;
  if (typeof o.explication !== 'string' || o.explication.trim() === '') return false;
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

export function estThemeValide(t: unknown): t is Theme {
  if (typeof t !== 'object' || t === null) return false;
  const o = t as Record<string, unknown>;
  return [o.id, o.libelle, o.icone].every((v) => typeof v === 'string' && v.trim() !== '');
}

/* ---------- Historique du jour (persisté en local) ---------- */

export interface HistoriqueStocke {
  date: string;
  parTheme: Historique;
}

/** Date locale au format AAAA-MM-JJ (le forum se tient en heure locale). */
export function dateLocale(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Relit l'historique stocké de façon défensive ; vide s'il date d'un autre jour. */
export function historiqueDuJour(brut: unknown, date: string): Historique {
  if (typeof brut !== 'object' || brut === null) return {};
  const o = brut as Partial<HistoriqueStocke>;
  if (o.date !== date || typeof o.parTheme !== 'object' || o.parTheme === null) return {};
  const sortie: Historique = {};
  for (const [theme, ids] of Object.entries(o.parTheme)) {
    if (Array.isArray(ids)) sortie[theme] = ids.filter((id): id is string => typeof id === 'string');
  }
  return sortie;
}
