import type { Question, ThemeId } from '../domain/types';

/**
 * Seul point d'accès aux questions. Le reste de l'application ne connaît que cette interface :
 * un ApiQuestionsAdapter (Laravel) pourra remplacer le mock sans toucher au métier.
 */
export interface QuestionsAdapter {
  listerQuestions(themeId: ThemeId): Promise<Question[]>;
}
