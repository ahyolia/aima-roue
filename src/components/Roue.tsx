import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, type Ref, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewInstance, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { textes } from '../config/content';
import type { Segment } from '../config/segments';
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
  segments: Segment[];
  rotation: Animated.Value;
  /** Petite oscillation du pointeur à chaque segment (degrés). */
  oscillationPointeur: Animated.Value;
  modeAmpoules: ModeAmpoules;
  reduit: boolean;
  boutonActif: boolean;
  onLancer: () => void;
  refBouton?: Ref<ViewInstance>;
}

export function Roue({ segments, rotation, oscillationPointeur, modeAmpoules, reduit, boutonActif, onLancer, refBouton }: Props) {
  const rotate = rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
  const pas = useChenillard(modeAmpoules, reduit);
  const pulsation = useBoucle(boutonActif && !reduit, 1400, Easing.inOut(Easing.sin));
  const scale = pulsation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.06, 1] });
  const inclinaison = oscillationPointeur.interpolate({ inputRange: [-30, 30], outputRange: ['-30deg', '30deg'] });

  return (
    <View style={{ width: D, height: D }}>
      <Jante />
      <Svg width={D} height={D} style={StyleSheet.absoluteFill} aria-hidden>
        <Ampoules pas={pas} mode={modeAmpoules} reduit={reduit} />
      </Svg>

      {/* Disque des segments : dessiné une seule fois, seule la vue qui l'enveloppe tourne */}
      <Animated.View style={[styles.disque, COMPOSITEUR, { transform: [{ rotate }] }]} aria-hidden>
        <Disque segments={segments} />
      </Animated.View>

      {/* Pointeur goutte, pointé vers le haut */}
      <Animated.View style={[styles.pointeur, { transform: [{ rotate: inclinaison }] }]} pointerEvents="none" aria-hidden>
        <Pointeur />
      </Animated.View>

      {/* Bouton central */}
      <View style={styles.centre} pointerEvents="box-none">
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

/** Jante double, en aplats laiton (reflet = forme plus claire décalée). */
const Jante = memo(function Jante() {
  return (
    <Svg width={D} height={D} style={StyleSheet.absoluteFill} aria-hidden>
      <Circle cx={C} cy={C + 10} r={RAYON_JANTE - 2} fill={couleurs.aubergine} />
      <Circle cx={C} cy={C} r={RAYON_JANTE - 2} fill={couleurs.laitonFonce} stroke={couleurs.aubergine} strokeWidth={4} />
      <Circle cx={C} cy={C} r={RAYON_JANTE - 12} fill={couleurs.orange} />
      <Circle cx={C - 4} cy={C - 5} r={RAYON_JANTE - 22} fill={couleurs.laitonClair} />
      <Circle cx={C} cy={C} r={R_DISQUE + 14} fill={couleurs.orange} stroke={couleurs.aubergine} strokeWidth={4} />
    </Svg>
  );
});

/** SVG du disque, mémoïsé : aucun re-render pendant la rotation. */
const Disque = memo(function Disque({ segments }: { segments: Segment[] }) {
  const L = largeurSegment(segments.length);
  return (
    <>
      <Svg width={R_DISQUE * 2} height={R_DISQUE * 2}>
        {segments.map((s, i) => (
          <Path
            key={s.id}
            d={secteur(R_DISQUE, R_DISQUE, i * L, (i + 1) * L)}
            fill={s.couleur}
            stroke={couleurs.aubergine}
            strokeWidth={4}
            strokeLinejoin="round"
          />
        ))}
        {/* Gouttes lime décoratives sur le segment Joker (aubergine) */}
        {segments.map((s, i) =>
          s.couleur === couleurs.aubergine ? (
            <G key="deco" transform={`rotate(${centreSegment(i, segments.length)} ${R_DISQUE} ${R_DISQUE})`}>
              {[-16, 16].map((dx) => (
                <G key={dx} transform={`translate(${R_DISQUE + dx * 2.6 - 13} ${R_DISQUE - 180})`}>
                  <Path d={cheminGoutte(26, 36)} fill={couleurs.lime} />
                </G>
              ))}
            </G>
          ) : null,
        )}
        <Circle cx={R_DISQUE} cy={R_DISQUE} r={R_DISQUE - 2} stroke={couleurs.aubergine} strokeWidth={4} fill="none" />
      </Svg>
      {segments.map((s, i) => (
        <Libelle key={s.id} segment={s} index={i} nb={segments.length} />
      ))}
    </>
  );
});

const Pointeur = memo(function Pointeur() {
  return (
    <Svg width={96} height={150}>
      <G transform="translate(10 12)">
        <Path d={cheminGoutte(78, 130)} fill={couleurs.aubergine} />
      </G>
      <G transform="translate(9 4)">
        <Path d={cheminGoutte(78, 130)} fill={couleurs.lime} stroke={couleurs.aubergine} strokeWidth={4} strokeLinejoin="round" />
      </G>
      <G transform="translate(22 30)">
        <Path d={cheminGoutte(52, 92)} fill={couleurs.aubergine} />
      </G>
      <Ellipse cx={38} cy={92} rx={5} ry={11} fill={couleurs.creme} transform="rotate(20 38 92)" />
    </Svg>
  );
});

const LABEL_L = 260;
const LABEL_H = 110;

function Libelle({ segment: s, index, nb }: { segment: Segment; index: number; nb: number }) {
  const theta = centreSegment(index, nb);
  const r = R_DISQUE * 0.68;
  const x = R_DISQUE + r * Math.sin(rad(theta));
  const y = R_DISQUE - r * Math.cos(rad(theta));
  return (
    <View
      style={[styles.emplacement, { left: x - LABEL_L / 2, top: y - LABEL_H / 2, transform: [{ rotate: `${theta}deg` }] }]}
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

/** Perles crème qui s'allument à tour de rôle (toutes allumées, fixes, en mouvement réduit). */
function Ampoules({ pas, mode, reduit }: { pas: number; mode: ModeAmpoules; reduit: boolean }) {
  return (
    <>
      {Array.from({ length: NB_AMPOULES }, (_, i) => {
        const angle = (i * 360) / NB_AMPOULES;
        const x = C + R_AMPOULES * Math.sin(rad(angle));
        const y = C - R_AMPOULES * Math.cos(rad(angle));
        const r = i % 5 === 0 ? 12 : 8;
        const allumee = reduit || (mode === 'fete' ? (i + pas) % 2 === 0 : (i + pas) % 4 < 2);
        return (
          <G key={i}>
            <Circle cx={x} cy={y} r={r} fill={allumee ? couleurs.creme : couleurs.ampouleEteinte} stroke={couleurs.aubergine} strokeWidth={3} />
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
    // Lent : jamais plus de 3 clignotements par seconde.
    const intervalle = mode === 'rotation' ? 360 : 900;
    const id = setInterval(() => setPas((p) => (p + 1) % 1000), intervalle);
    return () => clearInterval(id);
  }, [mode, reduit]);
  return pas;
}

/** Web : la vue qui tourne passe sur sa propre couche (GPU). */
const COMPOSITEUR = { willChange: 'transform' } as unknown as ViewStyle;

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
    borderColor: couleurs.aubergine,
    borderWidth: 3,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  libelle: { fontFamily: polices.extraGras, fontSize: tailles.libelle, lineHeight: 28 },
  pointeur: {
    position: 'absolute',
    left: C - 48,
    top: C - 214,
    width: 96,
    height: 150,
    transformOrigin: '50% 100%',
  },
  centre: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  anneauCreme: {
    width: TAILLE_BOUTON + 24,
    height: TAILLE_BOUTON + 24,
    borderRadius: 999,
    backgroundColor: couleurs.creme,
    borderColor: couleurs.aubergine,
    borderWidth: 4,
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
