import { luminance, ratioContraste } from '../../logic/contraste';
import { SEGMENTS } from '../segments';
import { couleurs, pairesContraste } from '../theme';

const SEUILS = { texte: 4.5, graphique: 3 } as const;

describe('ratioContraste', () => {
  it('donne 21:1 pour noir sur blanc et 1:1 pour une couleur sur elle-même', () => {
    expect(ratioContraste('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(ratioContraste('#F6F1E4', '#F6F1E4')).toBeCloseTo(1, 5);
  });

  it('est symétrique', () => {
    expect(ratioContraste(couleurs.lime, couleurs.aubergine)).toBeCloseTo(
      ratioContraste(couleurs.aubergine, couleurs.lime),
    );
  });

  it('refuse une couleur mal formée', () => {
    expect(() => luminance('rouge')).toThrow();
  });
});

describe('paires avant-plan / fond de l’interface (WCAG AA)', () => {
  it.each(pairesContraste.map((p) => [p.usage, p.type, p.avantPlan, p.fond] as const))(
    '%s (%s) : %s sur %s',
    (_usage, type, avantPlan, fond) => {
      expect(ratioContraste(avantPlan, fond)).toBeGreaterThanOrEqual(SEUILS[type]);
    },
  );

  it('couvre le texte aubergine et les icônes aubergine posés sur le cartouche crème', () => {
    const aPaire = (type: 'texte' | 'graphique') =>
      pairesContraste.some((p) => p.type === type && p.avantPlan === couleurs.aubergine && p.fond === couleurs.creme);
    expect(aPaire('texte')).toBe(true);
    expect(aPaire('graphique')).toBe(true);
  });

  it('couvre la goutte lime posée sur le segment Joker aubergine', () => {
    const joker = SEGMENTS.find((s) => s.id === 'joker');
    expect(joker?.couleur).toBe(couleurs.aubergine);
    expect(
      pairesContraste.some((p) => p.type === 'graphique' && p.avantPlan === couleurs.lime && p.fond === joker?.couleur),
    ).toBe(true);
  });
});

describe('segments', () => {
  it('ont deux à deux des couleurs voisines différentes', () => {
    SEGMENTS.forEach((s, i) => {
      const suivant = SEGMENTS[(i + 1) % SEGMENTS.length];
      expect(s.couleur).not.toBe(suivant.couleur);
    });
  });

  it('ont tous une icône et un libellé (jamais la couleur seule)', () => {
    for (const s of SEGMENTS) {
      expect(s.icone).toBeTruthy();
      expect(s.libelle.trim()).not.toBe('');
    }
  });
});
