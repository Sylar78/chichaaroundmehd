import type { Horaire, NiveauPrix } from '@/types';

export type Coordonnees = { latitude: number; longitude: number };

/** Distance à vol d'oiseau en mètres (formule de haversine). */
export function distanceEnMetres(a: Coordonnees, b: Coordonnees): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres / 10) * 10} m`;
  return `${(metres / 1000).toFixed(1).replace('.', ',')} km`;
}

export function formatNote(note: number): string {
  return note.toFixed(1).replace('.', ',');
}

export function formatNiveauPrix(niveau: NiveauPrix): string {
  return '€'.repeat(niveau);
}

export function formatPrix(prix: number): string {
  return `${prix.toLocaleString('fr-FR')} €`;
}

const NOMS_JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export function nomJour(jour: number): string {
  return NOMS_JOURS[jour] ?? '';
}

function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function formatHeure(hhmm: string): string {
  const [h, m] = hhmm.split(':');
  return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`;
}

/** Indique si le lieu est ouvert à `date`, en gérant les fermetures après minuit. */
export function estOuvert(horaires: Horaire[], date = new Date()): boolean {
  const maintenant = date.getHours() * 60 + date.getMinutes();
  const jour = date.getDay();
  const veille = (jour + 6) % 7;

  return horaires.some((h) => {
    const ouv = minutes(h.ouverture);
    const ferm = minutes(h.fermeture);
    const passeMinuit = ferm <= ouv;
    if (h.jour === jour) {
      return passeMinuit ? maintenant >= ouv : maintenant >= ouv && maintenant < ferm;
    }
    if (h.jour === veille && passeMinuit) {
      return maintenant < ferm;
    }
    return false;
  });
}

export function horaireDuJour(horaires: Horaire[], date = new Date()): Horaire | undefined {
  return horaires.find((h) => h.jour === date.getDay());
}
