import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp } from 'react-native';

import { colors, font } from '@/theme';
import type { Lieu } from '@/types';

const TEINTES = ['#3A2E28', '#2C3440', '#24384A', '#3E3A2A'];

/** Première photo du lieu, ou un aplat de couleur tant qu'il n'y en a pas. */
export function PhotoLieu({ lieu, style }: { lieu: Lieu; style?: StyleProp<ImageStyle> }) {
  const photo = lieu.photos[0];
  if (photo) {
    return <Image source={{ uri: photo }} style={[styles.fond, style]} accessibilityIgnoresInvertColors />;
  }
  const teinte = TEINTES[lieu.id.length % TEINTES.length];
  return (
    <View style={[styles.fond, { backgroundColor: teinte }, style as object]} accessibilityElementsHidden>
      <Text style={styles.etiquette}>Photo à venir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fond: { overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'flex-start', padding: 8 },
  etiquette: {
    fontSize: 11,
    fontWeight: font.bold,
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
