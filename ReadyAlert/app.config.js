// Dynamic Expo config.
// Reads the static config from app.json and injects secrets from the environment

const fs = require('fs');
const path = require('path');

module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Crashlytics needs a real google-services.json from the Firebase console to build.
  // Only wire the Firebase plugins in once that file actually exists, so `eas build`
  // keeps working before it's been added — see README/setup notes for how to get one.
  const googleServicesPath = path.join(__dirname, 'google-services.json');
  const hasGoogleServices = fs.existsSync(googleServicesPath);

  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      ...(hasGoogleServices
        ? ['@react-native-firebase/app', '@react-native-firebase/crashlytics']
        : []),
    ],
    android: {
      ...config.android,
      ...(hasGoogleServices ? { googleServicesFile: googleServicesPath } : {}),
      config: {
        ...(config.android && config.android.config),
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
  };
};
