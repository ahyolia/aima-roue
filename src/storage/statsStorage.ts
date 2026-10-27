import AsyncStorage from '@react-native-async-storage/async-storage';
import { lireStats, type Stats } from '../logic/stats';

const CLE = 'aima-roue:stats:v2';

/** Stockage local (localStorage sur le web). Ne contient que des agrégats anonymes. */
export async function chargerStats(): Promise<Stats | null> {
  try {
    const brut = await AsyncStorage.getItem(CLE);
    return brut ? lireStats(JSON.parse(brut)) : null;
  } catch {
    return null;
  }
}

export async function sauverStats(stats: Stats): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE, JSON.stringify(stats));
  } catch {
    // Stockage indisponible : la roue continue de fonctionner, sans persistance.
  }
}
