import assert from 'node:assert/strict';
import { test } from 'node:test';

import { convertirHoraires, convertirPlace, filtrerPlaces } from './places.mjs';

const exemple = {
  id: 'ChIJexemple',
  displayName: { text: 'Le Salon Test' },
  formattedAddress: '12 Rue Oberkampf, 75011 Paris, France',
  addressComponents: [
    { longText: '12', types: ['street_number'] },
    { longText: 'Rue Oberkampf', types: ['route'] },
    { longText: '75011', types: ['postal_code'] },
    { longText: 'Paris', types: ['locality', 'political'] },
  ],
  location: { latitude: 48.8649, longitude: 2.3787 },
  internationalPhoneNumber: '+33 1 23 45 67 89',
  priceLevel: 'PRICE_LEVEL_INEXPENSIVE',
  businessStatus: 'OPERATIONAL',
  regularOpeningHours: {
    periods: [{ open: { day: 5, hour: 17, minute: 0 }, close: { day: 6, hour: 2, minute: 0 } }],
  },
};

test('convertit un résultat Google en ligne de la table lieux', () => {
  assert.deepEqual(convertirPlace(exemple), {
    google_place_id: 'ChIJexemple',
    nom: 'Le Salon Test',
    adresse: '12 Rue Oberkampf',
    ville: '75011 Paris',
    latitude: 48.8649,
    longitude: 2.3787,
    telephone: '+33123456789',
    niveau_prix: 1,
    horaires: [{ jour: 5, ouverture: '17:00', fermeture: '02:00' }],
  });
});

test('prix inconnu → niveau moyen, adresse de repli', () => {
  const lieu = convertirPlace({ ...exemple, priceLevel: undefined, addressComponents: undefined });
  assert.equal(lieu.niveau_prix, 2);
  assert.equal(lieu.adresse, '12 Rue Oberkampf');
  assert.equal(lieu.ville, '');
});

test('ouvert 24 h/24 tous les jours quand l’unique période n’a pas de fermeture', () => {
  const horaires = convertirHoraires([{ open: { day: 0, hour: 0, minute: 0 } }]);
  assert.equal(horaires.length, 7);
  assert.deepEqual(horaires[3], { jour: 3, ouverture: '00:00', fermeture: '00:00' });
});

test('filtre les doublons, les lieux fermés et ceux hors rayon', () => {
  const centre = { latitude: 48.8606, longitude: 2.3776 };
  const loin = { ...exemple, id: 'loin', location: { latitude: 48.95, longitude: 2.3776 } };
  const ferme = { ...exemple, id: 'ferme', businessStatus: 'CLOSED_PERMANENTLY' };
  const garde = filtrerPlaces([exemple, exemple, loin, ferme], centre, 5000);
  assert.deepEqual(garde.map((p) => p.id), ['ChIJexemple']);
});
