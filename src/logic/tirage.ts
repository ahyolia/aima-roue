import type { Rng } from '../domain/types';
import { entierAleatoire } from './aleatoire';

/** Tire l'index du segment (segments de taille égale, donc équiprobables). */
export function tirerSegment(nbSegments: number, rng: Rng): number {
  return entierAleatoire(nbSegments, rng);
}
