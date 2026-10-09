import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarteLieu } from '@/components/CarteLieu';
import { EnTeteEcran } from '@/components/EnTeteEcran';
import { usePosition } from '@/hooks/usePosition';
import { chargerLieuxParIds } from '@/lib/donnees';
import { distanceEnMetres, estOuvert } from '@/lib/format';
import { useFavoris } from '@/state/favoris';
import { colors } from '@/theme';
import type { Lieu } from '@/types';

/** Lieux mis en favori, du plus proche au plus lointain. */
export default function EcranFavoris() {
  const insets = useSafeAreaInsets();
  const { favoris } = useFavoris();
  const { position } = usePosition();
  const [lieux, setLieux] = useState<Lieu[] | null>(null);

  useEffect(() => {
    let annule = false;
    chargerLieuxParIds(favoris)
      .then((l) => !annule && setLieux(l))
      .catch(() => !annule && setLieux([]));
    return () => {
      annule = true;
    };
  }, [favoris]);

  const tries = useMemo(
    () =>
      (lieux ?? [])
        .map((l) => ({ ...l, distance: distanceEnMetres(position, l), ouvert: estOuvert(l.horaires) }))
        .sort((a, b) => a.distance - b.distance),
    [lieux, position],
  );

  return (
    <View style={styles.ecran}>
      <EnTeteEcran titre="Favoris" />
      {lieux === null ? (
        <ActivityIndicator color={colors.ink} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tries}
          keyExtractor={(l) => l.id}
          renderItem={({ item }) => <CarteLieu lieu={item} />}
          contentContainerStyle={[styles.contenu, { paddingBottom: insets.bottom + 32 }]}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          ListEmptyComponent={
            <Text style={styles.vide}>Touchez le cœur sur la fiche d’un lieu pour le retrouver ici.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: colors.background },
  contenu: { paddingHorizontal: 16, paddingTop: 4 },
  vide: { fontSize: 15, color: colors.inkMuted, textAlign: 'center', paddingVertical: 40, lineHeight: 21 },
});
