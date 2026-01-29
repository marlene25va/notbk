import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.notebk.app',
  appName: 'notebk',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SistemBars: {
      insetsHandling: 'disable'
    },
    EdgeToEdge: {
      backgroundColor: '#ffffff',
      navigationBarColor: '#000000',
      statusBarColor: '#ffffff'
    }
  }
};

export default config;
