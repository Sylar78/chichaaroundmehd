import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

type Props = {
  erreur: string | null;
  nbRecus: number;
  distanceMaxKm: number;
  position: { latitude: number; longitude: number };
};

/** Explique pourquoi la liste est vide : erreur de chargement, base vide autour de soi, ou filtres trop stricts. */
export function MessageVide({ erreur, nbRecus, distanceMaxKm, position }: Props) {
  const coord = `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`;
  return (
    <View style={styles.boite}>
      <Text style={styles.texte}>
        {erreur
          ? `Impossible de charger les lieux : ${erreur}`
          : nbRecus === 0
            ? `Aucun lieu enregistré à moins de ${distanceMaxKm} km de votre position.`
            : 'Aucun lieu ne correspond à vos filtres.'}
      </Text>
      <Text style={styles.detail}>
        Position : {coord} · {nbRecus} lieu{nbRecus > 1 ? 'x' : ''} reçu{nbRecus > 1 ? 's' : ''} de la base
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  boite: { gap: 6, paddingVertical: 12, alignItems: 'center' },
  texte: { fontSize: 15, color: colors.inkMuted, textAlign: 'center' },
  detail: { fontSize: 12, color: colors.inkMuted, textAlign: 'center' },
});
