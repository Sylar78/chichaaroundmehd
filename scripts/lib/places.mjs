// Conversion des résultats Google Places API (New) vers la table `lieux`.

export const CHAMPS_GOOGLE = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.addressComponents',
  'places.location',
  'places.internationalPhoneNumber',
  'places.priceLevel',
  'places.regularOpeningHours.periods',
  'places.businessStatus',
  'nextPageToken',
].join(',');

const NIVEAUX_PRIX = {
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 3,
};

const hhmm = (p) => `${String(p.hour ?? 0).padStart(2, '0')}:${String(p.minute ?? 0).padStart(2, '0')}`;

/** Périodes Google (jour 0 = dimanche, comme dans l'app) → horaires de l'app. */
export function convertirHoraires(periods = []) {
  // Une seule période sans `close` : Google signale un lieu ouvert 24 h/24, 7 j/7.
  if (periods.length === 1 && periods[0].open && !periods[0].close) {
    return [0, 1, 2, 3, 4, 5, 6].map((jour) => ({ jour, ouverture: '00:00', fermeture: '00:00' }));
  }
  return periods
    .filter((p) => p.open && p.close)
    .map((p) => ({ jour: p.open.day, ouverture: hhmm(p.open), fermeture: hhmm(p.close) }));
}

function composant(place, type) {
  return place.addressComponents?.find((c) => c.types?.includes(type))?.longText;
}

/** Un résultat Google → ligne de la table `lieux` (sans id ni note, gérés par la base). */
export function convertirPlace(place) {
  const numero = composant(place, 'street_number');
  const rue = composant(place, 'route');
  const codePostal = composant(place, 'postal_code');
  const ville = composant(place, 'locality');
  const adresse = [numero, rue].filter(Boolean).join(' ') || place.formattedAddress?.split(',')[0] || '';
  return {
    google_place_id: place.id,
    nom: place.displayName?.text ?? 'Sans nom',
    adresse,
    ville: [codePostal, ville].filter(Boolean).join(' ') || '',
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    telephone: place.internationalPhoneNumber?.replace(/\s/g, '') ?? null,
    niveau_prix: NIVEAUX_PRIX[place.priceLevel] ?? 2,
    horaires: convertirHoraires(place.regularOpeningHours?.periods),
  };
}

/** Garde les lieux en activité, dans le rayon, sans doublon. */
export function filtrerPlaces(places, centre, rayonMetres) {
  const vus = new Set();
  return places.filter((p) => {
    if (!p.location || vus.has(p.id)) return false;
    if (p.businessStatus && p.businessStatus !== 'OPERATIONAL') return false;
    vus.add(p.id);
    return distanceMetres(centre, p.location) <= rayonMetres;
  });
}

export function distanceMetres(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}
