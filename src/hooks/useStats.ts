import { useCallback, useEffect, useState } from 'react';
import { dateLocale, statsPourDate, type Stats } from '../logic/stats';
import { chargerStats, sauverStats } from '../storage/statsStorage';

/** Statistiques persistées. `stats` vaut null tant que le chargement n'est pas terminé. */
export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let actif = true;
    chargerStats().then((s) => {
      if (actif) setStats(statsPourDate(s, dateLocale(new Date())));
    });
    return () => {
      actif = false;
    };
  }, []);

  useEffect(() => {
    if (stats) void sauverStats(stats);
  }, [stats]);

  const maj = useCallback((f: (s: Stats) => Stats) => {
    setStats((prev) => f(statsPourDate(prev, dateLocale(new Date()))));
  }, []);

  return { stats, maj };
}
