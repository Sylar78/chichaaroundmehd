import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bouton } from '@/components/Bouton';
import { supabase } from '@/lib/supabase';
import { colors, font, radius } from '@/theme';

/** Écran 7 : connexion / inscription par e-mail (Supabase Auth). */
export default function EcranConnexion() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [majeur, setMajeur] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const valide = /\S+@\S+\.\S+/.test(email) && motDePasse.length >= 8 && majeur;

  const valider = async () => {
    if (!supabase) {
      Alert.alert('Mode démo', 'Renseignez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY pour activer les comptes.');
      return;
    }
    setEnvoi(true);
    const { error } =
      mode === 'connexion'
        ? await supabase.auth.signInWithPassword({ email, password: motDePasse })
        : await supabase.auth.signUp({ email, password: motDePasse, options: { data: { majeur_confirme: true } } });
    setEnvoi(false);
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }
    if (mode === 'inscription') {
      Alert.alert('Vérifiez vos e-mails', 'Un lien de confirmation vient de vous être envoyé.');
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.ecran} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.contenu, { paddingTop: insets.top + 56 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          onPress={() => router.back()}
          style={[styles.fermer, { top: insets.top + 8 }]}>
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>

        <View style={{ gap: 10 }}>
          <View style={styles.logo}>
            <Ionicons name="location-outline" size={28} color={colors.white} />
          </View>
          <Text style={styles.titre} accessibilityRole="header">
            Chicha Around Me
          </Text>
          <Text style={styles.intro}>Connectez-vous pour enregistrer vos favoris et publier des avis.</Text>
        </View>

        <View style={{ gap: 16 }}>
          <View style={styles.champGroupe}>
            <Text style={styles.label} nativeID="label-email">
              Adresse e-mail
            </Text>
            <TextInput
              accessibilityLabelledBy="label-email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="vous@exemple.fr"
              placeholderTextColor={colors.inkMuted}
              style={styles.champ}
            />
          </View>
          <View style={styles.champGroupe}>
            <Text style={styles.label} nativeID="label-mdp">
              Mot de passe (8 caractères minimum)
            </Text>
            <TextInput
              accessibilityLabelledBy="label-mdp"
              value={motDePasse}
              onChangeText={setMotDePasse}
              secureTextEntry
              autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'}
              style={styles.champ}
            />
          </View>
          <View style={styles.majeur}>
            <Text style={styles.texte}>Je confirme avoir 18 ans ou plus</Text>
            <Switch
              accessibilityLabel="Je confirme avoir 18 ans ou plus"
              value={majeur}
              onValueChange={setMajeur}
              trackColor={{ true: colors.ink, false: colors.border }}
            />
          </View>
          <Bouton
            label={envoi ? 'Patientez…' : mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
            desactive={!valide || envoi}
            onPress={valider}
          />
        </View>
      </View>

      <View style={[styles.bas, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.texte}>{mode === 'connexion' ? 'Pas encore de compte ?' : 'Déjà inscrit ?'} </Text>
        <Pressable accessibilityRole="button" onPress={() => setMode(mode === 'connexion' ? 'inscription' : 'connexion')}>
          <Text style={[styles.texte, styles.lien]}>{mode === 'connexion' ? 'Créer un compte' : 'Se connecter'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: colors.background },
  contenu: { flex: 1, paddingHorizontal: 20, gap: 28 },
  fermer: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titre: { fontSize: 32, fontWeight: font.heavy, color: colors.ink, letterSpacing: -0.5 },
  intro: { fontSize: 16, color: colors.inkMuted, lineHeight: 22 },
  champGroupe: { gap: 6 },
  label: { fontSize: 15, fontWeight: font.bold, color: colors.ink },
  champ: {
    height: 54,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.ink,
  },
  majeur: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 },
  texte: { fontSize: 15, color: colors.ink },
  lien: { fontWeight: font.bold, textDecorationLine: 'underline' },
  bas: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
