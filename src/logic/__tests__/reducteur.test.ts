import type { TirageQuestion } from '../../domain/types';
import { fabriquerQuestion } from '../../test-utils/fixtures';
import { type Action, type Etat, etatInitial, reducteur } from '../reducteur';

const question = fabriquerQuestion('q1', 'groupes'); // réponse 0 correcte, 1 incorrecte
const tirage: TirageQuestion = { question, posees: ['q1'] };

const jouer = (...actions: Action[]): Etat => actions.reduce(reducteur, etatInitial);

const lancer: Action = { type: 'LANCER', segmentIndex: 1, angle: 2000 };
const fin: Action = { type: 'ROTATION_TERMINEE' };
const revele: Action = { type: 'THEME_REVELE', joker: false, themeId: 'groupes', tirage };

describe('reducteur — parcours nominal', () => {
  it('accueil → rotation', () => {
    const e = jouer(lancer);
    expect(e).toMatchObject({ phase: 'rotation', segmentIndex: 1, angle: 2000 });
  });

  it('rotation → theme', () => {
    expect(jouer(lancer, fin).phase).toBe('theme');
  });

  it('theme → question, avec historique mis à jour', () => {
    const e = jouer(lancer, fin, revele);
    expect(e).toMatchObject({ phase: 'question', themeId: 'groupes', historique: { groupes: ['q1'] } });
  });

  it('question → reponse bonne', () => {
    const e = jouer(lancer, fin, revele, { type: 'REPONDRE', index: 0 });
    expect(e).toMatchObject({ phase: 'reponse', verdict: 'bonne', indexChoisi: 0 });
  });

  it('question → reponse presque', () => {
    const e = jouer(lancer, fin, revele, { type: 'REPONDRE', index: 1 });
    expect(e).toMatchObject({ phase: 'reponse', verdict: 'presque', indexChoisi: 1 });
  });

  it('reponse → accueil, en gardant angle et historique', () => {
    const e = jouer(lancer, fin, revele, { type: 'REPONDRE', index: 0 }, { type: 'JOUEUR_SUIVANT' });
    expect(e).toEqual({ phase: 'accueil', angle: 2000, historique: { groupes: ['q1'] } });
  });
});

describe('reducteur — Joker', () => {
  const lancerJoker: Action = { type: 'LANCER', segmentIndex: 5, angle: 1800 };

  it('theme → choixJoker → question', () => {
    const e1 = jouer(lancerJoker, fin, { type: 'THEME_REVELE', joker: true });
    expect(e1.phase).toBe('choixJoker');
    const e2 = reducteur(e1, { type: 'CHOISIR_THEME', themeId: 'groupes', tirage });
    expect(e2).toMatchObject({ phase: 'question', themeId: 'groupes', segmentIndex: 5 });
  });
});

describe('reducteur — transitions refusées', () => {
  it('ignore un second lancer pendant la rotation', () => {
    const e = jouer(lancer);
    expect(reducteur(e, { type: 'LANCER', segmentIndex: 3, angle: 9999 })).toBe(e);
  });

  it('ignore une réponse hors des phases question', () => {
    expect(reducteur(etatInitial, { type: 'REPONDRE', index: 0 })).toBe(etatInitial);
    const e = jouer(lancer, fin, revele, { type: 'REPONDRE', index: 0 });
    expect(reducteur(e, { type: 'REPONDRE', index: 1 })).toBe(e);
  });

  it('ignore un index de réponse inexistant', () => {
    const e = jouer(lancer, fin, revele);
    expect(reducteur(e, { type: 'REPONDRE', index: 3 })).toBe(e);
  });

  it('ignore « joueur suivant » pendant la rotation et la révélation', () => {
    const e1 = jouer(lancer);
    expect(reducteur(e1, { type: 'JOUEUR_SUIVANT' })).toBe(e1);
    const e2 = jouer(lancer, fin);
    expect(reducteur(e2, { type: 'JOUEUR_SUIVANT' })).toBe(e2);
  });

  it('permet « joueur suivant » depuis la question (visiteur parti)', () => {
    expect(jouer(lancer, fin, revele, { type: 'JOUEUR_SUIVANT' }).phase).toBe('accueil');
  });

  it('ignore les actions hors séquence', () => {
    expect(reducteur(etatInitial, fin)).toBe(etatInitial);
    expect(reducteur(etatInitial, revele)).toBe(etatInitial);
    expect(reducteur(etatInitial, { type: 'CHOISIR_THEME', themeId: 'bases', tirage })).toBe(etatInitial);
    const e = jouer(lancer, fin, revele);
    expect(reducteur(e, { type: 'CHOISIR_THEME', themeId: 'bases', tirage })).toBe(e);
  });
});
