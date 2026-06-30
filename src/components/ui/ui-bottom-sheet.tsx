import type { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { BlurView, type BlurViewProps } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { BottomSheet, useBottomSheet } from 'heroui-native/bottom-sheet';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  type DerivedValue,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { useUniwind } from 'uniwind';
import { cn } from '@/lib/utils';

const bottomSheetContentBorderRadius = 40;
const insetGap = 8;

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
type UiBottomSheetBackgroundGlassFallbackVariantT = Exclude<
  UiBottomSheetBackgroundVariantT,
  typeof UiBottomSheetBackgroundVariantE.Glass
>;

export const UiBottomSheetOverlayVariantE = {
  Default: 'default',
  Transparent: 'transparent',
  Blur: 'blur',
  Glass: 'glass',
  None: 'none',
} as const;
type UiBottomSheetOverlayVariantT =
  (typeof UiBottomSheetOverlayVariantE)[keyof typeof UiBottomSheetOverlayVariantE];
type UiBottomSheetOverlayGlassFallbackVariantT = Exclude<
  UiBottomSheetOverlayVariantT,
  typeof UiBottomSheetOverlayVariantE.Glass
>;

interface UiBottomSheetProps {
  isOpen?: boolean;
  isDefaultOpen?: boolean;

  title?: string | React.ReactNode;
  titleClassName?: string;
  description?: string | React.ReactNode;
  descriptionClassName?: string;

  trigger?: React.ReactNode;
  hasCloseButton?: boolean;
  isInset?: boolean;
  enableOverDrag?: boolean;
  enablePanDownToClose?: boolean;

  hasHandle?: boolean;
  handleWrapperClassName?: string;
  handleClassName?: string;

  snapPoints?: UiBottomSheetSnapPoints;
  snapPointsIncludeSafeArea?: boolean;

  backgroundVariant?: UiBottomSheetBackgroundVariantT;
  backgroundBlurAmount?: number;
  backgroundGlassFallbackVariant?: UiBottomSheetBackgroundGlassFallbackVariantT;

  overlayVariant?: UiBottomSheetOverlayVariantT;
  overlayBlurAmount?: number;
  overlayGlassFallbackVariant?: UiBottomSheetOverlayGlassFallbackVariantT;
  overlayClosePress?: boolean;
  overlayClassName?: string;

  className?: string;
  classNameContentWrapper?: string;
  classNameContent?: string;

  borderRadiusTop?: number;
  borderRadiusBottom?: number;

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

  // props
  trigger,
  hasCloseButton = false,
  isInset = false,
  enableOverDrag = true,
  enablePanDownToClose = true,

  // handle
  hasHandle = true,
  handleWrapperClassName,
  handleClassName,

  // snap points
  snapPoints,
  snapPointsIncludeSafeArea = true,

  // background
  backgroundVariant = UiBottomSheetBackgroundVariantE.Default,
  backgroundBlurAmount = 40,
  backgroundGlassFallbackVariant = UiBottomSheetBackgroundVariantE.Blur,

  // overlay
  overlayVariant = UiBottomSheetOverlayVariantE.Blur,
  overlayBlurAmount = 40,
  overlayGlassFallbackVariant = UiBottomSheetOverlayVariantE.Blur,
  overlayClosePress = true,
  overlayClassName,

  // styling
  className,
  classNameContentWrapper,
  classNameContent,

  borderRadiusTop = bottomSheetContentBorderRadius,
  borderRadiusBottom,

  // events
  onOpenChange,

  // content
  children,
}: UiBottomSheetProps) => {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const deviceBorderRadius = useMemo(() => {
    return Platform.OS === 'ios'
      ? safeAreaInsets.top - insetGap
      : safeAreaInsets.top;
  }, [safeAreaInsets.top]);
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
        backgroundBlurAmount,
        backgroundGlassFallbackVariant
      ),
    [backgroundBlurAmount, backgroundGlassFallbackVariant, backgroundVariant]
  );
  const backgroundClassName =
    backgroundVariant === UiBottomSheetBackgroundVariantE.Default
      ? undefined
      : cn('bg-transparent shadow-overlay');

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
            glassFallbackVariant={overlayGlassFallbackVariant}
            isCloseOnPress={overlayClosePress}
            overlayVariant={overlayVariant}
            className={overlayClassName}
          />
        )}
        <BottomSheet.Content
          snapPoints={hasContentSnapPoints ? contentSnapPoints : undefined}
          enableOverDrag={enableOverDrag}
          enablePanDownToClose={enablePanDownToClose}
          enableDynamicSizing={!hasContentSnapPoints}
          backgroundComponent={backgroundComponent}
          backgroundClassName={cn('', backgroundClassName)}
          handleComponent={() =>
            hasHandle ? (
              <View
                className={cn(
                  'h-8 flex-1 items-center justify-center bg-transparent',
                  handleWrapperClassName
                )}
              >
                <View
                  className={cn(
                    'h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700',
                    handleClassName
                  )}
                />
              </View>
            ) : null
          }
          bottomInset={isInset ? insetGap : 0}
          detached={isInset}
          className={cn('overflow-hidden', className)}
          style={{
            borderTopLeftRadius: borderRadiusTop,
            borderTopRightRadius: borderRadiusTop,
            borderBottomLeftRadius:
              borderRadiusBottom || deviceBorderRadius || 0,
            borderBottomRightRadius:
              borderRadiusBottom || deviceBorderRadius || 0,
            marginHorizontal: isInset ? insetGap : 0,
          }}
          contentContainerClassName={cn(
            'm-0 p-0',
            hasContentSnapPoints ? 'h-full' : 'flex-none'
          )}
        >
          {hasCloseButton && (
            <BottomSheet.Close className="absolute top-0 right-4" />
          )}

          <View
            className={cn(
              'flex flex-1 flex-col gap-4 px-4 pt-0',
              !hasHandle && 'pt-4',
              hasContentSnapPoints ? 'h-full' : 'flex-none',
              classNameContentWrapper
            )}
          >
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
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};

