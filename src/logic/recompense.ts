import { messagesPaliers } from '../config/content';
import type { ObjetEpuisable, ObjetId, Palier, Recompense } from '../domain/types';

export const OBJETS_EPUISABLES: readonly ObjetEpuisable[] = ['stylo', 'tshirt'];

export const PALIERS: readonly { palier: Palier; bonnes: number }[] = [
  { palier: 'merci', bonnes: 0 },
  { palier: 'bravo', bonnes: 2 },
  { palier: 'sansFaute', bonnes: 3 },
];

export function palierPour(nbBonnes: number): Palier {
  if (nbBonnes >= 3) return 'sansFaute';
  if (nbBonnes === 2) return 'bravo';
  return 'merci';
}

/**
 * Ce que le joueur emporte. Dépend uniquement du nombre de bonnes réponses (jamais de la roue).
 * Le sticker est toujours offert. Un goodie épuisé est remplacé par celui du palier inférieur
 * encore disponible (t-shirt → stylo → sticker seul) ; le message du palier, lui, ne change pas.
 */
export function recompense(nbBonnes: number, epuises: readonly ObjetEpuisable[] = []): Recompense {
  const palier = palierPour(nbBonnes);
  const dispo = (o: ObjetEpuisable) => !epuises.includes(o);
  const cascade: ObjetEpuisable[] = palier === 'sansFaute' ? ['tshirt', 'stylo'] : palier === 'bravo' ? ['stylo'] : [];
  const bonus = cascade.find(dispo);
  const objets: ObjetId[] = bonus ? ['sticker', bonus] : ['sticker'];
  return { palier, objets, message: messagesPaliers[palier] };
}

/** Lit ?epuise=tshirt,stylo dans la chaîne de requête. Les valeurs inconnues sont ignorées. */
export function lireEpuises(recherche: string): ObjetEpuisable[] {
  const valeur = new URLSearchParams(recherche).getAll('epuise').join(',');
  const vus = valeur
    .split(',')
    .map((v) => v.trim().toLowerCase().replace(/[^a-z]/g, ''))
    .filter((v): v is ObjetEpuisable => (OBJETS_EPUISABLES as readonly string[]).includes(v));
  return [...new Set(vus)];
}
