import { Image } from 'expo-image';
import * as StoreReview from 'expo-store-review';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  DocsExamplePanel,
  DocsScreen,
  DocsSection,
} from '@/components/docs/docs-screen';
import {
  ThemeView,
  type ThemeViewProps,
  ThemeViewVariantE,
} from '@/components/theme-view';
import { cn } from '@/lib/utils';

const themeViewImageBackground = require('../../../assets/images/tutorial-web.png');

interface ThemeViewExample {
  description: string;
  id: string;
  themeViewProps: Omit<ThemeViewProps, 'children'>;
  title: string;
}

const themeViewExamples: ThemeViewExample[] = [
  {
    description: 'A translucent theme tint for lightweight overlays.',
    id: 'tint',
    themeViewProps: {
      tintAmount: 26,
      tintDarkRgb: '20, 184, 166',
      tintLightRgb: '37, 99, 235',
      variant: ThemeViewVariantE.Tint,
    },
    title: 'Tint',
  },
  {
    description: 'A blurred surface using the configured Expo blur target.',
    id: 'blur',
    themeViewProps: {
      blurAmount: 58,
      blurTint: 'systemMaterial',
      variant: ThemeViewVariantE.Blur,
    },
    title: 'Blur',
  },
  {
    description: 'Liquid glass with a small blur and theme-aware tint layer.',
    id: 'glass',
    themeViewProps: {
      blurTint: 'systemMaterial',
      glassBlurAmount: 14,
      glassColorScheme: 'auto',
      glassEffectStyle: 'clear',
      glassFallbackVariant: ThemeViewVariantE.Blur,
      glassTintAmount: 12,
      variant: ThemeViewVariantE.Glass,
    },
    title: 'Glass',
  },
];

const themeViewBackgrounds = ['light', 'dark', 'image'] as const;
type ThemeViewBackground = (typeof themeViewBackgrounds)[number];

export default function OtherDocs() {
  const parallaxProgress = useSharedValue(0);

  useEffect(() => {
    parallaxProgress.value = withRepeat(
      withTiming(1, { duration: 5200 }),
      -1,
      true
    );
  }, [parallaxProgress]);

  return (
    <DocsScreen
      description="Examples that sit outside the reusable UI component set."
      title="Other"
    >
      <DocsSection
        description="Rounded ThemeView rectangles over light, dark, and image backgrounds."
        title="ThemeView"
      >
        <View className="gap-4">
          {themeViewExamples.map((example) => (
            <DocsExamplePanel key={example.id} title={example.title}>
              <View className="gap-3">
                <Text className="text-slate-600 text-sm dark:text-slate-300">
                  {example.description}
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {themeViewBackgrounds.map((background, index) => (
                    <ThemeViewPreview
                      background={background}
                      example={example}
                      index={index}
                      key={`${example.id}-${background}`}
                      parallaxProgress={parallaxProgress}
                    />
                  ))}
                </View>
              </View>
            </DocsExamplePanel>
          ))}
        </View>
      </DocsSection>

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

interface ThemeViewPreviewProps {
  background: ThemeViewBackground;
  example: ThemeViewExample;
  index: number;
  parallaxProgress: SharedValue<number>;
}

function ThemeViewPreview({
  background,
  example,
  index,
  parallaxProgress,
}: ThemeViewPreviewProps) {
  const isDark = background === 'dark';
  const isImage = background === 'image';
  const direction = index % 2 === 0 ? 1 : -1;
  const parallaxStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: (parallaxProgress.value - 0.5) * 16 * direction,
        },
      ],
    }),
    [direction]
  );
  const labelTextClassName =
    isDark || isImage ? 'text-white' : 'text-slate-950';
  const supportingTextClassName =
    isDark || isImage ? 'text-white/75' : 'text-slate-700';
  const themeViewTextClassName =
    isDark || isImage ? 'text-white' : 'text-slate-950';

  return (
    <View
      className={cn(
        'h-56 min-w-44 flex-1 overflow-hidden rounded-md',
        isDark && 'bg-slate-950',
        isImage && 'bg-slate-900',
        !isDark && !isImage && 'bg-slate-50'
      )}
    >
      <Animated.View style={[styles.parallaxLayer, parallaxStyle]}>
        {isImage ? (
          <>
            <Image
              className="absolute inset-0"
              contentFit="cover"
              source={themeViewImageBackground}
            />
            <View className="absolute inset-0 bg-black/25" />
          </>
        ) : (
          <ThemeViewTextBackground isDark={isDark} />
        )}
      </Animated.View>

      <ThemeView
        {...example.themeViewProps}
        className={cn(
          'absolute top-5 right-4 left-4 h-24 rounded-[26px] border border-white/45',
          isDark && 'border-white/20',
          example.themeViewProps.className
        )}
      >
        <View className="flex-1 items-center justify-center px-3">
          <Text
            className={cn(
              'text-center font-bold text-sm',
              themeViewTextClassName
            )}
          >
            {example.title}
          </Text>
        </View>
      </ThemeView>

      <View className="absolute right-3 bottom-3 left-3 gap-1">
        <Text
          className={cn('font-bold text-[11px] uppercase', labelTextClassName)}
        >
          {background}
        </Text>
        <Text className={cn('text-xs', supportingTextClassName)}>
          {isImage
            ? 'Image detail sits below the material.'
            : 'Readable text sits below the rectangle.'}
        </Text>
      </View>
    </View>
  );
}

function ThemeViewTextBackground({ isDark }: { isDark: boolean }) {
  return (
    <View
      className={cn(
        'absolute inset-0 justify-between p-4',
        isDark ? 'bg-slate-950' : 'bg-white'
      )}
    >
      <View className="gap-2">
        <Text
          className={cn(
            'font-bold text-base',
            isDark ? 'text-white' : 'text-slate-950'
          )}
        >
          Surface copy
        </Text>
        <Text
          className={cn(
            'text-sm',
            isDark ? 'text-slate-300' : 'text-slate-600'
          )}
        >
          ThemeView floats above real content.
        </Text>
      </View>
      <View className="gap-2">
        {[0, 1, 2].map((line) => (
          <View
            className={cn(
              'h-2 rounded-full',
              isDark ? 'bg-white/18' : 'bg-slate-200'
            )}
            key={line}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parallaxLayer: {
    bottom: -12,
    left: 0,
    position: 'absolute',
    right: 0,
    top: -12,
  },
});
