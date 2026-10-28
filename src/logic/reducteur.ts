import { NB_LANCERS } from '../config/content';
import type { Historique, Question, ThemeId, TirageQuestion, Verdict } from '../domain/types';

interface Base {
  /** Rotation absolue de la roue, en degrés. */
  angle: number;
  /** Questions posées dans la journée, par thème (persisté). */
  historique: Historique;
  /** Numéro du lancer en cours (0 à l'accueil, puis 1 à NB_LANCERS). */
  lancer: number;
  /** Verdict de chaque lancer terminé, dans l'ordre. */
  resultats: Verdict[];
  /** Questions déjà posées dans la partie en cours. */
  poseesPartie: string[];
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
    | { phase: 'resultat' }
  );

export type Phase = Etat['phase'];

/**
 * Les données aléatoires (segment, angle, question) sont calculées AVANT le dispatch
 * et transportées par l'action : le réducteur reste pur et déterministe.
 */
export type Action =
  | { type: 'HISTORIQUE_CHARGE'; historique: Historique }
  | { type: 'LANCER'; segmentIndex: number; angle: number }
  | { type: 'ROTATION_TERMINEE' }
  | { type: 'THEME_REVELE'; joker: true }
  | { type: 'THEME_REVELE'; joker: false; themeId: ThemeId; tirage: TirageQuestion }
  | { type: 'CHOISIR_THEME'; themeId: ThemeId; tirage: TirageQuestion }
  | { type: 'REPONDRE'; index: number }
  | { type: 'VOIR_RESULTAT' }
  | { type: 'JOUEUR_SUIVANT' };

export const etatInitial: Etat = {
  phase: 'accueil',
  angle: 0,
  historique: {},
  lancer: 0,
  resultats: [],
  poseesPartie: [],
};

export const nbBonnes = (etat: Pick<Base, 'resultats'>): number =>
  etat.resultats.filter((v) => v === 'bonne').length;

/** Vrai si l'action LANCER est acceptée dans cet état. */
export const peutLancer = (etat: Etat): boolean =>
  (etat.phase === 'accueil' && etat.lancer === 0) || (etat.phase === 'reponse' && etat.lancer < NB_LANCERS);

const base = (e: Etat): Base => ({
  angle: e.angle,
  historique: e.historique,
  lancer: e.lancer,
  resultats: e.resultats,
  poseesPartie: e.poseesPartie,
});

const avecQuestion = (etat: Etat & { segmentIndex: number }, themeId: ThemeId, tirage: TirageQuestion): Etat => ({
  ...base(etat),
  phase: 'question',
  historique: { ...etat.historique, [themeId]: tirage.posees },
  poseesPartie: [...etat.poseesPartie, tirage.question.id],
  segmentIndex: etat.segmentIndex,
  themeId,
  question: tirage.question,
});

/** Toute transition non prévue renvoie l'état inchangé (ni double lancer, ni 4e lancer). */
export function reducteur(etat: Etat, action: Action): Etat {
  switch (action.type) {
    case 'HISTORIQUE_CHARGE':
      if (etat.phase !== 'accueil' || etat.lancer !== 0) return etat;
      return { ...etat, historique: action.historique };

    case 'LANCER':
      if (!peutLancer(etat)) return etat;
      return {
        ...base(etat),
        phase: 'rotation',
        angle: action.angle,
        lancer: etat.lancer + 1,
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
      const verdict: Verdict = reponse.correcte ? 'bonne' : 'presque';
      return { ...etat, phase: 'reponse', indexChoisi: action.index, verdict, resultats: [...etat.resultats, verdict] };
    }

    case 'VOIR_RESULTAT':
      if (etat.phase !== 'reponse' || etat.lancer < NB_LANCERS) return etat;
      return { ...base(etat), phase: 'resultat' };

    case 'JOUEUR_SUIVANT':
      if (etat.phase !== 'resultat') return etat;
      return { ...etatInitial, angle: etat.angle, historique: etat.historique };

    default:
      return etat;
  }
}
