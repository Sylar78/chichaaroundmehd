import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LieuAvecDistance } from '@/hooks/useLieux';
import { formatDistance, formatNiveauPrix, formatNote } from '@/lib/format';
import { colors, font, radius } from '@/theme';

import { PhotoLieu } from './PhotoLieu';

type Props = {
  lieu: LieuAvecDistance;
  /** `compacte` : vignette à gauche (panneau de la carte) ; sinon grande photo (liste). */
  variante?: 'compacte' | 'grande';
};

export function CarteLieu({ lieu, variante = 'grande' }: Props) {
  const compacte = variante === 'compacte';
  return (
    <Link href={{ pathname: '/lieu/[id]', params: { id: lieu.id } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${lieu.nom}, note ${formatNote(lieu.note_moyenne)}, à ${formatDistance(lieu.distance)}`}
        style={compacte ? styles.compacte : styles.grande}>
        <PhotoLieu lieu={lieu} court={compacte} style={compacte ? styles.vignette : styles.photo} />
        <View style={styles.infos}>
          <View style={styles.ligneTitre}>
            <Text style={styles.nom} numberOfLines={1}>
              {lieu.nom}
            </Text>
            {!compacte && (
              <View style={styles.badgeNote}>
                <Ionicons name="star" size={13} color={colors.ink} />
                <Text style={styles.badgeTexte}>
                  {formatNote(lieu.note_moyenne)}{' '}
                  <Text style={styles.muet}>({lieu.nombre_avis})</Text>
                </Text>
              </View>
            )}
          </View>
          {compacte && (
            <View style={styles.ligne}>
              <Ionicons name="star" size={13} color={colors.ink} />
              <Text style={styles.noteTexte}>{formatNote(lieu.note_moyenne)}</Text>
              <Text style={styles.muet}>({lieu.nombre_avis} avis)</Text>
            </View>
          )}
          <Text style={styles.muet}>
            {formatDistance(lieu.distance)} · {formatNiveauPrix(lieu.niveau_prix)} ·{' '}
            <Text style={{ color: lieu.ouvert ? colors.open : colors.inkMuted, fontWeight: font.bold }}>
              {lieu.ouvert ? 'Ouvert' : 'Fermé'}
            </Text>
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  grande: { gap: 8 },
  compacte: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
  },
  photo: { height: 168, borderRadius: radius.lg },
  vignette: { width: 84, height: 84, borderRadius: radius.md },
  infos: { flexShrink: 1, flexGrow: 1, gap: 4 },
  ligneTitre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  nom: { fontSize: 17, fontWeight: font.bold, color: colors.ink, flexShrink: 1 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  noteTexte: { fontSize: 14, fontWeight: font.bold, color: colors.ink },
  muet: { fontSize: 14, color: colors.inkMuted },
  badgeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  badgeTexte: { fontSize: 14, fontWeight: font.bold, color: colors.ink },
});
