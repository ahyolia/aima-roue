import Ionicons from '@expo/vector-icons/Ionicons';
import type { Ref } from 'react';
import { StyleSheet, View, type ViewInstance } from 'react-native';
import { textes } from '../config/content';
import { iconeTheme, libelleTheme, SEGMENTS } from '../config/segments';
import { couleurs, polices, tailles } from '../config/theme';
import type { Question, SegmentId, ThemeId, Verdict } from '../domain/types';
import { Bouton, Texte } from './base';

/** Badge icône + libellé (jamais la couleur seule). */
function BadgeTheme({ id, grand = false }: { id: SegmentId; grand?: boolean }) {
  return (
    <View style={styles.badge}>
      <Ionicons name={iconeTheme(id)} size={grand ? 72 : 36} color={couleurs.aubergine} />
      <Texte style={grand ? styles.themeGrand : styles.themePetit}>{libelleTheme(id)}</Texte>
    </View>
  );
}

export function CarteTheme({ id }: { id: SegmentId }) {
  return (
    <View style={styles.carte}>
      <Texte style={styles.surtitre}>{textes.themeTire}</Texte>
      <BadgeTheme id={id} grand />
    </View>
  );
}

const THEMES_JOKER = SEGMENTS.filter((s) => s.id !== 'joker');

export function ChoixJoker({
  onChoisir,
  refPremier,
}: {
  onChoisir: (id: ThemeId) => void;
  refPremier: Ref<ViewInstance>;
}) {
  return (
    <View style={styles.carte}>
      <BadgeTheme id="joker" grand />
      <Texte style={styles.consigne}>{textes.jokerConsigne}</Texte>
      <View style={styles.grilleJoker}>
        {THEMES_JOKER.map((s, i) => (
          <Bouton
            key={s.id}
            ref={i === 0 ? refPremier : undefined}
            accessibilityLabel={`${i + 1}. ${s.libelle}`}
            onPress={() => onChoisir(s.id as ThemeId)}
            style={styles.choixJoker}
          >
            <Texte style={styles.numero}>{i + 1}</Texte>
            <Ionicons name={s.icone} size={36} color={couleurs.aubergine} />
            <Texte style={styles.texteReponse}>{s.libelle}</Texte>
          </Bouton>
        ))}
      </View>
    </View>
  );
}

export function CarteQuestion({
  question,
  themeId,
  onRepondre,
  refCarte,
}: {
  question: Question;
  themeId: ThemeId;
  onRepondre: (index: number) => void;
  refCarte: Ref<ViewInstance>;
}) {
  return (
    <View style={styles.carte} ref={refCarte} tabIndex={-1} accessibilityLabel={question.question}>
      <BadgeTheme id={themeId} />
      <Texte style={styles.question}>{question.question}</Texte>
      <Texte style={styles.consigne}>{textes.consigneReponse}</Texte>
      <View style={styles.reponses}>
        {question.reponses.map((r, i) => (
          <Bouton
            key={r.texte}
            accessibilityLabel={`${i + 1}. ${r.texte}`}
            onPress={() => onRepondre(i)}
            style={styles.reponse}
          >
            <Texte style={styles.numero}>{i + 1}</Texte>
            <Texte style={styles.texteReponse}>{r.texte}</Texte>
          </Bouton>
        ))}
      </View>
    </View>
  );
}

