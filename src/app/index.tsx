import * as StoreReview from 'expo-store-review';
import { Button } from 'heroui-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  UiBottomSheet,
  UiBottomSheetBackgroundVariantE,
  UiBottomSheetOverlayVariantE,
} from '@/components/ui/ui-bottom-sheet';

export default function Index() {
  const [isOpenBottomSheetDefault, setIsOpenBottomSheetDefault] =
    useState(false);
  const [isOpenBottomSheetTransparent, setIsOpenBottomSheetTransparent] =
    useState(false);
  const [isOpenBottomSheetTint, setIsOpenBottomSheetTint] = useState(false);
  const [isOpenBottomSheetBlur, setIsOpenBottomSheetBlur] = useState(false);
  const [isOpenBottomSheetGlass, setIsOpenBottomSheetGlass] = useState(false);

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-slate-50 px-10 dark:bg-slate-950">
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

      <UiBottomSheet
        backgroundVariant={UiBottomSheetBackgroundVariantE.Default}
        description="This is a description of the bottom sheet"
        isOpen={isOpenBottomSheetDefault}
        onOpenChange={setIsOpenBottomSheetDefault}
        snapPoints={['50%', '80%', '100%']}
        title="Bottom Sheet Default"
        trigger={<Button>Bottom Sheet Default</Button>}
      >
        <Text>Bottom Sheet Default</Text>
      </UiBottomSheet>

      <UiBottomSheet
        backgroundVariant={UiBottomSheetBackgroundVariantE.Transparent}
        description="This is a description of the bottom sheet"
        hasHandle={false}
        isOpen={isOpenBottomSheetTransparent}
        onOpenChange={setIsOpenBottomSheetTransparent}
        overlayVariant={UiBottomSheetOverlayVariantE.Transparent}
        snapPoints={['100%']}
        title="Bottom Sheet Transparent"
        trigger={<Button>Bottom Sheet Transparent</Button>}
      >
        <Text>Bottom Sheet Transparent</Text>
      </UiBottomSheet>

      <UiBottomSheet
        backgroundVariant={UiBottomSheetBackgroundVariantE.Default}
        description="This is a description of the bottom sheet"
        hasHandle={false}
        isOpen={isOpenBottomSheetTint}
        onOpenChange={setIsOpenBottomSheetTint}
        overlayVariant={UiBottomSheetOverlayVariantE.Tint}
        snapPoints={['50%', '80%', '100%']}
        title="Bottom Sheet Tint"
        trigger={<Button>Bottom Sheet Tint</Button>}
      >
        <Text>Bottom Sheet Tint</Text>
      </UiBottomSheet>

      <UiBottomSheet
        backgroundVariant={UiBottomSheetBackgroundVariantE.Blur}
        description="This is a description of the bottom sheet"
        isOpen={isOpenBottomSheetBlur}
        onOpenChange={setIsOpenBottomSheetBlur}
        overlayVariant={UiBottomSheetOverlayVariantE.Transparent}
        snapPoints={['50%', '80%', '100%']}
        title="Bottom Sheet Blur"
        trigger={<Button>Bottom Sheet Blur</Button>}
      >
        <Text>Bottom Sheet Blur</Text>
      </UiBottomSheet>

      <UiBottomSheet
        backgroundVariant={UiBottomSheetBackgroundVariantE.Glass}
        description="This is a description of the bottom sheet"
        isOpen={isOpenBottomSheetGlass}
        onOpenChange={setIsOpenBottomSheetGlass}
        overlayVariant={UiBottomSheetOverlayVariantE.Transparent}
        snapPoints={['50%', '80%', '100%']}
        title="Bottom Sheet Glass"
        trigger={<Button>Bottom Sheet Glass</Button>}
      >
        <Text>Bottom Sheet Glass</Text>
      </UiBottomSheet>

      <Pressable
        className="rounded-md bg-blue-500 px-6 py-4 active:bg-blue-700 dark:bg-purple-500 dark:active:bg-purple-700"
        onPress={() => {
          StoreReview.requestReview();
        }}
      >
        <Text className="font-bold text-white">App Review</Text>
      </Pressable>

      <View className="mt-2 gap-1 text-center">
        <Text className="text-center font-bold">iOS Simulator</Text>
        <Text className="text-center">CMD + SHIFT + A (toggle Appearance)</Text>
        <Text className="text-center">Features {'>'} Toggle Appearance</Text>
      </View>
    </View>
  );
}
