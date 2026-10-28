import donnees from '../../../assets/data/questions.json';
import { estQuestionValide, estThemeValide } from '../../logic/questions';
import { MockQuestionsAdapter } from '../MockQuestionsAdapter';

const { themes, questions } = donnees;

describe('assets/data/questions.json', () => {
  it('a 5 thèmes valides, aux identifiants uniques', () => {
    expect(themes).toHaveLength(5);
    for (const t of themes) expect(estThemeValide(t)).toBe(true);
    expect(new Set(themes.map((t) => t.id)).size).toBe(5);
  });

  it.each(themes.map((t) => t.id))('a 8 questions pour le thème « %s »', (id) => {
    expect(questions.filter((q) => q.themeId === id)).toHaveLength(8);
  });

  it('ne référence que des thèmes connus', () => {
    const ids = themes.map((t) => t.id);
    for (const q of questions) expect(ids).toContain(q.themeId);
  });

  it.each(questions.map((q) => [q.id, q] as const))('%s : 2 à 4 réponses, une seule correcte, explication non vide', (_id, q) => {
    expect(q.reponses.length).toBeGreaterThanOrEqual(2);
    expect(q.reponses.length).toBeLessThanOrEqual(4);
    expect(q.reponses.filter((r) => r.correcte)).toHaveLength(1);
    expect(q.explication.trim()).not.toBe('');
    expect(estQuestionValide(q)).toBe(true);
  });

  it('a des identifiants de questions uniques', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('a des réponses « Vrai » et « Faux » pour le thème vrai-faux', () => {
    for (const q of questions.filter((x) => x.themeId === 'vrai-faux')) {
      expect(q.reponses.map((r) => r.texte).sort()).toEqual(['Faux', 'Vrai']);
    }
  });
});

describe('MockQuestionsAdapter', () => {
  it('liste les thèmes du fichier', async () => {
    const themesLus = await new MockQuestionsAdapter().listerThemes();
    expect(themesLus.map((t) => t.id)).toEqual(themes.map((t) => t.id));
  });

  it('filtre les questions par thème', async () => {
    const qs = await new MockQuestionsAdapter().listerQuestions('voyage');
    expect(qs).toHaveLength(8);
    expect(qs.every((q) => q.themeId === 'voyage')).toBe(true);
  });

  it('écarte les entrées invalides', async () => {
    const a = new MockQuestionsAdapter({ themes: [{ id: 'bases' }], questions: [{ id: 'x', themeId: 'bases' }] });
    expect(await a.listerThemes()).toEqual([]);
    expect(await a.listerQuestions('bases')).toEqual([]);
  });
});
