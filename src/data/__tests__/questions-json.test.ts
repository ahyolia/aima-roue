import donnees from '../../../assets/data/questions.json';
import { THEME_IDS } from '../../domain/types';
import { estQuestionValide } from '../../logic/questions';
import { MockQuestionsAdapter } from '../MockQuestionsAdapter';

describe('assets/data/questions.json', () => {
  it('ne contient que des questions valides', () => {
    for (const q of donnees) expect(estQuestionValide(q)).toBe(true);
  });

  it('a des identifiants uniques', () => {
    const ids = donnees.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('a au moins une question par thème, et seulement des thèmes connus', () => {
    for (const t of THEME_IDS) expect(donnees.some((q) => q.themeId === t)).toBe(true);
    for (const q of donnees) expect(THEME_IDS).toContain(q.themeId);
  });

  it('marque les questions à valider avec le préfixe', () => {
    for (const q of donnees.filter((d) => d.aValider)) expect(q.question.startsWith('[À VALIDER]')).toBe(true);
  });

  it('a des explications courtes (1 à 2 phrases)', () => {
    for (const q of donnees) {
      const phrases = q.explication.split(/[.!?…]+(?:\s|$)/).filter((p) => p.trim() !== '');
      expect(phrases.length).toBeGreaterThanOrEqual(1);
      expect(phrases.length).toBeLessThanOrEqual(2);
    }
  });
});

describe('MockQuestionsAdapter', () => {
  it('filtre par thème', async () => {
    const a = new MockQuestionsAdapter();
    const qs = await a.listerQuestions('voyage');
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => q.themeId === 'voyage')).toBe(true);
  });

  it('écarte les entrées invalides', async () => {
    const a = new MockQuestionsAdapter([{ id: 'x', themeId: 'bases' }]);
    expect(await a.listerQuestions('bases')).toEqual([]);
  });
});
