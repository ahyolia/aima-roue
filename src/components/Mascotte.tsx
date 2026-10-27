import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { couleurs } from '../config/theme';
import { useBoucle } from '../hooks/useBoucle';
import { cheminGoutte, CoeurGouttes } from './decor/formes';

export type Expression = 'attente' | 'excitee' | 'ravie';

interface Props {
  expression: Expression;
  taille: number;
  reduit: boolean;
}

/**
 * Mascotte PROVISOIRE : goutte corail souriante, toujours positive.
 * Composant isolé : à remplacer par assets/brand/mascotte.svg quand il sera fourni.
 */
export function Mascotte({ expression, taille, reduit }: Props) {
  const clignement = useClignement(expression === 'attente' && !reduit);
  const excitee = expression === 'excitee';
  const t = useBoucle(!reduit, excitee ? 520 : 2400, Easing.inOut(Easing.sin));
  const translateY = reduit
    ? 0
    : t.interpolate({ inputRange: [0, 0.5, 1], outputRange: excitee ? [0, -16, 0] : [0, -6, 0] });
  const rotate = reduit || !excitee ? '0deg' : t.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-4deg', '4deg', '-4deg'] });

  const hauteur = taille * 1.1;
  return (
    <Animated.View style={{ width: taille, height: hauteur, transform: [{ translateY }, { rotate }] }} aria-hidden>
      <Svg width={taille} height={hauteur} viewBox="0 0 200 220">
        {/* Bras : levés quand elle est excitée */}
        {excitee ? (
          <>
            <Ellipse cx={22} cy={110} rx={14} ry={26} fill={couleurs.corail} transform="rotate(-35 22 110)" />
            <Ellipse cx={178} cy={110} rx={14} ry={26} fill={couleurs.corail} transform="rotate(35 178 110)" />
          </>
        ) : (
          <>
            <Ellipse cx={26} cy={170} rx={14} ry={22} fill={couleurs.corail} transform="rotate(20 26 170)" />
            <Ellipse cx={174} cy={170} rx={14} ry={22} fill={couleurs.corail} transform="rotate(-20 174 170)" />
          </>
        )}

        {/* Corps */}
        <G transform="translate(20 0)">
          <Path d={cheminGoutte(160, 220)} fill={couleurs.corail} />
        </G>
        {/* Reflet en aplat */}
        <Ellipse cx={62} cy={120} rx={14} ry={30} fill={couleurs.corailClair} transform="rotate(20 62 120)" />
        <Circle cx={74} cy={84} r={7} fill={couleurs.corailClair} />

        {/* Joues */}
        <Ellipse cx={58} cy={162} rx={15} ry={9} fill={couleurs.rose} />
        <Ellipse cx={142} cy={162} rx={15} ry={9} fill={couleurs.rose} />

        <Yeux expression={expression} fermes={clignement} />
        <Bouche expression={expression} />
      </Svg>

      {expression === 'ravie' && (
        <>
          <Animated.View style={{ position: 'absolute', left: -taille * 0.18, top: -taille * 0.05, transform: [{ translateY }] }}>
            <CoeurGouttes taille={taille * 0.3} couleur={couleurs.lime} />
          </Animated.View>
          <Animated.View style={{ position: 'absolute', right: -taille * 0.2, top: taille * 0.08, transform: [{ translateY }] }}>
            <CoeurGouttes taille={taille * 0.24} couleur={couleurs.orange} />
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
}

function Yeux({ expression, fermes }: { expression: Expression; fermes: boolean }) {
  const trait = { stroke: couleurs.aubergine, strokeWidth: 7, strokeLinecap: 'round' as const, fill: 'none' };
  if (expression === 'ravie') {
    // Yeux plissés de joie « ^ ^ »
    return (
      <>
        <Path d="M 62 140 Q 76 120 90 140" {...trait} />
        <Path d="M 110 140 Q 124 120 138 140" {...trait} />
      </>
    );
  }
  if (fermes) {
    return (
      <>
        <Path d="M 64 138 Q 76 146 88 138" {...trait} />
        <Path d="M 112 138 Q 124 146 136 138" {...trait} />
      </>
    );
  }
  const grand = expression === 'excitee';
  const ry = grand ? 17 : 14;
  return (
    <>
      <Ellipse cx={76} cy={136} rx={grand ? 13 : 11} ry={ry} fill={couleurs.aubergine} />
      <Ellipse cx={124} cy={136} rx={grand ? 13 : 11} ry={ry} fill={couleurs.aubergine} />
      <Circle cx={80} cy={129} r={grand ? 5.5 : 4.5} fill={couleurs.creme} />
      <Circle cx={128} cy={129} r={grand ? 5.5 : 4.5} fill={couleurs.creme} />
      {grand && (
        <>
          <Circle cx={72} cy={143} r={2.5} fill={couleurs.creme} />
          <Circle cx={120} cy={143} r={2.5} fill={couleurs.creme} />
        </>
      )}
    </>
  );
}

function Bouche({ expression }: { expression: Expression }) {
  if (expression === 'attente') {
    return <Path d="M 84 166 Q 100 182 116 166" stroke={couleurs.aubergine} strokeWidth={7} strokeLinecap="round" fill="none" />;
  }
  // Grand sourire ouvert, avec une petite langue rose
  return (
    <>
      <Path d="M 78 162 Q 100 204 122 162 Z" fill={couleurs.aubergine} />
      <Path d="M 90 182 Q 100 172 110 182 Q 100 194 90 182 Z" fill={couleurs.rose} />
    </>
  );
}

/** Clignement d'yeux toutes les ~3 s. */
function useClignement(actif: boolean): boolean {
  const [fermes, setFermes] = useState(false);
  useEffect(() => {
    if (!actif) return;
    let rouvrir: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      setFermes(true);
      rouvrir = setTimeout(() => setFermes(false), 150);
    }, 3200);
    return () => {
      clearInterval(id);
      if (rouvrir) clearTimeout(rouvrir);
      setFermes(false);
    };
  }, [actif]);
  return fermes;
}
