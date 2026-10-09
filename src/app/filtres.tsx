import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bouton } from '@/components/Bouton';
import { Pastille } from '@/components/Pastille';
import { filtresParDefaut, useFiltres, type Filtres } from '@/state/filtres';
import { colors, font } from '@/theme';
import type { NiveauPrix } from '@/types';

const DISTANCES = [1, 2, 5, 10, 20];
const NOTES: { valeur: number; label: string }[] = [
  { valeur: 0, label: 'Toutes' },
  { valeur: 3.5, label: '3,5+' },
  { valeur: 4, label: '4+' },
  { valeur: 4.5, label: '4,5+' },
];
const PRATIQUE: { cle: 'ouvertMaintenant' | 'terrasse' | 'wifi' | 'accessiblePmr'; label: string }[] = [
  { cle: 'ouvertMaintenant', label: 'Ouvert maintenant' },
  { cle: 'terrasse', label: 'Terrasse' },
  { cle: 'wifi', label: 'Wi-Fi' },
  { cle: 'accessiblePmr', label: 'Accessible PMR' },
];

/** Écran 4 : filtres (modale). Les choix ne s'appliquent qu'à la validation. */
export default function EcranFiltres() {
  const insets = useSafeAreaInsets();
  const { filtres, setFiltres } = useFiltres();
  const [brouillon, setBrouillon] = useState<Filtres>(filtres);

  const maj = (partiel: Partial<Filtres>) => setBrouillon((b) => ({ ...b, ...partiel }));
  const basculerPrix = (n: NiveauPrix) =>
    maj({
      niveauxPrix: brouillon.niveauxPrix.includes(n)
        ? brouillon.niveauxPrix.filter((x) => x !== n)
        : [...brouillon.niveauxPrix, n],
    });

  return (
    <View style={styles.ecran}>
      <View style={[styles.entete, { paddingTop: insets.top + 8 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => router.back()} style={styles.fermer}>
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.titre} accessibilityRole="header">
          Filtres
        </Text>
        <Pressable accessibilityRole="button" onPress={() => setBrouillon(filtresParDefaut)} style={styles.effacer}>
          <Text style={styles.effacerTexte}>Effacer</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Distance maximale</Text>
          <View style={styles.rangee}>
            {DISTANCES.map((d) => (
              <Pastille
                key={d}
                label={`${d} km`}
                actif={brouillon.distanceMaxKm === d}
                onPress={() => maj({ distanceMaxKm: d })}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Note minimale</Text>
          <View style={styles.rangee}>
            {NOTES.map((n) => (
              <Pastille key={n.valeur} label={n.label} actif={brouillon.noteMin === n.valeur} onPress={() => maj({ noteMin: n.valeur })} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Prix</Text>
          <View style={styles.rangee}>
            {([1, 2, 3] as NiveauPrix[]).map((n) => (
              <Pastille
                key={n}
                label={'€'.repeat(n)}
                actif={brouillon.niveauxPrix.includes(n)}
                onPress={() => basculerPrix(n)}
                style={{ flex: 1 }}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Pratique</Text>
          {PRATIQUE.map((p) => (
            <View key={p.cle} style={styles.interrupteur}>
              <Text style={styles.texte}>{p.label}</Text>
              <Switch
                accessibilityLabel={p.label}
                value={brouillon[p.cle]}
                onValueChange={(v) => maj({ [p.cle]: v })}
                trackColor={{ true: colors.ink, false: colors.border }}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.pied, { paddingBottom: insets.bottom + 14 }]}>
        <Bouton
          label="Afficher les lieux"
          onPress={() => {
            setFiltres(brouillon);
            router.back();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: colors.background },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  fermer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titre: { fontSize: 18, fontWeight: font.heavy, color: colors.ink },
  effacer: { height: 44, justifyContent: 'center' },
  effacerTexte: { fontSize: 15, fontWeight: font.semibold, color: colors.ink, textDecorationLine: 'underline' },
  contenu: { padding: 16, gap: 26 },
  section: { gap: 12 },
  sectionTitre: { fontSize: 17, fontWeight: font.heavy, color: colors.ink },
  rangee: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interrupteur: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48 },
  texte: { fontSize: 16, color: colors.ink },
  pied: { paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E8E8E8' },
});
