import {
  ajouterLancer,
  ajouterReponse,
  dateLocale,
  lireStats,
  statsPourDate,
  statsVides,
  totaux,
} from '../stats';

describe('stats', () => {
  const base = statsVides('2026-10-29');

  it('compte les lancers', () => {
    expect(ajouterLancer(ajouterLancer(base)).lancers).toBe(2);
  });

  it('compte les réponses par thème', () => {
    let s = ajouterReponse(base, 'bases', true);
    s = ajouterReponse(s, 'bases', false);
    s = ajouterReponse(s, 'voyage', true);
    expect(s.parTheme).toEqual({ bases: { bonnes: 1, total: 2 }, voyage: { bonnes: 1, total: 1 } });
    expect(totaux(s)).toEqual({ bonnes: 2, total: 3 });
  });

  it("ne modifie pas l'objet reçu", () => {
    ajouterReponse(base, 'bases', true);
    expect(base).toEqual(statsVides('2026-10-29'));
  });

  it('repart de zéro le lendemain', () => {
    const s = ajouterLancer(ajouterReponse(base, 'groupes', true));
    expect(statsPourDate(s, '2026-10-30')).toEqual(statsVides('2026-10-30'));
    expect(statsPourDate(s, '2026-10-29')).toBe(s);
    expect(statsPourDate(null, '2026-10-29')).toEqual(base);
  });

  it('formate la date locale', () => {
    expect(dateLocale(new Date(2026, 9, 29, 23, 30))).toBe('2026-10-29');
  });

  it('relit des données persistées de façon défensive', () => {
    expect(lireStats(null)).toBeNull();
    expect(lireStats({ date: 3 })).toBeNull();
    expect(lireStats({ date: 'd', lancers: 2.7 })).toEqual({ date: 'd', lancers: 2, parTheme: {} });
  });
});
