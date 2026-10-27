import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewInstance } from 'react-native';
import { Annonce, Bouton, Scene, Texte } from '../components/base';
import { CarteQuestion, CarteReponse, CarteTheme, ChoixJoker, LARGEUR_CARTE } from '../components/Cartes';
import { Confettis } from '../components/decor/Confettis';
import { CENTRE_ROUE, Coeurs, Etincelles, Fond } from '../components/decor/Fond';
import { type Expression, Mascotte } from '../components/Mascotte';
import { PanneauAnimateur } from '../components/PanneauAnimateur';
import { type ModeAmpoules, RAYON_JANTE, Roue } from '../components/Roue';
import { LARGEUR_SOCLE, Socle } from '../components/Socle';
import { textes } from '../config/content';
import { estThemeId, SEGMENTS } from '../config/segments';
import { couleurs, durees, polices, tailles } from '../config/theme';
import type { QuestionsAdapter } from '../data/QuestionsAdapter';
import type { Rng, ThemeId } from '../domain/types';
import { useClavier } from '../hooks/useClavier';
import { useMouvementReduit } from '../hooks/useMouvementReduit';
import { useQuestions } from '../hooks/useQuestions';
import { useSon } from '../hooks/useSon';
import { useStats } from '../hooks/useStats';
import { rngCrypto } from '../logic/aleatoire';
import { angleArret, largeurSegment } from '../logic/angle';
import { choisirQuestion } from '../logic/questions';
import { type Etat, etatInitial, reducteur } from '../logic/reducteur';
import { ajouterLancer, ajouterReponse, statsVides } from '../logic/stats';
import { tirerSegment } from '../logic/tirage';

const TAILLE_MASCOTTE = 170;

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

function expressionMascotte(etat: Etat): Expression {
  if (etat.phase === 'rotation' || etat.phase === 'theme') return 'excitee';
  if (etat.phase === 'reponse') return 'ravie';
  return 'attente';
}

function modeAmpoules(etat: Etat): ModeAmpoules {
  if (etat.phase === 'rotation') return 'rotation';
  if (etat.phase === 'reponse' && etat.verdict === 'bonne') return 'fete';
  return 'attente';
}

export function EcranRoue({ adapter, rng = rngCrypto }: Props) {
  const [etat, dispatch] = useReducer(reducteur, etatInitial);
  const { stats, maj } = useStats();
  const questions = useQuestions(adapter);
  const reduit = useMouvementReduit();
  const pret = stats !== null && questions !== null;

  const [rotation] = useState(() => new Animated.Value(0));
  const [oscillation] = useState(() => new Animated.Value(0));
  const [panneau, setPanneau] = useState(false);
  const [son, setSon] = useState(true);
  const sons = useSon(son);

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
        // Un « tic » et une pichenette du pointeur à chaque segment qui passe.
        const L = largeurSegment(SEGMENTS.length);
        let secteur = Math.floor((precedent?.angle ?? 0) / L);
        const ecoute = rotation.addListener(({ value }) => {
          const s = Math.floor(value / L);
          if (s === secteur) return;
          secteur = s;
          sons.tic();
          if (!reduit) {
            oscillation.setValue(-16);
            Animated.spring(oscillation, { toValue: 0, friction: 3, tension: 160, useNativeDriver: false }).start();
          }
        });
        Animated.timing(rotation, {
          toValue: etat.angle,
          duration: reduit ? durees.rotationReduite : durees.rotation,
          easing: reduit ? Easing.out(Easing.quad) : Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start(({ finished }) => {
          rotation.removeListener(ecoute);
          if (finished) dispatch({ type: 'ROTATION_TERMINEE' });
        });
        return;
      }

      case 'theme': {
        sons.pop();
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
        if (bonne) sons.fanfare();
        else sons.carillon();
        refSuivant.current?.focus();
        return;
      }
    }
    // L'effet ne rejoue rien pour un même état (garde dernierEtat) : les autres dépendances
    // servent seulement à disposer de leurs valeurs à jour.
  }, [etat, maj, reduit, rotation, oscillation, sons, tirerQuestion]);

  useEffect(() => {
    if (panneau) refFermerPanneau.current?.focus();
  }, [panneau]);

  /* ---------- Rendu ---------- */

  const enAccueil = etat.phase === 'accueil';
  const carteVisible = !enAccueil && etat.phase !== 'rotation';
  const fete = etat.phase === 'reponse' && etat.verdict === 'bonne' && !reduit;

  return (
    <Scene>
      <Fond reduit={reduit} />
      <Coeurs reduit={reduit} />

      <View style={styles.socle} pointerEvents="none">
        <Socle />
      </View>

      <View style={styles.roue}>
        <Roue
          rotation={rotation}
          oscillationPointeur={oscillation}
          modeAmpoules={modeAmpoules(etat)}
          reduit={reduit}
          boutonActif={enAccueil && pret}
          onLancer={lancer}
          refBouton={refLance}
        />
      </View>

      {/* Mascotte perchée sur la jante, au-dessus de la roue */}
      <View style={styles.mascotte} pointerEvents="none">
        <Mascotte expression={expressionMascotte(etat)} taille={TAILLE_MASCOTTE} reduit={reduit} />
      </View>

      <Etincelles reduit={reduit} />

      <View style={styles.zoneDroite}>
        {carteVisible ? (
          <>
            {etat.phase === 'theme' && <CarteTheme id={SEGMENTS[etat.segmentIndex].id} reduit={reduit} />}
            {etat.phase === 'choixJoker' && (
              <ChoixJoker onChoisir={choisirTheme} refPremier={refJoker} reduit={reduit} />
            )}
            {etat.phase === 'question' && (
              <CarteQuestion
                question={etat.question}
                themeId={etat.themeId}
                onRepondre={repondre}
                refCarte={refCarteQuestion}
                reduit={reduit}
              />
            )}
            {etat.phase === 'reponse' && (
              <CarteReponse
                question={etat.question}
                indexChoisi={etat.indexChoisi}
                verdict={etat.verdict}
                onSuivant={suivant}
                refSuivant={refSuivant}
                reduit={reduit}
              />
            )}
          </>
        ) : (
          <Accueil enRotation={etat.phase === 'rotation'} pret={pret} />
        )}
      </View>

      {/* Onglet animateur, comme l'onglet latéral de la référence */}
      <Bouton
        onPress={() => setPanneau((p) => !p)}
        accessibilityLabel={textes.panneauTitre}
        style={styles.onglet}
      >
        <Ionicons name={son ? 'volume-high' : 'volume-mute'} size={26} color={couleurs.creme} />
        <Texte style={styles.texteOnglet}>{textes.ongletAnimateur}</Texte>
      </Bouton>

      {panneau && stats && (
        <PanneauAnimateur
          stats={stats}
          son={son}
          onFermer={() => setPanneau(false)}
          onRemiseAZero={() => maj((s) => statsVides(s.date))}
          refFermer={refFermerPanneau}
        />
      )}

      <Confettis actif={fete} />
      <Annonce message={messageAnnonce(etat)} />
    </Scene>
  );
}

