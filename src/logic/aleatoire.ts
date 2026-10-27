import type { Rng } from '../domain/types';

const DEUX_PUISSANCE_32 = 0x1_0000_0000;

/** Générateur basé sur crypto.getRandomValues : uniforme dans [0, 1). */
export const rngCrypto: Rng = () => {
  const tampon = new Uint32Array(1);
  globalThis.crypto.getRandomValues(tampon);
  return tampon[0] / DEUX_PUISSANCE_32;
};

/** Entier uniforme dans [0, n). Robuste même si rng renvoie une valeur limite. */
export function entierAleatoire(n: number, rng: Rng): number {
  if (!Number.isInteger(n) || n <= 0) throw new RangeError(`n invalide : ${n}`);
  const x = Math.floor(rng() * n);
  return Math.min(Math.max(x, 0), n - 1);
}
