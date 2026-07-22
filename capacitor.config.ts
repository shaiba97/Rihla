import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId:    'com.rihla.company',
  appName:  'تفية',
  webDir:   'dist/company/browser',
  server: {
    androidScheme: 'https',
    cleartext:     true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration:  2000,
      launchAutoHide:      true,
      backgroundColor:     '#8B5E3C',
      showSpinnerFalse:    false,
    },
    StatusBar: {
      style:           'DARK',
      backgroundColor: '#8B5E3C',
    },
  },
};

export default config;