import { useState } from 'react';
import { Text, View } from 'react-native';
import {
  DocsExamplePanel,
  DocsScreen,
  DocsSection,
} from '@/components/docs/docs-screen';
import { UiButton } from '@/components/ui/ui-button';
import { AppIcon, UiIcon } from '@/components/ui/ui-icon';

export default function ButtonDocs() {
  const [lastAction, setLastAction] = useState('None yet');

  return (
    <DocsScreen
      description="UiButton wraps Hero UI Native Button with optional leading and trailing icon slots."
      title="Buttons"
    >
      <DocsSection title="Examples">
        <DocsExamplePanel>
          <View className="items-start gap-3">
            <UiButton onPress={() => setLastAction('Plain button')}>
              Plain Button
            </UiButton>
            <UiButton
              iconStart={
                <UiIcon color="#ffffff" name={AppIcon.BullsEye} size={18} />
              }
              onPress={() => setLastAction('Leading icon')}
            >
              Leading Icon
            </UiButton>
            <UiButton
              iconEnd={
                <UiIcon
                  color="#ffffff"
                  name="arrow.right.circle.fill"
                  size={18}
                />
              }
              onPress={() => setLastAction('Trailing icon')}
            >
              Trailing Icon
            </UiButton>
          </View>
          <Text className="text-slate-600 text-sm dark:text-slate-300">
            Last action: {lastAction}
          </Text>
        </DocsExamplePanel>
      </DocsSection>
    </DocsScreen>
  );
}
