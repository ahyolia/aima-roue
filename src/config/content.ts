import type { SegmentId } from '../domain/types';

/** Nom officiel de l'association : pas encore arbitré, à changer ici uniquement. */
export const NOM_ASSOCIATION = "l'association des donneurs de sang";

/** Objectif du compteur collectif du stand. */
export const OBJECTIF_COMPTEUR = 100;

/** Libellés des segments (lignes affichées sur la roue + libellé complet). */
export const libellesSegments: Record<SegmentId, { lignes: string[]; complet: string }> = {
  bases: { lignes: ['Les bases', 'du don'], complet: 'Les bases du don' },
  groupes: { lignes: ['Groupes', 'sanguins'], complet: 'Groupes sanguins' },
  association: { lignes: ["L'association"], complet: "L'association" },
  vraiFaux: { lignes: ['Vrai', 'ou faux ?'], complet: 'Vrai ou faux ?' },
  voyage: { lignes: ['Le voyage', "d'une poche"], complet: "Le voyage d'une poche" },
  joker: { lignes: ['Joker de', 'la goutte'], complet: 'Joker de la goutte' },
};

/** Textes d'interface. Aucun vocabulaire de jeu d'argent ici (vérifié par un test). */
export const textes = {
  titre: 'La roue Aïma',
  bandeauLancer: '1 lancer offert',
  bandeauSousTitre: 'Merci pour ton questionnaire !',
  boutonLancer: 'Lance !',
  boutonLancerAccessible: 'Lancer la roue',
  compteur: (x: number, objectif: number) => `Bonnes réponses du stand : ${x} / ${objectif}`,
  rotationEnCours: 'La roue tourne…',
  themeTire: 'Thème :',
  annonceTheme: (theme: string) => `Thème tiré : ${theme}.`,
  jokerTitre: 'Joker de la goutte !',
  jokerConsigne: 'Choisis ton thème',
  annonceJoker: 'Joker de la goutte : choisis ton thème.',
  consigneReponse: 'Choisis ta réponse (touches 1 à 4)',
  verdictBonneTitre: 'Bravo !',
  verdictBonneMessage: 'Bonne réponse ! Un goodie bonus t’attend.',
  verdictPresqueTitre: 'Presque !',
  verdictPresqueMessage: 'Merci d’avoir joué ! Voici l’explication, et un sticker pour toi.',
  etiquetteBonneReponse: 'Bonne réponse',
  etiquetteTaReponse: 'Ta réponse',
  boutonJoueurSuivant: 'Joueur suivant',
  chargement: 'Préparation de la roue…',
  panneauTitre: 'Panneau animateur',
  panneauRaccourcis: 'Raccourcis',
  raccourcis: [
    ['Espace / Entrée', 'Lancer la roue'],
    ['1 à 4', 'Répondre'],
    ['N', 'Joueur suivant'],
    ['H', 'Afficher / masquer ce panneau'],
    ['M', 'Son activé / coupé'],
  ] as const,
  panneauStats: 'Statistiques du jour (anonymes)',
  statsLancers: (n: number) => `Lancers : ${n}`,
  statsTheme: (theme: string, bonnes: number, total: number) => `${theme} : ${bonnes} / ${total}`,
  son: (actif: boolean) => (actif ? 'Son : activé' : 'Son : coupé'),
  razBouton: 'Remettre le compteur à zéro',
  razQuestion: 'Remettre le compteur collectif à zéro ?',
  razConfirmer: 'Oui, remettre à zéro',
  razAnnuler: 'Annuler',
  fermerPanneau: 'Fermer le panneau',
} as const;
