// Dynamic Expo config.
// Reads the static config from app.json and injects secrets from the environment

module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...(config.android && config.android.config),
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
  };
};
