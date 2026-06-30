import type { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { BlurView, type BlurViewProps } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { BottomSheet, useBottomSheet } from 'heroui-native/bottom-sheet';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  type DerivedValue,
  type SharedValue,
  useAnimatedProps,
  useAnimatedReaction,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { useUniwind } from 'uniwind';
import { cn } from '@/lib/utils';

type UiBottomSheetSnapPoint = string | number;
type UiBottomSheetSnapPoints =
  | Array<UiBottomSheetSnapPoint>
  | SharedValue<Array<UiBottomSheetSnapPoint>>;

export const UiBottomSheetBackgroundVariantE = {
  Default: 'default',
  Transparent: 'transparent',
  Blur: 'blur',
  Glass: 'glass',
} as const;
type UiBottomSheetBackgroundVariantT =
  (typeof UiBottomSheetBackgroundVariantE)[keyof typeof UiBottomSheetBackgroundVariantE];

export const UiBottomSheetOverlayVariantE = {
  Default: 'default',
  Transparent: 'transparent',
  Blur: 'blur',
  None: 'none',
} as const;
type UiBottomSheetOverlayVariantT =
  (typeof UiBottomSheetOverlayVariantE)[keyof typeof UiBottomSheetOverlayVariantE];

interface UiBottomSheetProps {
  isOpen?: boolean;
  isDefaultOpen?: boolean;
  title?: string | React.ReactNode;
  titleClassName?: string;
  description?: string | React.ReactNode;
  descriptionClassName?: string;
  trigger?: React.ReactNode;
  snapPoints?: UiBottomSheetSnapPoints;
  snapPointsIncludeSafeArea?: boolean;
  hasCloseButton?: boolean;
  overlayVariant?: UiBottomSheetOverlayVariantT;
  overlayBlurAmount?: number;
  overlayClosePress?: boolean;
  backgroundVariant?: UiBottomSheetBackgroundVariantT;
  backgroundBlurAmount?: number;
  classNameContentWrapper?: string;
  classNameContent?: string;
  onOpenChange: (isOpen: boolean) => void;
  children?: React.ReactNode;
}

export const UiBottomSheet = ({
  isOpen,
  isDefaultOpen = false,

  // header
  title,
  titleClassName,
  description,
  descriptionClassName,
  trigger,

  // snap points
  snapPoints,
  snapPointsIncludeSafeArea = true,

  // close button
  hasCloseButton = false,

  // overlay
  overlayVariant = UiBottomSheetOverlayVariantE.Default,
  overlayBlurAmount = 40,
  overlayClosePress = true,

  // background
  backgroundVariant = UiBottomSheetBackgroundVariantE.Default,
  backgroundBlurAmount = 40,

  classNameContentWrapper,
  classNameContent,

  onOpenChange,
  children,
}: UiBottomSheetProps) => {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const contentSnapPoints = useMemo(() => {
    if (!snapPoints) return undefined;
    if (!snapPointsIncludeSafeArea || !Array.isArray(snapPoints)) {
      return snapPoints;
    }

    const isLandscape = screenWidth > screenHeight;
    const screenSize = isLandscape ? screenWidth : screenHeight;
    const safeAreaSize = isLandscape
      ? safeAreaInsets.left + safeAreaInsets.right
      : safeAreaInsets.top + safeAreaInsets.bottom;
    const availableSize = Math.max(0, screenSize - safeAreaSize);

    return snapPoints.map((point) =>
      getSafeAreaAdjustedSnapPoint(point, availableSize)
    );
  }, [
    safeAreaInsets.bottom,
    safeAreaInsets.left,
    safeAreaInsets.right,
    safeAreaInsets.top,
    screenHeight,
    screenWidth,
    snapPoints,
    snapPointsIncludeSafeArea,
  ]);
  const hasContentSnapPoints =
    contentSnapPoints !== undefined &&
    (!Array.isArray(contentSnapPoints) || contentSnapPoints.length > 0);
  const backgroundComponent = useMemo(
    () =>
      getBottomSheetBackgroundComponent(
        backgroundVariant,
        backgroundBlurAmount
      ),
    [backgroundBlurAmount, backgroundVariant]
  );
  const backgroundClassName =
    backgroundVariant === UiBottomSheetBackgroundVariantE.Default
      ? undefined
      : cn('rounded-t-4xl bg-transparent shadow-overlay');

  return (
    <BottomSheet
      isOpen={isOpen}
      isDefaultOpen={isDefaultOpen}
      onOpenChange={onOpenChange}
    >
      {trigger && <BottomSheet.Trigger asChild>{trigger}</BottomSheet.Trigger>}
      <BottomSheet.Portal>
        {overlayVariant !== UiBottomSheetOverlayVariantE.None && (
          <BottomSheetOverlay
            blurAmount={overlayBlurAmount}
            isCloseOnPress={overlayClosePress}
            overlayVariant={overlayVariant}
          />
        )}
        <BottomSheet.Content
          snapPoints={hasContentSnapPoints ? contentSnapPoints : undefined}
          enableOverDrag={true}
          enableDynamicSizing={!hasContentSnapPoints}
          backgroundComponent={backgroundComponent}
          backgroundClassName={backgroundClassName}
          handleComponent={() => (
            <View className="h-6 flex-1 items-center justify-center bg-transparent">
              <View className="h-1 w-8 rounded-full bg-gray-400 dark:bg-gray-600" />
            </View>
          )}
          contentContainerClassName={cn(
            'flex flex-col gap-4 px-4 pt-0',
            hasContentSnapPoints ? 'h-full' : 'flex-none',
            classNameContentWrapper
          )}
        >
          {hasCloseButton && (
            <BottomSheet.Close className="absolute top-0 right-4" />
          )}
          {(title || description) && (
            <View className="">
              {title && (
                <BottomSheet.Title className={titleClassName}>
                  {title}
                </BottomSheet.Title>
              )}
              {description && (
                <BottomSheet.Description className={descriptionClassName}>
                  {description}
                </BottomSheet.Description>
              )}
            </View>
          )}

          {children && (
            <View
              className={cn(
                'flex flex-1 flex-col',
                hasContentSnapPoints && 'flex-1',
                classNameContent
              )}
            >
              {children}
            </View>
          )}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};

// overlay --------------------

interface BottomSheetOverlayProps {
  blurAmount: number;
  isCloseOnPress: boolean;
  overlayVariant: UiBottomSheetOverlayVariantT;
}

const BottomSheetOverlay = ({
  blurAmount,
  isCloseOnPress,
  overlayVariant,
}: BottomSheetOverlayProps) => {
  const { theme } = useUniwind();
  const { isOpen, onOpenChange } = useBottomSheet();
  const [isOverlayMounted, setIsOverlayMounted] = useState(isOpen);
  const isBlurOverlay = overlayVariant === UiBottomSheetOverlayVariantE.Blur;
  const blurIntensity = useDerivedValue<number>(() => {
    return withTiming(isOpen && isBlurOverlay ? blurAmount : 0, {
      duration: isOpen ? 200 : 150,
    });
  }, [blurAmount, isBlurOverlay, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsOverlayMounted(true);
    }
  }, [isOpen]);

  useAnimatedReaction(
    () => blurIntensity.get(),
    (value) => {
      if (!isOpen && value <= 0.001) {
        scheduleOnRN(setIsOverlayMounted, false);
      }
    },
    [isOpen]
  );

  if (!(isOpen || isOverlayMounted)) {
    return null;
  }

  return (
    <Pressable
      className={cn(
        'absolute inset-0',
        overlayVariant === UiBottomSheetOverlayVariantE.Default &&
          'bg-backdrop',
        overlayVariant === UiBottomSheetOverlayVariantE.Transparent &&
          'bg-transparent',
        isBlurOverlay && 'bg-transparent'
      )}
      pointerEvents={isOpen ? 'auto' : 'none'}
      onPress={() => {
        if (isCloseOnPress) {
          onOpenChange(false);
        }
      }}
    >
      {isBlurOverlay && (
        <AnimatedBlurView
          blurIntensity={blurIntensity}
          className="absolute inset-0"
          pointerEvents="none"
          tint={theme === 'light' ? 'dark' : 'light'}
        />
      )}
    </Pressable>
  );
};

const RBlurView = Animated.createAnimatedComponent(BlurView);

interface AnimatedBlurViewProps extends Omit<BlurViewProps, 'intensity'> {
  blurIntensity: DerivedValue<number>;
}

const AnimatedBlurView = ({
  blurIntensity,
  ...props
}: AnimatedBlurViewProps) => {
  const animatedProps = useAnimatedProps<BlurViewProps>(() => ({
    intensity: blurIntensity.get(),
  }));

  return <RBlurView animatedProps={animatedProps} {...props} />;
};

interface BottomSheetVisualBackgroundProps extends BottomSheetBackgroundProps {
  blurAmount: number;
}

const BottomSheetBlurBackground = ({
  blurAmount,
  pointerEvents,
  style,
}: BottomSheetVisualBackgroundProps) => {
  return (
    <View
      className="overflow-hidden rounded-t-[32px] bg-transparent shadow-overlay"
      pointerEvents={pointerEvents}
      style={style}
    >
      <BlurView
        className="absolute inset-0 bg-transparent"
        intensity={blurAmount}
        tint="systemMaterial"
      />
    </View>
  );
};

const BottomSheetGlassBackground = (
  props: BottomSheetVisualBackgroundProps
) => {
  if (!getIsGlassBackgroundAvailable()) {
    return <BottomSheetBlurBackground {...props} />;
  }

  const { pointerEvents, style } = props;

  return (
    <View
      className="overflow-hidden rounded-t-[32px] bg-transparent shadow-overlay"
      pointerEvents={pointerEvents}
      style={style}
    >
      <GlassView
        className="absolute inset-0 bg-transparent"
        colorScheme="auto"
        glassEffectStyle="regular"
      />
    </View>
  );
};

// utils --------------------

const getIsGlassBackgroundAvailable = () => {
  try {
    return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  } catch {
    return false;
  }
};

const getSafeAreaAdjustedSnapPoint = (
  snapPoint: UiBottomSheetSnapPoint,
  availableSize: number
) => {
  if (typeof snapPoint === 'number') return snapPoint;

  const trimmedSnapPoint = snapPoint.trim();
  const startsWithPercentage = trimmedSnapPoint.startsWith('%');
  const endsWithPercentage = trimmedSnapPoint.endsWith('%');

  if (!(startsWithPercentage || endsWithPercentage)) return snapPoint;

  const percentageValue = startsWithPercentage
    ? trimmedSnapPoint.slice(1)
    : trimmedSnapPoint.slice(0, -1);
  const percentage = Number(percentageValue.trim());

  return Number.isFinite(percentage)
    ? (percentage / 100) * availableSize
    : snapPoint;
};

const getBottomSheetBackgroundComponent = (
  backgroundVariant: UiBottomSheetBackgroundVariantT,
  backgroundBlurAmount: number
) => {
  switch (backgroundVariant) {
    case UiBottomSheetBackgroundVariantE.Transparent:
      return null;
    case UiBottomSheetBackgroundVariantE.Blur:
      return (props: BottomSheetBackgroundProps) => (
        <BottomSheetBlurBackground
          {...props}
          blurAmount={backgroundBlurAmount}
        />
      );
    case UiBottomSheetBackgroundVariantE.Glass:
      return (props: BottomSheetBackgroundProps) => (
        <BottomSheetGlassBackground
          {...props}
          blurAmount={backgroundBlurAmount}
        />
      );
    case UiBottomSheetBackgroundVariantE.Default:
      return undefined;
  }
};