// overlay --------------------

interface BottomSheetOverlayProps {
  blurAmount: number;
  glassFallbackVariant: UiBottomSheetOverlayGlassFallbackVariantT;
  isCloseOnPress: boolean;
  overlayVariant: UiBottomSheetOverlayVariantT;
  className?: string;
}

const BottomSheetOverlay = ({
  blurAmount,
  glassFallbackVariant,
  isCloseOnPress,
  overlayVariant,
  className,
}: BottomSheetOverlayProps) => {
  const { theme } = useUniwind();
  const { isOpen, onOpenChange } = useBottomSheet();
  const [isOverlayMounted, setIsOverlayMounted] = useState(isOpen);
  const resolvedOverlayVariant =
    overlayVariant === UiBottomSheetOverlayVariantE.Glass &&
    !getIsGlassEffectAvailable()
      ? glassFallbackVariant
      : overlayVariant;
  const isBlurOverlay =
    resolvedOverlayVariant === UiBottomSheetOverlayVariantE.Blur;
  const isDefaultOverlay =
    resolvedOverlayVariant === UiBottomSheetOverlayVariantE.Default;
  const isGlassOverlay =
    resolvedOverlayVariant === UiBottomSheetOverlayVariantE.Glass;
  const overlayProgress = useDerivedValue<number>(() => {
    return withTiming(isOpen ? 1 : 0, {
      duration: isOpen ? 200 : 150,
    });
  }, [isOpen]);
  const blurIntensity = useDerivedValue<number>(() => {
    return isBlurOverlay ? overlayProgress.get() * blurAmount : 0;
  }, [blurAmount, isBlurOverlay]);
  const defaultOverlayStyle = useAnimatedStyle(
    () => ({
      opacity: isDefaultOverlay ? overlayProgress.get() : 0,
    }),
    [isDefaultOverlay]
  );

  useEffect(() => {
    if (isOpen) {
      setIsOverlayMounted(true);
    }
  }, [isOpen]);

  useAnimatedReaction(
    () => overlayProgress.get(),
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

  if (resolvedOverlayVariant === UiBottomSheetOverlayVariantE.None) {
    return null;
  }

  return (
    <Pressable
      className={cn(
        'absolute inset-0',
        resolvedOverlayVariant === UiBottomSheetOverlayVariantE.Transparent &&
          'bg-transparent',
        (isBlurOverlay || isDefaultOverlay || isGlassOverlay) &&
          'bg-transparent',
        className
      )}
      pointerEvents={isOpen ? 'auto' : 'none'}
      onPress={() => {
        if (isCloseOnPress) {
          onOpenChange(false);
        }
      }}
    >
      {isDefaultOverlay && (
        <Animated.View
          className="absolute inset-0 bg-backdrop"
          pointerEvents="none"
          style={defaultOverlayStyle}
        />
      )}
      {isBlurOverlay && (
        <AnimatedBlurView
          blurIntensity={blurIntensity}
          className="absolute inset-0"
          pointerEvents="none"
          tint={theme === 'light' ? 'dark' : 'light'}
        />
      )}
      {isGlassOverlay && (
        <GlassView
          className="absolute inset-0 bg-transparent"
          colorScheme="auto"
          glassEffectStyle={{
            animate: true,
            animationDuration: isOpen ? 0.2 : 0.15,
            style: isOpen ? 'regular' : 'none',
          }}
          pointerEvents="none"
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

  return (
    <RBlurView
      animatedProps={animatedProps}
      blurMethod="dimezisBlurView"
      {...props}
    />
  );
};

interface BottomSheetVisualBackgroundProps extends BottomSheetBackgroundProps {
  blurAmount: number;
}

interface BottomSheetGlassBackgroundProps
  extends BottomSheetVisualBackgroundProps {
  fallbackVariant: UiBottomSheetBackgroundGlassFallbackVariantT;
}

const BottomSheetDefaultBackground = ({
  animatedIndex,
  pointerEvents,
  style,
}: BottomSheetBackgroundProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.get(),
      [-1, 0],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View
      accessibilityLabel="Bottom Sheet"
      accessibilityRole="adjustable"
      accessible={true}
      pointerEvents={pointerEvents}
      style={style}
    >
      <Animated.View
        className={cn('absolute inset-0 bg-overlay')}
        style={animatedStyle}
      />
    </View>
  );
};

const BottomSheetBlurBackground = ({
  blurAmount,
  pointerEvents,
  style,
}: BottomSheetVisualBackgroundProps) => {
  return (
    <View
      className="overflow-hidden bg-transparent"
      pointerEvents={pointerEvents}
      style={style}
    >
      <BlurView
        blurMethod="dimezisBlurView"
        className="absolute inset-0 bg-transparent"
        intensity={blurAmount}
        tint="systemMaterial"
      />
    </View>
  );
};

const BottomSheetGlassBackground = (props: BottomSheetGlassBackgroundProps) => {
  if (!getIsGlassEffectAvailable()) {
    return <BottomSheetGlassBackgroundFallback {...props} />;
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

const BottomSheetGlassBackgroundFallback = ({
  fallbackVariant,
  ...props
}: BottomSheetGlassBackgroundProps) => {
  switch (fallbackVariant) {
    case UiBottomSheetBackgroundVariantE.Transparent:
      return null;
    case UiBottomSheetBackgroundVariantE.Blur:
      return <BottomSheetBlurBackground {...props} />;
    case UiBottomSheetBackgroundVariantE.Default:
      return <BottomSheetDefaultBackground {...props} />;
  }
};

// utils --------------------

const getIsGlassEffectAvailable = () => {
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
  backgroundBlurAmount: number,
  backgroundGlassFallbackVariant: UiBottomSheetBackgroundGlassFallbackVariantT
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
          fallbackVariant={backgroundGlassFallbackVariant}
        />
      );
    case UiBottomSheetBackgroundVariantE.Default:
      return BottomSheetDefaultBackground;
  }
};
