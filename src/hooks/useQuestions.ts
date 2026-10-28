import { useEffect, useState } from 'react';
import { construireSegments, type Segment } from '../config/segments';
import type { QuestionsAdapter } from '../data/QuestionsAdapter';
import type { Question, ThemeId } from '../domain/types';

export interface Contenu {
  segments: Segment[];
  questions: Record<ThemeId, Question[]>;
}

/** Charge thèmes et questions une fois, via l'adaptateur. null pendant le chargement. */
export function useContenu(adapter: QuestionsAdapter): Contenu | null {
  const [contenu, setContenu] = useState<Contenu | null>(null);

  useEffect(() => {
    let actif = true;
    (async () => {
      const themes = await adapter.listerThemes().catch(() => []);
      const listes = await Promise.all(themes.map((t) => adapter.listerQuestions(t.id).catch(() => [])));
      if (!actif) return;
      setContenu({
        segments: construireSegments(themes),
        questions: Object.fromEntries(themes.map((t, i) => [t.id, listes[i]])),
      });
    })();
    return () => {
      actif = false;
    };
  }, [adapter]);

  return contenu;
}
