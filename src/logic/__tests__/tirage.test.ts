import { entierAleatoire, rngCrypto } from '../aleatoire';
import { tirerSegment } from '../tirage';
import { rngSequence } from '../../test-utils/fixtures';

describe('rngCrypto', () => {
  it('renvoie des valeurs dans [0, 1)', () => {
    for (let i = 0; i < 1000; i++) {
      const x = rngCrypto();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('entierAleatoire', () => {
  it('reste dans les bornes, y compris aux valeurs limites', () => {
    expect(entierAleatoire(6, () => 0)).toBe(0);
    expect(entierAleatoire(6, () => 0.9999999)).toBe(5);
    expect(entierAleatoire(6, () => 1)).toBe(5);
  });

  it('refuse un n invalide', () => {
    expect(() => entierAleatoire(0, () => 0)).toThrow(RangeError);
    expect(() => entierAleatoire(2.5, () => 0)).toThrow(RangeError);
  });
});

describe('tirerSegment', () => {
  it('associe chaque tranche de [0, 1) à un segment', () => {
    const rng = rngSequence(0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6);
    expect(Array.from({ length: 6 }, () => tirerSegment(6, rng))).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('répartit les tirages de façon équilibrée', () => {
    const compte = new Array(6).fill(0);
    const n = 60000;
    for (let i = 0; i < n; i++) compte[tirerSegment(6, rngCrypto)]++;
    for (const c of compte) {
      expect(c / n).toBeGreaterThan(1 / 6 - 0.015);
      expect(c / n).toBeLessThan(1 / 6 + 0.015);
    }
  });
});
