import donnees from '../../assets/data/questions.json';
import type { Question, Theme, ThemeId } from '../domain/types';
import { estQuestionValide, estThemeValide } from '../logic/questions';
import type { QuestionsAdapter } from './QuestionsAdapter';

/** Lit les thèmes et questions embarqués dans assets/data/questions.json (hors-ligne). */
export class MockQuestionsAdapter implements QuestionsAdapter {
  private readonly themes: Theme[];
  private readonly questions: Question[];

  constructor(source: unknown = donnees) {
    const o = (typeof source === 'object' && source !== null ? source : {}) as Record<string, unknown>;
    this.themes = (Array.isArray(o.themes) ? o.themes : []).filter(estThemeValide);
    const ids = new Set(this.themes.map((t) => t.id));
    this.questions = (Array.isArray(o.questions) ? o.questions : [])
      .filter(estQuestionValide)
      .filter((q) => ids.has(q.themeId));
  }

  async listerThemes(): Promise<Theme[]> {
    return this.themes;
  }

  async listerQuestions(themeId: ThemeId): Promise<Question[]> {
    return this.questions.filter((q) => q.themeId === themeId);
  }
}
