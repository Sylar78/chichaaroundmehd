import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FiltresProvider } from '@/state/filtres';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FiltresProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(onglets)" />
          <Stack.Screen name="lieu/[id]" />
          <Stack.Screen name="filtres" options={{ presentation: 'modal' }} />
          <Stack.Screen name="avis/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="connexion" options={{ presentation: 'modal' }} />
        </Stack>
      </FiltresProvider>
    </SafeAreaProvider>
  );
}
