import { Pressable, Text, View } from 'react-native';

import '../global.css';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-10">
      <View className="text-center">
        <Text className="text-center font-bold text-2xl">Uniwind</Text>
        <Text className="text-center">Combining Pseudo-classes</Text>

        <View className="mt-4 text-center">
          <Text className="text-center font-bold">
            dark:active:bg-purple-700
          </Text>
          <Text className="text-center">
            Test active state in both light and dark modes (light should be
            blue, dark should be purple)
          </Text>
        </View>
      </View>

      <Pressable className="rounded-md bg-blue-500 p-4 active:bg-blue-700 dark:bg-purple-500 dark:active:bg-purple-700">
        <Text className="font-bold text-white">Click Me</Text>
      </Pressable>

      <View className="mt-2 gap-1 text-center">
        <Text className="text-center font-bold">iOS Simulator</Text>
        <Text className="text-center">CMD + SHIFT + A (toggle Appearance)</Text>
        <Text className="text-center">Features {'>'} Toggle Appearance</Text>
      </View>
    </View>
  );
}
