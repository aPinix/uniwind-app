import * as StoreReview from 'expo-store-review';
import { Pressable, Text } from 'react-native';
import {
  DocsExamplePanel,
  DocsScreen,
  DocsSection,
} from '@/components/docs/docs-screen';

export default function OtherDocs() {
  return (
    <DocsScreen
      description="Examples that sit outside the reusable UI component set."
      title="Other"
    >
      <DocsSection title="App Review">
        <DocsExamplePanel>
          <Pressable
            className="rounded-md bg-blue-500 px-6 py-4 active:bg-blue-700 dark:bg-purple-500 dark:active:bg-purple-700"
            onPress={() => {
              StoreReview.requestReview();
            }}
          >
            <Text className="text-center font-bold text-white">App Review</Text>
          </Pressable>
        </DocsExamplePanel>
      </DocsSection>
    </DocsScreen>
  );
}
