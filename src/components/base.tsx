import { type ReactNode, type Ref, useState } from 'react';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type TextProps,
  type ViewInstance,
  type StyleProp,
  type ViewStyle,
  useWindowDimensions,
  View as RNView,
} from 'react-native';
import { anneauFocus, couleurs, polices, tailles } from '../config/theme';

/** Texte par défaut : Nunito Sans, aubergine, taille lisible à 2 m. */
export function Texte({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.texte, style]} />;
}

type BoutonProps = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  ref?: Ref<ViewInstance>;
};

/** Bouton accessible : cible ≥ 48 px, rôle bouton, anneau de focus aubergine + liseré crème. */
export function Bouton({ style, children, onFocus, onBlur, ...props }: BoutonProps) {
  const [focus, setFocus] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      onFocus={(e) => {
        setFocus(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocus(false);
        onBlur?.(e);
      }}
      style={({ pressed }) => [styles.bouton, style, pressed && styles.appuye, focus && styles.focus]}
    >
      {children}
    </Pressable>
  );
}

/** Scène fixe 1920×1080 mise à l'échelle de la fenêtre (mise en page déterministe). */
export function Scene({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const echelle = Math.min(width / 1920, height / 1080) || 1;
  return (
    <RNView style={styles.fenetre}>
      <RNView style={[styles.scene, { transform: [{ scale: echelle }] }]}>{children}</RNView>
    </RNView>
  );
}

/** Zone annoncée aux lecteurs d'écran, visuellement masquée. */
export function Annonce({ message }: { message: string }) {
  return (
    <RNView style={styles.masque}>
      <Text accessibilityLiveRegion="polite" aria-live="polite" role="status">
        {message}
      </Text>
    </RNView>
  );
}

const styles = StyleSheet.create({
  texte: {
    fontFamily: polices.texte,
    fontSize: tailles.texte,
    color: couleurs.aubergine,
  },
  bouton: {
    minWidth: tailles.cibleMin,
    minHeight: tailles.cibleMin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appuye: { opacity: 0.85 },
  focus: {
    boxShadow: anneauFocus.boxShadow,
    outlineWidth: 0,
  },
  fenetre: {
    flex: 1,
    backgroundColor: couleurs.creme,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scene: {
    width: 1920,
    height: 1080,
    backgroundColor: couleurs.creme,
  },
  masque: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0.01,
  },
});
