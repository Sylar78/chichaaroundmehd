import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font } from '@/theme';

import type { CarteMapProps } from './CarteMap';

const DELTA = 0.03;

/**
 * Version web : `react-native-maps` n'existe que sur iOS et Android.
 * On dessine un plan simplifié où les lieux sont placés selon leur position, ce qui suffit
 * pour l'aperçu dans un navigateur.
 */
export function CarteMap({ lieux, position, selectionId, onSelect }: CarteMapProps) {
  return (
    <View style={styles.fond} accessibilityLabel="Plan des lieux">
      <Text style={styles.note}>Aperçu web : la vraie carte est sur iOS et Android</Text>
      {lieux.map((l) => {
        const x = 50 + ((l.longitude - position.longitude) / DELTA) * 100;
        const y = 50 - ((l.latitude - position.latitude) / DELTA) * 100;
        if (x < 2 || x > 98 || y < 2 || y > 98) return null;
        const actif = l.id === selectionId;
        return (
          <Pressable
            key={l.id}
            accessibilityRole="button"
            accessibilityLabel={l.nom}
            onPress={() => onSelect(l.id)}
            style={[
              styles.marqueur,
              { left: `${x}%`, top: `${y}%`, backgroundColor: actif ? colors.accent : colors.ink },
              actif && { transform: [{ scale: 1.15 }] },
            ]}>
            <Ionicons name="cafe-outline" size={18} color={colors.white} />
          </Pressable>
        );
      })}
      <View style={styles.moi} />
    </View>
  );
}

const styles = StyleSheet.create({
  fond: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.map },
  note: {
    position: 'absolute',
    left: 16,
    right: 80,
    bottom: 330,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: font.semibold,
    color: colors.inkMuted,
  },
  marqueur: {
    position: 'absolute',
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moi: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 18,
    height: 18,
    marginLeft: -9,
    marginTop: -9,
    borderRadius: 9,
    backgroundColor: colors.userDot,
    borderWidth: 3,
    borderColor: colors.white,
  },
});
