import Ionicons from '@expo/vector-icons/Ionicons';
import { type Ref, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewInstance } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { textes } from '../config/content';
import { SEGMENTS } from '../config/segments';
import { couleurs, polices, tailles } from '../config/theme';
import { useBoucle } from '../hooks/useBoucle';
import { centreSegment, largeurSegment } from '../logic/angle';
import { Bouton, Texte } from './base';
import { cheminGoutte } from './decor/formes';

/** Rayon extérieur de la jante : la roue occupe un carré de 2 × RAYON_JANTE. */
export const RAYON_JANTE = 390;
const D = RAYON_JANTE * 2;
const C = RAYON_JANTE;
const R_DISQUE = 344;
const R_AMPOULES = 375;
const NB_AMPOULES = 20;

const rad = (deg: number) => (deg * Math.PI) / 180;
const point = (c: number, r: number, deg: number) => `${c + r * Math.sin(rad(deg))} ${c - r * Math.cos(rad(deg))}`;

/** Secteur circulaire, angles en degrés horaires depuis le haut. */
function secteur(c: number, r: number, debut: number, fin: number): string {
  return `M ${c} ${c} L ${point(c, r, debut)} A ${r} ${r} 0 0 1 ${point(c, r, fin)} Z`;
}

export type ModeAmpoules = 'attente' | 'rotation' | 'fete';

interface Props {
  rotation: Animated.Value;
  /** Petite oscillation du pointeur à chaque segment (degrés). */
  oscillationPointeur: Animated.Value;
  modeAmpoules: ModeAmpoules;
  reduit: boolean;
  boutonActif: boolean;
  onLancer: () => void;
  refBouton: Ref<ViewInstance>;
}

export function Roue({ rotation, oscillationPointeur, modeAmpoules, reduit, boutonActif, onLancer, refBouton }: Props) {
  const rotate = rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
  const pas = useChenillard(modeAmpoules, reduit);
  const pulsation = useBoucle(boutonActif && !reduit, 1100, Easing.inOut(Easing.sin));
  const scale = pulsation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 1] });
  const halo = pulsation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.22, 1] });
  const opaciteHalo = pulsation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.55, 0] });
  const inclinaison = oscillationPointeur.interpolate({ inputRange: [-30, 30], outputRange: ['-30deg', '30deg'] });

  return (
    <View style={{ width: D, height: D }}>
      {/* Jante double, en aplats laiton (reflet = forme plus claire décalée) */}
      <Svg width={D} height={D} style={StyleSheet.absoluteFill} aria-hidden>
        <Circle cx={C} cy={C} r={RAYON_JANTE} fill={couleurs.laitonOmbre} />
        <Circle cx={C} cy={C} r={RAYON_JANTE - 8} fill={couleurs.laitonClair} />
        <Circle cx={C + 6} cy={C + 7} r={RAYON_JANTE - 12} fill={couleurs.orange} />
        <Circle cx={C} cy={C} r={R_DISQUE + 16} fill={couleurs.laitonFonce} />
        <Circle cx={C} cy={C} r={R_DISQUE + 8} fill={couleurs.creme} />
        <Ampoules pas={pas} mode={modeAmpoules} reduit={reduit} />
      </Svg>

      {/* Disque des segments : tourne d'un bloc (transform CSS sur le web) */}
      <Animated.View
        style={[styles.disque, { transform: [{ rotate }] }]}
        aria-hidden
      >
        <Svg width={R_DISQUE * 2} height={R_DISQUE * 2}>
          {SEGMENTS.map((s, i) => {
            const L = largeurSegment(SEGMENTS.length);
            return (
              <Path
                key={s.id}
                d={secteur(R_DISQUE, R_DISQUE, i * L, (i + 1) * L)}
                fill={s.couleur}
                stroke={couleurs.creme}
                strokeWidth={5}
                strokeLinejoin="round"
              />
            );
          })}
          {/* Gouttes lime décoratives sur le segment Joker */}
          {SEGMENTS.map((s, i) =>
            s.id === 'joker' ? (
              <G key="deco" transform={`rotate(${centreSegment(i, SEGMENTS.length)} ${R_DISQUE} ${R_DISQUE})`}>
                {[-16, 16].map((dx) => (
                  <G key={dx} transform={`translate(${R_DISQUE + dx * 2.6 - 13} ${R_DISQUE - 175})`}>
                    <Path d={cheminGoutte(26, 36)} fill={couleurs.lime} />
                  </G>
                ))}
              </G>
            ) : null,
          )}
          <Circle cx={R_DISQUE} cy={R_DISQUE} r={R_DISQUE - 3} stroke={couleurs.creme} strokeWidth={6} fill="none" />
        </Svg>
        {SEGMENTS.map((s, i) => (
          <Libelle key={s.id} index={i} />
        ))}
      </Animated.View>

      {/* Pointeur goutte, fixé au bouton central et pointé vers le haut */}
      <Animated.View style={[styles.pointeur, { transform: [{ rotate: inclinaison }] }]} pointerEvents="none" aria-hidden>
        <Svg width={96} height={150}>
          <G transform="translate(6 4)">
            <Path d={cheminGoutte(84, 140)} fill={couleurs.lime} />
          </G>
          <G transform="translate(15 18)">
            <Path d={cheminGoutte(66, 118)} fill={couleurs.aubergine} />
          </G>
          <Ellipse cx={36} cy={88} rx={6} ry={12} fill={couleurs.creme} opacity={0.6} transform="rotate(20 36 88)" />
        </Svg>
      </Animated.View>

      {/* Bouton central : halo qui respire + pulsation */}
      <View style={styles.centre} pointerEvents="box-none">
        <Animated.View
          style={[styles.halo, { opacity: opaciteHalo, transform: [{ scale: halo }] }]}
          pointerEvents="none"
        />
        <Animated.View style={[styles.anneauCreme, { transform: [{ scale }] }]}>
          <Bouton
            ref={refBouton}
            onPress={onLancer}
            disabled={!boutonActif}
            accessibilityLabel={textes.boutonLancerAccessible}
            accessibilityState={{ disabled: !boutonActif }}
            style={styles.bouton}
          >
            <Texte style={styles.texteBouton}>{textes.boutonLancer}</Texte>
          </Bouton>
        </Animated.View>
      </View>
    </View>
  );
}

