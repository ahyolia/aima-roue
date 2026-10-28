import type { Rng } from '../domain/types';

/*
 * Conventions : angles en degrés, sens horaire, 0 = en haut (position du pointeur).
 * Le segment i occupe [i × L, (i + 1) × L[ dans le repère de la roue, avec L = 360 / nb.
 * Quand la roue a tourné de R, le point du repère roue situé sous le pointeur est à (-R) mod 360.
 */

export const modulo = (a: number, n: number): number => ((a % n) + n) % n;

export const largeurSegment = (nb: number): number => 360 / nb;

export const centreSegment = (index: number, nb: number): number =>
  (index + 0.5) * largeurSegment(nb);

/** Index du segment situé sous le pointeur pour une rotation donnée. */
export function segmentSousPointeur(rotation: number, nb: number): number {
  const a = modulo(-rotation, 360);
  return Math.min(Math.floor(a / largeurSegment(nb)), nb - 1);
}

/** Distance (en degrés) entre le pointeur et la bordure de segment la plus proche. */
export function distanceBordure(rotation: number, nb: number): number {
  const L = largeurSegment(nb);
  const dansSegment = modulo(modulo(-rotation, 360), L);
  return Math.min(dansSegment, L - dansSegment);
}

export interface ParamsAngleArret {
  index: number;
  nbSegments: number;
  angleCourant: number;
  tours: number;
  rng: Rng;
  /** Décalage max autour du centre, en fraction de la demi-largeur (0,3 = ±30 %). */
  decalageMax?: number;
}

/**
 * Angle absolu d'arrêt : plusieurs tours complets + centre du segment + petit décalage aléatoire.
 * Le décalage reste à ±30 % de la demi-largeur, donc le pointeur s'arrête toujours loin d'une bordure.
 */
export function angleArret({
  index,
  nbSegments,
  angleCourant,
  tours,
  rng,
  decalageMax = 0.3,
}: ParamsAngleArret): number {
  const demiLargeur = largeurSegment(nbSegments) / 2;
  const decalage = (rng() * 2 - 1) * decalageMax * demiLargeur;
  const cibleModulo = modulo(-(centreSegment(index, nbSegments) + decalage), 360);
  const base = angleCourant + tours * 360;
  const complement = modulo(cibleModulo - modulo(base, 360), 360);
  return base + complement;
}
