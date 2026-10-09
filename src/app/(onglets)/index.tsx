import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarteLieu } from '@/components/CarteLieu';
import { CarteMap } from '@/components/CarteMap';
import { Pastille } from '@/components/Pastille';
import { useLieux } from '@/hooks/useLieux';
import { useFiltres } from '@/state/filtres';
import { colors, font, radius, shadow } from '@/theme';

/** Écran 1 : carte des lieux autour de l'utilisateur. */
export default function EcranCarte() {
  const insets = useSafeAreaInsets();
  const { lieux, position } = useLieux();
  const { filtres, setFiltres, tri, setTri } = useFiltres();
  const [recherche, setRecherche] = useState('');
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [recentrerCle, setRecentrerCle] = useState(0);

  const visibles = useMemo(
    () => lieux.filter((l) => l.nom.toLowerCase().includes(recherche.trim().toLowerCase())),
    [lieux, recherche],
  );
  const selection = visibles.find((l) => l.id === selectionId) ?? visibles[0];

  return (
    <View style={styles.ecran}>
      <CarteMap
        lieux={visibles}
        position={position}
        selectionId={selection?.id}
        onSelect={setSelectionId}
        recentrerCle={recentrerCle}
      />

      <View style={[styles.haut, { top: insets.top + 8 }]}>
        <View style={styles.recherche}>
          <Ionicons name="search" size={20} color={colors.ink} />
          <TextInput
            value={recherche}
            onChangeText={setRecherche}
            placeholder="Rechercher un lieu, un quartier"
            placeholderTextColor={colors.inkMuted}
            style={styles.champ}
            accessibilityLabel="Rechercher un lieu"
            returnKeyType="search"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pastilles}>
          <Pastille label="Filtres" actif onPress={() => router.push('/filtres')} />
          <Pastille
            label="Ouvert"
            flottante
            actif={filtres.ouvertMaintenant}
            onPress={() => setFiltres({ ...filtres, ouvertMaintenant: !filtres.ouvertMaintenant })}
          />
          <Pastille label="Les mieux notés" flottante actif={tri === 'note'} onPress={() => setTri(tri === 'note' ? 'distance' : 'note')} />
          <Pastille label="Prix" flottante actif={tri === 'prix'} onPress={() => setTri(tri === 'prix' ? 'distance' : 'prix')} />
        </ScrollView>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Me recentrer" onPress={() => setRecentrerCle((c) => c + 1)} style={styles.recentrer}>
        <Ionicons name="navigate-outline" size={22} color={colors.ink} />
      </Pressable>

      <View style={[styles.panneau, { paddingBottom: insets.bottom + 96 }]}>
        <View style={styles.poignee} />
        <View style={styles.enTete}>
          <Text style={styles.titre} accessibilityRole="header">
            {visibles.length} lieu{visibles.length > 1 ? 'x' : ''} à proximité
          </Text>
          <Link href="/liste" style={styles.lien}>
            Tout voir
          </Link>
        </View>
        {selection ? (
          <CarteLieu lieu={selection} variante="compacte" />
        ) : (
          <Text style={styles.vide}>Aucun lieu ne correspond à vos filtres.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: colors.map },
  haut: { position: 'absolute', left: 16, right: 16, gap: 10 },
  recherche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 26,
    backgroundColor: colors.white,
    ...shadow.soft,
  },
  champ: { flex: 1, fontSize: 16, color: colors.ink },
  pastilles: { gap: 8, paddingVertical: 4 },
  recentrer: {
    position: 'absolute',
    right: 16,
    bottom: 330,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  panneau: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.floating,
  },
  poignee: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border },
  enTete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  titre: { fontSize: 20, fontWeight: font.heavy, color: colors.ink },
  lien: { fontSize: 14, fontWeight: font.semibold, color: colors.ink, textDecorationLine: 'underline' },
  vide: { fontSize: 15, color: colors.inkMuted, paddingVertical: 24, textAlign: 'center' },
});
