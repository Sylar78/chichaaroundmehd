-- Chicha Around Me : schéma initial (tables lieux, avis, utilisateurs).
-- À exécuter dans l'éditeur SQL de Supabase ou via `supabase db push`.

create extension if not exists "pgcrypto";

-- Profil public lié au compte Supabase Auth.
create table public.utilisateurs (
  id uuid primary key references auth.users (id) on delete cascade,
  pseudo text not null check (char_length(pseudo) between 2 and 40),
  majeur_confirme boolean not null default false,
  role text not null default 'membre' check (role in ('membre', 'moderateur')),
  cree_le timestamptz not null default now()
);

create table public.lieux (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  adresse text not null,
  ville text not null,
  latitude double precision not null,
  longitude double precision not null,
  telephone text,
  niveau_prix smallint not null check (niveau_prix between 1 and 3),
  photos text[] not null default '{}',
  -- [{ "jour": 0-6, "ouverture": "17:00", "fermeture": "02:00" }]
  horaires jsonb not null default '[]',
  -- [{ "libelle": "Chicha classique", "prix": 18 }]
  prix jsonb not null default '[]',
  terrasse boolean not null default false,
  wifi boolean not null default false,
  accessible_pmr boolean not null default false,
  google_place_id text unique,
  note_moyenne numeric(2, 1) not null default 0,
  nombre_avis integer not null default 0,
  cree_le timestamptz not null default now()
);

create index lieux_position_idx on public.lieux (latitude, longitude);

create table public.avis (
  id uuid primary key default gen_random_uuid(),
  lieu_id uuid not null references public.lieux (id) on delete cascade,
  utilisateur_id uuid not null references public.utilisateurs (id) on delete cascade,
  note smallint not null check (note between 1 and 5),
  commentaire text not null check (char_length(commentaire) between 20 and 1000),
  -- Modération : un avis n'est visible qu'une fois publié.
  statut text not null default 'en_attente' check (statut in ('en_attente', 'publie', 'rejete')),
  signalements integer not null default 0,
  cree_le timestamptz not null default now(),
  -- Anti faux avis : un seul avis par compte et par lieu.
  unique (lieu_id, utilisateur_id)
);

create index avis_lieu_idx on public.avis (lieu_id) where statut = 'publie';

-- Note moyenne et nombre d'avis recalculés à partir des seuls avis publiés.
create or replace function public.recalculer_note_lieu() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cible uuid := coalesce(new.lieu_id, old.lieu_id);
begin
  update public.lieux l
  set note_moyenne = coalesce((select round(avg(note)::numeric, 1) from public.avis where lieu_id = cible and statut = 'publie'), 0),
      nombre_avis = (select count(*) from public.avis where lieu_id = cible and statut = 'publie')
  where l.id = cible;
  return null;
end;
$$;

create trigger avis_recalcul_note
after insert or update or delete on public.avis
for each row execute function public.recalculer_note_lieu();

-- Création automatique du profil à l'inscription.
create or replace function public.creer_profil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.utilisateurs (id, pseudo, majeur_confirme)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'pseudo', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'majeur_confirme')::boolean, false)
  );
  return new;
end;
$$;

create trigger auth_creer_profil
after insert on auth.users
for each row execute function public.creer_profil();

create or replace function public.est_moderateur() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.utilisateurs where id = auth.uid() and role = 'moderateur');
$$;

-- Row Level Security
alter table public.utilisateurs enable row level security;
alter table public.lieux enable row level security;
alter table public.avis enable row level security;

create policy "Profils lisibles par tous" on public.utilisateurs for select using (true);
create policy "Chacun modifie son profil" on public.utilisateurs for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select u.role from public.utilisateurs u where u.id = auth.uid()));

create policy "Lieux lisibles par tous" on public.lieux for select using (true);

create policy "Avis publiés lisibles par tous" on public.avis for select
  using (statut = 'publie' or utilisateur_id = auth.uid() or public.est_moderateur());
create policy "Membres majeurs déposent un avis en attente" on public.avis for insert
  with check (
    utilisateur_id = auth.uid()
    and statut = 'en_attente'
    and exists (select 1 from public.utilisateurs where id = auth.uid() and majeur_confirme)
  );
create policy "Modérateurs changent le statut" on public.avis for update
  using (public.est_moderateur());
create policy "Chacun supprime son avis" on public.avis for delete
  using (utilisateur_id = auth.uid());
