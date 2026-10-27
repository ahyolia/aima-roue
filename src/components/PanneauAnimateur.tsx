import { type Ref, useState } from 'react';
import { StyleSheet, View, type ViewInstance } from 'react-native';
import { textes } from '../config/content';
import { libelleTheme } from '../config/segments';
import { couleurs, polices } from '../config/theme';
import { THEME_IDS } from '../domain/types';
import { type Stats, totaux } from '../logic/stats';
import { Bouton, Texte } from './base';

interface Props {
  stats: Stats;
  son: boolean;
  onFermer: () => void;
  onRemiseAZero: () => void;
  refFermer: Ref<ViewInstance>;
}

/** Panneau animateur (touche H) : raccourcis, statistiques anonymes, remise à zéro confirmée. */
export function PanneauAnimateur({ stats, son, onFermer, onRemiseAZero, refFermer }: Props) {
  const [confirmation, setConfirmation] = useState(false);

  return (
    <View style={styles.panneau} accessibilityLabel={textes.panneauTitre} role="dialog">
      <View style={styles.entete}>
        <Texte style={styles.titre}>{textes.panneauTitre}</Texte>
        <Bouton ref={refFermer} onPress={onFermer} accessibilityLabel={textes.fermerPanneau} style={styles.boutonSecondaire}>
          <Texte style={styles.texteBouton}>✕</Texte>
        </Bouton>
      </View>

      <Texte style={styles.section}>{textes.panneauRaccourcis}</Texte>
      {textes.raccourcis.map(([touche, action]) => (
        <View key={touche} style={styles.ligne}>
          <Texte style={styles.touche}>{touche}</Texte>
          <Texte style={styles.texte}>{action}</Texte>
        </View>
      ))}
      <Texte style={styles.texte}>{textes.son(son)}</Texte>

      <Texte style={styles.section}>{textes.panneauStats}</Texte>
      <Texte style={styles.texte}>{textes.statsLancers(stats.lancers)}</Texte>
      <Texte style={styles.texte}>{textes.statsTotal(totaux(stats).bonnes, totaux(stats).total)}</Texte>
      {THEME_IDS.map((id) => {
        const t = stats.parTheme[id] ?? { bonnes: 0, total: 0 };
        return (
          <Texte key={id} style={styles.texte}>
            {textes.statsTheme(libelleTheme(id), t.bonnes, t.total)}
          </Texte>
        );
      })}

      <View style={styles.raz}>
        {confirmation ? (
          <>
            <Texte style={styles.texte}>{textes.razQuestion}</Texte>
            <View style={styles.ligne}>
              <Bouton
                onPress={() => {
                  onRemiseAZero();
                  setConfirmation(false);
                }}
                style={styles.boutonPrincipal}
              >
                <Texte style={[styles.texteBouton, styles.texteCreme]}>{textes.razConfirmer}</Texte>
              </Bouton>
              <Bouton onPress={() => setConfirmation(false)} style={styles.boutonSecondaire}>
                <Texte style={styles.texteBouton}>{textes.razAnnuler}</Texte>
              </Bouton>
            </View>
          </>
        ) : (
          <Bouton onPress={() => setConfirmation(true)} style={styles.boutonSecondaire}>
            <Texte style={styles.texteBouton}>{textes.razBouton}</Texte>
          </Bouton>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panneau: {
    position: 'absolute',
    top: 40,
    right: 40,
    width: 640,
    padding: 32,
    gap: 10,
    backgroundColor: couleurs.creme,
    borderColor: couleurs.aubergine,
    borderWidth: 4,
    borderRadius: 28,
  },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titre: { fontFamily: polices.extraGras, fontSize: 32 },
  section: { fontFamily: polices.extraGras, fontSize: 26, marginTop: 12 },
  ligne: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  touche: { fontFamily: polices.extraGras, fontSize: 24, minWidth: 190 },
  texte: { fontSize: 24 },
  raz: { marginTop: 16, gap: 12 },
  boutonPrincipal: {
    backgroundColor: couleurs.aubergine,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  boutonSecondaire: {
    borderColor: couleurs.aubergine,
    borderWidth: 3,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  texteBouton: { fontFamily: polices.extraGras, fontSize: 24 },
  texteCreme: { color: couleurs.creme },
});
