import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { Coordonnees } from '@/lib/format';
import { colors } from '@/theme';
import type { Lieu } from '@/types';

export type CarteMapProps = {
  lieux: Lieu[];
  position: Coordonnees;
  selectionId?: string;
  onSelect: (id: string) => void;
  /** Incrémenté pour demander de recentrer la carte sur `position`. */
  recentrerCle: number;
};

const DELTA = 0.03;

/** Carte native (Apple Maps sur iOS, Google Maps sur Android). La version web est dans CarteMap.web.tsx. */
export function CarteMap({ lieux, position, selectionId, onSelect, recentrerCle }: CarteMapProps) {
  const carte = useRef<MapView>(null);

  useEffect(() => {
    if (recentrerCle > 0) {
      carte.current?.animateToRegion({ ...position, latitudeDelta: DELTA, longitudeDelta: DELTA }, 400);
    }
    // On ne recentre que sur demande, pas à chaque changement de position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentrerCle]);

  return (
    <MapView
      ref={carte}
      style={StyleSheet.absoluteFill}
      initialRegion={{ ...position, latitudeDelta: DELTA, longitudeDelta: DELTA }}
      showsUserLocation
      showsMyLocationButton={false}>
      {lieux.map((l) => {
        const actif = l.id === selectionId;
        return (
          <Marker
            key={l.id}
            coordinate={{ latitude: l.latitude, longitude: l.longitude }}
            title={l.nom}
            onPress={() => onSelect(l.id)}
            tracksViewChanges={false}>
            <View style={[styles.marqueur, { backgroundColor: actif ? colors.accent : colors.ink }, actif && styles.actif]}>
              <Ionicons name="cafe-outline" size={18} color={colors.white} />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  marqueur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actif: { transform: [{ scale: 1.15 }] },
});
