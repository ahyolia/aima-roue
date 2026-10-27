import {
  angleArret,
  centreSegment,
  distanceBordure,
  largeurSegment,
  modulo,
  segmentSousPointeur,
} from '../angle';

describe('segmentSousPointeur', () => {
  it('donne le segment 0 au repos', () => {
    expect(segmentSousPointeur(0, 6)).toBe(0);
  });

  it('suit la rotation horaire : le segment situé à gauche arrive sous le pointeur', () => {
    // Le segment 5 occupe [300°, 360°[ ; tourner de 30° l'amène sous le pointeur.
    expect(segmentSousPointeur(30, 6)).toBe(5);
    expect(segmentSousPointeur(-30, 6)).toBe(0);
    expect(segmentSousPointeur(-90, 6)).toBe(1);
  });
});

describe('angleArret', () => {
  const valeursRng = [0, 0.001, 0.25, 0.5, 0.75, 0.999999];

  it.each([0, 1, 2, 3, 4, 5])('arrête le pointeur sur le segment %i', (index) => {
    for (const v of valeursRng) {
      for (const depart of [0, 123.4, 4000, -50]) {
        const a = angleArret({ index, nbSegments: 6, angleCourant: depart, tours: 5, rng: () => v });
        expect(segmentSousPointeur(a, 6)).toBe(index);
      }
    }
  });

  it("ne s'approche jamais d'une bordure (≥ 70 % de la demi-largeur)", () => {
    const demi = largeurSegment(6) / 2;
    for (const v of valeursRng) {
      const a = angleArret({ index: 3, nbSegments: 6, angleCourant: 17, tours: 5, rng: () => v });
      expect(distanceBordure(a, 6)).toBeGreaterThanOrEqual(0.7 * demi - 1e-9);
    }
  });

  it('vise exactement le centre quand le décalage est nul (rng = 0,5)', () => {
    const a = angleArret({ index: 2, nbSegments: 6, angleCourant: 0, tours: 4, rng: () => 0.5 });
    expect(modulo(-a, 360)).toBeCloseTo(centreSegment(2, 6));
  });

  it("fait au moins le nombre de tours demandé, et moins d'un tour de plus", () => {
    for (const depart of [0, 250, 3610]) {
      const a = angleArret({ index: 4, nbSegments: 6, angleCourant: depart, tours: 6, rng: () => 0.9 });
      expect(a).toBeGreaterThanOrEqual(depart + 6 * 360);
      expect(a).toBeLessThan(depart + 7 * 360);
    }
  });

  it('fonctionne aussi avec un seul tour (mouvement réduit)', () => {
    const a = angleArret({ index: 1, nbSegments: 6, angleCourant: 720, tours: 1, rng: () => 0.2 });
    expect(segmentSousPointeur(a, 6)).toBe(1);
    expect(a).toBeGreaterThanOrEqual(720 + 360);
  });
});
