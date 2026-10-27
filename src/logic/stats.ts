import type { ThemeId } from '../domain/types';

/** Statistiques anonymes et agrégées du jour : aucune donnée personnelle. */
export interface Stats {
  date: string;
  lancers: number;
  parTheme: Partial<Record<ThemeId, { bonnes: number; total: number }>>;
}

/** Date locale au format AAAA-MM-JJ (le forum se tient en heure locale). */
export function dateLocale(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const statsVides = (date: string): Stats => ({ date, lancers: 0, parTheme: {} });

/** Repart de zéro quand la date change (nouvelle journée de stand). */
export function statsPourDate(stats: Stats | null, date: string): Stats {
  return stats && stats.date === date ? stats : statsVides(date);
}

export function ajouterLancer(stats: Stats): Stats {
  return { ...stats, lancers: stats.lancers + 1 };
}

export function ajouterReponse(stats: Stats, themeId: ThemeId, bonne: boolean): Stats {
  const actuel = stats.parTheme[themeId] ?? { bonnes: 0, total: 0 };
  return {
    ...stats,
    parTheme: {
      ...stats.parTheme,
      [themeId]: { bonnes: actuel.bonnes + (bonne ? 1 : 0), total: actuel.total + 1 },
    },
  };
}

/** Totaux du jour, tous thèmes confondus. */
export function totaux(stats: Stats): { bonnes: number; total: number } {
  return Object.values(stats.parTheme).reduce(
    (acc, t) => ({ bonnes: acc.bonnes + (t?.bonnes ?? 0), total: acc.total + (t?.total ?? 0) }),
    { bonnes: 0, total: 0 },
  );
}

/** Relit des données persistées inconnues de façon défensive. */
export function lireStats(brut: unknown): Stats | null {
  if (typeof brut !== 'object' || brut === null) return null;
  const o = brut as Partial<Stats>;
  if (typeof o.date !== 'string' || typeof o.lancers !== 'number' || !Number.isFinite(o.lancers)) return null;
  const parTheme = typeof o.parTheme === 'object' && o.parTheme !== null ? o.parTheme : {};
  return { date: o.date, lancers: Math.max(0, Math.floor(o.lancers)), parTheme };
}
