import { libellesPaliers, libellesPaliersAccessibles, messagesPaliers, nomsObjets, segmentJoker, textes } from '../content';

/**
 * Vocabulaire interdit dans l'interface et les verdicts : la roue tire un thème, jamais un lot.
 * « Faux » reste autorisé dans le libellé de thème « Vrai ou faux ? » et dans les réponses,
 * qui viennent de questions.json et ne sont donc pas vérifiés ici.
 */
const INTERDITS = [
  'chance',
  'chances',
  'jackpot',
  'perdu',
  'perdue',
  'perdus',
  'perdre',
  'raté',
  'ratée',
  'rater',
  'gagné',
  'gagnée',
  'gagner',
  'gagnant',
  'faux',
  'fausse',
  'lot',
  'casino',
  'échec',
];

/** Récupère toutes les chaînes, en appelant les fonctions avec des valeurs d'exemple. */
function chaines(valeur: unknown): string[] {
  if (typeof valeur === 'string') return [valeur];
  if (typeof valeur === 'function') {
    const f = valeur as (...a: unknown[]) => unknown;
    return [...chaines(f(1, 2, true)), ...chaines(f(3, 0, false)), ...chaines(f('Thème', 'Sticker', true))];
  }
  if (Array.isArray(valeur)) return valeur.flatMap(chaines);
  if (typeof valeur === 'object' && valeur !== null) return Object.values(valeur).flatMap(chaines);
  return [];
}

const mots = (texte: string) =>
  texte
    .toLocaleLowerCase('fr')
    .split(/[^\p{L}]+/u)
    .filter(Boolean);

describe('vocabulaire de l’interface et des verdicts', () => {
  const tous = chaines([textes, messagesPaliers, nomsObjets, libellesPaliers, libellesPaliersAccessibles, segmentJoker.libelle]);

  it('trouve bien les verdicts et les messages de paliers', () => {
    expect(tous).toContain(textes.verdictPresqueTitre);
    expect(tous).toContain(messagesPaliers.sansFaute);
    expect(tous.length).toBeGreaterThan(40);
  });

  it.each(INTERDITS)('ne contient pas « %s »', (interdit) => {
    const fautifs = tous.filter((t) => mots(t).includes(interdit));
    expect(fautifs).toEqual([]);
  });

  it('dit « Tu repars avec », jamais « tu as gagné »', () => {
    expect(textes.tuReparsAvec).toMatch(/^Tu repars avec/);
  });

  it('affiche « Bravo ! » ou « Presque ! » comme verdict', () => {
    expect(textes.verdictBonneTitre).toBe('Bravo !');
    expect(textes.verdictPresqueTitre).toBe('Presque !');
  });
});
