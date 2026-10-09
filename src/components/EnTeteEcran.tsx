import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font } from '@/theme';

/** Bouton retour rond et grand titre, pour les écrans secondaires. */
export function EnTeteEcran({ titre }: { titre: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.conteneur, { paddingTop: insets.top + 8 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => router.back()} style={styles.retour}>
        <Ionicons name="chevron-back" size={22} color={colors.ink} />
      </Pressable>
      <Text style={styles.titre} accessibilityRole="header">
        {titre}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { paddingHorizontal: 16, paddingBottom: 12, gap: 14, backgroundColor: colors.background },
  retour: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titre: { fontSize: 30, fontWeight: font.heavy, color: colors.ink, letterSpacing: -0.5 },
});
