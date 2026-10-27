import type { Question, Rng, ThemeId } from '../domain/types';

/** Rng déterministe qui renvoie les valeurs données en boucle. */
export const rngSequence = (...valeurs: number[]): Rng => {
  let i = 0;
  return () => valeurs[i++ % valeurs.length];
};

export const fabriquerQuestion = (id: string, themeId: ThemeId = 'bases'): Question => ({
  id,
  themeId,
  question: `Question ${id}`,
  reponses: [
    { texte: 'A', correcte: true },
    { texte: 'B', correcte: false },
  ],
  explication: 'Explication.',
  aValider: true,
});
