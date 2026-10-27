import Ionicons from '@expo/vector-icons/Ionicons';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { SEGMENTS } from '../config/segments';
import { couleurs, polices, tailles } from '../config/theme';
import { centreSegment, largeurSegment } from '../logic/angle';
import { Texte } from './base';

const rad = (deg: number) => (deg * Math.PI) / 180;
const point = (c: number, r: number, deg: number) =>
  `${c + r * Math.sin(rad(deg))} ${c - r * Math.cos(rad(deg))}`;

/** Secteur circulaire, angles en degrés horaires depuis le haut. */
function secteur(c: number, r: number, debut: number, fin: number): string {
  const grandArc = fin - debut > 180 ? 1 : 0;
  return `M ${c} ${c} L ${point(c, r, debut)} A ${r} ${r} 0 ${grandArc} 1 ${point(c, r, fin)} Z`;
}

const LABEL_L = 250;
const LABEL_H = 100;

interface Props {
  diametre: number;
  /** Rotation absolue en degrés. */
  rotation: Animated.Value;
}

/**
 * Roue : le Svg et les libellés tournent ensemble dans un Animated.View
 * (transform CSS sur le web, plutôt que d'animer les props SVG).
 */
export function Roue({ diametre, rotation }: Props) {
  const c = diametre / 2;
  const nb = SEGMENTS.length;
  const L = largeurSegment(nb);
  const rayonLibelle = c * 0.66;
  const rotate = rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ width: diametre, height: diametre }} aria-hidden>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
        <Svg width={diametre} height={diametre}>
          {SEGMENTS.map((s, i) => (
            <Path
              key={s.id}
              d={secteur(c, c - 6, i * L, (i + 1) * L)}
              fill={s.couleur}
              stroke={couleurs.creme}
              strokeWidth={4}
            />
          ))}
          <Circle cx={c} cy={c} r={c - 4} stroke={couleurs.aubergine} strokeWidth={8} fill="none" />
        </Svg>

        {SEGMENTS.map((s, i) => {
          const theta = centreSegment(i, nb);
          const x = c + rayonLibelle * Math.sin(rad(theta));
          const y = c - rayonLibelle * Math.cos(rad(theta));
          return (
            <View
              key={s.id}
              style={[
                styles.emplacement,
                { left: x - LABEL_L / 2, top: y - LABEL_H / 2, transform: [{ rotate: `${theta}deg` }] },
              ]}
            >
              <View style={styles.cartouche}>
                <Ionicons name={s.icone} size={30} color={couleurs.aubergine} />
                <View>
                  {s.lignes.map((ligne) => (
                    <Texte key={ligne} style={styles.libelle}>
                      {ligne}
                    </Texte>
                  ))}
                </View>
              </View>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

/** Pointeur fixe en haut de la roue (version simple, remplacé en phase 3). */
export function Pointeur({ largeur = 64 }: { largeur?: number }) {
  return (
    <Svg width={largeur} height={largeur} aria-hidden>
      <Path d={`M 4 4 L ${largeur - 4} 4 L ${largeur / 2} ${largeur - 4} Z`} fill={couleurs.aubergine} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  emplacement: {
    position: 'absolute',
    width: LABEL_L,
    height: LABEL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartouche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: couleurs.creme,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  libelle: {
    fontFamily: polices.extraGras,
    fontSize: tailles.libelle,
    lineHeight: 28,
  },
});