const LABEL_L = 260;
const LABEL_H = 110;

function Libelle({ index }: { index: number }) {
  const s = SEGMENTS[index];
  const theta = centreSegment(index, SEGMENTS.length);
  const r = R_DISQUE * 0.7;
  const x = R_DISQUE + r * Math.sin(rad(theta));
  const y = R_DISQUE - r * Math.cos(rad(theta));
  return (
    <View
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
}

/** Ampoules crème qui s'allument à tour de rôle (toutes allumées, fixes, en mouvement réduit). */
function Ampoules({ pas, mode, reduit }: { pas: number; mode: ModeAmpoules; reduit: boolean }) {
  return (
    <>
      {Array.from({ length: NB_AMPOULES }, (_, i) => {
        const angle = (i * 360) / NB_AMPOULES;
        const x = C + R_AMPOULES * Math.sin(rad(angle));
        const y = C - R_AMPOULES * Math.cos(rad(angle));
        const grosse = i % 5 === 0;
        const r = grosse ? 13 : 8.5;
        const allumee = reduit || (mode === 'fete' ? (i + pas) % 2 === 0 : (i + pas) % 4 === 0 || (i + pas) % 4 === 1);
        return (
          <G key={i}>
            {allumee && <Circle cx={x} cy={y} r={r + 6} fill={couleurs.laitonClair} />}
            <Circle cx={x} cy={y} r={r} fill={allumee ? couleurs.creme : couleurs.ampouleEteinte} />
            {!allumee && <Circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.3} fill={couleurs.laitonClair} />}
          </G>
        );
      })}
    </>
  );
}

function useChenillard(mode: ModeAmpoules, reduit: boolean): number {
  const [pas, setPas] = useState(0);
  useEffect(() => {
    if (reduit) return;
    const intervalle = mode === 'rotation' ? 90 : mode === 'fete' ? 220 : 420;
    const id = setInterval(() => setPas((p) => (p + 1) % 1000), intervalle);
    return () => clearInterval(id);
  }, [mode, reduit]);
  return pas;
}

const TAILLE_BOUTON = 196;

const styles = StyleSheet.create({
  disque: {
    position: 'absolute',
    left: C - R_DISQUE,
    top: C - R_DISQUE,
    width: R_DISQUE * 2,
    height: R_DISQUE * 2,
  },
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
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  libelle: { fontFamily: polices.extraGras, fontSize: tailles.libelle, lineHeight: 28 },
  pointeur: {
    position: 'absolute',
    left: C - 48,
    top: C - 196,
    width: 96,
    height: 150,
    transformOrigin: '50% 100%',
  },
  centre: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: TAILLE_BOUTON + 36,
    height: TAILLE_BOUTON + 36,
    borderRadius: 999,
    backgroundColor: couleurs.lime,
  },
  anneauCreme: {
    width: TAILLE_BOUTON + 24,
    height: TAILLE_BOUTON + 24,
    borderRadius: 999,
    backgroundColor: couleurs.creme,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bouton: {
    width: TAILLE_BOUTON,
    height: TAILLE_BOUTON,
    borderRadius: 999,
    backgroundColor: couleurs.aubergine,
    borderColor: couleurs.lime,
    borderWidth: 12,
  },
  texteBouton: { fontFamily: polices.extraGras, fontSize: 44, color: couleurs.creme },
});
