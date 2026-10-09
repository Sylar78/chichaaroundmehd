import { Tabs } from 'expo-router/js-tabs';

import { BarreOnglets } from '@/components/BarreOnglets';

export default function OngletsLayout() {
  return (
    <Tabs tabBar={(props) => <BarreOnglets {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Carte' }} />
      <Tabs.Screen name="liste" options={{ title: 'Liste' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
