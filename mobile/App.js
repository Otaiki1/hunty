import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ReactQueryProvider from './providers/ReactQueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { initializeSplashScreen } from './utils/splashScreenManager';
import RootLayout from './app/_layout';

// Initialize splash screen on app start
initializeSplashScreen();

export default function App() {
  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="default" />
          <RootLayout />
        </SafeAreaProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
