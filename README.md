# Chicha Around Me

Application mobile pour trouver les bars à chicha autour de soi : carte, liste triable, fiche détaillée, filtres, comptes et avis.

## Stack

| Brique | Choix |
| --- | --- |
| Mobile | React Native + Expo SDK 57 (TypeScript), navigation Expo Router |
| Carte | `react-native-maps` (Apple Maps sur iOS, Google Maps sur Android) |
| Backend | Supabase : base de données, comptes, avis |
| Localisation | `expo-location` |

La carte utilise `react-native-maps` plutôt que Mapbox pour cette première étape : elle fonctionne directement dans Expo Go, sans clé ni build natif. Le passage à Mapbox (`@rnmapbox/maps`) demandera un build de développement EAS et un jeton Mapbox.

## Démarrer

```bash
npm install
npx expo start
```

Scanner le QR code avec l'app **Expo Go** (iOS ou Android).

Sans configuration Supabase, l'app tourne avec les 4 lieux factices de `src/data/lieux.ts`, placés dans Paris 11e. Si la localisation est refusée, la carte se centre sur Paris 11e.

### Brancher Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Exécuter `supabase/migrations/0001_init.sql` dans l'éditeur SQL du projet.
3. Copier `.env.example` en `.env` et renseigner l'URL et la clé `anon`.
4. Relancer `npx expo start`.

## Écrans

Les maquettes de référence sont dans l'artifact Claude Design « Chicha Around Me – Maquettes ».

| Écran | Fichier |
| --- | --- |
| Carte avec marqueurs et panneau du lieu sélectionné | `src/app/(onglets)/index.tsx` |
| Liste triable (distance, note, prix) | `src/app/(onglets)/liste.tsx` |
| Profil et favoris | `src/app/(onglets)/profil.tsx` |
| Fiche du lieu (prix, horaires, adresse, avis) | `src/app/lieu/[id].tsx` |
| Filtres (modale) | `src/app/filtres.tsx` |
| Déposer un avis (modale) | `src/app/avis/[id].tsx` |
| Connexion / inscription par e-mail | `src/app/connexion.tsx` |

## Base de données

`supabase/migrations/0001_init.sql` crée :

- `utilisateurs` : profil public, créé automatiquement à l'inscription, avec la confirmation de majorité et un rôle (`membre` ou `moderateur`).
- `lieux` : coordonnées, niveau de prix, horaires et prix (JSON), équipements, note moyenne recalculée automatiquement.
- `avis` : note de 1 à 5 et commentaire, avec un statut de modération (`en_attente`, `publie`, `rejete`).

Contre les faux avis : un seul avis par compte et par lieu, compte majeur obligatoire, publication seulement après modération, et la note moyenne ne compte que les avis publiés. Les règles d'accès (RLS) sont activées sur les trois tables.

## Prochaines étapes

1. Charger les lieux depuis Supabase au lieu des données factices (requête par zone autour de la position).
2. Amorcer la base de lieux avec Google Places API (script côté serveur, pour protéger la clé).
3. Stocker les favoris et les photos dans Supabase.
4. Ajouter un écran de modération pour les avis en attente.

## Points d'attention

- **Légal** : la publicité pour le tabac est encadrée en France (loi Evin). L'app reste informative : pas de mise en avant promotionnelle des produits. Apple et Google ont aussi leurs règles sur le tabac ; prévoir un contrôle d'âge (déjà présent à l'inscription) et une classification 18+ sur les stores.
- **Coût des API** : surveiller les quotas Google Places et cartographie.

## Vérifications

```bash
npm run typecheck
npx expo export --platform android   # vérifie que le bundle se construit
```
