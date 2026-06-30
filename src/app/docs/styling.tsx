import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  DocsExamplePanel,
  DocsScreen,
  DocsSection,
} from '@/components/docs/docs-screen';

export default function StylingDocs() {
  const [presses, setPresses] = useState(0);

  return (
    <DocsScreen
      description="An interactive Uniwind example that combines active and dark pseudo-classes on the same Pressable."
      title="Styling"
    >
      <DocsSection title="Multi pseudo-classes">
        <DocsExamplePanel>
          <View className="gap-4">
            <Pressable
              className="rounded-md bg-blue-500 px-6 py-4 active:bg-blue-700 dark:bg-purple-500 dark:active:bg-purple-700"
              onPress={() => setPresses((current) => current + 1)}
            >
              <Text className="text-center font-bold text-white">
                Pressable Example
              </Text>
            </Pressable>
            <Text className="text-slate-600 text-sm dark:text-slate-300">
              Press count: {presses}
            </Text>
            <Text className="font-mono text-slate-500 text-xs dark:text-slate-400">
              active:bg-blue-700 dark:active:bg-purple-700
            </Text>
          </View>
        </DocsExamplePanel>
      </DocsSection>
    </DocsScreen>
  );
}