/** Colonne de droite à l'accueil : titre, étapes, pilule de remerciement. */
function Accueil({ enRotation, pret }: { enRotation: boolean; pret: boolean }) {
  return (
    <View style={styles.accueil}>
      {/* Emplacement réservé au logo (assets/brand/logo-aima.svg) : volontairement vide. */}
      <View style={styles.emplacementLogo} />
      <Texte style={styles.titre} role="heading">
        {textes.titre}
      </Texte>
      <Texte style={styles.sousTitre}>{textes.sousTitre}</Texte>

      <View>
        <View style={styles.ombreEtapes} />
        <View style={styles.etapes}>
          {textes.etapes.map(([icone, texte], i) => (
            <View key={texte} style={styles.etape}>
              <View style={styles.pastilleEtape}>
                <Ionicons name={icone} size={34} color={couleurs.aubergine} />
              </View>
              <Texte style={styles.texteEtape}>
                <Texte style={styles.numeroEtape}>{i + 1}. </Texte>
                {texte}
              </Texte>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.pilule}>
        <Ionicons name={enRotation ? 'sync' : 'heart'} size={30} color={couleurs.aubergine} />
        <Texte style={styles.textePilule}>
          {!pret ? textes.chargement : enRotation ? textes.rotationEnCours : textes.merciQuestionnaire}
        </Texte>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  socle: {
    position: 'absolute',
    left: CENTRE_ROUE.x - LARGEUR_SOCLE / 2,
    top: CENTRE_ROUE.y + RAYON_JANTE - 60,
  },
  mascotte: {
    position: 'absolute',
    left: CENTRE_ROUE.x - TAILLE_MASCOTTE / 2,
    // Le bas de la goutte repose sur la jante.
    top: CENTRE_ROUE.y - RAYON_JANTE + 34 - TAILLE_MASCOTTE * 1.1,
  },
  roue: {
    position: 'absolute',
    left: CENTRE_ROUE.x - RAYON_JANTE,
    top: CENTRE_ROUE.y - RAYON_JANTE,
  },
  zoneDroite: {
    position: 'absolute',
    left: 1040,
    top: 0,
    width: LARGEUR_CARTE + 20,
    height: 1080,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accueil: { alignItems: 'center', gap: 26, width: 760 },
  emplacementLogo: { width: 360, height: 90 },
  titre: { fontFamily: polices.titre, fontSize: tailles.titre, lineHeight: 150 },
  sousTitre: { fontFamily: polices.gras, fontSize: 30, textAlign: 'center', lineHeight: 40 },
  ombreEtapes: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: -14,
    bottom: -14,
    borderRadius: 36,
    backgroundColor: couleurs.lime,
  },
  etapes: {
    width: 700,
    backgroundColor: couleurs.creme,
    borderColor: couleurs.aubergine,
    borderWidth: 5,
    borderRadius: 36,
    paddingHorizontal: 32,
    paddingVertical: 26,
    gap: 18,
  },
  etape: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  pastilleEtape: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: couleurs.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texteEtape: { fontFamily: polices.gras, fontSize: 28, flexShrink: 1, lineHeight: 36 },
  numeroEtape: { fontFamily: polices.extraGras, fontSize: 28 },
  pilule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: couleurs.orange,
    borderRadius: 999,
    paddingHorizontal: 36,
    paddingVertical: 16,
    marginTop: 10,
  },
  textePilule: { fontFamily: polices.extraGras, fontSize: 30 },
  onglet: {
    position: 'absolute',
    right: 0,
    bottom: 18,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: couleurs.aubergine,
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
    paddingLeft: 26,
    paddingRight: 30,
    paddingVertical: 12,
  },
  texteOnglet: { fontFamily: polices.extraGras, fontSize: 24, color: couleurs.creme },
});
