import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarteAvis } from '@/components/CarteAvis';
import { EnTeteEcran } from '@/components/EnTeteEcran';
import { chargerMesAvis, type AvisAvecLieu } from '@/lib/donnees';
import { useSession } from '@/state/session';
import { colors } from '@/theme';

/** Avis déposés par le membre, avec leur statut de modération. */
export default function EcranMesAvis() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const userId = session?.user.id;
  const [avis, setAvis] = useState<AvisAvecLieu[] | null>(null);

  useEffect(() => {
    if (!userId) {
      setAvis([]);
      return;
    }
    let annule = false;
    chargerMesAvis(userId)
      .then((a) => !annule && setAvis(a))
      .catch(() => !annule && setAvis([]));
    return () => {
      annule = true;
    };
  }, [userId]);

  return (
    <View style={styles.ecran}>
      <EnTeteEcran titre="Mes avis" />
      {avis === null ? (
        <ActivityIndicator color={colors.ink} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={avis}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <CarteAvis
              titre={item.nom_lieu}
              sousTitre={new Date(item.cree_le).toLocaleDateString('fr-FR')}
              note={item.note}
              commentaire={item.commentaire}
              statut={item.statut}
            />
          )}
          contentContainerStyle={[styles.contenu, { paddingBottom: insets.bottom + 32 }]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <Text style={styles.vide}>
              {userId ? 'Vous n’avez pas encore donné d’avis.' : 'Connectez-vous pour retrouver vos avis.'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: colors.background },
  contenu: { paddingHorizontal: 16, paddingTop: 4 },
  vide: { fontSize: 15, color: colors.inkMuted, textAlign: 'center', paddingVertical: 40 },
});
