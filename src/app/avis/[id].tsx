import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bouton } from '@/components/Bouton';
import { useLieu } from '@/hooks/useLieux';
import { supabase } from '@/lib/supabase';
import { colors, font, radius } from '@/theme';

const LIBELLES = ['Choisissez une note', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'];
const LONGUEUR_MIN = 20;

/** Écran 5 : dépôt d'un avis (modale). L'avis part en modération avant publication. */
export default function EcranAvis() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lieu = useLieu(id);
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const valide = note > 0 && commentaire.trim().length >= LONGUEUR_MIN;

  const publier = async () => {
    if (!lieu || !valide) return;
    if (!supabase) {
      Alert.alert('Mode démo', 'Supabase n’est pas encore configuré : l’avis n’a pas été envoyé.');
      router.back();
      return;
    }
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push('/connexion');
      return;
    }
    setEnvoi(true);
    const { error } = await supabase
      .from('avis')
      .insert({ lieu_id: lieu.id, utilisateur_id: data.user.id, note, commentaire: commentaire.trim() });
    setEnvoi(false);
    if (error) {
      Alert.alert('Envoi impossible', error.code === '23505' ? 'Vous avez déjà donné votre avis sur ce lieu.' : error.message);
      return;
    }
    Alert.alert('Merci !', 'Votre avis sera visible après vérification.');
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.ecran} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.entete, { paddingTop: insets.top + 8 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => router.back()} style={styles.retour}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.nomLieu}>{lieu?.nom}</Text>
      </View>

      <View style={styles.contenu}>
        <Text style={styles.titre} accessibilityRole="header">
          Comment s’est passée votre visite ?
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Votre note</Text>
          <View style={styles.etoiles} accessibilityRole="radiogroup">
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                accessibilityRole="radio"
                accessibilityState={{ checked: note === n }}
                accessibilityLabel={`${n} sur 5`}
                onPress={() => setNote(n)}
                style={styles.etoile}>
                <Ionicons name={n <= note ? 'star' : 'star-outline'} size={28} color={colors.ink} />
              </Pressable>
            ))}
          </View>
          <Text style={styles.libelle}>{LIBELLES[note]}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre} nativeID="label-avis">
            Votre avis
          </Text>
          <TextInput
            accessibilityLabelledBy="label-avis"
            value={commentaire}
            onChangeText={setCommentaire}
            placeholder="Ambiance, accueil, service, propreté…"
            placeholderTextColor={colors.inkMuted}
            multiline
            maxLength={1000}
            style={styles.champ}
          />
          <Text style={styles.aide}>
            {LONGUEUR_MIN} caractères minimum. Les avis sont vérifiés avant publication. Un seul avis par lieu et par
            compte.
          </Text>
        </View>
      </View>

      <View style={[styles.pied, { paddingBottom: insets.bottom + 14 }]}>
        <Bouton label={envoi ? 'Envoi…' : 'Publier mon avis'} desactive={!valide || envoi} onPress={publier} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: colors.background },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  retour: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nomLieu: { fontSize: 15, fontWeight: font.semibold, color: colors.inkMuted },
  contenu: { flex: 1, padding: 16, gap: 28 },
  titre: { fontSize: 30, fontWeight: font.heavy, color: colors.ink, letterSpacing: -0.5, lineHeight: 36 },
  section: { gap: 12 },
  sectionTitre: { fontSize: 17, fontWeight: font.heavy, color: colors.ink },
  etoiles: { flexDirection: 'row', gap: 8 },
  etoile: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libelle: { fontSize: 15, fontWeight: font.semibold, color: colors.ink },
  champ: {
    minHeight: 130,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  aide: { fontSize: 13, color: colors.inkMuted, lineHeight: 18 },
  pied: { paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E8E8E8' },
});