export function CarteReponse({
  question,
  indexChoisi,
  verdict,
  onSuivant,
  refSuivant,
}: {
  question: Question;
  indexChoisi: number;
  verdict: Verdict;
  onSuivant: () => void;
  refSuivant: Ref<ViewInstance>;
}) {
  const bonne = verdict === 'bonne';
  return (
    <View style={styles.carte}>
      <View style={styles.badge}>
        <Ionicons
          name={bonne ? 'sparkles' : 'heart'}
          size={72}
          color={bonne ? couleurs.petrole : couleurs.aubergine}
        />
        <Texte style={styles.verdict}>{bonne ? textes.verdictBonneTitre : textes.verdictPresqueTitre}</Texte>
      </View>
      <Texte style={styles.message}>{bonne ? textes.verdictBonneMessage : textes.verdictPresqueMessage}</Texte>

      <View style={styles.reponses}>
        {question.reponses.map((r, i) => {
          const estCorrecte = r.correcte;
          const estChoisie = i === indexChoisi;
          return (
            <View
              key={r.texte}
              style={[styles.reponse, estCorrecte && styles.reponseCorrecte, estChoisie && !estCorrecte && styles.reponseChoisie]}
            >
              {estCorrecte ? (
                <Ionicons name="checkmark-circle" size={36} color={couleurs.creme} />
              ) : estChoisie ? (
                <Ionicons name="arrow-forward-circle" size={36} color={couleurs.aubergine} />
              ) : null}
              <Texte style={[styles.texteReponse, estCorrecte && styles.texteCreme]}>{r.texte}</Texte>
              {estCorrecte ? (
                <Texte style={[styles.etiquette, styles.texteCreme]}>{textes.etiquetteBonneReponse}</Texte>
              ) : estChoisie ? (
                <Texte style={styles.etiquette}>{textes.etiquetteTaReponse}</Texte>
              ) : null}
            </View>
          );
        })}
      </View>

      <Texte style={styles.explication}>{question.explication}</Texte>

      <Bouton ref={refSuivant} onPress={onSuivant} style={styles.boutonPrincipal}>
        <Texte style={styles.texteBoutonPrincipal}>{textes.boutonJoueurSuivant} (N)</Texte>
      </Bouton>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    width: 1400,
    maxHeight: 1000,
    backgroundColor: couleurs.creme,
    borderColor: couleurs.aubergine,
    borderWidth: 6,
    borderRadius: 40,
    padding: 48,
    gap: 28,
    alignItems: 'center',
  },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  surtitre: { fontFamily: polices.gras, fontSize: 36 },
  themeGrand: { fontFamily: polices.extraGras, fontSize: 64 },
  themePetit: { fontFamily: polices.gras, fontSize: 30 },
  consigne: { fontFamily: polices.texte, fontSize: tailles.texte },
  question: { fontFamily: polices.extraGras, fontSize: tailles.question, textAlign: 'center', lineHeight: 52 },
  reponses: { width: '100%', gap: 16 },
  reponse: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 20,
    minHeight: 80,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: couleurs.aubergine,
    backgroundColor: couleurs.creme,
  },
  reponseCorrecte: { backgroundColor: couleurs.petrole, borderColor: couleurs.petrole },
  reponseChoisie: { borderStyle: 'dashed' },
  numero: {
    fontFamily: polices.extraGras,
    fontSize: 30,
    width: 52,
    height: 52,
    lineHeight: 52,
    textAlign: 'center',
    borderRadius: 26,
    backgroundColor: couleurs.aubergine,
    color: couleurs.creme,
    overflow: 'hidden',
  },
  texteReponse: { fontFamily: polices.gras, fontSize: 32, flexShrink: 1 },
  texteCreme: { color: couleurs.creme },
  etiquette: { fontFamily: polices.extraGras, fontSize: tailles.libelle, marginLeft: 'auto' },
  grilleJoker: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  choixJoker: {
    flexDirection: 'row',
    gap: 16,
    width: 630,
    minHeight: 88,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: couleurs.aubergine,
    backgroundColor: couleurs.creme,
  },
  verdict: { fontFamily: polices.extraGras, fontSize: tailles.verdict },
  message: { fontFamily: polices.gras, fontSize: 32, textAlign: 'center' },
  explication: { fontFamily: polices.texte, fontSize: 30, textAlign: 'center', lineHeight: 42 },
  boutonPrincipal: {
    backgroundColor: couleurs.aubergine,
    borderRadius: 999,
    paddingHorizontal: 48,
    paddingVertical: 18,
  },
  texteBoutonPrincipal: { fontFamily: polices.extraGras, fontSize: 32, color: couleurs.creme },
});
