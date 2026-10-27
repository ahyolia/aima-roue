import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';
import type { SegmentId, ThemeId } from '../domain/types';
import { libellesSegments } from './content';
import { couleurs } from './theme';

export type NomIcone = ComponentProps<typeof Ionicons>['name'];

export interface Segment {
  id: SegmentId;
  lignes: string[];
  libelle: string;
  icone: NomIcone;
  couleur: string;
}

const def = (id: SegmentId, icone: NomIcone, couleur: string): Segment => ({
  id,
  lignes: libellesSegments[id].lignes,
  libelle: libellesSegments[id].complet,
  icone,
  couleur,
});

/** Ordre horaire à partir du haut. Couleurs voisines toujours différentes. */
export const SEGMENTS: Segment[] = [
  def('bases', 'heart', couleurs.petrole),
  def('groupes', 'people', couleurs.corail),
  def('association', 'hand-left', couleurs.lime),
  def('vraiFaux', 'help-circle', couleurs.orange),
  def('voyage', 'navigate', couleurs.mousse),
  def('joker', 'water', couleurs.aubergine),
];

export const estThemeId = (id: SegmentId): id is ThemeId => id !== 'joker';

export const libelleTheme = (id: SegmentId): string => libellesSegments[id].complet;

export const iconeTheme = (id: SegmentId): NomIcone =>
  SEGMENTS.find((s) => s.id === id)?.icone ?? 'help-circle';
