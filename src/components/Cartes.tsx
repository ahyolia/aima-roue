import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode, Ref } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewInstance } from 'react-native';
import { textes } from '../config/content';
import { iconeTheme, libelleTheme, SEGMENTS } from '../config/segments';
import { couleurs, polices, tailles } from '../config/theme';
import type { Question, SegmentId, ThemeId, Verdict } from '../domain/types';
import { useApparition, useBoucle } from '../hooks/useBoucle';
import { Bouton, Texte } from './base';

export const LARGEUR_CARTE = 800;

/** Carte avec ombre en aplat et entrée « pop » (simple apparition en mouvement réduit). */
function Carte({
  children,
  cle,
  reduit,
  refCarte,
  label,
}: {
  children: ReactNode;
  cle: unknown;
  reduit: boolean;
  refCarte?: Ref<ViewInstance>;
  label?: string;
}) {
  const a = useApparition(cle, reduit);
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });
  const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const opacity = a.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] });
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      <View style={styles.ombre} />
      <View style={styles.carte} ref={refCarte} tabIndex={refCarte ? -1 : undefined} accessibilityLabel={label}>
        {children}
      </View>
    </Animated.View>
  );
}

/** Pastille de thème : disque de la couleur du segment + icône sur crème (jamais la couleur seule). */
function Pastille({ id, taille }: { id: SegmentId; taille: number }) {
  const couleur = SEGMENTS.find((s) => s.id === id)?.couleur ?? couleurs.aubergine;
  return (
    <View style={[styles.pastille, { width: taille, height: taille, backgroundColor: couleur }]}>
      <View style={[styles.pastilleInterieur, { width: taille * 0.74, height: taille * 0.74 }]}>
        <Ionicons name={iconeTheme(id)} size={taille * 0.42} color={couleurs.aubergine} />
      </View>
    </View>
  );
}

function Badge({ id }: { id: SegmentId }) {
  return (
    <View style={styles.badge}>
      <Pastille id={id} taille={64} />
      <Texte style={styles.themePetit}>{libelleTheme(id)}</Texte>
    </View>
  );
}

export function CarteTheme({ id, reduit }: { id: SegmentId; reduit: boolean }) {
  const t = useBoucle(!reduit, 900, Easing.inOut(Easing.sin));
  const rebond = reduit ? 0 : t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -18, 0] });
  const rotate = reduit ? '0deg' : t.interpolate({ inputRange: [0, 0.25, 0.75, 1], outputRange: ['0deg', '-6deg', '6deg', '0deg'] });
  return (
    <Carte cle={id} reduit={reduit}>
      <Texte style={styles.surtitre}>{textes.themeTire}</Texte>
      <Animated.View style={{ transform: [{ translateY: rebond }, { rotate }] }}>
        <Pastille id={id} taille={220} />
      </Animated.View>
      <Texte style={styles.themeGrand}>{libelleTheme(id)}</Texte>
    </Carte>
  );
}

const THEMES_JOKER = SEGMENTS.filter((s) => s.id !== 'joker');

export function ChoixJoker({
  onChoisir,
  refPremier,
  reduit,
}: {
  onChoisir: (id: ThemeId) => void;
  refPremier: Ref<ViewInstance>;
  reduit: boolean;
}) {
  return (
    <Carte cle="joker" reduit={reduit}>
      <Badge id="joker" />
      <Texte style={styles.consigne}>{textes.jokerConsigne}</Texte>
      <View style={styles.liste}>
        {THEMES_JOKER.map((s, i) => (
          <Bouton
            key={s.id}
            ref={i === 0 ? refPremier : undefined}
            accessibilityLabel={`${i + 1}. ${s.libelle}`}
            onPress={() => onChoisir(s.id as ThemeId)}
            style={styles.choix}
          >
            <Texte style={styles.numero}>{i + 1}</Texte>
            <Pastille id={s.id} taille={52} />
            <Texte style={styles.texteChoix}>{s.libelle}</Texte>
          </Bouton>
        ))}
      </View>
    </Carte>
  );
}

export function CarteQuestion({
  question,
  themeId,
  onRepondre,
  refCarte,
  reduit,
}: {
  question: Question;
  themeId: ThemeId;
  onRepondre: (index: number) => void;
  refCarte: Ref<ViewInstance>;
  reduit: boolean;
}) {
  return (
    <Carte cle={question.id} reduit={reduit} refCarte={refCarte} label={question.question}>
      <Badge id={themeId} />
      <Texte style={styles.question}>{question.question}</Texte>
      <Texte style={styles.consigne}>{textes.consigneReponse}</Texte>
      <View style={styles.liste}>
        {question.reponses.map((r, i) => (
          <Bouton
            key={r.texte}
            accessibilityLabel={`${i + 1}. ${r.texte}`}
            onPress={() => onRepondre(i)}
            style={styles.choix}
          >
            <Texte style={styles.numero}>{i + 1}</Texte>
            <Texte style={styles.texteChoix}>{r.texte}</Texte>
          </Bouton>
        ))}
      </View>
    </Carte>
  );
}

