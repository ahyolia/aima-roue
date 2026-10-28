/** Identifiant d'un thème, tel que défini dans assets/data/questions.json. */
export type ThemeId = string;

/** Le segment Joker n'est pas un thème : il permet d'en choisir un. */
export const JOKER = 'joker' as const;
export type SegmentId = ThemeId;

export interface Theme {
  id: ThemeId;
  libelle: string;
  /** Nom d'icône Ionicons. */
  icone: string;
}

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
}

/** Générateur aléatoire injecté : renvoie un nombre dans [0, 1). */
export type Rng = () => number;

export type Verdict = 'bonne' | 'presque';

/** Identifiants des questions déjà posées dans la journée (cycle en cours), par thème. */
export type Historique = Record<ThemeId, string[]>;

/** Résultat d'un choix de question : la question et le nouvel historique du thème. */
export interface TirageQuestion {
  question: Question;
  posees: string[];
}

/* ---------- Récompenses ---------- */

export type ObjetId = 'sticker' | 'stylo' | 'tshirt';
/** Objets dont le stock peut être épuisé (le sticker est toujours offert). */
export type ObjetEpuisable = Exclude<ObjetId, 'sticker'>;
export type Palier = 'merci' | 'bravo' | 'sansFaute';

export interface Recompense {
  palier: Palier;
  objets: ObjetId[];
  message: string;
}
