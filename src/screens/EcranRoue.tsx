import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewInstance } from 'react-native';
import { Annonce, Bouton, Scene, Texte } from '../components/base';
import { CarteQuestion, CarteReponse, CarteTheme, ChoixJoker } from '../components/Cartes';
import { PanneauAnimateur } from '../components/PanneauAnimateur';
import { Pointeur, Roue } from '../components/Roue';
import { textes } from '../config/content';
import { estThemeId, SEGMENTS } from '../config/segments';
import { couleurs, durees, polices, tailles } from '../config/theme';
import type { QuestionsAdapter } from '../data/QuestionsAdapter';
import type { Rng, ThemeId } from '../domain/types';
import { useClavier } from '../hooks/useClavier';
import { useMouvementReduit } from '../hooks/useMouvementReduit';
import { useQuestions } from '../hooks/useQuestions';
import { useStats } from '../hooks/useStats';
import { rngCrypto } from '../logic/aleatoire';
import { angleArret } from '../logic/angle';
import { choisirQuestion } from '../logic/questions';
import { type Etat, etatInitial, reducteur } from '../logic/reducteur';
import { ajouterLancer, ajouterReponse, statsVides } from '../logic/stats';
import { tirerSegment } from '../logic/tirage';

const DIAMETRE_ROUE = 820;

interface Props {
  adapter: QuestionsAdapter;
  rng?: Rng;
}

/** Message pour les lecteurs d'écran, dérivé de l'état : thème tiré puis verdict. */
function messageAnnonce(etat: Etat): string {
  switch (etat.phase) {
    case 'rotation':
      return textes.rotationEnCours;
    case 'theme': {
      const segment = SEGMENTS[etat.segmentIndex];
      return segment.id === 'joker' ? textes.annonceJoker : textes.annonceTheme(segment.libelle);
    }
    case 'choixJoker':
      return textes.annonceJoker;
    case 'reponse': {
      const bonne = etat.verdict === 'bonne';
      const titre = bonne ? textes.verdictBonneTitre : textes.verdictPresqueTitre;
      const message = bonne ? textes.verdictBonneMessage : textes.verdictPresqueMessage;
      return `${titre} ${message} ${etat.question.explication}`;
    }
    default:
      return '';
  }
}

