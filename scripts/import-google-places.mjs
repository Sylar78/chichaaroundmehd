#!/usr/bin/env node
// Importe les bars à chicha d'une zone depuis Google Places API (New) dans la table `lieux` de Supabase.
//
// Usage :
//   node --env-file=.env scripts/import-google-places.mjs --lat 48.8606 --lng 2.3776 --rayon 5
//   node --env-file=.env scripts/import-google-places.mjs --lat 48.8606 --lng 2.3776 --dry-run
//
// Variables d'environnement (jamais dans l'app) :
//   GOOGLE_PLACES_API_KEY       clé Google Cloud avec « Places API (New) » activée
//   SUPABASE_URL                URL du projet Supabase
//   SUPABASE_SERVICE_ROLE_KEY   clé service_role (contourne la RLS : à garder secrète)

import { parseArgs } from 'node:util';

import { createClient } from '@supabase/supabase-js';

import { CHAMPS_GOOGLE, convertirPlace, filtrerPlaces } from './lib/places.mjs';

const REQUETES = ['bar à chicha', 'chicha lounge', 'shisha bar'];
const PAGES_MAX = 3; // 20 résultats par page, soit 60 par requête au plus.

const { values } = parseArgs({
  options: {
    lat: { type: 'string' },
    lng: { type: 'string' },
    rayon: { type: 'string', default: '5' },
    'dry-run': { type: 'boolean', default: false },
  },
});

const centre = { latitude: Number(values.lat), longitude: Number(values.lng) };
const rayonMetres = Math.min(Number(values.rayon) * 1000, 50000);
if (!Number.isFinite(centre.latitude) || !Number.isFinite(centre.longitude) || !(rayonMetres > 0)) {
  console.error('Précisez --lat et --lng (et éventuellement --rayon en km, 50 au plus).');
  process.exit(1);
}

const cleGoogle = process.env.GOOGLE_PLACES_API_KEY;
if (!cleGoogle) {
  console.error('GOOGLE_PLACES_API_KEY manquante.');
  process.exit(1);
}

async function rechercher(texte) {
  const resultats = [];
  let pageToken;
  for (let page = 0; page < PAGES_MAX; page++) {
    const reponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': cleGoogle,
        'X-Goog-FieldMask': CHAMPS_GOOGLE,
      },
      body: JSON.stringify({
        textQuery: texte,
        languageCode: 'fr',
        regionCode: 'FR',
        pageSize: 20,
        pageToken,
        locationBias: { circle: { center: centre, radius: rayonMetres } },
      }),
    });
    if (!reponse.ok) {
      throw new Error(`Google Places a répondu ${reponse.status} : ${await reponse.text()}`);
    }
    const json = await reponse.json();
    resultats.push(...(json.places ?? []));
    pageToken = json.nextPageToken;
    if (!pageToken) break;
  }
  return resultats;
}

const bruts = [];
for (const texte of REQUETES) {
  const places = await rechercher(texte);
  console.log(`« ${texte} » : ${places.length} résultats`);
  bruts.push(...places);
}

const lieux = filtrerPlaces(bruts, centre, rayonMetres).map(convertirPlace);
console.log(`${lieux.length} lieux uniques dans un rayon de ${rayonMetres / 1000} km.`);

if (values['dry-run']) {
  console.log(JSON.stringify(lieux, null, 2));
  process.exit(0);
}

const url = process.env.SUPABASE_URL;
const cleService = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !cleService) {
  console.error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont nécessaires pour enregistrer (ou utilisez --dry-run).');
  process.exit(1);
}

const supabase = createClient(url, cleService, { auth: { persistSession: false } });
// Upsert sur google_place_id : relancer le script met à jour les lieux sans créer de doublons,
// et ne touche ni aux prix saisis à la main, ni aux photos, ni aux notes.
const { error, count } = await supabase
  .from('lieux')
  .upsert(lieux, { onConflict: 'google_place_id', count: 'exact' });
if (error) {
  console.error('Échec de l’enregistrement :', error.message);
  process.exit(1);
}
console.log(`${count ?? lieux.length} lieux enregistrés dans Supabase.`);