export function CarteReponse({
  question,
  indexChoisi,
  verdict,
  onSuivant,
  refSuivant,
  reduit,
}: {
  question: Question;
  indexChoisi: number;
  verdict: Verdict;
  onSuivant: () => void;
  refSuivant: Ref<ViewInstance>;
  reduit: boolean;
}) {
  const bonne = verdict === 'bonne';
  const t = useBoucle(!reduit, 1000, Easing.inOut(Easing.sin));
  const scale = reduit ? 1 : t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 1] });
  return (
    <Carte cle={`${question.id}-reponse`} reduit={reduit}>
      <View style={styles.badge}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons
            name={bonne ? 'sparkles' : 'heart'}
            size={72}
            color={bonne ? couleurs.petrole : couleurs.aubergine}
          />
        </Animated.View>
        <Texte style={styles.verdict}>{bonne ? textes.verdictBonneTitre : textes.verdictPresqueTitre}</Texte>
      </View>
      <Texte style={styles.message}>{bonne ? textes.verdictBonneMessage : textes.verdictPresqueMessage}</Texte>

      <View style={styles.liste}>
        {question.reponses.map((r, i) => {
          const estCorrecte = r.correcte;
          const estChoisie = i === indexChoisi;
          return (
            <View
              key={r.texte}
              style={[
                styles.choix,
                estCorrecte && styles.choixCorrect,
                estChoisie && !estCorrecte && styles.choixChoisi,
              ]}
            >
              {estCorrecte ? (
                <Ionicons name="checkmark-circle" size={40} color={couleurs.creme} />
              ) : estChoisie ? (
                <Ionicons name="arrow-forward-circle" size={40} color={couleurs.aubergine} />
              ) : (
                <View style={{ width: 40 }} />
              )}
              <View style={styles.colonneChoix}>
                <Texte style={[styles.texteChoix, estCorrecte && styles.texteCreme]}>{r.texte}</Texte>
                {estCorrecte ? (
                  <Texte style={[styles.etiquette, styles.texteCreme]}>{textes.etiquetteBonneReponse}</Texte>
                ) : estChoisie ? (
                  <Texte style={styles.etiquette}>{textes.etiquetteTaReponse}</Texte>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.explication}>
        <Ionicons name="bulb" size={36} color={couleurs.aubergine} />
        <Texte style={styles.texteExplication}>{question.explication}</Texte>
      </View>

      <Bouton ref={refSuivant} onPress={onSuivant} style={styles.boutonPrincipal}>
        <Texte style={styles.texteBoutonPrincipal}>{textes.boutonJoueurSuivant}</Texte>
        <Ionicons name="arrow-forward" size={32} color={couleurs.creme} />
      </Bouton>
    </Carte>
  );
}

const RAYON = 44;

const styles = StyleSheet.create({
  ombre: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: -16,
    bottom: -16,
    borderRadius: RAYON,
    backgroundColor: couleurs.orange,
  },
  carte: {
    width: LARGEUR_CARTE,
    backgroundColor: couleurs.creme,
    borderColor: couleurs.aubergine,
    borderWidth: 6,
    borderRadius: RAYON,
    paddingHorizontal: 44,
    paddingVertical: 36,
    gap: 22,
    alignItems: 'center',
  },
  pastille: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  pastilleInterieur: {
    borderRadius: 999,
    backgroundColor: couleurs.creme,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  surtitre: { fontFamily: polices.gras, fontSize: 40 },
  themeGrand: { fontFamily: polices.extraGras, fontSize: 60, textAlign: 'center' },
  themePetit: { fontFamily: polices.extraGras, fontSize: 32 },
  consigne: { fontFamily: polices.texte, fontSize: tailles.texte },
  question: { fontFamily: polices.extraGras, fontSize: tailles.question, textAlign: 'center', lineHeight: 52 },
  liste: { width: '100%', gap: 14 },
  choix: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 18,
    minHeight: 80,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: couleurs.aubergine,
    backgroundColor: couleurs.creme,
  },
  choixCorrect: { backgroundColor: couleurs.petrole, borderColor: couleurs.petrole },
  choixChoisi: { borderStyle: 'dashed' },
  colonneChoix: { flexShrink: 1 },
  numero: {
    fontFamily: polices.extraGras,
    fontSize: 30,
    width: 52,
    height: 52,
    lineHeight: 52,
    textAlign: 'center',
    borderRadius: 26,
    backgroundColor: couleurs.lime,
    color: couleurs.aubergine,
    overflow: 'hidden',
  },
  texteChoix: { fontFamily: polices.gras, fontSize: 30, flexShrink: 1 },
  texteCreme: { color: couleurs.creme },
  etiquette: { fontFamily: polices.extraGras, fontSize: tailles.libelle },
  verdict: { fontFamily: polices.extraGras, fontSize: tailles.verdict },
  message: { fontFamily: polices.gras, fontSize: 30, textAlign: 'center' },
  explication: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    backgroundColor: couleurs.rose,
    borderRadius: 24,
    padding: 18,
    width: '100%',
  },
  texteExplication: { fontFamily: polices.texte, fontSize: 28, lineHeight: 38, flexShrink: 1 },
  boutonPrincipal: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: couleurs.aubergine,
    borderRadius: 999,
    paddingHorizontal: 44,
    paddingVertical: 16,
  },
  texteBoutonPrincipal: { fontFamily: polices.extraGras, fontSize: 32, color: couleurs.creme },
});
