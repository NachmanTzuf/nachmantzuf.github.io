import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar, Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'earpa-global-mobile-ergonomics';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-touch-callout: none !important;
          }
          input, textarea {
            -webkit-user-select: text !important;
            user-select: text !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0d14" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0d14' },
        }}
      />
    </>
  );
}
