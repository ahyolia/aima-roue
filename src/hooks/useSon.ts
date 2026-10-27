import { useCallback, useEffect, useMemo, useRef } from 'react';

type Onde = OscillatorType;

/**
 * Sons synthétisés avec la Web Audio API : aucun fichier, aucun réseau.
 * Le contexte audio est créé au premier son (après un geste de l'utilisateur).
 */
export function useSon(actif: boolean) {
  const contexte = useRef<AudioContext | null>(null);
  const actifRef = useRef(actif);
  useEffect(() => {
    actifRef.current = actif;
  }, [actif]);

  const obtenir = useCallback((): AudioContext | null => {
    if (!actifRef.current || typeof window === 'undefined') return null;
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    contexte.current ??= new Ctor();
    if (contexte.current.state === 'suspended') void contexte.current.resume();
    return contexte.current;
  }, []);

  const note = useCallback(
    (ctx: AudioContext, frequence: number, decalage: number, duree: number, onde: Onde, volume: number) => {
      const debut = ctx.currentTime + decalage;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = onde;
      osc.frequency.setValueAtTime(frequence, debut);
      gain.gain.setValueAtTime(0.0001, debut);
      gain.gain.exponentialRampToValueAtTime(volume, debut + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
      osc.connect(gain).connect(ctx.destination);
      osc.start(debut);
      osc.stop(debut + duree + 0.03);
    },
    [],
  );

  return useMemo(
    () => ({
      /** Petit « tic » à chaque segment qui passe sous le pointeur. */
      tic: () => {
        const ctx = obtenir();
        if (ctx) note(ctx, 1500, 0, 0.035, 'triangle', 0.05);
      },
      /** Fanfare douce : arpège do-mi-sol-do. */
      fanfare: () => {
        const ctx = obtenir();
        if (!ctx) return;
        [523.25, 659.25, 783.99].forEach((f, i) => note(ctx, f, i * 0.11, 0.2, 'triangle', 0.09));
        note(ctx, 1046.5, 0.33, 0.6, 'triangle', 0.1);
      },
      /** Carillon chaleureux pour « Presque ! » (jamais un son d'échec). */
      carillon: () => {
        const ctx = obtenir();
        if (!ctx) return;
        note(ctx, 587.33, 0, 0.3, 'sine', 0.08);
        note(ctx, 880, 0.14, 0.45, 'sine', 0.08);
      },
      /** « Pop » à l'apparition du thème. */
      pop: () => {
        const ctx = obtenir();
        if (ctx) note(ctx, 880, 0, 0.09, 'sine', 0.07);
      },
    }),
    [note, obtenir],
  );
}
