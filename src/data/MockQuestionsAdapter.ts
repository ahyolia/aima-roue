import donnees from '../../assets/data/questions.json';
import type { Question, ThemeId } from '../domain/types';
import { estQuestionValide } from '../logic/questions';
import type { QuestionsAdapter } from './QuestionsAdapter';

/** Lit les questions embarquées dans assets/data/questions.json (hors-ligne). */
export class MockQuestionsAdapter implements QuestionsAdapter {
  private readonly questions: Question[];

  constructor(source: unknown = donnees) {
    const brut = Array.isArray(source) ? source : [];
    this.questions = brut.filter(estQuestionValide);
  }

  async listerQuestions(themeId: ThemeId): Promise<Question[]> {
    return this.questions.filter((q) => q.themeId === themeId);
  }
}
