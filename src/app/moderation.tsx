import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bouton } from '@/components/Bouton';
import { CarteAvis } from '@/components/CarteAvis';
import { EnTeteEcran } from '@/components/EnTeteEcran';
import { changerStatutAvis, chargerAvisEnAttente, type AvisAvecLieu } from '@/lib/donnees';
import { useSession } from '@/state/session';
import { colors } from '@/theme';

/** File des avis en attente, réservée aux modérateurs (la RLS le garantit côté base). */
export default function EcranModeration() {
  const insets = useSafeAreaInsets();
  const { estModerateur } = useSession();
  const [avis, setAvis] = useState<AvisAvecLieu[] | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  const charger = useCallback(() => {
    chargerAvisEnAttente()
      .then(setAvis)
      .catch((e: Error) => {
        setAvis([]);
        Alert.alert('Chargement impossible', e.message);
      });
  }, []);

  useEffect(() => {
    if (estModerateur) charger();
    else setAvis([]);
  }, [estModerateur, charger]);

  const decider = async (id: string, statut: 'publie' | 'rejete') => {
    setEnCours(id);
    try {
      await changerStatutAvis(id, statut);
      setAvis((a) => a?.filter((x) => x.id !== id) ?? null);
    } catch (e) {
      Alert.alert('Action impossible', (e as Error).message);
    } finally {
      setEnCours(null);
    }
  };

  return (
    <View style={styles.ecran}>
      <EnTeteEcran titre="Modération" />
      {avis === null ? (
        <ActivityIndicator color={colors.ink} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={avis}
          keyExtractor={(a) => a.id}
          onRefresh={charger}
          refreshing={false}
          renderItem={({ item }) => (
            <CarteAvis
              titre={item.nom_lieu}
              sousTitre={`${item.auteur} · ${new Date(item.cree_le).toLocaleDateString('fr-FR')}`}
              note={item.note}
              commentaire={item.commentaire}>
              <View style={styles.actions}>
                <Bouton
                  label="Publier"
                  desactive={enCours === item.id}
                  onPress={() => decider(item.id, 'publie')}
                  style={styles.action}
                />
                <Bouton
                  label="Refuser"
                  variante="doux"
                  desactive={enCours === item.id}
                  onPress={() => decider(item.id, 'rejete')}
                  style={styles.action}
                />
              </View>
            </CarteAvis>
          )}
          contentContainerStyle={[styles.contenu, { paddingBottom: insets.bottom + 32 }]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <Text style={styles.vide}>
              {estModerateur ? 'Aucun avis en attente.' : 'Cet écran est réservé aux modérateurs.'}
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
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  action: { flex: 1, height: 46 },
  vide: { fontSize: 15, color: colors.inkMuted, textAlign: 'center', paddingVertical: 40 },
});
