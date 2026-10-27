import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Suit le réglage « réduire les animations » (prefers-reduced-motion sur le web). */
export function useMouvementReduit(): boolean {
  const [reduit, setReduit] = useState(false);

  useEffect(() => {
    let actif = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => actif && setReduit(v))
      .catch(() => undefined);
    const abonnement = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduit);
    return () => {
      actif = false;
      abonnement?.remove();
    };
  }, []);

  return reduit;
}
