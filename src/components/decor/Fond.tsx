import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { couleurs } from '../../config/theme';
import { useBoucle } from '../../hooks/useBoucle';
import { CoeurGouttes, Etincelle } from './formes';

/** Centre de la roue sur la scène 1920×1080 (partagé avec l'écran). */
export const CENTRE_ROUE = { x: 600, y: 555 } as const;
const RAYON_HALO = 490;
const NB_RAYONS = 18;

function rayon(i: number): string {
  const a1 = ((i * 360) / NB_RAYONS) * (Math.PI / 180);
  const a2 = (((i + 0.5) * 360) / NB_RAYONS) * (Math.PI / 180);
  const r = RAYON_HALO;
  return `M ${r} ${r} L ${r + r * Math.sin(a1)} ${r - r * Math.cos(a1)} A ${r} ${r} 0 0 1 ${r + r * Math.sin(a2)} ${r - r * Math.cos(a2)} Z`;
}

/** Fond crème avec grandes formes roses en aplat et soleil de rayons qui tourne doucement. */
export function Fond({ reduit }: { reduit: boolean }) {
  const t = useBoucle(!reduit, 90000);
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
      <Svg width={1920} height={1080} style={StyleSheet.absoluteFill}>
        <Path d="M 1920 0 L 1340 0 C 1390 130 1540 150 1650 240 C 1760 330 1760 480 1920 520 Z" fill={couleurs.rose} />
        <Path d="M 1920 1080 L 1480 1080 C 1550 990 1690 960 1780 900 C 1850 850 1880 790 1920 770 Z" fill={couleurs.rose} />
        <Path d="M 0 0 L 0 260 C 60 220 90 120 190 60 C 240 30 260 10 280 0 Z" fill={couleurs.rose} />
      </Svg>

      <Animated.View
        style={[
          styles.soleil,
          { left: CENTRE_ROUE.x - RAYON_HALO, top: CENTRE_ROUE.y - RAYON_HALO, transform: [{ rotate }] },
        ]}
      >
        <Svg width={RAYON_HALO * 2} height={RAYON_HALO * 2}>
          <Circle cx={RAYON_HALO} cy={RAYON_HALO} r={RAYON_HALO} fill={couleurs.rose} />
          {Array.from({ length: NB_RAYONS }, (_, i) => (
            <Path key={i} d={rayon(i)} fill={couleurs.roseClair} />
          ))}
        </Svg>
      </Animated.View>

      {/* Fines lignes de halo autour de la roue, comme sur la référence. */}
      <Svg width={1920} height={1080} style={StyleSheet.absoluteFill}>
        <Circle cx={CENTRE_ROUE.x} cy={CENTRE_ROUE.y} r={424} stroke={couleurs.creme} strokeWidth={4} fill="none" />
        <Circle cx={CENTRE_ROUE.x} cy={CENTRE_ROUE.y} r={440} stroke={couleurs.creme} strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
}

const ETINCELLES: { x: number; y: number; taille: number; couleur: string; phase: number }[] = [
  { x: 225, y: 215, taille: 84, couleur: couleurs.creme, phase: 0.05 },
  { x: 990, y: 205, taille: 70, couleur: couleurs.lime, phase: 0.3 },
  { x: 1055, y: 560, taille: 50, couleur: couleurs.creme, phase: 0.55 },
  { x: 140, y: 500, taille: 60, couleur: couleurs.lime, phase: 0.2 },
  { x: 175, y: 850, taille: 76, couleur: couleurs.creme, phase: 0.42 },
  { x: 1020, y: 880, taille: 64, couleur: couleurs.lime, phase: 0.12 },
  { x: 345, y: 120, taille: 46, couleur: couleurs.lime, phase: 0.66 },
  { x: 870, y: 115, taille: 52, couleur: couleurs.creme, phase: 0.8 },
  { x: 1830, y: 340, taille: 56, couleur: couleurs.lime, phase: 0.48 },
  { x: 1250, y: 70, taille: 48, couleur: couleurs.lime, phase: 0.7 },
];

/** Étincelles lime et crème qui scintillent (immobiles en mouvement réduit). */
export function Etincelles({ reduit }: { reduit: boolean }) {
  const t = useBoucle(!reduit, 2600);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
      {ETINCELLES.map((e, i) => {
        const p = e.phase * 0.7;
        const scale = reduit
          ? 1
          : t.interpolate({ inputRange: [0, p, p + 0.15, p + 0.3, 1], outputRange: [0.55, 0.55, 1.1, 0.55, 0.55] });
        const rotate = reduit
          ? '0deg'
          : t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', i % 2 ? '90deg' : '-90deg'] });
        return (
          <Animated.View
            key={i}
            style={{ position: 'absolute', left: e.x - e.taille / 2, top: e.y - e.taille / 2, transform: [{ scale }, { rotate }] }}
          >
            <Etincelle taille={e.taille} couleur={e.couleur} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const COEURS: { x: number; y: number; taille: number; couleur: string }[] = [
  { x: 70, y: 930, taille: 110, couleur: couleurs.corail },
  { x: 200, y: 1000, taille: 64, couleur: couleurs.orange },
  { x: 985, y: 960, taille: 84, couleur: couleurs.corail },
  { x: 1830, y: 160, taille: 70, couleur: couleurs.corail },
  { x: 1765, y: 960, taille: 58, couleur: couleurs.lime },
];

/** Cœurs de gouttes qui flottent doucement. */
export function Coeurs({ reduit }: { reduit: boolean }) {
  const t = useBoucle(!reduit, 3800);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
      {COEURS.map((c, i) => {
        const translateY = reduit
          ? 0
          : t.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: i % 2 ? [0, -14, 0] : [-10, 6, -10],
            });
        return (
          <Animated.View
            key={i}
            style={{ position: 'absolute', left: c.x - c.taille / 2, top: c.y - c.taille / 2, transform: [{ translateY }] }}
          >
            <CoeurGouttes taille={c.taille} couleur={c.couleur} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  soleil: { position: 'absolute', width: RAYON_HALO * 2, height: RAYON_HALO * 2 },
});
