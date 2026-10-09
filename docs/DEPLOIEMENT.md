# Déployer Chicha Around Me : TestFlight et Google Play

Le workflow `.github/workflows/deploiement.yml` construit l'app dans le cloud **EAS** (Expo Application Services) puis l'envoie :

- iOS : vers **TestFlight**.
- Android : vers **Google Play, piste « Test interne »**, en brouillon.

Il se lance à la main (onglet **Actions > Déploiement > Run workflow**, choix de la plateforme et du profil) ou en poussant un tag de version :

```bash
git tag v1.0.0 && git push --tags
```

Avant la construction, il relance la vérification TypeScript et les tests. Les builds se font chez EAS : GitHub n'attend pas leur fin, le suivi est sur [expo.dev](https://expo.dev) (onglet Builds).

Rien de ce workflow n'a pu être testé de bout en bout : il faut vos comptes. Faites la mise en place ci-dessous dans l'ordre, avec un premier lancement en profil `preview` pour Android avant de passer en `production`.

## Ce qu'il faut avoir

| Compte | Pourquoi | Coût |
| --- | --- | --- |
| Compte Expo (expo.dev) | Construire dans le cloud EAS | Gratuit, avec un nombre limité de builds par mois |
| Apple Developer Program | Signer l'app et utiliser TestFlight | 99 $ par an |
| Google Play Console | Publier sur Android | 25 $, une seule fois |

## Étape 1 : Expo et GitHub

1. Créez un compte sur expo.dev.
2. Dans le dossier du projet : `npx eas-cli login` puis `npx eas-cli init`. Cela crée le projet EAS et ajoute son identifiant dans `app.json` ; commitez ce changement.
3. Créez un jeton : expo.dev > Account settings > Access tokens.
4. Dans GitHub : Settings > Secrets and variables > Actions > New repository secret, nom `EXPO_TOKEN`.

## Étape 2 : variables de l'app dans EAS

Les builds se font chez EAS, pas dans GitHub : leurs variables se déclarent dans EAS.

```bash
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxxx.supabase.co" --environment production --visibility plaintext
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..." --environment production --visibility plaintext
npx eas-cli env:create --name GOOGLE_MAPS_ANDROID_API_KEY --value "..." --environment production --visibility sensitive
```

Faites de même avec `--environment preview` pour les builds de test.

`GOOGLE_MAPS_ANDROID_API_KEY` est **indispensable pour Android** : sans elle, la carte reste vide dans l'app publiée (sur iOS, c'est Apple Maps, sans clé). Créez-la dans Google Cloud : activer **Maps SDK for Android**, créer une clé, la restreindre à l'application `com.chichaaroundme.app` et à l'empreinte SHA-1 de signature (visible avec `npx eas-cli credentials`).

## Étape 3 : iOS et TestFlight

1. Inscrivez-vous à l'Apple Developer Program.
2. Dans App Store Connect > Apps > « + » > Nouvelle app, avec l'identifiant de bundle `com.chichaaroundme.app`. Notez l'**identifiant Apple** de l'app (nombre dans l'URL, rubrique Informations générales).
3. Créez une clé d'API : App Store Connect > Utilisateurs et accès > Intégrations > Clés d'API > « + », rôle **App Manager**. Téléchargez le fichier `.p8` (une seule fois) et notez l'**Issuer ID** et le **Key ID**.
4. Dans `eas.json`, remplacez les trois valeurs `REMPLACER_...` de `submit.production.ios` (`ascAppId`, `ascApiKeyIssuerId`, `ascApiKeyId`) et commitez.
5. Dans GitHub, créez le secret `ASC_API_KEY_P8` avec le contenu complet du fichier `.p8`, lignes `-----BEGIN...` et `-----END...` comprises.
6. **Une seule fois, en local**, laissez EAS créer les certificats iOS : `npx eas-cli build --platform ios --profile production`. EAS demande vos identifiants Apple et garde les certificats ; le workflow les réutilise ensuite sans rien demander.

Les testeurs : App Store Connect > TestFlight. Les testeurs internes (jusqu'à 100 personnes de votre équipe) n'attendent aucune validation d'Apple ; les testeurs externes déclenchent une courte revue.

## Étape 4 : Android et Google Play

1. Créez un compte Play Console, puis l'app (nom, langue, app gratuite ou payante).
2. **Le tout premier envoi doit se faire à la main** : l'API de Google refuse de créer la fiche. Lancez `npx eas-cli build --platform android --profile production`, téléchargez le `.aab` depuis expo.dev, et ajoutez-le à la main dans Play Console > Test > Test interne > Créer une release. Complétez aussi les formulaires obligatoires de la fiche (politique de confidentialité, classification du contenu, sécurité des données). Une fois cette première release créée, le workflow prend le relais.
3. Créez un compte de service : Google Cloud Console > IAM > Comptes de service > créer, puis une clé **JSON**. Dans Play Console > Utilisateurs et autorisations, invitez l'adresse de ce compte avec le droit de publier des versions de l'app.
4. Dans GitHub, créez le secret `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` avec le contenu complet du fichier JSON.

Le workflow envoie ensuite chaque version dans la piste « Test interne » en brouillon : il reste un clic dans Play Console pour la publier aux testeurs. Pour passer en production, changez `track` dans `eas.json`.

## Profils de build (`eas.json`)

| Profil | Usage |
| --- | --- |
| `development` | App de développement avec outils Expo, pour tester sur un vrai téléphone |
| `preview` | APK Android et build interne iOS à partager sans passer par les stores |
| `production` | Binaire signé pour TestFlight et Google Play ; le numéro de build s'incrémente tout seul |

## À savoir avant la première soumission

- **Âge et tabac** : les deux stores encadrent les apps qui parlent de tabac. Déclarez honnêtement le contenu dans les questionnaires, visez une classification 18+ et gardez la confirmation d'âge à l'inscription.
- **Apple impose** une politique de confidentialité en ligne, une page d'assistance et une description des données collectées (comptes, avis, position).
- **Position** : le texte d'autorisation est dans `app.json` ; relisez-le avant l'envoi.
- **Les 4 lieux fictifs** servent tant que Supabase n'est pas configuré. Un build de production sans les variables de l'étape 2 afficherait ces lieux fictifs : vérifiez-les avant de lancer `production`.

## En cas d'échec

| Message | Cause probable |
| --- | --- |
| `EXPO_TOKEN est absent` | Étape 1.4 non faite |
| `Credentials are not set up` (iOS) | Étape 3.6 non faite : première construction iOS en local |
| Soumission Android refusée, « app not found » | Étape 4.2 non faite : première release à ajouter à la main |
| Carte vide sur Android | `GOOGLE_MAPS_ANDROID_API_KEY` manquante ou clé non restreinte au bon SHA-1 |
