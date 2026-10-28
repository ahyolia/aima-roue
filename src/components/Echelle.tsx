import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { libellesPaliers, libellesPaliersAccessibles, nomsObjets, textes } from '../config/content';
import { couleurs, polices } from '../config/theme';
import type { ObjetEpuisable, Palier } from '../domain/types';
import { PALIERS, recompense } from '../logic/recompense';
import { Texte } from './base';
import { IllustrationObjet } from './Objets';

/**
 * Échelle « Tes récompenses », compacte, en marches qui montent.
 * Les objets viennent de recompense() : un objet épuisé n'y apparaît jamais.
 */
export function Echelle({ epuises, atteint }: { epuises: readonly ObjetEpuisable[]; atteint: Palier | null }) {
  return (
    <View style={styles.echelle}>
      <Texte style={styles.titre} role="heading">
        {textes.echelleTitre}
      </Texte>
      <View style={styles.marches}>
        {PALIERS.map(({ palier, bonnes }, i) => {
          const { objets } = recompense(bonnes, epuises);
          const noms = objets.map((o) => nomsObjets[o]).join(' + ');
          const allume = palier === atteint;
          return (
            <View
              key={palier}
              accessible
              accessibilityLabel={textes.palierAccessible(libellesPaliersAccessibles[palier], noms, allume)}
              style={[styles.marche, { minHeight: 96 + i * 14 }, allume && styles.marcheAllumee]}
            >
              {allume && (
                <View style={styles.atteint}>
                  <Ionicons name="star" size={20} color={couleurs.aubergine} />
                  <Texte style={styles.texteAtteint}>{textes.palierAtteint}</Texte>
                </View>
              )}
              <Texte style={styles.palier}>{libellesPaliers[palier]}</Texte>
              <View style={styles.objets}>
                {objets.map((o) => (
                  <IllustrationObjet key={o} id={o} taille={34} />
                ))}
              </View>
              <Texte style={styles.noms}>{noms}</Texte>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  echelle: { width: '100%', gap: 8 },
  titre: { fontFamily: polices.extraGras, fontSize: 28 },
  marches: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  marche: {
    flex: 1,
    backgroundColor: couleurs.creme,
    borderColor: couleurs.aubergine,
    borderWidth: 4,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  marcheAllumee: { backgroundColor: couleurs.lime, borderWidth: 6 },
  atteint: {
    position: 'absolute',
    top: -22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: couleurs.creme,
    borderColor: couleurs.aubergine,
    borderWidth: 3,
    borderRadius: 999,
    paddingHorizontal: 10,
  },
  texteAtteint: { fontFamily: polices.extraGras, fontSize: 24 },
  palier: { fontFamily: polices.extraGras, fontSize: 26 },
  objets: { flexDirection: 'row', gap: 4 },
  noms: { fontFamily: polices.gras, fontSize: 24, textAlign: 'center' },
});
