import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type HeroUINativeConfig, HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BlurViewProvider } from '@/components/ui/blur-view-provider';

import '../global.css';

const config: HeroUINativeConfig = {
  devInfo: {
    // Disable styling principles information message
    stylingPrinciples: false,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider config={config}>
        <BlurViewProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
        </BlurViewProvider>
        <StatusBar style="auto" />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
