import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, shadow } from '@/theme';

const ICONES: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'map-outline',
  liste: 'list',
  profil: 'person-outline',
};

/** Barre de navigation flottante à boutons ronds, comme dans les maquettes. */
export function BarreOnglets({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.conteneur, { bottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.barre} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const actif = state.index === index;
          const { options } = descriptors[route.key];
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!actif && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: actif }}
              accessibilityLabel={options.title ?? route.name}
              onPress={onPress}
              style={[styles.bouton, actif && styles.boutonActif]}>
              <Ionicons name={ICONES[route.name] ?? 'ellipse-outline'} size={22} color={actif ? colors.white : colors.ink} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  barre: {
    flexDirection: 'row',
    gap: 6,
    padding: 6,
    borderRadius: 36,
    backgroundColor: colors.white,
    ...shadow.floating,
  },
  bouton: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  boutonActif: { backgroundColor: colors.ink },
});
