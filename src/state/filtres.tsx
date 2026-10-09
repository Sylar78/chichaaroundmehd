import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { NiveauPrix } from '@/types';

export type Tri = 'distance' | 'note' | 'prix';

export type Filtres = {
  distanceMaxKm: number;
  noteMin: number;
  niveauxPrix: NiveauPrix[];
  ouvertMaintenant: boolean;
  terrasse: boolean;
  wifi: boolean;
  accessiblePmr: boolean;
};

export const filtresParDefaut: Filtres = {
  distanceMaxKm: 5,
  noteMin: 0,
  niveauxPrix: [1, 2, 3],
  ouvertMaintenant: false,
  terrasse: false,
  wifi: false,
  accessiblePmr: false,
};

type FiltresContexte = {
  filtres: Filtres;
  setFiltres: (f: Filtres) => void;
  tri: Tri;
  setTri: (t: Tri) => void;
};

const Contexte = createContext<FiltresContexte | null>(null);

export function FiltresProvider({ children }: { children: ReactNode }) {
  const [filtres, setFiltres] = useState<Filtres>(filtresParDefaut);
  const [tri, setTri] = useState<Tri>('distance');

  const valeur = useMemo<FiltresContexte>(
    () => ({
      filtres,
      setFiltres,
      tri,
      setTri,
    }),
    [filtres, tri],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useFiltres(): FiltresContexte {
  const ctx = useContext(Contexte);
  if (!ctx) throw new Error('useFiltres doit être utilisé dans <FiltresProvider>');
  return ctx;
}
