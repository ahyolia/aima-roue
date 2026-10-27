import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export interface Raccourcis {
  lancer: () => void;
  suivant: () => void;
  basculerPanneau: () => void;
  basculerSon: () => void;
  chiffre: (n: number) => void;
  echap: () => void;
}

const SELECTEUR_INTERACTIF = 'button, [role="button"], a, input, textarea, select';

/** Raccourcis animateur. Espace/Entrée sont laissés aux boutons quand l'un d'eux a le focus. */
export function useClavier(raccourcis: Raccourcis): void {
  const ref = useRef(raccourcis);
  useEffect(() => {
    ref.current = raccourcis;
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const surTouche = (e: KeyboardEvent) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
      const cible = e.target instanceof Element ? e.target : null;
      const surInteractif = cible?.closest(SELECTEUR_INTERACTIF) != null;
      const r = ref.current;

      switch (e.key) {
        case ' ':
        case 'Enter':
          if (surInteractif) return;
          e.preventDefault();
          r.lancer();
          return;
        case 'n':
        case 'N':
          r.suivant();
          return;
        case 'h':
        case 'H':
          r.basculerPanneau();
          return;
        case 'm':
        case 'M':
          r.basculerSon();
          return;
        case 'Escape':
          r.echap();
          return;
        default:
          if (/^[1-9]$/.test(e.key)) r.chiffre(Number(e.key));
      }
    };

    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, []);
}
