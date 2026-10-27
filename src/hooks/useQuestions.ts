import { useEffect, useState } from 'react';
import type { QuestionsAdapter } from '../data/QuestionsAdapter';
import { type Question, THEME_IDS, type ThemeId } from '../domain/types';

export type QuestionsParTheme = Record<ThemeId, Question[]>;

/** Charge toutes les questions une fois, via l'adaptateur. null pendant le chargement. */
export function useQuestions(adapter: QuestionsAdapter): QuestionsParTheme | null {
  const [questions, setQuestions] = useState<QuestionsParTheme | null>(null);

  useEffect(() => {
    let actif = true;
    Promise.all(THEME_IDS.map((id) => adapter.listerQuestions(id).catch(() => [])))
      .then((listes) => {
        if (!actif) return;
        const parTheme = Object.fromEntries(THEME_IDS.map((id, i) => [id, listes[i]])) as QuestionsParTheme;
        setQuestions(parTheme);
      });
    return () => {
      actif = false;
    };
  }, [adapter]);

  return questions;
}
