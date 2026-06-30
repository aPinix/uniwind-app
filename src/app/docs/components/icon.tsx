import { Text, View } from 'react-native';
import {
  DocsExamplePanel,
  DocsScreen,
  DocsSection,
} from '@/components/docs/docs-screen';
import { AppIcon, UiIcon } from '@/components/ui/ui-icon';

const symbolExamples = [
  { color: '#2563eb', label: 'Sparkles', name: 'sparkles' },
  { color: '#dc2626', label: 'Heart', name: 'heart.fill' },
  { color: '#16a34a', label: 'Checkmark', name: 'checkmark.circle.fill' },
];

export default function IconDocs() {
  return (
    <DocsScreen
      description="UiIcon can render Expo Symbols by name or local SVG components created with createIcon."
      title="Icon"
    >
      <DocsSection title="Expo Symbols">
        <DocsExamplePanel>
          <View className="flex-row flex-wrap gap-3">
            {symbolExamples.map((icon) => (
              <View
                className="min-w-28 flex-1 items-center gap-3 rounded-md bg-slate-50 p-4 dark:bg-slate-950"
                key={icon.name}
              >
                <UiIcon color={icon.color} name={icon.name} size={36} />
                <Text className="font-medium text-slate-700 dark:text-slate-200">
                  {icon.label}
                </Text>
              </View>
            ))}
          </View>
        </DocsExamplePanel>
      </DocsSection>

      <DocsSection title="Local SVG icon">
        <DocsExamplePanel>
          <View className="items-center gap-3 rounded-md bg-slate-50 p-6 dark:bg-slate-950">
            <UiIcon color="#2563eb" name={AppIcon.BullsEye} size={56} />
            <Text className="font-medium text-slate-700 dark:text-slate-200">
              AppIcon.BullsEye
            </Text>
          </View>
        </DocsExamplePanel>
      </DocsSection>
    </DocsScreen>
  );
}
