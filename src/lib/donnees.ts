import { avisFactices, lieuxFactices } from '@/data/lieux';
import type { Avis, Lieu } from '@/types';

import type { Coordonnees } from './format';
import { supabase } from './supabase';

const COLONNES_LIEU =
  'id, nom, adresse, ville, latitude, longitude, telephone, niveau_prix, note_moyenne, nombre_avis, photos, horaires, prix, terrasse, wifi, accessible_pmr';

/** Un degré de latitude ≈ 111 km. */
const KM_PAR_DEGRE = 111;

function normaliserLieu(brut: Record<string, unknown>): Lieu {
  // numeric(2,1) arrive en chaîne depuis PostgREST.
  return { ...(brut as Lieu), note_moyenne: Number(brut.note_moyenne) };
}

/**
 * Lieux dans un carré de `rayonKm` autour de `centre`.
 * Sans Supabase configuré, renvoie les données factices.
 */
export async function chargerLieux(centre: Coordonnees, rayonKm: number): Promise<Lieu[]> {
  if (!supabase) return lieuxFactices;
  const dLat = rayonKm / KM_PAR_DEGRE;
  const dLon = rayonKm / (KM_PAR_DEGRE * Math.cos((centre.latitude * Math.PI) / 180));
  const { data, error } = await supabase
    .from('lieux')
    .select(COLONNES_LIEU)
    .gte('latitude', centre.latitude - dLat)
    .lte('latitude', centre.latitude + dLat)
    .gte('longitude', centre.longitude - dLon)
    .lte('longitude', centre.longitude + dLon)
    .limit(200);
  if (error) throw error;
  return (data ?? []).map(normaliserLieu);
}

export async function chargerLieu(id: string): Promise<Lieu | null> {
  if (!supabase) return lieuxFactices.find((l) => l.id === id) ?? null;
  const { data, error } = await supabase.from('lieux').select(COLONNES_LIEU).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? normaliserLieu(data) : null;
}

/** Avis publiés d'un lieu, du plus récent au plus ancien. */
export async function chargerAvis(lieuId: string): Promise<Avis[]> {
  if (!supabase) return avisFactices.filter((a) => a.lieu_id === lieuId && a.statut === 'publie');
  const { data, error } = await supabase
    .from('avis')
    .select('id, lieu_id, utilisateur_id, note, commentaire, statut, cree_le, utilisateurs(pseudo)')
    .eq('lieu_id', lieuId)
    .eq('statut', 'publie')
    .order('cree_le', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((a) => {
    const profil = a.utilisateurs as { pseudo: string } | { pseudo: string }[] | null;
    const pseudo = Array.isArray(profil) ? profil[0]?.pseudo : profil?.pseudo;
    return {
      id: a.id,
      lieu_id: a.lieu_id,
      utilisateur_id: a.utilisateur_id,
      auteur: pseudo ?? 'Membre',
      note: a.note,
      commentaire: a.commentaire,
      statut: a.statut,
      cree_le: a.cree_le,
    };
  });
}

export async function chargerLieuxParIds(ids: string[]): Promise<Lieu[]> {
  if (ids.length === 0) return [];
  if (!supabase) return lieuxFactices.filter((l) => ids.includes(l.id));
  const { data, error } = await supabase.from('lieux').select(COLONNES_LIEU).in('id', ids);
  if (error) throw error;
  return (data ?? []).map(normaliserLieu);
}

export type AvisAvecLieu = Avis & { nom_lieu: string };

function nomLieu(brut: unknown): string {
  const l = brut as { nom: string } | { nom: string }[] | null;
  return (Array.isArray(l) ? l[0]?.nom : l?.nom) ?? 'Lieu supprimé';
}

/** Tous les avis du membre, quel que soit leur statut de modération. */
export async function chargerMesAvis(utilisateurId: string): Promise<AvisAvecLieu[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('avis')
    .select('id, lieu_id, utilisateur_id, note, commentaire, statut, cree_le, lieux(nom)')
    .eq('utilisateur_id', utilisateurId)
    .order('cree_le', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((a) => ({ ...(a as unknown as Avis), auteur: 'Moi', nom_lieu: nomLieu(a.lieux) }));
}

/** Avis en attente de modération, du plus ancien au plus récent (réservé aux modérateurs par la RLS). */
export async function chargerAvisEnAttente(): Promise<AvisAvecLieu[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('avis')
    .select('id, lieu_id, utilisateur_id, note, commentaire, statut, cree_le, lieux(nom), utilisateurs(pseudo)')
    .eq('statut', 'en_attente')
    .order('cree_le', { ascending: true })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((a) => {
    const profil = a.utilisateurs as { pseudo: string } | { pseudo: string }[] | null;
    const pseudo = Array.isArray(profil) ? profil[0]?.pseudo : profil?.pseudo;
    return { ...(a as unknown as Avis), auteur: pseudo ?? 'Membre', nom_lieu: nomLieu(a.lieux) };
  });
}

export async function changerStatutAvis(id: string, statut: 'publie' | 'rejete'): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('avis').update({ statut }).eq('id', id);
  if (error) throw error;
}
