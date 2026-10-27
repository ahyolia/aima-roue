import { choisirQuestion, estQuestionValide } from '../questions';
import { fabriquerQuestion, rngSequence } from '../../test-utils/fixtures';

const pool = ['q1', 'q2', 'q3', 'q4'].map((id) => fabriquerQuestion(id));

describe('choisirQuestion', () => {
  it('renvoie null pour un thème vide', () => {
    expect(choisirQuestion([], [], () => 0)).toBeNull();
  });

  it("ne repose aucune question tant que le thème n'est pas épuisé", () => {
    const rng = rngSequence(0.9, 0.1, 0.5, 0.3);
    let posees: string[] = [];
    const vues: string[] = [];
    for (let i = 0; i < pool.length; i++) {
      const t = choisirQuestion(pool, posees, rng);
      if (!t) throw new Error('tirage nul');
      vues.push(t.question.id);
      posees = t.posees;
    }
    expect(new Set(vues).size).toBe(pool.length);
    expect(posees).toHaveLength(pool.length);
  });

  it('recommence un cycle une fois le thème épuisé, sans reposer la dernière question', () => {
    const posees = ['q1', 'q2', 'q3', 'q4'];
    for (const v of [0, 0.4, 0.99]) {
      const t = choisirQuestion(pool, posees, () => v);
      expect(t?.question.id).not.toBe('q4');
      expect(t?.posees).toEqual([t?.question.id]);
    }
  });

  it('fonctionne avec une seule question', () => {
    const seule = [fabriquerQuestion('unique')];
    const t = choisirQuestion(seule, ['unique'], () => 0);
    expect(t?.question.id).toBe('unique');
  });

  it('ne modifie pas les tableaux reçus', () => {
    const posees = ['q1'];
    choisirQuestion(pool, posees, () => 0);
    expect(posees).toEqual(['q1']);
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

  it('refuse moins de 2 ou plus de 4 réponses', () => {
    const q = fabriquerQuestion('x');
    expect(estQuestionValide({ ...q, reponses: [{ texte: 'A', correcte: true }] })).toBe(false);
    const cinq = [true, false, false, false, false].map((c, i) => ({ texte: `${i}`, correcte: c }));
    expect(estQuestionValide({ ...q, reponses: cinq })).toBe(false);
  });

  it('refuse un objet incomplet', () => {
    expect(estQuestionValide(null)).toBe(false);
    expect(estQuestionValide({ id: 'x' })).toBe(false);
  });
});
