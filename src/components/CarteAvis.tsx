import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, radius } from '@/theme';
import type { StatutAvis } from '@/types';

const STATUTS: Record<StatutAvis, { libelle: string; couleur: string }> = {
  en_attente: { libelle: 'En attente de vérification', couleur: colors.inkMuted },
  publie: { libelle: 'Publié', couleur: colors.open },
  rejete: { libelle: 'Refusé', couleur: colors.danger },
};

type Props = {
  titre: string;
  sousTitre: string;
  note: number;
  commentaire: string;
  statut?: StatutAvis;
  children?: ReactNode;
};

/** Un avis dans une liste (Mes avis, modération). */
export function CarteAvis({ titre, sousTitre, note, commentaire, statut, children }: Props) {
  return (
    <View style={styles.carte}>
      <View style={styles.ligne}>
        <Text style={styles.titre} numberOfLines={1}>
          {titre}
        </Text>
        <Text style={styles.muet}>{note}/5</Text>
      </View>
      <Text style={styles.muet}>{sousTitre}</Text>
      <Text style={styles.texte}>{commentaire}</Text>
      {statut && <Text style={[styles.statut, { color: STATUTS[statut].couleur }]}>{STATUTS[statut].libelle}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: { gap: 6, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surfaceSoft },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  titre: { flexShrink: 1, fontSize: 16, fontWeight: font.bold, color: colors.ink },
  muet: { fontSize: 14, color: colors.inkMuted },
  texte: { fontSize: 15, color: colors.ink, lineHeight: 21 },
  statut: { fontSize: 14, fontWeight: font.bold },
});
