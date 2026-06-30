import { Stack } from 'expo-router';

export default function DocsLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#f8fafc' },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#f8fafc' },
        headerTintColor: '#0f172a',
      }}
    />
  );
}
