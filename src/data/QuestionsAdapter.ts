import type { Question, Theme, ThemeId } from '../domain/types';

/**
 * Seul point d'accès aux thèmes et aux questions. Le métier ne connaît que cette interface :
 * un adaptateur d'API pourra remplacer le mock sans toucher au reste.
 */
export interface QuestionsAdapter {
  listerThemes(): Promise<Theme[]>;
  listerQuestions(themeId: ThemeId): Promise<Question[]>;
}
