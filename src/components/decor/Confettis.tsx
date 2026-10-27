import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { couleurs } from '../../config/theme';

const PALETTE = [couleurs.lime, couleurs.petrole, couleurs.orange, couleurs.mousse, couleurs.corail, couleurs.aubergine];
const NB = 70;

/** Générateur pseudo-aléatoire déterministe (mulberry32) : rendu pur et stable. */
function graine(n: number) {
  let a = n >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PIECES = (() => {
  const r = graine(29102026);
  return Array.from({ length: NB }, () => ({
    x: r() * 1920,
    derive: (r() - 0.5) * 260,
    retard: r() * 0.35,
    tours: 1 + r() * 3,
    couleur: PALETTE[Math.floor(r() * PALETTE.length)],
    forme: r() < 0.5 ? 'bande' : r() < 0.5 ? 'rond' : 'carre',
  }));
})();

/** Confettis aux couleurs de la palette. Jamais rendus en mouvement réduit. */
export function Confettis({ actif }: { actif: boolean }) {
  const [t] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!actif) return;
    t.setValue(0);
    const anim = Animated.timing(t, { toValue: 1, duration: 3200, easing: Easing.linear, useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [actif, t]);

  if (!actif) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
      {PIECES.map((p, i) => {
        const debut = p.retard;
        const fin = Math.min(1, debut + 0.65);
        const translateY = t.interpolate({ inputRange: [0, debut, fin, 1], outputRange: [-60, -60, 1140, 1140] });
        const translateX = t.interpolate({ inputRange: [0, debut, fin, 1], outputRange: [0, 0, p.derive, p.derive] });
        const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.tours * 360}deg`] });
        const dims =
          p.forme === 'bande' ? { width: 12, height: 26, borderRadius: 4 } : p.forme === 'rond' ? { width: 18, height: 18, borderRadius: 9 } : { width: 16, height: 16, borderRadius: 3 };
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: 0,
              backgroundColor: p.couleur,
              ...dims,
              transform: [{ translateX }, { translateY }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
