import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { Coordonnees } from '@/lib/format';

/** Position de repli (Paris 11e) quand la localisation est refusée ou indisponible. */
export const POSITION_PAR_DEFAUT: Coordonnees = { latitude: 48.8606, longitude: 2.3776 };

export function usePosition() {
  const [position, setPosition] = useState<Coordonnees>(POSITION_PAR_DEFAUT);
  const [autorisee, setAutorisee] = useState<boolean | null>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (annule) return;
      setAutorisee(status === 'granted');
      if (status !== 'granted') return;
      const actuelle = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!annule) {
        setPosition({ latitude: actuelle.coords.latitude, longitude: actuelle.coords.longitude });
      }
    })().catch(() => setAutorisee(false));
    return () => {
      annule = true;
    };
  }, []);

  return { position, autorisee };
}
