import { useEffect, useMemo, useState } from 'react';

import { chargerAvis, chargerLieu, chargerLieux } from '@/lib/donnees';
import { distanceEnMetres, estOuvert, type Coordonnees } from '@/lib/format';
import { useFiltres } from '@/state/filtres';
import type { Avis, Lieu } from '@/types';

import { usePosition } from './usePosition';

export type LieuAvecDistance = Lieu & { distance: number; ouvert: boolean };

/**
 * Lieux filtrés et triés autour de l'utilisateur.
 * Source : Supabase s'il est configuré, sinon les données factices.
 * Par défaut la recherche est centrée sur l'utilisateur ; `centreRecherche` la déplace (bouton « Rechercher dans cette zone »).
 * Les distances affichées restent mesurées depuis l'utilisateur.
 */
export function useLieux(centreRecherche?: Coordonnees | null) {
  const { position, autorisee } = usePosition();
  const centre = centreRecherche ?? position;
  const { filtres, tri } = useFiltres();
  const [bruts, setBruts] = useState<Lieu[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    setChargement(true);
    chargerLieux(centre, filtres.distanceMaxKm)
      .then((l) => {
        if (annule) return;
        setBruts(l);
        setErreur(null);
      })
      .catch((e: Error) => {
        if (annule) return;
        // Ne pas garder les lieux d'une ancienne position : ils seraient filtrés et masqueraient l'erreur.
        setBruts([]);
        setErreur(e.message);
      })
      .finally(() => !annule && setChargement(false));
    return () => {
      annule = true;
    };
  }, [centre, filtres.distanceMaxKm]);

  const lieux = useMemo<LieuAvecDistance[]>(() => {
    const maintenant = new Date();
    return bruts
      .map((l) => ({ ...l, distance: distanceEnMetres(position, l), ouvert: estOuvert(l.horaires, maintenant) }))
      .filter(
        (l) =>
          distanceEnMetres(centre, l) <= filtres.distanceMaxKm * 1000 &&
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
  }, [bruts, centre, position, filtres, tri]);

  return { lieux, position, centre, autorisee, chargement, erreur, nbRecus: bruts.length };
}

/** Un lieu et ses avis publiés. `lieu` vaut `undefined` pendant le chargement, `null` s'il n'existe pas. */
export function useLieu(id: string | undefined) {
  const [lieu, setLieu] = useState<Lieu | null | undefined>(undefined);
  const [avis, setAvis] = useState<Avis[]>([]);

  useEffect(() => {
    if (!id) {
      setLieu(null);
      return;
    }
    let annule = false;
    Promise.all([chargerLieu(id), chargerAvis(id)])
      .then(([l, a]) => {
        if (annule) return;
        setLieu(l);
        setAvis(a);
      })
      .catch(() => !annule && setLieu(null));
    return () => {
      annule = true;
    };
  }, [id]);

  return { lieu, avis };
}
