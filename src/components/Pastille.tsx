import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, font, radius } from '@/theme';

type Props = {
  label: string;
  actif?: boolean;
  onPress?: () => void;
  /** Pastille blanche avec ombre, posée sur la carte. */
  flottante?: boolean;
  style?: ViewStyle;
};

/** Pastille de filtre ou de tri (chip). */
export function Pastille({ label, actif = false, onPress, flottante = false, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: actif }}
      onPress={onPress}
      style={[
        styles.base,
        actif ? styles.actif : flottante ? styles.flottante : styles.inactif,
        style,
      ]}>
      <Text style={[styles.texte, actif && styles.texteActif]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actif: { backgroundColor: colors.ink },
  inactif: { backgroundColor: colors.surface },
  flottante: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  texte: { fontSize: 14, fontWeight: font.semibold, color: colors.ink },
  texteActif: { color: colors.white },
});
