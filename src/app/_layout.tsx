import { Stack } from 'expo-router';
import { type HeroUINativeConfig, HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
        <Stack />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
