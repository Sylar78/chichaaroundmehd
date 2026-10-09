import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarteLieu } from '@/components/CarteLieu';
import { Pastille } from '@/components/Pastille';
import { useLieux } from '@/hooks/useLieux';
import { useFiltres, type Tri } from '@/state/filtres';
import { colors, font } from '@/theme';

const TRIS: { id: Tri; label: string }[] = [
  { id: 'distance', label: 'Distance' },
  { id: 'note', label: 'Note' },
  { id: 'prix', label: 'Prix' },
];

/** Écran 2 : liste triable des lieux. */
export default function EcranListe() {
  const insets = useSafeAreaInsets();
  const { lieux } = useLieux();
  const { tri, setTri } = useFiltres();

  return (
    <FlatList
      data={lieux}
      keyExtractor={(l) => l.id}
      renderItem={({ item }) => <CarteLieu lieu={item} />}
      style={styles.ecran}
      contentContainerStyle={[styles.contenu, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 120 }]}
      ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
      ListHeaderComponent={
        <View style={styles.entete}>
          <View style={styles.ligne}>
            <View>
              <Text style={styles.sousTitre}>Autour de</Text>
              <Text style={styles.lieu}>Ma position</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filtres"
              onPress={() => router.push('/filtres')}
              style={styles.boutonFiltres}>
              <Ionicons name="options-outline" size={20} color={colors.ink} />
            </Pressable>
          </View>
          <Text style={styles.titre} accessibilityRole="header">
            Chichas à proximité
          </Text>
          <View style={styles.tris} accessibilityLabel="Trier par">
            {TRIS.map((t) => (
              <Pastille key={t.id} label={t.label} actif={tri === t.id} onPress={() => setTri(t.id)} />
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={<Text style={styles.vide}>Aucun lieu ne correspond à vos filtres.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: colors.background },
  contenu: { paddingHorizontal: 16 },
  entete: { gap: 14, marginBottom: 18 },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sousTitre: { fontSize: 13, fontWeight: font.semibold, color: colors.inkMuted },
  lieu: { fontSize: 17, fontWeight: font.bold, color: colors.ink },
  boutonFiltres: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titre: { fontSize: 30, fontWeight: font.heavy, color: colors.ink, letterSpacing: -0.5 },
  tris: { flexDirection: 'row', gap: 8 },
  vide: { fontSize: 15, color: colors.inkMuted, textAlign: 'center', paddingVertical: 40 },
});
