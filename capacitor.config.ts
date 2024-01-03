import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.weather.app.de',
  appName: 'react-weather-app',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
