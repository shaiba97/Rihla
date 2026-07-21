// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rihla.app',
  appName: 'تفية',
  webDir: 'dist/customer/browser',
  server: {
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