// Types alignés sur le schéma Supabase (supabase/migrations/0001_init.sql).

export type NiveauPrix = 1 | 2 | 3;

export type Horaire = {
  /** 0 = dimanche … 6 = samedi */
  jour: number;
  /** "17:00" */
  ouverture: string;
  /** "02:00" (une heure inférieure à l'ouverture signifie le lendemain) */
  fermeture: string;
};

export type LignePrix = {
  libelle: string;
  prix: number;
};

export type Lieu = {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  latitude: number;
  longitude: number;
  telephone: string | null;
  niveau_prix: NiveauPrix;
  note_moyenne: number;
  nombre_avis: number;
  photos: string[];
  horaires: Horaire[];
  prix: LignePrix[];
  terrasse: boolean;
  wifi: boolean;
  accessible_pmr: boolean;
};

export type StatutAvis = 'en_attente' | 'publie' | 'rejete';

export type Avis = {
  id: string;
  lieu_id: string;
  utilisateur_id: string;
  auteur: string;
  note: number;
  commentaire: string;
  statut: StatutAvis;
  cree_le: string;
};
