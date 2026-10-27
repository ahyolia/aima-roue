import { useEffect, useState } from 'react';
import { Animated, Easing, type EasingFunction } from 'react-native';

/**
 * Valeur animée qui boucle de 0 à 1 tant que `actif` est vrai (revient à 0 sinon).
 * À combiner avec interpolate pour les pulsations, scintillements, flottements…
 */
export function useBoucle(actif: boolean, duree: number, easing: EasingFunction = Easing.linear): Animated.Value {
  const [valeur] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!actif) {
      valeur.stopAnimation();
      valeur.setValue(0);
      return;
    }
    const boucle = Animated.loop(
      Animated.timing(valeur, { toValue: 1, duration: duree, easing, useNativeDriver: false }),
    );
    boucle.start();
    return () => boucle.stop();
  }, [actif, duree, easing, valeur]);

  return valeur;
}

/** Entrée « pop » : 0 → 1 avec un léger rebond (instantané en mouvement réduit). */
export function useApparition(cle: unknown, reduit: boolean): Animated.Value {
  const [valeur] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduit) {
      valeur.setValue(1);
      return;
    }
    valeur.setValue(0);
    const anim = Animated.spring(valeur, { toValue: 1, friction: 6, tension: 90, useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [cle, reduit, valeur]);

  return valeur;
}
