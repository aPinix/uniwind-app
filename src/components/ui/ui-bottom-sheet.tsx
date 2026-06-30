import { BlurView, type BlurViewProps } from 'expo-blur';
import {
  BottomSheet,
  useBottomSheet,
  useBottomSheetAnimation,
} from 'heroui-native/bottom-sheet';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  type DerivedValue,
  interpolate,
  type SharedValue,
  useAnimatedProps,
  useAnimatedReaction,
  useDerivedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { useUniwind } from 'uniwind';

type UiBottomSheetSnapPoint = string | number;
type UiBottomSheetSnapPoints =
  | Array<UiBottomSheetSnapPoint>
  | SharedValue<Array<UiBottomSheetSnapPoint>>;

interface UiBottomSheetProps {
  isOpen?: boolean;
  isDefaultOpen?: boolean;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  trigger?: React.ReactNode;
  snapPoints?: UiBottomSheetSnapPoints;
  snapPointsIncludeSafeArea?: boolean;
  hasCloseButton?: boolean;
  hasOverlay?: boolean;
  hasBlurOverlay?: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children?: React.ReactNode;
}

export const UiBottomSheet = ({
  isOpen,
  isDefaultOpen = false,
  title,
  description,
  trigger,
  snapPoints,
  snapPointsIncludeSafeArea = true,
  hasCloseButton = true,
  hasOverlay = true,
  hasBlurOverlay = true,
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

  return (
    <BottomSheet
      isOpen={isOpen}
      isDefaultOpen={isDefaultOpen}
      onOpenChange={onOpenChange}
    >
      {trigger && <BottomSheet.Trigger asChild>{trigger}</BottomSheet.Trigger>}
      <BottomSheet.Portal>
        {hasOverlay &&
          (hasBlurOverlay ? (
            <BottomSheetBlurOverlay />
          ) : (
            <BottomSheet.Overlay />
          ))}
        <BottomSheet.Content
          snapPoints={hasContentSnapPoints ? contentSnapPoints : undefined}
          enableOverDrag={true}
          enableDynamicSizing={!hasContentSnapPoints}
          contentContainerClassName="h-full"
        >
          {hasCloseButton && (
            <BottomSheet.Close className="absolute top-0 right-4" />
          )}
          {title && <BottomSheet.Title>{title}</BottomSheet.Title>}
          {description && (
            <BottomSheet.Description>{description}</BottomSheet.Description>
          )}

          {children && <View className="flex-1">{children}</View>}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};

// overlay --------------------

const BottomSheetBlurOverlay = () => {
  const { theme } = useUniwind();
  const { isOpen, onOpenChange } = useBottomSheet();
  const { progress } = useBottomSheetAnimation();
  const [isOverlayMounted, setIsOverlayMounted] = useState(isOpen);
  const blurIntensity = useDerivedValue(() => {
    return interpolate(progress.get(), [0, 1, 2], [0, 40, 0]);
  });

  useEffect(() => {
    if (isOpen) {
      setIsOverlayMounted(true);
    }
  }, [isOpen]);

  useAnimatedReaction(
    () => progress.get(),
    (value) => {
      const isClosed = value <= 0.001 || value >= 1.999;

      if (!isOpen && isClosed) {
        scheduleOnRN(setIsOverlayMounted, false);
      }
    },
    [isOpen]
  );

  if (!isOverlayMounted) {
    return null;
  }

  return (
    <Pressable
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={StyleSheet.absoluteFill}
      onPress={() => onOpenChange(false)}
    >
      <AnimatedBlurView
        blurIntensity={blurIntensity}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        tint={theme === 'light' ? 'dark' : 'light'}
      />
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

// utils --------------------

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
