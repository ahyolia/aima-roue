import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Historique } from '../domain/types';
import { dateLocale, historiqueDuJour, type HistoriqueStocke } from '../logic/questions';

/*
 * Stockage local (localStorage sur le web). Aucune donnée personnelle :
 * seulement l'historique des questions posées et la préférence de son.
 */
const CLE_HISTORIQUE = 'aima-roue:historique:v1';
const CLE_SON = 'aima-roue:son:v1';

export async function chargerHistorique(maintenant = new Date()): Promise<Historique> {
  try {
    const brut = await AsyncStorage.getItem(CLE_HISTORIQUE);
    return brut ? historiqueDuJour(JSON.parse(brut), dateLocale(maintenant)) : {};
  } catch {
    return {};
  }
}

export async function sauverHistorique(parTheme: Historique, maintenant = new Date()): Promise<void> {
  const valeur: HistoriqueStocke = { date: dateLocale(maintenant), parTheme };
  try {
    await AsyncStorage.setItem(CLE_HISTORIQUE, JSON.stringify(valeur));
  } catch {
    // Stockage indisponible : la roue continue, sans persistance.
  }
}

export async function chargerSon(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLE_SON)) !== 'coupe';
  } catch {
    return true;
  }
}

export async function sauverSon(actif: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE_SON, actif ? 'actif' : 'coupe');
  } catch {
    // Préférence non mémorisée : sans conséquence.
  }
}
