// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rihla.app',
  appName: 'رحلة',
  webDir: 'dist/customer/browser',
  server: {
    url: 'http://10.150.112.92:4100',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0D9488',
      overlaysWebView: false
    }
  },
  android: {
    allowMixedContent: true
  }
};

export default config;