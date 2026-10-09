import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, font, radius } from '@/theme';

type Props = {
  label: string;
  onPress?: () => void;
  variante?: 'plein' | 'doux' | 'contour';
  icone?: keyof typeof Ionicons.glyphMap;
  desactive?: boolean;
  style?: ViewStyle;
};

export function Bouton({ label, onPress, variante = 'plein', icone, desactive, style }: Props) {
  const couleurTexte = variante === 'plein' ? colors.white : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desactive }}
      disabled={desactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variante],
        (pressed || desactive) && { opacity: 0.6 },
        style,
      ]}>
      {icone && <Ionicons name={icone} size={18} color={couleurTexte} />}
      <Text style={[styles.texte, { color: couleurTexte }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  plein: { backgroundColor: colors.ink },
  doux: { backgroundColor: colors.surface },
  contour: { borderWidth: 2, borderColor: colors.ink },
  texte: { fontSize: 16, fontWeight: font.bold },
});
