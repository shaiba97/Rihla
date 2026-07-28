import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tafiya.com',
  appName: 'تفية',
  webDir: 'dist/customer/browser',
  server: {
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0D9488',
      overlaysWebView: false
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
    },
    PushNotifications: {
      presentationOptions: ['alert', 'sound', 'badge'],
    }
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
