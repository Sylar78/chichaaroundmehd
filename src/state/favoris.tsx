import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

import { useSession } from './session';

const CLE_STOCKAGE = 'chicha:favoris';

type FavorisContexte = {
  favoris: string[];
  estFavori: (lieuId: string) => boolean;
  basculerFavori: (lieuId: string) => void;
};

const Contexte = createContext<FavorisContexte | null>(null);

/**
 * Favoris gardés sur le téléphone, et synchronisés avec la table `favoris`
 * quand le membre est connecté (les favoris locaux sont alors envoyés).
 */
export function FavorisProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user.id;
  const [favoris, setFavoris] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(CLE_STOCKAGE)
      .then((brut) => brut && setFavoris(JSON.parse(brut) as string[]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(CLE_STOCKAGE, JSON.stringify(favoris)).catch(() => {});
  }, [favoris]);

  // À la connexion : fusionner les favoris locaux et ceux du compte.
  useEffect(() => {
    if (!supabase || !userId) return;
    const client = supabase;
    (async () => {
      const { data } = await client.from('favoris').select('lieu_id').eq('utilisateur_id', userId);
      const distants = (data ?? []).map((f) => f.lieu_id as string);
      const locaux = JSON.parse((await AsyncStorage.getItem(CLE_STOCKAGE)) ?? '[]') as string[];
      const aEnvoyer = locaux.filter((id) => !distants.includes(id));
      if (aEnvoyer.length) {
        await client
          .from('favoris')
          .upsert(aEnvoyer.map((lieu_id) => ({ utilisateur_id: userId, lieu_id })), { ignoreDuplicates: true });
      }
      setFavoris([...new Set([...distants, ...locaux])]);
    })().catch(() => {});
  }, [userId]);

  const basculerFavori = useCallback(
    (lieuId: string) => {
      const retirer = favoris.includes(lieuId);
      setFavoris(retirer ? favoris.filter((x) => x !== lieuId) : [...favoris, lieuId]);
      if (supabase && userId) {
        const requete = retirer
          ? supabase.from('favoris').delete().match({ utilisateur_id: userId, lieu_id: lieuId })
          : supabase.from('favoris').insert({ utilisateur_id: userId, lieu_id: lieuId });
        requete.then(() => {});
      }
    },
    [favoris, userId],
  );

  const valeur = useMemo<FavorisContexte>(
    () => ({ favoris, estFavori: (id) => favoris.includes(id), basculerFavori }),
    [favoris, basculerFavori],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useFavoris(): FavorisContexte {
  const ctx = useContext(Contexte);
  if (!ctx) throw new Error('useFavoris doit être utilisé dans <FavorisProvider>');
  return ctx;
}
