import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cyrixservices.mindbridge',
  appName: 'mind-bridge',
  webDir: 'public',

  server: {
    hostname: '192.168.29.49:3000',
    allowNavigation: ['*'],
    androidScheme: 'http',
    cleartext: true
  },

  android: {
    allowMixedContent: true
  }
};


export default config;
