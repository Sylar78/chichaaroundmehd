-- Favoris des membres, synchronisés entre appareils.

create table public.favoris (
  utilisateur_id uuid not null references public.utilisateurs (id) on delete cascade,
  lieu_id uuid not null references public.lieux (id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (utilisateur_id, lieu_id)
);

alter table public.favoris enable row level security;

create policy "Chacun voit ses favoris" on public.favoris for select using (utilisateur_id = auth.uid());
create policy "Chacun ajoute ses favoris" on public.favoris for insert with check (utilisateur_id = auth.uid());
create policy "Chacun retire ses favoris" on public.favoris for delete using (utilisateur_id = auth.uid());
