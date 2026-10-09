-- Signalement d'un avis par un membre (faux avis, contenu inapproprié).

create table public.signalements_avis (
  avis_id uuid not null references public.avis (id) on delete cascade,
  utilisateur_id uuid not null references public.utilisateurs (id) on delete cascade,
  motif text not null check (motif in ('faux_avis', 'inapproprie')),
  cree_le timestamptz not null default now(),
  -- Un membre ne peut signaler un avis qu'une fois.
  primary key (avis_id, utilisateur_id)
);

alter table public.signalements_avis enable row level security;

create policy "Chacun voit ses signalements" on public.signalements_avis for select
  using (utilisateur_id = auth.uid() or public.est_moderateur());

create policy "Signaler l'avis d'un autre" on public.signalements_avis for insert
  with check (
    utilisateur_id = auth.uid()
    and not exists (select 1 from public.avis a where a.id = avis_id and a.utilisateur_id = auth.uid())
  );

-- Compte les signalements ; à 3, l'avis repasse en modération et disparaît le temps de la vérification.
create or replace function public.compter_signalement() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.avis
  set signalements = signalements + 1,
      statut = case when signalements + 1 >= 3 and statut = 'publie' then 'en_attente' else statut end
  where id = new.avis_id;
  return null;
end;
$$;

create trigger signalement_compte
after insert on public.signalements_avis
for each row execute function public.compter_signalement();
