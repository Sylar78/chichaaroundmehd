import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bouton } from '@/components/Bouton';
import { supabase } from '@/lib/supabase';
import { useFiltres } from '@/state/filtres';
import { colors, font, radius } from '@/theme';

const REGLAGES: { label: string; icone: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Notifications', icone: 'notifications-outline' },
  { label: 'Confidentialité', icone: 'lock-closed-outline' },
  { label: 'Aide', icone: 'help-circle-outline' },
  { label: 'À propos et mentions légales', icone: 'information-circle-outline' },
];

/** Écran 6 : profil, favoris et réglages. */
export default function EcranProfil() {
  const insets = useSafeAreaInsets();
  const { favoris } = useFiltres();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setEmail(session?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <ScrollView
      style={styles.ecran}
      contentContainerStyle={[styles.contenu, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 120 }]}>
      <View style={styles.entete}>
        <Text style={styles.titre} accessibilityRole="header" numberOfLines={1}>
          {email ?? 'Mon profil'}
        </Text>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={28} color={colors.inkMuted} />
        </View>
      </View>

      {!email && (
        <View style={styles.encart}>
          <Text style={styles.encartTexte}>Connectez-vous pour enregistrer vos favoris et publier des avis.</Text>
          <Bouton label="Se connecter" onPress={() => router.push('/connexion')} />
        </View>
      )}

      <View style={styles.tuiles}>
        <View style={styles.tuile}>
          <Ionicons name="heart-outline" size={24} color={colors.ink} />
          <Text style={styles.tuileTitre}>Favoris</Text>
          <Text style={styles.tuileSous}>
            {favoris.length} lieu{favoris.length > 1 ? 'x' : ''}
          </Text>
        </View>
        <View style={styles.tuile}>
          <Ionicons name="star-outline" size={24} color={colors.ink} />
          <Text style={styles.tuileTitre}>Mes avis</Text>
          <Text style={styles.tuileSous}>Bientôt</Text>
        </View>
      </View>

      <View>
        {REGLAGES.map((r) => (
          <Pressable key={r.label} accessibilityRole="button" style={styles.ligne}>
            <Ionicons name={r.icone} size={22} color={colors.ink} />
            <Text style={styles.ligneTexte}>{r.label}</Text>
          </Pressable>
        ))}
        {email && (
          <Pressable accessibilityRole="button" style={styles.ligne} onPress={() => supabase?.auth.signOut()}>
            <Ionicons name="log-out-outline" size={22} color={colors.danger} />
            <Text style={[styles.ligneTexte, { color: colors.danger, fontWeight: font.semibold }]}>Se déconnecter</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: colors.background },
  contenu: { paddingHorizontal: 16, gap: 24 },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  titre: { flexShrink: 1, fontSize: 30, fontWeight: font.heavy, color: colors.ink, letterSpacing: -0.5 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E4E4E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  encart: { gap: 12, padding: 16, borderRadius: radius.lg, backgroundColor: colors.surfaceSoft },
  encartTexte: { fontSize: 15, color: colors.ink, lineHeight: 21 },
  tuiles: { flexDirection: 'row', gap: 10 },
  tuile: { flex: 1, gap: 8, padding: 16, borderRadius: radius.lg, backgroundColor: colors.surface },
  tuileTitre: { fontSize: 16, fontWeight: font.bold, color: colors.ink },
  tuileSous: { fontSize: 13, color: colors.inkMuted },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  ligneTexte: { fontSize: 16, color: colors.ink },
});
