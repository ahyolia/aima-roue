/** Palette Aïma (aplats uniquement, pas de dégradés). */
export const couleurs = {
  creme: '#F6F1E4',
  rose: '#FAD3C9',
  aubergine: '#3E2430',
  lime: '#C6DA2C',
  petrole: '#136B7A',
  orange: '#F0A03C',
  mousse: '#6E9B3E',
  corail: '#F07A5E',
  /* Déclinaisons en aplat (reflets et ombres = formes plus claires ou plus foncées). */
  roseClair: '#FCE3DB',
  laitonClair: '#F8C978',
  laitonFonce: '#C77A1F',
  laitonOmbre: '#9A5A12',
  ampouleEteinte: '#EBCB93',
  corailClair: '#F6A38E',
  limeClair: '#E2EC8F',
} as const;

/** Polices embarquées (chargées dans App.tsx). Pacifico : un seul grand titre. */
export const polices = {
  texte: 'NunitoSans_400Regular',
  gras: 'NunitoSans_700Bold',
  extraGras: 'NunitoSans_800ExtraBold',
  titre: 'Pacifico_400Regular',
} as const;

/** Tailles en px sur la scène 1920×1080 (lisibilité à 2 m). */
export const tailles = {
  libelle: 24,
  texte: 28,
  question: 40,
  verdict: 64,
  titre: 88,
  cibleMin: 48,
} as const;

export const durees = {
  rotation: 5200,
  rotationReduite: 900,
  tours: 6,
  toursReduits: 1,
  revelationTheme: 1500,
} as const;

/** Anneau de focus : liseré crème + double anneau aubergine 3 px (web). */
export const anneauFocus = {
  boxShadow: `0 0 0 2px ${couleurs.creme}, 0 0 0 5px ${couleurs.aubergine}, 0 0 0 7px ${couleurs.creme}, 0 0 0 10px ${couleurs.aubergine}`,
} as const;

export interface PaireContraste {
  avantPlan: string;
  fond: string;
  usage: string;
  /** texte : seuil 4,5:1 ; graphique (icônes, anneaux) : seuil 3:1. */
  type: 'texte' | 'graphique';
}

/** Toutes les paires avant-plan / fond utilisées dans l'interface (testées). */
export const pairesContraste: PaireContraste[] = [
  { avantPlan: couleurs.aubergine, fond: couleurs.creme, usage: 'texte courant, cartes, cartouches', type: 'texte' },
  { avantPlan: couleurs.aubergine, fond: couleurs.rose, usage: 'texte posé sur les formes roses', type: 'texte' },
  { avantPlan: couleurs.aubergine, fond: couleurs.roseClair, usage: 'texte posé sur les rayons rose clair', type: 'texte' },
  { avantPlan: couleurs.creme, fond: couleurs.aubergine, usage: 'bouton Lance !, plaque du socle, onglet animateur', type: 'texte' },
  { avantPlan: couleurs.aubergine, fond: couleurs.lime, usage: 'pastilles et bandeaux lime', type: 'texte' },
  { avantPlan: couleurs.aubergine, fond: couleurs.orange, usage: 'pilule orange', type: 'texte' },
  { avantPlan: couleurs.creme, fond: couleurs.petrole, usage: 'réponse correcte surlignée', type: 'texte' },
  { avantPlan: couleurs.aubergine, fond: couleurs.creme, usage: 'icônes de segment dans le cartouche', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.lime, usage: 'icônes des étapes sur pastille lime', type: 'graphique' },
  { avantPlan: couleurs.lime, fond: couleurs.aubergine, usage: 'goutte du Joker, anneau du bouton, pointeur', type: 'graphique' },
  { avantPlan: couleurs.petrole, fond: couleurs.creme, usage: 'icône de bonne réponse', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.creme, usage: 'anneau de focus sur fond crème', type: 'graphique' },
  { avantPlan: couleurs.creme, fond: couleurs.aubergine, usage: 'liseré de focus sur bouton aubergine', type: 'graphique' },
];
