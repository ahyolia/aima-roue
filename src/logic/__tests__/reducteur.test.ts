import type { TirageQuestion } from '../../domain/types';
import { fabriquerQuestion } from '../../test-utils/fixtures';
import { type Action, type Etat, etatInitial, nbBonnes, peutLancer, reducteur } from '../reducteur';

const tirage = (id: string): TirageQuestion => ({ question: fabriquerQuestion(id, 'groupes'), posees: [id] });

const jouer = (depart: Etat, ...actions: Action[]): Etat => actions.reduce(reducteur, depart);

const lancer = (angle = 2000): Action => ({ type: 'LANCER', segmentIndex: 1, angle });
const fin: Action = { type: 'ROTATION_TERMINEE' };
const revele = (id: string): Action => ({ type: 'THEME_REVELE', joker: false, themeId: 'groupes', tirage: tirage(id) });
const bonne: Action = { type: 'REPONDRE', index: 0 };
const presque: Action = { type: 'REPONDRE', index: 1 };

/** Un lancer complet jusqu'au verdict. */
const tour = (id: string, reponse: Action): Action[] => [lancer(), fin, revele(id), reponse];

describe('reducteur — parcours en 3 lancers', () => {
  it('accueil → rotation, lancer 1', () => {
    expect(reducteur(etatInitial, lancer())).toMatchObject({ phase: 'rotation', segmentIndex: 1, angle: 2000, lancer: 1 });
  });

  it('enchaîne 3 lancers puis le résultat, en comptant les bonnes réponses', () => {
    const e1 = jouer(etatInitial, ...tour('q1', bonne));
    expect(e1).toMatchObject({ phase: 'reponse', lancer: 1, verdict: 'bonne', resultats: ['bonne'] });

    const e2 = jouer(e1, ...tour('q2', presque));
    expect(e2).toMatchObject({ phase: 'reponse', lancer: 2, verdict: 'presque', resultats: ['bonne', 'presque'] });

    const e3 = jouer(e2, ...tour('q3', bonne));
    expect(e3).toMatchObject({ lancer: 3, resultats: ['bonne', 'presque', 'bonne'], poseesPartie: ['q1', 'q2', 'q3'] });
    expect(nbBonnes(e3)).toBe(2);

    const r = reducteur(e3, { type: 'VOIR_RESULTAT' });
    expect(r).toMatchObject({ phase: 'resultat', lancer: 3 });
    expect(nbBonnes(r)).toBe(2);
  });

  it('joueur suivant : retour à l’accueil, compteur à 0, historique et angle gardés', () => {
    const e3 = jouer(etatInitial, ...tour('q1', bonne), ...tour('q2', bonne), ...tour('q3', bonne));
    const e = jouer(e3, { type: 'VOIR_RESULTAT' }, { type: 'JOUEUR_SUIVANT' });
    expect(e).toEqual({ ...etatInitial, angle: 2000, historique: { groupes: ['q3'] } });
  });

  it('met à jour l’historique du jour à chaque question', () => {
    const e = jouer(etatInitial, lancer(), fin, revele('q1'));
    expect(e).toMatchObject({ phase: 'question', historique: { groupes: ['q1'] }, poseesPartie: ['q1'] });
  });

  it('charge l’historique stocké à l’accueil seulement', () => {
    const h = { bases: ['bases-1'] };
    expect(reducteur(etatInitial, { type: 'HISTORIQUE_CHARGE', historique: h }).historique).toEqual(h);
    const enCours = reducteur(etatInitial, lancer());
    expect(reducteur(enCours, { type: 'HISTORIQUE_CHARGE', historique: h })).toBe(enCours);
  });
});

describe('reducteur — Joker', () => {
  it('theme → choixJoker → question', () => {
    const e1 = jouer(etatInitial, { type: 'LANCER', segmentIndex: 5, angle: 1800 }, fin, { type: 'THEME_REVELE', joker: true });
    expect(e1.phase).toBe('choixJoker');
    const e2 = reducteur(e1, { type: 'CHOISIR_THEME', themeId: 'groupes', tirage: tirage('q1') });
    expect(e2).toMatchObject({ phase: 'question', themeId: 'groupes', segmentIndex: 5, lancer: 1 });
  });
});

describe('reducteur — transitions refusées', () => {
  it('refuse un double lancer pendant la rotation', () => {
    const e = reducteur(etatInitial, lancer());
    expect(reducteur(e, lancer(9999))).toBe(e);
  });

  it('refuse un lancer pendant la question ou la révélation', () => {
    const e1 = jouer(etatInitial, lancer(), fin);
    expect(reducteur(e1, lancer())).toBe(e1);
    const e2 = reducteur(e1, revele('q1'));
    expect(reducteur(e2, lancer())).toBe(e2);
  });

  it('refuse un 4e lancer', () => {
    const e3 = jouer(etatInitial, ...tour('q1', bonne), ...tour('q2', bonne), ...tour('q3', bonne));
    expect(peutLancer(e3)).toBe(false);
    expect(reducteur(e3, lancer())).toBe(e3);
    const r = reducteur(e3, { type: 'VOIR_RESULTAT' });
    expect(reducteur(r, lancer())).toBe(r);
  });

  it('refuse le résultat avant le 3e lancer', () => {
    const e1 = jouer(etatInitial, ...tour('q1', bonne));
    expect(reducteur(e1, { type: 'VOIR_RESULTAT' })).toBe(e1);
  });

  it('refuse une seconde réponse, ou une réponse hors question', () => {
    expect(reducteur(etatInitial, bonne)).toBe(etatInitial);
    const e = jouer(etatInitial, ...tour('q1', bonne));
    expect(reducteur(e, presque)).toBe(e);
  });

  it('refuse un index de réponse inexistant', () => {
    const e = jouer(etatInitial, lancer(), fin, revele('q1'));
    expect(reducteur(e, { type: 'REPONDRE', index: 3 })).toBe(e);
  });

  it('refuse « joueur suivant » ailleurs que sur le résultat', () => {
    const e1 = reducteur(etatInitial, lancer());
    expect(reducteur(e1, { type: 'JOUEUR_SUIVANT' })).toBe(e1);
    const e2 = jouer(etatInitial, ...tour('q1', bonne));
    expect(reducteur(e2, { type: 'JOUEUR_SUIVANT' })).toBe(e2);
  });

  it('refuse les actions hors séquence', () => {
    expect(reducteur(etatInitial, fin)).toBe(etatInitial);
    expect(reducteur(etatInitial, revele('q1'))).toBe(etatInitial);
    expect(reducteur(etatInitial, { type: 'CHOISIR_THEME', themeId: 'bases', tirage: tirage('q1') })).toBe(etatInitial);
    const e = jouer(etatInitial, lancer(), fin, revele('q1'));
    expect(reducteur(e, { type: 'CHOISIR_THEME', themeId: 'bases', tirage: tirage('q2') })).toBe(e);
  });
});
