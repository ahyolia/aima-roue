import { StyleSheet, View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { textes } from '../config/content';
import { couleurs, polices } from '../config/theme';
import { Texte } from './base';
import { cheminGoutte } from './decor/formes';

export const LARGEUR_SOCLE = 700;
export const HAUTEUR_SOCLE = 200;

/** Socle sous la roue, avec la plaque « 3 lancers, 3 questions » (comme le bandeau de la référence). */
export function Socle() {
  return (
    <View style={{ width: LARGEUR_SOCLE, height: HAUTEUR_SOCLE }}>
      <Svg width={LARGEUR_SOCLE} height={HAUTEUR_SOCLE} style={StyleSheet.absoluteFill} aria-hidden>
        {/* Col */}
        <Path d="M 270 0 L 430 0 L 470 70 L 230 70 Z" fill={couleurs.laitonFonce} />
        <Path d="M 290 0 L 330 0 L 318 70 L 262 70 Z" fill={couleurs.laitonClair} />
        {/* Plateau : dessus clair, face orange, ombre foncée */}
        <Rect x={30} y={72} width={640} height={124} rx={34} fill={couleurs.laitonOmbre} />
        <Rect x={30} y={62} width={640} height={120} rx={34} fill={couleurs.orange} />
        <Rect x={54} y={62} width={592} height={20} rx={10} fill={couleurs.laitonClair} />
        {/* Plaque aubergine */}
        <Rect x={130} y={92} width={440} height={78} rx={39} fill={couleurs.aubergine} />
        <G transform="translate(160 106)">
          <Path d={cheminGoutte(32, 48)} fill={couleurs.lime} />
        </G>
        <G transform="translate(508 106)">
          <Path d={cheminGoutte(32, 48)} fill={couleurs.lime} />
        </G>
      </Svg>
      <View style={styles.plaque}>
        <Texte style={styles.texte}>{textes.sousTitre}</Texte>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plaque: {
    position: 'absolute',
    left: 192,
    top: 92,
    width: 316,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texte: { fontFamily: polices.extraGras, fontSize: 26, color: couleurs.creme },
});
