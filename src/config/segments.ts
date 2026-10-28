import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';
import { JOKER, type SegmentId, type Theme } from '../domain/types';
import { segmentJoker } from './content';
import { couleurs } from './theme';

export type NomIcone = ComponentProps<typeof Ionicons>['name'];

export interface Segment {
  id: SegmentId;
  libelle: string;
  /** Libellé coupé en 1 ou 2 lignes pour la roue. */
  lignes: string[];
  icone: NomIcone;
  couleur: string;
}

/** Couleurs des 5 thèmes, dans l'ordre du fichier ; le Joker est en aubergine. */
export const COULEURS_THEMES = [couleurs.petrole, couleurs.corail, couleurs.lime, couleurs.orange, couleurs.mousse];

/** Coupe un libellé en 2 lignes équilibrées (« ? » et « ! » restent collés au mot précédent). */
export function couperLibelle(libelle: string, max = 12): string[] {
  const mots = libelle.replace(/ ([?!:;])/g, ' $1').split(' ');
  if (libelle.length <= max || mots.length < 2) return [libelle.replace(/ /g, ' ')];
  let meilleure: string[] = [libelle];
  let score = Infinity;
  for (let i = 1; i < mots.length; i++) {
    const l = [mots.slice(0, i).join(' '), mots.slice(i).join(' ')];
    const s = Math.max(l[0].length, l[1].length);
    if (s < score) {
      score = s;
      meilleure = l;
    }
  }
  return meilleure.map((l) => l.replace(/ /g, ' '));
}

/** Les 6 segments : les thèmes du fichier (ordre horaire depuis le haut), puis le Joker. */
export function construireSegments(themes: readonly Theme[]): Segment[] {
  const s: Segment[] = themes.map((t, i) => ({
    id: t.id,
    libelle: t.libelle,
    lignes: couperLibelle(t.libelle),
    icone: t.icone as NomIcone,
    couleur: COULEURS_THEMES[i % COULEURS_THEMES.length],
  }));
  s.push({
    id: JOKER,
    libelle: segmentJoker.libelle,
    lignes: couperLibelle(segmentJoker.libelle),
    icone: segmentJoker.icone,
    couleur: couleurs.aubergine,
  });
  return s;
}

export const estJoker = (id: SegmentId): boolean => id === JOKER;
