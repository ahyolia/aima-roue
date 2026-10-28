import type { ObjetId, Palier } from '../domain/types';

/** Nombre de lancers par partie. */
export const NB_LANCERS = 3;

/** Thème dont les réponses gardent l'ordre « Vrai » puis « Faux ». */
export const THEME_VRAI_FAUX = 'vrai-faux';

/** Segment Joker (ajouté aux 5 thèmes du fichier de questions). */
export const segmentJoker = { libelle: 'Joker de la goutte', icone: 'sparkles' } as const;

/** Noms des objets offerts, affichés sous leur illustration. */
export const nomsObjets: Record<ObjetId, string> = {
  sticker: 'Sticker',
  stylo: 'Stylo',
  tshirt: 'T-shirt',
};

/** Messages des paliers. Le message ne change pas si un objet est épuisé. */
export const messagesPaliers: Record<Palier, string> = {
  merci: "Merci d'avoir joué ! Et en bonus : 3 nouvelles infos sur le don.",
  bravo: 'Bravo !',
  sansFaute: 'Sans-faute !',
};

/** Libellés courts des paliers dans l'échelle des récompenses. */
export const libellesPaliers: Record<Palier, string> = {
  merci: '0 ou 1/3',
  bravo: '2/3',
  sansFaute: '3/3',
};

/** Libellés complets, lus par les lecteurs d'écran. */
export const libellesPaliersAccessibles: Record<Palier, string> = {
  merci: '0 ou 1 bonne réponse',
  bravo: '2 bonnes réponses',
  sansFaute: '3 bonnes réponses',
};

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;

/**
 * Textes d'interface. Vocabulaire interdit (vérifié par un test) : chance, jackpot,
 * perdu, raté, gagné, faux. On dit « Tu repars avec », jamais « tu as gagné ».
 */
export const textes = {
  titre: 'La roue des questions',
  sousTitre: '3 lancers, 3 questions',
  boutonCommencer: 'Lance la roue !',
  boutonLancer: 'Lance !',
  boutonLancerAccessible: 'Lancer la roue',
  chargement: 'Préparation de la roue…',
  aideClavier: 'Espace ou Entrée pour lancer',

  compteur: (lancer: number) => `Lancer ${lancer}/${NB_LANCERS}`,
  annonceCompteur: (lancer: number, bonnes: number) =>
    `Lancer ${lancer} sur ${NB_LANCERS}, ${pluriel(bonnes, 'bonne réponse')}.`,
  goutteAVenir: (n: number) => `Lancer ${n} : à venir`,
  goutteBonne: (n: number) => `Lancer ${n} : bonne réponse`,
  gouttePresque: (n: number) => `Lancer ${n} : presque`,

  rotationEnCours: 'La roue tourne…',
  themeTire: 'Ton thème :',
  annonceTheme: (theme: string) => `Thème tiré : ${theme}.`,
  jokerConsigne: 'Choisis ton thème (touches 1 à 5)',
  annonceJoker: 'Joker de la goutte : choisis ton thème.',
  consigneReponse: 'Choisis ta réponse (touches 1 à 4)',

  verdictBonneTitre: 'Bravo !',
  verdictPresqueTitre: 'Presque !',
  verdictBonneMessage: 'Tu as trouvé la bonne réponse.',
  verdictPresqueMessage: 'Voici la bonne réponse :',
  etiquetteBonneReponse: 'Bonne réponse',
  lancerSuivant: (prochain: number) => `Lancer suivant (${prochain}/${NB_LANCERS})`,
  voirRecompenses: 'Voir mes récompenses',

  echelleTitre: 'Tes récompenses',
  palierAtteint: 'Atteint',
  palierAccessible: (palier: string, objets: string, atteint: boolean) =>
    `${palier} : ${objets}${atteint ? ', palier atteint' : ''}.`,
  annonceRecompenses: (objets: string) => `Tu repars avec : ${objets}.`,
  score: (bonnes: number) => `${bonnes}/${NB_LANCERS}`,
  scoreAccessible: (bonnes: number) => `${pluriel(bonnes, 'bonne réponse')} sur ${NB_LANCERS}`,
  tuReparsAvec: 'Tu repars avec :',
  boutonJoueurSuivant: 'Joueur suivant',

  sonActive: 'Son activé',
  sonCoupe: 'Son coupé',
} as const;
