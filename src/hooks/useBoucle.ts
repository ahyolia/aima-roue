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

/**
 * Entrée 0 → 1 (instantanée en mouvement réduit).
 * Sans retard : glissement + fondu de 280 ms. Avec retard : rebond (objet qui se colle).
 */
export function useApparition(cle: unknown, reduit: boolean, retard?: number): Animated.Value {
  const [valeur] = useState(() => new Animated.Value(reduit ? 1 : 0));

  useEffect(() => {
    if (reduit) {
      valeur.setValue(1);
      return;
    }
    valeur.setValue(0);
    const anim =
      retard === undefined
        ? Animated.timing(valeur, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: false })
        : Animated.sequence([
            Animated.delay(retard),
            Animated.spring(valeur, { toValue: 1, friction: 5, tension: 120, useNativeDriver: false }),
          ]);
    anim.start();
    return () => anim.stop();
  }, [cle, reduit, retard, valeur]);

  return valeur;
}
