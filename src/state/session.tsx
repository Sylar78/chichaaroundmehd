import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

type SessionContexte = {
  session: Session | null;
  estModerateur: boolean;
};

const Contexte = createContext<SessionContexte>({ session: null, estModerateur: false });

/** Session Supabase Auth et rôle du membre connecté. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [estModerateur, setEstModerateur] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!supabase || !userId) {
      setEstModerateur(false);
      return;
    }
    supabase
      .from('utilisateurs')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => setEstModerateur(data?.role === 'moderateur'));
  }, [userId]);

  return <Contexte.Provider value={{ session, estModerateur }}>{children}</Contexte.Provider>;
}

export function useSession(): SessionContexte {
  return useContext(Contexte);
}
