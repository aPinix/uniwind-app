import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
  useState,
} from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  DocsExamplePanel,
  DocsScreen,
  DocsSection,
} from '@/components/docs/docs-screen';
import {
  UiBottomSheet,
  UiBottomSheetBackgroundVariantE,
  UiBottomSheetOverlayVariantE,
} from '@/components/ui/ui-bottom-sheet';

type BackgroundVariant =
  (typeof UiBottomSheetBackgroundVariantE)[keyof typeof UiBottomSheetBackgroundVariantE];
type OverlayVariant =
  (typeof UiBottomSheetOverlayVariantE)[keyof typeof UiBottomSheetOverlayVariantE];

interface BackgroundExample {
  id: string;
  label: string;
  title: string;
  description: string;
  variant: BackgroundVariant;
  hasHandle?: boolean;
  snapPoints?: Array<string | number>;
}

interface OverlayExample {
  id: string;
  label: string;
  title: string;
  description: string;
  variant: OverlayVariant;
  overlayClosePress?: boolean;
}

interface SheetExample {
  id: string;
  background: BackgroundExample;
  overlay: OverlayExample;
}

const defaultSnapPoints = ['50%', '80%', '100%'];

const backgroundExamples: BackgroundExample[] = [
  {
    description:
      'The standard sheet surface with an overlay-colored background.',
    id: 'background-default',
    label: 'Default',
    title: 'Default Background',
    variant: UiBottomSheetBackgroundVariantE.Default,
  },
  {
    description: 'A transparent sheet surface for fully custom content.',
    hasHandle: false,
    id: 'background-transparent',
    label: 'Transparent',
    snapPoints: ['100%'],
    title: 'Transparent Background',
    variant: UiBottomSheetBackgroundVariantE.Transparent,
  },
  {
    description: 'A blurred sheet surface using expo-blur.',
    id: 'background-blur',
    label: 'Blur',
    title: 'Blur Background',
    variant: UiBottomSheetBackgroundVariantE.Blur,
  },
  {
    description:
      'A clear glass sheet layered with background blur and theme tint.',
    id: 'background-glass',
    label: 'Glass',
    title: 'Glass Background',
    variant: UiBottomSheetBackgroundVariantE.Glass,
  },
  {
    description: 'No sheet background component.',
    id: 'background-none',
    label: 'None',
    title: 'No Background',
    variant: UiBottomSheetBackgroundVariantE.None,
  },
];

const overlayExamples: OverlayExample[] = [
  {
    description: 'The default backdrop from the bottom sheet implementation.',
    id: 'overlay-default',
    label: 'Default',
    title: 'Default Overlay',
    variant: UiBottomSheetOverlayVariantE.Default,
  },
  {
    description: 'A transparent overlay that still catches outside presses.',
    id: 'overlay-transparent',
    label: 'Transparent',
    title: 'Transparent Overlay',
    variant: UiBottomSheetOverlayVariantE.Transparent,
  },
  {
    description: 'A tint overlay driven by the configured blur amount.',
    id: 'overlay-tint',
    label: 'Tint',
    title: 'Tint Overlay',
    variant: UiBottomSheetOverlayVariantE.Tint,
  },
  {
    description: 'A blurred overlay using the configured blur target.',
    id: 'overlay-blur',
    label: 'Blur',
    title: 'Blur Overlay',
    variant: UiBottomSheetOverlayVariantE.Blur,
  },
  {
    description: 'A glass overlay using the previous blur-glass look.',
    id: 'overlay-glass',
    label: 'Glass',
    title: 'Glass Overlay',
    variant: UiBottomSheetOverlayVariantE.Glass,
  },
  {
    description: 'No overlay or backdrop component.',
    id: 'overlay-none',
    label: 'None',
    overlayClosePress: false,
    title: 'No Overlay',
    variant: UiBottomSheetOverlayVariantE.None,
  },
];

export default function BottomSheetDocs() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const renderSheet = (
    background: BackgroundExample,
    overlay: OverlayExample
  ) => {
    const example: SheetExample = {
      background,
      id: `${background.id}-${overlay.id}`,
      overlay,
    };

    return (
      <UiBottomSheet
        backgroundVariant={background.variant}
        description={`${background.title} with ${overlay.title.toLowerCase()}.`}
        hasHandle={background.hasHandle}
        isOpen={activeSheet === example.id}
        key={example.id}
        onOpenChange={(isOpen) => setActiveSheet(isOpen ? example.id : null)}
        overlayClosePress={overlay.overlayClosePress}
        overlayVariant={overlay.variant}
        snapPoints={background.snapPoints ?? defaultSnapPoints}
        title={`${background.title} / ${overlay.title}`}
        trigger={<SheetTrigger label={overlay.label} />}
      >
        <SheetContent example={example} />
      </UiBottomSheet>
    );
  };

  return (
    <DocsScreen
      description="UiBottomSheet examples covering every background and overlay variant exposed by the local wrapper."
      title="Bottom Sheet"
    >
      <DocsSection
        description="Each row is a background variant. Buttons in that row open the sheet with each overlay variant."
        title="Background x overlay variants"
      >
        <View className="gap-4">
          {backgroundExamples.map((background) => (
            <DocsExamplePanel key={background.id}>
              <View className="gap-3">
                <View className="gap-1">
                  <Text className="font-bold text-base text-slate-950 dark:text-white">
                    {background.title}
                  </Text>
                  <Text className="text-slate-600 text-sm dark:text-slate-300">
                    {background.description}
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {overlayExamples.map((overlay) =>
                    renderSheet(background, overlay)
                  )}
                </View>
              </View>
            </DocsExamplePanel>
          ))}
        </View>
      </DocsSection>
    </DocsScreen>
  );
}

interface SheetTriggerProps extends ComponentPropsWithoutRef<typeof Pressable> {
  label: string;
}

const SheetTrigger = forwardRef<
  ComponentRef<typeof Pressable>,
  SheetTriggerProps
>(({ label, ...props }, ref) => {
  return (
    <Pressable
      className="rounded-md border border-slate-200 bg-white px-4 py-3 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:active:bg-slate-700"
      ref={ref}
      {...props}
    >
      <Text className="font-bold text-slate-950 dark:text-white">{label}</Text>
    </Pressable>
  );
});

SheetTrigger.displayName = 'SheetTrigger';

function SheetContent({ example }: { example: SheetExample }) {
  return (
    <View className="gap-4 pb-8">
      <Text className="font-bold text-lg text-slate-950 dark:text-white">
        {example.background.title} / {example.overlay.title}
      </Text>
      <Text className="text-slate-600 dark:text-slate-300">
        {example.background.description}
      </Text>
      <Text className="text-slate-600 dark:text-slate-300">
        {example.overlay.description}
      </Text>
      <View className="gap-2 rounded-lg bg-white p-4 dark:bg-slate-950">
        <Text className="text-slate-600 text-sm dark:text-slate-300">
          backgroundVariant: {example.background.variant}
        </Text>
        <Text className="text-slate-600 text-sm dark:text-slate-300">
          overlayVariant: {example.overlay.variant}
        </Text>
      </View>
    </View>
  );
}
