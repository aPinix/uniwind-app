import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-slate-50 px-10 dark:bg-slate-950">
      <View className="gap-2">
        <Text className="text-center font-bold text-3xl text-slate-950 dark:text-white">
          Uniwind
        </Text>
        <Text className="text-center text-slate-600 dark:text-slate-300">
          Component examples and docs
        </Text>
      </View>

      <Link asChild href="/docs">
        <Pressable className="rounded-md bg-blue-500 px-6 py-4 active:bg-blue-700 dark:bg-purple-500 dark:active:bg-purple-700">
          <Text className="font-bold text-white">Open Docs</Text>
        </Pressable>
      </Link>
    </View>
  );
}