export function EcranRoue({ adapter, rng = rngCrypto }: Props) {
  const [etat, dispatch] = useReducer(reducteur, etatInitial);
  const { stats, maj } = useStats();
  const questions = useQuestions(adapter);
  const reduit = useMouvementReduit();
  const pret = stats !== null && questions !== null;

  const [rotation] = useState(() => new Animated.Value(0));
  const [panneau, setPanneau] = useState(false);
  const [son, setSon] = useState(true);

  const refLance = useRef<ViewInstance>(null);
  const refCarteQuestion = useRef<ViewInstance>(null);
  const refSuivant = useRef<ViewInstance>(null);
  const refJoker = useRef<ViewInstance>(null);
  const refFermerPanneau = useRef<ViewInstance>(null);

  /* ---------- Actions ---------- */

  const lancer = useCallback(() => {
    if (!pret || etat.phase !== 'accueil') return;
    // Le résultat est tiré AVANT l'animation.
    const segmentIndex = tirerSegment(SEGMENTS.length, rng);
    const angle = angleArret({
      index: segmentIndex,
      nbSegments: SEGMENTS.length,
      angleCourant: etat.angle,
      tours: reduit ? durees.toursReduits : durees.tours,
      rng,
    });
    dispatch({ type: 'LANCER', segmentIndex, angle });
  }, [pret, etat, reduit, rng]);

  const tirerQuestion = useCallback(
    (themeId: ThemeId) => choisirQuestion(questions?.[themeId] ?? [], etat.historique[themeId] ?? [], rng),
    [questions, etat.historique, rng],
  );

  const choisirTheme = useCallback(
    (themeId: ThemeId) => {
      const tirage = tirerQuestion(themeId);
      if (tirage) dispatch({ type: 'CHOISIR_THEME', themeId, tirage });
    },
    [tirerQuestion],
  );

  const repondre = useCallback((index: number) => dispatch({ type: 'REPONDRE', index }), []);
  const suivant = useCallback(() => dispatch({ type: 'JOUEUR_SUIVANT' }), []);

  useClavier({
    lancer,
    suivant,
    basculerPanneau: () => setPanneau((p) => !p),
    basculerSon: () => setSon((s) => !s),
    echap: () => setPanneau(false),
    chiffre: (n) => {
      if (etat.phase === 'question') repondre(n - 1);
      if (etat.phase === 'choixJoker') {
        const choix = SEGMENTS.filter((s) => s.id !== 'joker')[n - 1];
        if (choix && estThemeId(choix.id)) choisirTheme(choix.id);
      }
    },
  });

  /* ---------- Effets de transition (une seule fois par nouvel état) ---------- */

  const dernierEtat = useRef<Etat | null>(null);

  useEffect(() => {
    if (dernierEtat.current === etat) return;
    const precedent = dernierEtat.current;
    dernierEtat.current = etat;

    switch (etat.phase) {
      case 'accueil':
        if (precedent) refLance.current?.focus();
        return;

      case 'rotation': {
        maj(ajouterLancer);
        Animated.timing(rotation, {
          toValue: etat.angle,
          duration: reduit ? durees.rotationReduite : durees.rotation,
          easing: reduit ? Easing.out(Easing.quad) : Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (finished) dispatch({ type: 'ROTATION_TERMINEE' });
        });
        return;
      }

      case 'theme': {
        const id = SEGMENTS[etat.segmentIndex].id;
        // Pas d'annulation : aucune action ne peut quitter la phase « theme » avant ce minuteur.
        setTimeout(() => {
          if (!estThemeId(id)) {
            dispatch({ type: 'THEME_REVELE', joker: true });
            return;
          }
          const tirage = tirerQuestion(id);
          // Thème sans question : on laisse choisir un autre thème plutôt que de bloquer.
          if (tirage) dispatch({ type: 'THEME_REVELE', joker: false, themeId: id, tirage });
          else dispatch({ type: 'THEME_REVELE', joker: true });
        }, durees.revelationTheme);
        return;
      }

      case 'choixJoker':
        refJoker.current?.focus();
        return;

      case 'question':
        refCarteQuestion.current?.focus();
        return;

      case 'reponse': {
        const bonne = etat.verdict === 'bonne';
        maj((s) => ajouterReponse(s, etat.themeId, bonne));
        refSuivant.current?.focus();
        return;
      }
    }
    // L'effet ne rejoue rien pour un même état (garde dernierEtat) : les autres dépendances
    // servent seulement à disposer de leurs valeurs à jour.
  }, [etat, maj, reduit, rotation, tirerQuestion]);

  useEffect(() => {
    if (panneau) refFermerPanneau.current?.focus();
  }, [panneau]);

  /* ---------- Rendu ---------- */

  const enAccueil = etat.phase === 'accueil';

  return (
    <Scene>
      <View style={styles.mise}>
        <View style={styles.colonneRoue}>
          <View style={styles.pointeur}>
            <Pointeur />
          </View>
          <View>
            <Roue diametre={DIAMETRE_ROUE} rotation={rotation} />
            <View style={styles.centre} pointerEvents="box-none">
              <Bouton
                ref={refLance}
                onPress={lancer}
                disabled={!enAccueil || !pret}
                accessibilityLabel={textes.boutonLancerAccessible}
                accessibilityState={{ disabled: !enAccueil || !pret }}
                style={styles.boutonLance}
              >
                <Texte style={styles.texteLance}>{textes.boutonLancer}</Texte>
              </Bouton>
            </View>
          </View>
        </View>

        <View style={styles.colonneDroite}>
          {/* Emplacement réservé au logo (assets/brand/logo-aima.svg) : volontairement vide. */}
          <View style={styles.emplacementLogo} />
          <Texte style={styles.titre} role="heading">
            {textes.titre}
          </Texte>
          <View style={styles.bandeau}>
            <Texte style={styles.bandeauTitre}>{textes.bandeauLancer}</Texte>
            <Texte style={styles.bandeauSousTitre}>{textes.bandeauSousTitre}</Texte>
          </View>
          {!pret && <Texte>{textes.chargement}</Texte>}
          {etat.phase === 'rotation' && <Texte style={styles.etat}>{textes.rotationEnCours}</Texte>}
        </View>
      </View>

      {!enAccueil && etat.phase !== 'rotation' && (
        <View style={styles.voile}>
          {etat.phase === 'theme' && <CarteTheme id={SEGMENTS[etat.segmentIndex].id} />}
          {etat.phase === 'choixJoker' && <ChoixJoker onChoisir={choisirTheme} refPremier={refJoker} />}
          {etat.phase === 'question' && (
            <CarteQuestion
              question={etat.question}
              themeId={etat.themeId}
              onRepondre={repondre}
              refCarte={refCarteQuestion}
            />
          )}
          {etat.phase === 'reponse' && (
            <CarteReponse
              question={etat.question}
              indexChoisi={etat.indexChoisi}
              verdict={etat.verdict}
              onSuivant={suivant}
              refSuivant={refSuivant}
            />
          )}
        </View>
      )}

      {panneau && stats && (
        <PanneauAnimateur
          stats={stats}
          son={son}
          onFermer={() => setPanneau(false)}
          onRemiseAZero={() => maj((s) => statsVides(s.date))}
          refFermer={refFermerPanneau}
        />
      )}

      <Bouton
        onPress={() => setPanneau((p) => !p)}
        accessibilityLabel={textes.panneauTitre}
        style={styles.boutonPanneau}
      >
        <Texte style={styles.texteBoutonPanneau}>H</Texte>
      </Bouton>

      <Annonce message={messageAnnonce(etat)} />
    </Scene>
  );
}

const styles = StyleSheet.create({
  mise: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 80 },
  colonneRoue: { width: 1000, alignItems: 'center' },
  pointeur: { zIndex: 2, marginBottom: -24 },
  centre: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  boutonLance: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: couleurs.aubergine,
    borderColor: couleurs.lime,
    borderWidth: 10,
  },
  texteLance: { fontFamily: polices.extraGras, fontSize: 40, color: couleurs.creme },
  colonneDroite: { flex: 1, alignItems: 'center', gap: 32 },
  emplacementLogo: { width: 360, height: 120 },
  titre: { fontFamily: polices.titre, fontSize: tailles.titre, lineHeight: 110 },
  bandeau: {
    backgroundColor: couleurs.lime,
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: 'center',
  },
  bandeauTitre: { fontFamily: polices.extraGras, fontSize: 48 },
  bandeauSousTitre: { fontFamily: polices.gras, fontSize: 28 },
  compteur: {
    borderColor: couleurs.aubergine,
    borderWidth: 4,
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  texteCompteur: { fontFamily: polices.extraGras, fontSize: 34 },
  etat: { fontFamily: polices.gras, fontSize: 32 },
  voile: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(246, 241, 228, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonPanneau: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: couleurs.aubergine,
  },
  texteBoutonPanneau: { fontFamily: polices.extraGras, fontSize: 24 },
});
