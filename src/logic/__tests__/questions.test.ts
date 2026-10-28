import { fabriquerQuestion, rngSequence } from '../../test-utils/fixtures';
import {
  choisirQuestion,
  dateLocale,
  estQuestionValide,
  historiqueDuJour,
  melanger,
  ordonnerReponses,
} from '../questions';

const pool = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'].map((id) => fabriquerQuestion(id));

describe('choisirQuestion — sur la journée', () => {
  it('renvoie null pour un thème vide', () => {
    expect(choisirQuestion([], [], [], () => 0)).toBeNull();
  });

  it("ne repose aucune question tant que le thème n'est pas épuisé", () => {
    const rng = rngSequence(0.9, 0.1, 0.5, 0.3, 0.7);
    let posees: string[] = [];
    const vues: string[] = [];
    for (let i = 0; i < pool.length; i++) {
      const t = choisirQuestion(pool, posees, [], rng);
      if (!t) throw new Error('tirage nul');
      vues.push(t.question.id);
      posees = t.posees;
    }
    expect(new Set(vues).size).toBe(pool.length);
    expect(posees).toHaveLength(pool.length);
  });

  it('recommence un cycle une fois le thème épuisé, sans reposer la dernière question', () => {
    const posees = pool.map((q) => q.id);
    for (const v of [0, 0.4, 0.99]) {
      const t = choisirQuestion(pool, posees, [], () => v);
      expect(t?.question.id).not.toBe('q8');
      expect(t?.posees).toEqual([t?.question.id]);
    }
  });

  it('ne modifie pas les tableaux reçus', () => {
    const jour = ['q1'];
    const partie = ['q2'];
    choisirQuestion(pool, jour, partie, () => 0);
    expect(jour).toEqual(['q1']);
    expect(partie).toEqual(['q2']);
  });
});

describe('choisirQuestion — dans une partie', () => {
  it('ne pose jamais deux fois la même question, même après un nouveau cycle', () => {
    // Thème épuisé sur la journée, mais q1 et q2 déjà posées dans la partie.
    const jour = pool.map((q) => q.id);
    for (const v of [0, 0.2, 0.5, 0.99]) {
      const t = choisirQuestion(pool, jour, ['q1', 'q2'], () => v);
      expect(['q1', 'q2']).not.toContain(t?.question.id);
    }
  });

  it('enchaîne 3 tirages du même thème sans doublon', () => {
    let jour: string[] = [];
    const partie: string[] = [];
    for (let i = 0; i < 3; i++) {
      const t = choisirQuestion(pool, jour, partie, () => 0);
      if (!t) throw new Error('tirage nul');
      expect(partie).not.toContain(t.question.id);
      partie.push(t.question.id);
      jour = t.posees;
    }
  });

  it('renvoie null si toutes les questions du thème ont été posées dans la partie', () => {
    const petit = [fabriquerQuestion('a'), fabriquerQuestion('b')];
    expect(choisirQuestion(petit, [], ['a', 'b'], () => 0)).toBeNull();
  });
});

describe('ordre des réponses', () => {
  const q = {
    ...fabriquerQuestion('m', 'bases'),
    reponses: ['A', 'B', 'C', 'D'].map((texte, i) => ({ texte, correcte: i === 0 })),
  };

  it('mélange sans perdre ni modifier de réponse', () => {
    const r = ordonnerReponses(q, rngSequence(0.1, 0.8, 0.4));
    expect(r.reponses.map((x) => x.texte).sort()).toEqual(['A', 'B', 'C', 'D']);
    expect(r.reponses.find((x) => x.correcte)?.texte).toBe('A');
    expect(q.reponses.map((x) => x.texte)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('change effectivement l’ordre selon le générateur', () => {
    expect(melanger([1, 2, 3, 4], () => 0)).not.toEqual([1, 2, 3, 4]);
  });

  it('garde toujours « Vrai » puis « Faux » pour le thème vrai-faux', () => {
    const vf = {
      ...fabriquerQuestion('vf', 'vrai-faux'),
      reponses: [
        { texte: 'Faux', correcte: true },
        { texte: 'Vrai', correcte: false },
      ],
    };
    for (const v of [0, 0.5, 0.99]) {
      expect(ordonnerReponses(vf, () => v).reponses.map((x) => x.texte)).toEqual(['Vrai', 'Faux']);
    }
  });
});

describe('historique du jour', () => {
  it('relit l’historique du même jour', () => {
    expect(historiqueDuJour({ date: '2026-10-29', parTheme: { bases: ['bases-1', 3] } }, '2026-10-29')).toEqual({
      bases: ['bases-1'],
    });
  });

  it('repart de zéro un autre jour ou si les données sont illisibles', () => {
    expect(historiqueDuJour({ date: '2026-10-28', parTheme: { bases: ['x'] } }, '2026-10-29')).toEqual({});
    expect(historiqueDuJour('n’importe quoi', '2026-10-29')).toEqual({});
    expect(historiqueDuJour(null, '2026-10-29')).toEqual({});
  });

  it('formate la date locale', () => {
    expect(dateLocale(new Date(2026, 9, 9))).toBe('2026-10-09');
  });
});

describe('estQuestionValide', () => {
  it('accepte une question correcte', () => {
    expect(estQuestionValide(fabriquerQuestion('ok'))).toBe(true);
  });

  it('refuse 0 ou 2 bonnes réponses', () => {
    const q = fabriquerQuestion('x');
    expect(estQuestionValide({ ...q, reponses: q.reponses.map((r) => ({ ...r, correcte: false })) })).toBe(false);
    expect(estQuestionValide({ ...q, reponses: q.reponses.map((r) => ({ ...r, correcte: true })) })).toBe(false);
  });

  it('refuse moins de 2 ou plus de 4 réponses, ou une explication vide', () => {
    const q = fabriquerQuestion('x');
    expect(estQuestionValide({ ...q, reponses: [{ texte: 'A', correcte: true }] })).toBe(false);
    const cinq = [true, false, false, false, false].map((c, i) => ({ texte: `${i}`, correcte: c }));
    expect(estQuestionValide({ ...q, reponses: cinq })).toBe(false);
    expect(estQuestionValide({ ...q, explication: '  ' })).toBe(false);
  });
});
