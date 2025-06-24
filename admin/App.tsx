import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RouterProvider } from 'expo-router';

export default function App() {
  return (
    <SafeAreaProvider>
      <RouterProvider />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
