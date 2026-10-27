import Ionicons from '@expo/vector-icons/Ionicons';
import { NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans/400Regular';
import { NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans/700Bold';
import { NunitoSans_800ExtraBold } from '@expo-google-fonts/nunito-sans/800ExtraBold';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico/400Regular';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { couleurs } from './src/config/theme';
import { MockQuestionsAdapter } from './src/data/MockQuestionsAdapter';
import { EcranRoue } from './src/screens/EcranRoue';

// Point unique de branchement des données : remplacer par un ApiQuestionsAdapter plus tard.
const adapter = new MockQuestionsAdapter();

export default function App() {
  // Polices embarquées dans le bundle : aucun appel réseau.
  const [chargees, erreur] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
    Pacifico_400Regular,
    ...Ionicons.font,
  });

  if (!chargees && !erreur) return <View style={{ flex: 1, backgroundColor: couleurs.creme }} />;
  return <EcranRoue adapter={adapter} />;
}
