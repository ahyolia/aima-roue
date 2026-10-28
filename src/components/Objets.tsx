import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { couleurs } from '../config/theme';
import type { ObjetId } from '../domain/types';
import { cheminGoutte } from './decor/formes';

const TRAIT = { stroke: couleurs.aubergine, strokeWidth: 4, strokeLinejoin: 'round' as const };

/** Illustrations plates des objets offerts (contour aubergine, aplats de la palette). */
export function IllustrationObjet({ id, taille }: { id: ObjetId; taille: number }) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 120 120" aria-hidden>
      {id === 'sticker' && <Sticker />}
      {id === 'stylo' && <Stylo />}
      {id === 'tshirt' && <TShirt />}
    </Svg>
  );
}

function Sticker() {
  return (
    <>
      {/* Ombre en aplat décalée vers le bas */}
      <Circle cx={60} cy={66} r={46} fill={couleurs.aubergine} />
      <Path d="M 60 14 A 46 46 0 1 0 106 60 L 82 60 Q 74 38 60 14 Z" fill={couleurs.corail} {...TRAIT} />
      {/* Coin décollé */}
      <Path d="M 60 14 Q 74 38 82 60 L 106 60 Q 92 26 60 14 Z" fill={couleurs.creme} {...TRAIT} />
      <G transform="translate(38 32)">
        <Path d={cheminGoutte(36, 50)} fill={couleurs.creme} {...TRAIT} />
      </G>
      <Circle cx={50} cy={70} r={4} fill={couleurs.corail} />
    </>
  );
}

function Stylo() {
  return (
    <G transform="rotate(35 60 60)">
      <Rect x={50} y={16} width={22} height={74} rx={7} fill={couleurs.aubergine} transform="translate(0 5)" />
      <Path d="M 50 86 L 72 86 L 61 110 Z" fill={couleurs.orange} {...TRAIT} />
      <Path d="M 57 101 L 65 101 L 61 110 Z" fill={couleurs.aubergine} />
      <Rect x={50} y={12} width={22} height={74} rx={7} fill={couleurs.petrole} {...TRAIT} />
      <Rect x={50} y={30} width={22} height={9} fill={couleurs.creme} {...TRAIT} />
      <Rect x={68} y={14} width={8} height={34} rx={4} fill={couleurs.lime} {...TRAIT} />
    </G>
  );
}

const CHEMIN_TSHIRT =
  'M 42 16 L 22 24 L 6 46 L 24 60 L 31 52 L 31 104 L 89 104 L 89 52 L 96 60 L 114 46 L 98 24 L 78 16 Q 60 32 42 16 Z';

function TShirt() {
  return (
    <>
      <Path d={CHEMIN_TSHIRT} fill={couleurs.aubergine} transform="translate(0 6)" />
      <Path d={CHEMIN_TSHIRT} fill={couleurs.lime} {...TRAIT} />
      <G transform="translate(49 48)">
        <Path d={cheminGoutte(22, 30)} fill={couleurs.corail} {...TRAIT} strokeWidth={3} />
      </G>
    </>
  );
}
