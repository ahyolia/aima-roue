import type { ObjetEpuisable } from '../../domain/types';
import { lireEpuises, recompense } from '../recompense';

const CAS_EPUISES: ObjetEpuisable[][] = [[], ['tshirt'], ['stylo'], ['tshirt', 'stylo']];

describe('recompense — table attendue', () => {
  it.each([
    [0, [], ['sticker'], 'merci'],
    [1, [], ['sticker'], 'merci'],
    [2, [], ['sticker', 'stylo'], 'bravo'],
    [3, [], ['sticker', 'tshirt'], 'sansFaute'],
    [0, ['tshirt'], ['sticker'], 'merci'],
    [1, ['tshirt'], ['sticker'], 'merci'],
    [2, ['tshirt'], ['sticker', 'stylo'], 'bravo'],
    [3, ['tshirt'], ['sticker', 'stylo'], 'sansFaute'],
    [0, ['stylo'], ['sticker'], 'merci'],
    [1, ['stylo'], ['sticker'], 'merci'],
    [2, ['stylo'], ['sticker'], 'bravo'],
    [3, ['stylo'], ['sticker', 'tshirt'], 'sansFaute'],
    [0, ['tshirt', 'stylo'], ['sticker'], 'merci'],
    [1, ['tshirt', 'stylo'], ['sticker'], 'merci'],
    [2, ['tshirt', 'stylo'], ['sticker'], 'bravo'],
    [3, ['tshirt', 'stylo'], ['sticker'], 'sansFaute'],
  ] as const)('%i bonne(s), épuisés %j → %j (%s)', (n, epuises, objets, palier) => {
    const r = recompense(n, epuises);
    expect(r.objets).toEqual(objets);
    expect(r.palier).toBe(palier);
  });
});

describe('recompense — invariants', () => {
  for (const epuises of CAS_EPUISES) {
    for (const n of [0, 1, 2, 3]) {
      it(`${n} bonne(s), épuisés ${JSON.stringify(epuises)} : sticker présent, aucun objet épuisé`, () => {
        const r = recompense(n, epuises);
        expect(r.objets).toContain('sticker');
        for (const e of epuises) expect(r.objets).not.toContain(e);
      });
    }
  }

  it('garde le message du palier même si un objet est épuisé', () => {
    expect(recompense(3, ['tshirt', 'stylo']).message).toBe('Sans-faute !');
    expect(recompense(2, ['stylo']).message).toBe('Bravo !');
    expect(recompense(1).message).toBe("Merci d'avoir joué ! Et en bonus : 3 nouvelles infos sur le don.");
  });
});

describe('lireEpuises', () => {
  it.each([
    ['', []],
    ['?epuise=tshirt', ['tshirt']],
    ['?epuise=stylo', ['stylo']],
    ['?epuise=tshirt,stylo', ['tshirt', 'stylo']],
    ['?epuise=T-shirt, Stylo', ['tshirt', 'stylo']],
    ['?epuise=casquette,stylo,', ['stylo']],
    ['?epuise=sticker', []],
    ['?epuise=stylo&epuise=tshirt', ['stylo', 'tshirt']],
    ['?autre=1', []],
  ])('%s → %j', (recherche, attendu) => {
    expect(lireEpuises(recherche)).toEqual(attendu);
  });
});
