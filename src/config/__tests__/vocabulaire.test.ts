import { NOM_ASSOCIATION, textes } from '../content';

/**
 * Vocabulaire de jeu d'argent ou culpabilisant interdit dans les messages de verdict,
 * de feedback et les textes d'interface. Les libellés de thèmes (« Vrai ou faux ? »)
 * et les réponses des questions ne sont volontairement pas vérifiés ici.
 */
const INTERDITS = ['chance', 'jackpot', 'perdu', 'perdue', 'perdus', 'perdre', 'faux', 'fausse', 'pari', 'lot', 'gros lot', 'casino', 'mise', 'gagnant', 'échec', 'raté'];

/** Récupère toutes les chaînes, en appelant les fonctions avec des valeurs d'exemple. */
function chaines(valeur: unknown): string[] {
  if (typeof valeur === 'string') return [valeur];
  if (typeof valeur === 'function') {
    // Deux appels pour couvrir les variantes (ex. son activé / coupé).
    const f = valeur as (...a: unknown[]) => unknown;
    return [...chaines(f('Thème', 3, 7)), ...chaines(f(false, 0, 0))];
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

describe('vocabulaire des textes d’interface', () => {
  const tous = [...chaines(textes), NOM_ASSOCIATION];

  it('trouve bien les messages de verdict', () => {
    expect(tous).toContain(textes.verdictPresqueTitre);
    expect(tous.length).toBeGreaterThan(30);
  });

  it.each(INTERDITS)('ne contient pas « %s »', (interdit) => {
    const cible = mots(interdit).join(' ');
    const fautifs = tous.filter((t) => ` ${mots(t).join(' ')} `.includes(` ${cible} `));
    expect(fautifs).toEqual([]);
  });

  it('affiche « Presque ! » pour une réponse incorrecte', () => {
    expect(textes.verdictPresqueTitre).toBe('Presque !');
  });
});
