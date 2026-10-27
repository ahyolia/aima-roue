import type { ThemeId } from '../domain/types';

/** Statistiques anonymes et agrégées : aucune donnée personnelle. */
export interface StatsJour {
  date: string;
  lancers: number;
  parTheme: Partial<Record<ThemeId, { bonnes: number; total: number }>>;
}

export interface Stats {
  /** Bonnes réponses cumulées du stand (persistant, tous jours confondus). */
  compteurCollectif: number;
  jour: StatsJour;
}

/** Date locale au format AAAA-MM-JJ (le forum se tient en heure locale). */
export function dateLocale(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const statsVides = (date: string): Stats => ({
  compteurCollectif: 0,
  jour: { date, lancers: 0, parTheme: {} },
});

/** Garde le compteur collectif, mais repart de zéro pour les stats d'un nouveau jour. */
export function statsPourDate(stats: Stats | null, date: string): Stats {
  if (!stats) return statsVides(date);
  if (stats.jour.date === date) return stats;
  return { compteurCollectif: stats.compteurCollectif, jour: { date, lancers: 0, parTheme: {} } };
}

export function ajouterLancer(stats: Stats): Stats {
  return { ...stats, jour: { ...stats.jour, lancers: stats.jour.lancers + 1 } };
}

export function ajouterReponse(stats: Stats, themeId: ThemeId, bonne: boolean): Stats {
  const actuel = stats.jour.parTheme[themeId] ?? { bonnes: 0, total: 0 };
  return {
    compteurCollectif: stats.compteurCollectif + (bonne ? 1 : 0),
    jour: {
      ...stats.jour,
      parTheme: {
        ...stats.jour.parTheme,
        [themeId]: { bonnes: actuel.bonnes + (bonne ? 1 : 0), total: actuel.total + 1 },
      },
    },
  };
}

export function remettreCompteurAZero(stats: Stats): Stats {
  return { ...stats, compteurCollectif: 0 };
}

/** Relit des données persistées inconnues de façon défensive. */
export function lireStats(brut: unknown): Stats | null {
  if (typeof brut !== 'object' || brut === null) return null;
  const o = brut as Partial<Stats>;
  if (typeof o.compteurCollectif !== 'number' || !Number.isFinite(o.compteurCollectif)) return null;
  const j = o.jour;
  if (!j || typeof j.date !== 'string' || typeof j.lancers !== 'number') return null;
  return {
    compteurCollectif: Math.max(0, Math.floor(o.compteurCollectif)),
    jour: { date: j.date, lancers: j.lancers, parTheme: j.parTheme ?? {} },
  };
}
