/** Thèmes de questions (le Joker n'en est pas un : il permet d'en choisir un). */
export const THEME_IDS = ['bases', 'groupes', 'association', 'vraiFaux', 'voyage'] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export type SegmentId = ThemeId | 'joker';

export interface Reponse {
  texte: string;
  correcte: boolean;
}

export interface Question {
  id: string;
  themeId: ThemeId;
  question: string;
  reponses: Reponse[];
  explication: string;
  aValider: boolean;
}

/** Générateur aléatoire injecté : renvoie un nombre dans [0, 1). */
export type Rng = () => number;

export type Verdict = 'bonne' | 'presque';

/** Identifiants des questions déjà posées dans le cycle en cours, par thème. */
export type Historique = Partial<Record<ThemeId, string[]>>;

/** Résultat d'un choix de question : la question et le nouvel historique du thème. */
export interface TirageQuestion {
  question: Question;
  posees: string[];
}
