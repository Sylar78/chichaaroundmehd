import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bouton } from '@/components/Bouton';
import { PhotoLieu } from '@/components/PhotoLieu';
import { useLieu } from '@/hooks/useLieux';
import { estOuvert, formatHeure, formatNiveauPrix, formatNote, formatPrix, horaireDuJour, nomJour } from '@/lib/format';
import { useFavoris } from '@/state/favoris';
import { colors, font, radius, shadow } from '@/theme';

/** Écran 3 : fiche détaillée d'un lieu. */
export default function EcranFiche() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lieu, avis } = useLieu(id);
  const insets = useSafeAreaInsets();
  const { estFavori, basculerFavori } = useFavoris();

  if (lieu === undefined) {
    return (
      <View style={[styles.introuvable, { paddingTop: insets.top + 80 }]}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  if (!lieu) {
    return (
      <View style={[styles.introuvable, { paddingTop: insets.top + 80 }]}>
        <Text style={styles.titre}>Lieu introuvable</Text>
        <Bouton label="Retour" variante="doux" onPress={() => router.back()} />
      </View>
    );
  }

  const favori = estFavori(lieu.id);
  const ouvert = estOuvert(lieu.horaires);
  const aujourdhui = horaireDuJour(lieu.horaires);
  const jourCourant = new Date().getDay();

  const itineraire = () => {
    const q = `${lieu.latitude},${lieu.longitude}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(lieu.nom)}&ll=${q}`,
      default: `geo:0,0?q=${q}(${encodeURIComponent(lieu.nom)})`,
    });
    Linking.openURL(url);
  };

  return (
    <View style={styles.ecran}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <PhotoLieu lieu={lieu} style={styles.photo} />
        <View style={styles.corps}>
          <View style={{ gap: 6 }}>
            <Text style={styles.titre} accessibilityRole="header">
              {lieu.nom}
            </Text>
            <View style={styles.ligne}>
              <Ionicons name="star" size={15} color={colors.ink} />
              <Text style={styles.note}>{formatNote(lieu.note_moyenne)}</Text>
              <Text style={styles.muet}>
                ({lieu.nombre_avis} avis) · {formatNiveauPrix(lieu.niveau_prix)}
              </Text>
            </View>
            <Text style={styles.texte}>
              <Text style={{ color: ouvert ? colors.open : colors.inkMuted, fontWeight: font.bold }}>
                {ouvert ? 'Ouvert' : 'Fermé'}
              </Text>
              {aujourdhui && (
                <Text style={styles.muet}>
                  {' '}
                  · {formatHeure(aujourdhui.ouverture)} – {formatHeure(aujourdhui.fermeture)}
                </Text>
              )}
            </Text>
          </View>

          <View style={styles.actions}>
            <Bouton label="Itinéraire" icone="navigate-outline" onPress={itineraire} style={{ flex: 1 }} />
            <Bouton
              label="Appeler"
              icone="call-outline"
              variante="doux"
              desactive={!lieu.telephone}
              onPress={() => lieu.telephone && Linking.openURL(`tel:${lieu.telephone}`)}
              style={{ flex: 1 }}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Prix</Text>
            {lieu.prix.length === 0 && <Text style={styles.muet}>Prix non renseignés pour l’instant.</Text>}
            <View style={[styles.boite, lieu.prix.length === 0 && { display: 'none' }]}>
              {lieu.prix.map((p, i) => (
                <View key={p.libelle} style={[styles.ligneBoite, i < lieu.prix.length - 1 && styles.separateur]}>
                  <Text style={styles.texte}>{p.libelle}</Text>
                  <Text style={[styles.texte, { fontWeight: font.bold }]}>{formatPrix(p.prix)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Horaires</Text>
            {lieu.horaires.length === 0 && <Text style={styles.muet}>Horaires non renseignés.</Text>}
            {lieu.horaires.length > 0 && [1, 2, 3, 4, 5, 6, 0].map((jour) => {
              const h = lieu.horaires.find((x) => x.jour === jour);
              const gras = jour === jourCourant ? { fontWeight: font.bold, color: colors.ink } : null;
              return (
                <View key={jour} style={styles.ligneHoraire}>
                  <Text style={[styles.muet, gras]}>{nomJour(jour)}</Text>
                  <Text style={[styles.texte, gras]}>
                    {h ? `${formatHeure(h.ouverture)} – ${formatHeure(h.fermeture)}` : 'Fermé'}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Adresse</Text>
            <Text style={styles.texte}>
              {lieu.adresse}
              {'\n'}
              {lieu.ville}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.ligneEntre}>
              <Text style={styles.sectionTitre}>Avis</Text>
              <Text style={styles.muet}>
                {formatNote(lieu.note_moyenne)} sur 5 · {lieu.nombre_avis} avis
              </Text>
            </View>
            {avis.map((a) => (
              <View key={a.id} style={[styles.boite, { gap: 6, paddingVertical: 14 }]}>
                <View style={styles.ligneEntre}>
                  <Text style={[styles.texte, { fontWeight: font.bold }]}>{a.auteur}</Text>
                  <Text style={styles.muet}>{new Date(a.cree_le).toLocaleDateString('fr-FR')}</Text>
                </View>
                <Text style={[styles.texte, { fontWeight: font.bold }]}>{a.note}/5</Text>
                <Text style={styles.texte}>{a.commentaire}</Text>
              </View>
            ))}
            <Bouton
              label="Laisser un avis"
              variante="contour"
              onPress={() => router.push({ pathname: '/avis/[id]', params: { id: lieu.id } })}
            />
          </View>
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        onPress={() => router.back()}
        style={[styles.boutonRond, { top: insets.top + 8, left: 16 }]}>
        <Ionicons name="chevron-back" size={22} color={colors.ink} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        accessibilityState={{ selected: favori }}
        onPress={() => basculerFavori(lieu.id)}
        style={[styles.boutonRond, { top: insets.top + 8, right: 16 }]}>
        <Ionicons name={favori ? 'heart' : 'heart-outline'} size={22} color={favori ? colors.accent : colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: colors.background },
  introuvable: { flex: 1, padding: 16, gap: 16, backgroundColor: colors.background },
  photo: { height: 300 },
  corps: {
    marginTop: -24,
    paddingTop: 22,
    paddingHorizontal: 16,
    gap: 24,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  titre: { fontSize: 28, fontWeight: font.heavy, color: colors.ink, letterSpacing: -0.4 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ligneEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  note: { fontSize: 15, fontWeight: font.bold, color: colors.ink },
  texte: { fontSize: 15, color: colors.ink, lineHeight: 21 },
  muet: { fontSize: 15, color: colors.inkMuted },
  actions: { flexDirection: 'row', gap: 10 },
  section: { gap: 10 },
  sectionTitre: { fontSize: 19, fontWeight: font.heavy, color: colors.ink },
  boite: { borderRadius: radius.lg, backgroundColor: colors.surfaceSoft, paddingHorizontal: 14 },
  ligneBoite: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  separateur: { borderBottomWidth: 1, borderBottomColor: '#E4E4E4' },
  ligneHoraire: { flexDirection: 'row', justifyContent: 'space-between' },
  boutonRond: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
});
