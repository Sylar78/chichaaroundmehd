import assert from 'node:assert/strict';
import { test } from 'node:test';

import { distanceEnMetres, estOuvert, formatDistance, formatHeure, formatNote } from './format.ts';

// Vendredi 9 octobre 2026 = jour 5. Les dates sont en heure locale.
const vendredi = (h: number, m = 0) => new Date(2026, 9, 9, h, m);
const samedi = (h: number, m = 0) => new Date(2026, 9, 10, h, m);

const soir = [{ jour: 5, ouverture: '17:00', fermeture: '02:00' }];

test('ouvert le soir, fermé avant l’ouverture', () => {
  assert.equal(estOuvert(soir, vendredi(18)), true);
  assert.equal(estOuvert(soir, vendredi(16, 59)), false);
  assert.equal(estOuvert(soir, vendredi(17, 0)), true);
});

test('la fermeture après minuit couvre le lendemain matin', () => {
  assert.equal(estOuvert(soir, samedi(1, 30)), true);
  assert.equal(estOuvert(soir, samedi(2, 0)), false);
  assert.equal(estOuvert(soir, samedi(10)), false);
});

test('une fermeture le même jour ne déborde pas', () => {
  const journee = [{ jour: 5, ouverture: '10:00', fermeture: '18:00' }];
  assert.equal(estOuvert(journee, vendredi(17, 59)), true);
  assert.equal(estOuvert(journee, vendredi(18, 0)), false);
  assert.equal(estOuvert(journee, samedi(1)), false);
});

test('ouvert 24 h/24 (ouverture = fermeture = minuit)', () => {
  const tous = [0, 1, 2, 3, 4, 5, 6].map((jour) => ({ jour, ouverture: '00:00', fermeture: '00:00' }));
  assert.equal(estOuvert(tous, vendredi(3)), true);
  assert.equal(estOuvert(tous, samedi(23, 59)), true);
});

test('sans horaires, le lieu est considéré fermé', () => {
  assert.equal(estOuvert([], vendredi(18)), false);
});

test('distance à vol d’oiseau', () => {
  const a = { latitude: 48.8606, longitude: 2.3776 };
  assert.equal(Math.round(distanceEnMetres(a, a)), 0);
  const d = distanceEnMetres(a, { latitude: 48.8696, longitude: 2.3776 });
  assert.ok(d > 990 && d < 1010, `attendu ~1 km, obtenu ${d}`);
});

test('formats français', () => {
  assert.equal(formatDistance(234), '230 m');
  assert.equal(formatDistance(1250), '1,3 km');
  assert.equal(formatNote(4.7), '4,7');
  assert.equal(formatHeure('17:00'), '17 h');
  assert.equal(formatHeure('02:30'), '2 h 30');
});
