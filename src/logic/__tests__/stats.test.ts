import {
  ajouterLancer,
  ajouterReponse,
  dateLocale,
  lireStats,
  remettreCompteurAZero,
  statsPourDate,
  statsVides,
} from '../stats';

describe('stats', () => {
  const base = statsVides('2026-10-29');

  it('compte les lancers', () => {
    expect(ajouterLancer(ajouterLancer(base)).jour.lancers).toBe(2);
  });

  it('incrémente le compteur collectif seulement sur une bonne réponse', () => {
    let s = ajouterReponse(base, 'bases', true);
    s = ajouterReponse(s, 'bases', false);
    s = ajouterReponse(s, 'voyage', true);
    expect(s.compteurCollectif).toBe(2);
    expect(s.jour.parTheme).toEqual({ bases: { bonnes: 1, total: 2 }, voyage: { bonnes: 1, total: 1 } });
  });

  it('ne modifie pas l’objet reçu', () => {
    ajouterReponse(base, 'bases', true);
    expect(base).toEqual(statsVides('2026-10-29'));
  });

  it('garde le compteur mais remet les stats du jour à zéro le lendemain', () => {
    const s = ajouterLancer(ajouterReponse(base, 'groupes', true));
    const lendemain = statsPourDate(s, '2026-10-30');
    expect(lendemain.compteurCollectif).toBe(1);
    expect(lendemain.jour).toEqual({ date: '2026-10-30', lancers: 0, parTheme: {} });
    expect(statsPourDate(s, '2026-10-29')).toBe(s);
    expect(statsPourDate(null, '2026-10-29')).toEqual(base);
  });

  it('remet le compteur collectif à zéro sans toucher aux stats du jour', () => {
    const s = ajouterLancer(ajouterReponse(base, 'groupes', true));
    const r = remettreCompteurAZero(s);
    expect(r.compteurCollectif).toBe(0);
    expect(r.jour).toEqual(s.jour);
  });

  it('formate la date locale', () => {
    expect(dateLocale(new Date(2026, 9, 29, 23, 30))).toBe('2026-10-29');
  });

  it('relit des données persistées de façon défensive', () => {
    expect(lireStats(null)).toBeNull();
    expect(lireStats({ compteurCollectif: 'x' })).toBeNull();
    expect(lireStats({ compteurCollectif: 3.7, jour: { date: 'd', lancers: 2 } })).toEqual({
      compteurCollectif: 3,
      jour: { date: 'd', lancers: 2, parTheme: {} },
    });
  });
});
