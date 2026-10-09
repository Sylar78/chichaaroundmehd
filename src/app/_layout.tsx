import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FavorisProvider } from '@/state/favoris';
import { FiltresProvider } from '@/state/filtres';
import { SessionProvider } from '@/state/session';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <FavorisProvider>
          <FiltresProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
              <Stack.Screen name="(onglets)" />
              <Stack.Screen name="lieu/[id]" />
              <Stack.Screen name="filtres" options={{ presentation: 'modal' }} />
              <Stack.Screen name="avis/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="connexion" options={{ presentation: 'modal' }} />
              <Stack.Screen name="favoris" />
              <Stack.Screen name="mes-avis" />
              <Stack.Screen name="moderation" />
            </Stack>
          </FiltresProvider>
        </FavorisProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
