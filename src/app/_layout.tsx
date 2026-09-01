import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { configureNotificationHandler } from '@/features/notifications/scheduler';
import { useNotificationRouting } from '@/features/notifications/useNotificationRouting';
import { color, motion } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
configureNotificationHandler();

/**
 * iOS renders in SF Pro, which needs no loading. Inter is the fallback face
 * design.md names for everywhere else, so it is only fetched off-iOS.
 */
const interFonts =
  Platform.OS === 'ios'
    ? {}
    : { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold };

/**
 * Notification routing needs the router, which only exists inside the
 * navigation tree — hence a component rather than a hook call in RootLayout.
 */
function NotificationRouting() {
  useNotificationRouting();
  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(interFonts);
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.bg }}>
      <SafeAreaProvider>
        <QueryClientProvider client={client}>
          <NotificationRouting />
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: color.bg },
              animationDuration: motion.screen,
            }}
          />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
