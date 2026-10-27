import type { Historique, Question, ThemeId, TirageQuestion, Verdict } from '../domain/types';

interface Base {
  /** Rotation absolue de la roue, en degrés (ne revient jamais en arrière). */
  angle: number;
  historique: Historique;
}

export type Etat = Base &
  (
    | { phase: 'accueil' }
    | { phase: 'rotation'; segmentIndex: number }
    | { phase: 'theme'; segmentIndex: number }
    | { phase: 'choixJoker'; segmentIndex: number }
    | { phase: 'question'; segmentIndex: number; themeId: ThemeId; question: Question }
    | {
        phase: 'reponse';
        segmentIndex: number;
        themeId: ThemeId;
        question: Question;
        indexChoisi: number;
        verdict: Verdict;
      }
  );

export type Phase = Etat['phase'];

/**
 * Les données aléatoires (segment, angle, question) sont calculées AVANT le dispatch
 * et transportées par l'action : le réducteur reste pur et déterministe.
 */
export type Action =
  | { type: 'LANCER'; segmentIndex: number; angle: number }
  | { type: 'ROTATION_TERMINEE' }
  | { type: 'THEME_REVELE'; joker: true }
  | { type: 'THEME_REVELE'; joker: false; themeId: ThemeId; tirage: TirageQuestion }
  | { type: 'CHOISIR_THEME'; themeId: ThemeId; tirage: TirageQuestion }
  | { type: 'REPONDRE'; index: number }
  | { type: 'JOUEUR_SUIVANT' };

export const etatInitial: Etat = { phase: 'accueil', angle: 0, historique: {} };

const avecQuestion = (
  etat: Etat & { segmentIndex: number },
  themeId: ThemeId,
  tirage: TirageQuestion,
): Etat => ({
  phase: 'question',
  angle: etat.angle,
  historique: { ...etat.historique, [themeId]: tirage.posees },
  segmentIndex: etat.segmentIndex,
  themeId,
  question: tirage.question,
});

/** Toute transition non prévue renvoie l'état inchangé (ex. double lancer ignoré). */
export function reducteur(etat: Etat, action: Action): Etat {
  switch (action.type) {
    case 'LANCER':
      if (etat.phase !== 'accueil') return etat;
      return {
        phase: 'rotation',
        angle: action.angle,
        historique: etat.historique,
        segmentIndex: action.segmentIndex,
      };

    case 'ROTATION_TERMINEE':
      if (etat.phase !== 'rotation') return etat;
      return { ...etat, phase: 'theme' };

    case 'THEME_REVELE':
      if (etat.phase !== 'theme') return etat;
      if (action.joker) return { ...etat, phase: 'choixJoker' };
      return avecQuestion(etat, action.themeId, action.tirage);

    case 'CHOISIR_THEME':
      if (etat.phase !== 'choixJoker') return etat;
      return avecQuestion(etat, action.themeId, action.tirage);

    case 'REPONDRE': {
      if (etat.phase !== 'question') return etat;
      const reponse = etat.question.reponses[action.index];
      if (!reponse) return etat;
      return {
        ...etat,
        phase: 'reponse',
        indexChoisi: action.index,
        verdict: reponse.correcte ? 'bonne' : 'presque',
      };
    }

    case 'JOUEUR_SUIVANT':
      // Possible après la réponse, ou pour libérer la roue si le visiteur est parti.
      if (etat.phase !== 'reponse' && etat.phase !== 'question' && etat.phase !== 'choixJoker') {
        return etat;
      }
      return { phase: 'accueil', angle: etat.angle, historique: etat.historique };

    default:
      return etat;
  }
}
