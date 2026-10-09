import { useMemo } from 'react';

import { lieuxFactices } from '@/data/lieux';
import { distanceEnMetres, estOuvert } from '@/lib/format';
import { useFiltres } from '@/state/filtres';
import type { Lieu } from '@/types';

import { usePosition } from './usePosition';

export type LieuAvecDistance = Lieu & { distance: number; ouvert: boolean };

/**
 * Lieux filtrés et triés autour de l'utilisateur.
 * Source : données factices pour l'instant (étape suivante : requête Supabase).
 */
export function useLieux() {
  const { position, autorisee } = usePosition();
  const { filtres, tri } = useFiltres();

  const lieux = useMemo<LieuAvecDistance[]>(() => {
    const maintenant = new Date();
    return lieuxFactices
      .map((l) => ({ ...l, distance: distanceEnMetres(position, l), ouvert: estOuvert(l.horaires, maintenant) }))
      .filter(
        (l) =>
          l.distance <= filtres.distanceMaxKm * 1000 &&
          l.note_moyenne >= filtres.noteMin &&
          filtres.niveauxPrix.includes(l.niveau_prix) &&
          (!filtres.ouvertMaintenant || l.ouvert) &&
          (!filtres.terrasse || l.terrasse) &&
          (!filtres.wifi || l.wifi) &&
          (!filtres.accessiblePmr || l.accessible_pmr),
      )
      .sort((a, b) => {
        if (tri === 'note') return b.note_moyenne - a.note_moyenne;
        if (tri === 'prix') return a.niveau_prix - b.niveau_prix || a.distance - b.distance;
        return a.distance - b.distance;
      });
  }, [position, filtres, tri]);

  return { lieux, position, autorisee };
}

export function useLieu(id: string | undefined): Lieu | undefined {
  return lieuxFactices.find((l) => l.id === id);
}
