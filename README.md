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

Quand Supabase est configuré, l'app lit les lieux de la table `lieux` autour de la position. Sinon, elle tourne avec les 4 lieux factices de `src/data/lieux.ts`, placés dans Paris 11e. Si la localisation est refusée, la carte se centre sur Paris 11e.

### Brancher Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Exécuter dans l'ordre les fichiers de `supabase/migrations/` dans l'éditeur SQL du projet.
3. Copier `.env.example` en `.env` et renseigner l'URL et la clé `anon`.
4. Relancer `npx expo start`.

### Remplir la base avec Google Places

Le script `scripts/import-google-places.mjs` cherche les bars à chicha d'une zone avec Places API (New) et les enregistre dans la table `lieux`. Il se relance sans créer de doublons (clé `google_place_id`) et ne touche pas aux prix, photos et notes déjà en base.

1. Dans Google Cloud, activer **Places API (New)** et créer une clé (restreinte à cette API).
2. Renseigner `GOOGLE_PLACES_API_KEY`, `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans `.env`.
3. Essayer sans rien écrire, puis importer :

```bash
npm run import:places -- --lat 48.8606 --lng 2.3776 --rayon 5 --dry-run
npm run import:places -- --lat 48.8606 --lng 2.3776 --rayon 5
```

Le script récupère le nom, l'adresse, la position, le téléphone, le niveau de prix et les horaires. Les prix détaillés et les photos restent à saisir. Chaque requête Google est facturée : 3 recherches de 1 à 3 pages par lancement.

Les conditions d'utilisation de Google Maps Platform limitent le stockage durable des données Places (seul l'identifiant `place_id` peut être conservé sans limite). Avant une mise en production, vérifier ces conditions et prévoir de relancer l'import régulièrement ou de compléter les fiches avec des données propres.

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
| Favoris | `src/app/favoris.tsx` |
| Mes avis et leur statut de vérification | `src/app/mes-avis.tsx` |
| Modération des avis (modérateurs seulement) | `src/app/moderation.tsx` |

## Base de données

`supabase/migrations/` crée :

- `utilisateurs` : profil public, créé automatiquement à l'inscription, avec la confirmation de majorité et un rôle (`membre` ou `moderateur`).
- `lieux` : coordonnées, niveau de prix, horaires et prix (JSON), équipements, note moyenne recalculée automatiquement.
- `avis` : note de 1 à 5 et commentaire, avec un statut de modération (`en_attente`, `publie`, `rejete`).
- `favoris` : lieux favoris de chaque membre. Les favoris sont aussi gardés sur le téléphone et envoyés au compte à la connexion.

Contre les faux avis : un seul avis par compte et par lieu, signalement par les membres (à 3 signalements, l'avis repasse en modération), compte majeur obligatoire, publication seulement après modération, et la note moyenne ne compte que les avis publiés. Les règles d'accès (RLS) sont activées sur toutes les tables.

Pour nommer un modérateur, dans l'éditeur SQL :

```sql
update public.utilisateurs set role = 'moderateur'
where id = (select id from auth.users where email = 'vous@exemple.fr');
```

L'écran « Modération des avis » apparaît alors dans son profil.

## Déploiement

Le workflow GitHub Actions `Déploiement` construit l'app avec EAS et l'envoie à TestFlight (iOS) et à Google Play, piste « Test interne » (Android). La mise en place des comptes et des secrets est détaillée dans [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md).

## Prochaines étapes

1. Photos des lieux (Supabase Storage) et saisie des prix détaillés.
2. Passage à Mapbox si on veut une carte personnalisée (build de développement EAS).

## Points d'attention

- **Légal** : la publicité pour le tabac est encadrée en France (loi Evin). L'app reste informative : pas de mise en avant promotionnelle des produits. Apple et Google ont aussi leurs règles sur le tabac ; prévoir un contrôle d'âge (déjà présent à l'inscription) et une classification 18+ sur les stores.
- **Coût des API** : surveiller les quotas Google Places et cartographie.

## Vérifications

```bash
npm run typecheck
npm test                              # tests de l'import Google Places et des horaires
npx expo export --platform android   # vérifie que le bundle se construit
```
