import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { NB_LANCERS, textes } from '../config/content';
import { couleurs, polices } from '../config/theme';
import type { Verdict } from '../domain/types';
import { Texte } from './base';
import { cheminGoutte } from './decor/formes';

type EtatGoutte = Verdict | 'aVenir' | 'enCours';

/**
 * Goutte d'un lancer (jamais la couleur seule) :
 * à venir = contour pointillé + numéro ; bonne = pleine + coche ; presque = claire + ampoule.
 */
export function GoutteLancer({ numero, etat, taille = 64 }: { numero: number; etat: EtatGoutte; taille?: number }) {
  const l = taille * 0.78;
  const h = taille;
  const aVenir = etat === 'aVenir' || etat === 'enCours';
  const fond = etat === 'bonne' ? couleurs.petrole : etat === 'presque' ? couleurs.rose : etat === 'enCours' ? couleurs.lime : couleurs.creme;
  const label =
    etat === 'bonne' ? textes.goutteBonne(numero) : etat === 'presque' ? textes.gouttePresque(numero) : textes.goutteAVenir(numero);
  return (
    <View style={{ width: l + 8, height: h + 8 }} accessibilityLabel={label} role="img">
      <Svg width={l + 8} height={h + 8} style={StyleSheet.absoluteFill}>
        <G transform="translate(4 4)">
          <Path
            d={cheminGoutte(l, h)}
            fill={fond}
            stroke={couleurs.aubergine}
            strokeWidth={4}
            strokeDasharray={aVenir ? '7 6' : undefined}
            strokeLinejoin="round"
          />
        </G>
      </Svg>
      <View style={[styles.contenu, { paddingTop: h * 0.36 }]}>
        {aVenir ? (
          <Texte style={[styles.numero, { fontSize: taille * 0.36 }]}>{numero}</Texte>
        ) : (
          <Ionicons
            name={etat === 'bonne' ? 'checkmark' : 'bulb'}
            size={taille * 0.42}
            color={etat === 'bonne' ? couleurs.creme : couleurs.aubergine}
          />
        )}
      </View>
    </View>
  );
}

/** Les 3 gouttes d'une partie. */
export function Gouttes({ resultats, lancer, taille }: { resultats: Verdict[]; lancer: number; taille?: number }) {
  return (
    <View style={styles.gouttes}>
      {Array.from({ length: NB_LANCERS }, (_, i) => {
        const etat: EtatGoutte = resultats[i] ?? (i === lancer - 1 ? 'enCours' : 'aVenir');
        return <GoutteLancer key={i} numero={i + 1} etat={etat} taille={taille} />;
      })}
    </View>
  );
}

/** Compteur de lancers visible en haut de la colonne de droite. */
export function Compteur({ lancer, resultats }: { lancer: number; resultats: Verdict[] }) {
  return (
    <View style={styles.compteur}>
      <Texte style={styles.texte}>{textes.compteur(lancer)}</Texte>
      <Gouttes resultats={resultats} lancer={lancer} />
    </View>
  );
}

const styles = StyleSheet.create({
  compteur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    backgroundColor: couleurs.creme,
    borderColor: couleurs.aubergine,
    borderWidth: 4,
    borderRadius: 999,
    paddingLeft: 32,
    paddingRight: 24,
    paddingVertical: 6,
  },
  texte: { fontFamily: polices.extraGras, fontSize: 34 },
  gouttes: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  contenu: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  numero: { fontFamily: polices.extraGras },
});
