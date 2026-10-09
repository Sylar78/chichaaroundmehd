// Complète app.json avec les valeurs qui ne doivent pas être écrites dans le dépôt.
// Les variables viennent de l'environnement EAS (`eas env:create`) pour les builds dans le cloud,
// ou du shell en local.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      // Sans clé Google Maps, la carte reste vide dans les builds Android de production.
      googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY },
    },
  },
});
