import type {
  BottomSheetBackgroundProps,
  BottomSheetProps,
} from '@gorhom/bottom-sheet';
import { BlurView, type BlurViewProps } from 'expo-blur';
import {
  type GlassColorScheme,
  GlassView,
  isGlassEffectAPIAvailable,
} from 'expo-glass-effect';
import { BottomSheet, useBottomSheet } from 'heroui-native/bottom-sheet';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
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
import { useBlurTarget } from '@/components/ui/blur-view-provider';
import { cn } from '@/lib/utils';

const bottomSheetContentBorderRadius = 40;
const insetGap = 8;
const androidBlurMethod: BlurViewProps['blurMethod'] =
  'dimezisBlurViewSdk31Plus';
const NoBottomSheetBackdrop: NonNullable<
  BottomSheetProps['backdropComponent']
> = () => null;

type UiBottomSheetSnapPoint = string | number;
type UiBottomSheetSnapPoints =
  | Array<UiBottomSheetSnapPoint>
  | SharedValue<Array<UiBottomSheetSnapPoint>>;

export const UiBottomSheetBackgroundVariantE = {
  Default: 'default',
  Transparent: 'transparent',
  Blur: 'blur',
  Glass: 'glass',
  None: 'none',
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
  Tint: 'tint',
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
  backgroundGlassBlurAmount?: number;
  backgroundGlassColorScheme?: GlassColorScheme | undefined;
  backgroundGlassFallbackVariant?: UiBottomSheetBackgroundGlassFallbackVariantT;
  backgroundGlassTintAmount?: number;

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
  backgroundGlassBlurAmount = 10,
  backgroundGlassColorScheme = 'auto',
  backgroundGlassFallbackVariant = UiBottomSheetBackgroundVariantE.Blur,
  backgroundGlassTintAmount = 10,

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
  const blurTarget = useBlurTarget();
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
        backgroundGlassBlurAmount,
        backgroundGlassColorScheme,
        backgroundGlassFallbackVariant,
        backgroundGlassTintAmount,
        blurTarget
      ),
    [
      backgroundBlurAmount,
      backgroundGlassBlurAmount,
      backgroundGlassColorScheme,
      backgroundGlassFallbackVariant,
      backgroundGlassTintAmount,
      backgroundVariant,
      blurTarget,
    ]
  );
  const backgroundClassName =
    getBottomSheetBackgroundClassName(backgroundVariant);
  const resolvedOverlayVariant = getResolvedOverlayVariant(
    overlayVariant,
    overlayGlassFallbackVariant
  );
  const hasOverlay =
    resolvedOverlayVariant !== UiBottomSheetOverlayVariantE.None;
  const backdropComponent = hasOverlay ? undefined : NoBottomSheetBackdrop;

  return (
    <BottomSheet
      isDefaultOpen={isDefaultOpen}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      {trigger && <BottomSheet.Trigger asChild>{trigger}</BottomSheet.Trigger>}
      <BottomSheet.Portal>
        {hasOverlay && (
          <BottomSheetOverlay
            blurAmount={overlayBlurAmount}
            blurTarget={blurTarget}
            className={overlayClassName}
            isCloseOnPress={overlayClosePress}
            overlayVariant={resolvedOverlayVariant}
          />
        )}
        <BottomSheet.Content
          backdropComponent={backdropComponent}
          backgroundClassName={cn('', backgroundClassName)}
          backgroundComponent={backgroundComponent}
          bottomInset={isInset ? insetGap : 0}
          className={cn('overflow-hidden', className)}
          contentContainerClassName={cn(
            'm-0 p-0',
            hasContentSnapPoints ? 'h-full' : 'flex-none'
          )}
          detached={isInset}
          enableDynamicSizing={!hasContentSnapPoints}
          enableOverDrag={enableOverDrag}
          enablePanDownToClose={enablePanDownToClose}
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
          snapPoints={hasContentSnapPoints ? contentSnapPoints : undefined}
          style={{
            borderTopLeftRadius: borderRadiusTop,
            borderTopRightRadius: borderRadiusTop,
            borderBottomLeftRadius:
              borderRadiusBottom || deviceBorderRadius || 0,
            borderBottomRightRadius:
              borderRadiusBottom || deviceBorderRadius || 0,
            marginHorizontal: isInset ? insetGap : 0,
          }}
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
  blurTarget: BlurViewProps['blurTarget'];
  isCloseOnPress: boolean;
  overlayVariant: UiBottomSheetOverlayVariantT;
  className?: string;
}

const BottomSheetOverlay = ({
  blurAmount,
  blurTarget,
  isCloseOnPress,
  overlayVariant,
  className,
}: BottomSheetOverlayProps) => {
  const { theme } = useUniwind();
  const { isOpen, onOpenChange } = useBottomSheet();
  const [isOverlayMounted, setIsOverlayMounted] = useState(isOpen);
  const isTintOverlay = overlayVariant === UiBottomSheetOverlayVariantE.Tint;
  const isBlurOverlay = overlayVariant === UiBottomSheetOverlayVariantE.Blur;
  const isDefaultOverlay =
    overlayVariant === UiBottomSheetOverlayVariantE.Default;
  const isGlassOverlay = overlayVariant === UiBottomSheetOverlayVariantE.Glass;
  const overlayTintColor = getOverlayTintColor(theme, blurAmount);
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
  const tintOverlayStyle = useAnimatedStyle(
    () => ({
      backgroundColor: overlayTintColor,
      opacity: isTintOverlay ? overlayProgress.get() : 0,
    }),
    [isTintOverlay, overlayTintColor]
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

  if (overlayVariant === UiBottomSheetOverlayVariantE.None) {
    return null;
  }

  return (
    <Pressable
      className={cn(
        'absolute inset-0',
        overlayVariant === UiBottomSheetOverlayVariantE.Transparent &&
          'bg-transparent',
        (isTintOverlay ||
          isBlurOverlay ||
          isDefaultOverlay ||
          isGlassOverlay) &&
          'bg-transparent',
        className
      )}
      onPress={() => {
        if (isCloseOnPress) {
          onOpenChange(false);
        }
      }}
      pointerEvents={isOpen ? 'auto' : 'none'}
    >
      {isDefaultOverlay && (
        <Animated.View
          className="absolute inset-0 bg-backdrop"
          pointerEvents="none"
          style={defaultOverlayStyle}
        />
      )}
      {isTintOverlay && (
        <Animated.View
          className="absolute inset-0"
          pointerEvents="none"
          style={tintOverlayStyle}
        />
      )}
      {isBlurOverlay && (
        <AnimatedBlurView
          blurIntensity={blurIntensity}
          blurTarget={blurTarget}
          className="absolute inset-0"
          pointerEvents="none"
          tint={'dark'}
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
          style={StyleSheet.absoluteFill}
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
      {...props}
      blurMethod={androidBlurMethod}
    />
  );
};

interface BottomSheetVisualBackgroundProps extends BottomSheetBackgroundProps {
  blurAmount: number;
  blurTarget: BlurViewProps['blurTarget'];
}

interface BottomSheetGlassBackgroundProps
  extends Omit<BottomSheetVisualBackgroundProps, 'blurAmount'> {
  fallbackVariant: UiBottomSheetBackgroundGlassFallbackVariantT;
  glassBlurAmount: number;
  glassColorScheme: GlassColorScheme;
  glassTintAmount: number;
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
  blurTarget,
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
        blurMethod={androidBlurMethod}
        blurTarget={blurTarget}
        className="absolute inset-0 bg-transparent"
        intensity={blurAmount}
        tint="systemMaterial"
      />
    </View>
  );
};

const BottomSheetGlassBackground = (props: BottomSheetGlassBackgroundProps) => {
  const { theme } = useUniwind();

  if (!getIsGlassEffectAvailable()) {
    return <BottomSheetGlassBackgroundFallback {...props} />;
  }

  const { blurTarget, glassBlurAmount, glassColorScheme, glassTintAmount } =
    props;
  const { pointerEvents, style } = props;
  const tintColor = getGlassTintColor(theme, glassTintAmount);

  return (
    <View
      className="overflow-hidden rounded-t-[32px] bg-transparent shadow-overlay"
      pointerEvents={pointerEvents}
      style={style}
    >
      {glassBlurAmount > 0 && (
        <BlurView
          blurMethod={androidBlurMethod}
          blurTarget={blurTarget}
          className="absolute inset-0 bg-transparent"
          intensity={getBoundedAmount(glassBlurAmount)}
          tint="systemMaterial"
        />
      )}
      {tintColor && (
        <View
          className="absolute inset-0"
          pointerEvents="none"
          style={{ backgroundColor: tintColor }}
        />
      )}
      <GlassView
        className="absolute inset-0 bg-transparent"
        colorScheme={glassColorScheme}
        glassEffectStyle="clear"
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

const BottomSheetGlassBackgroundFallback = ({
  fallbackVariant,
  glassBlurAmount,
  glassColorScheme,
  glassTintAmount,
  ...props
}: BottomSheetGlassBackgroundProps) => {
  void glassColorScheme;
  void glassTintAmount;

  switch (fallbackVariant) {
    case UiBottomSheetBackgroundVariantE.None:
    case UiBottomSheetBackgroundVariantE.Transparent:
      return null;
    case UiBottomSheetBackgroundVariantE.Blur:
      return (
        <BottomSheetBlurBackground {...props} blurAmount={glassBlurAmount} />
      );
    case UiBottomSheetBackgroundVariantE.Default:
      return <BottomSheetDefaultBackground {...props} />;
  }
};

// utils --------------------

const getIsGlassEffectAvailable = () => {
  try {
    return Platform.OS === 'ios' && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
};

const getResolvedOverlayVariant = (
  overlayVariant: UiBottomSheetOverlayVariantT,
  glassFallbackVariant: UiBottomSheetOverlayGlassFallbackVariantT
) => {
  if (isOverlayGlassVariant(overlayVariant) && !getIsGlassEffectAvailable()) {
    return glassFallbackVariant;
  }

  return overlayVariant;
};

const isOverlayGlassVariant = (
  overlayVariant: UiBottomSheetOverlayVariantT
) => {
  return overlayVariant === UiBottomSheetOverlayVariantE.Glass;
};

const getBoundedAmount = (amount: number) => {
  return Number.isFinite(amount) ? Math.min(Math.max(amount, 0), 100) : 0;
};

const getOverlayTintColor = (theme: string, amount: number) => {
  const normalizedAmount = getBoundedAmount(amount) / 100;
  const alpha = normalizedAmount * 1;
  const color = theme === 'light' ? '0, 0, 0' : '0, 0, 0';

  return `rgba(${color}, ${alpha})`;
};

const getGlassTintColor = (theme: string, amount: number) => {
  const alpha = getBoundedAmount(amount) / 100;
  if (alpha <= 0) return undefined;

  const color = theme === 'light' ? '255, 255, 255' : '0, 0, 0';
  return `rgba(${color}, ${alpha})`;
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

const getBottomSheetBackgroundClassName = (
  backgroundVariant: UiBottomSheetBackgroundVariantT
) => {
  switch (backgroundVariant) {
    case UiBottomSheetBackgroundVariantE.None:
    case UiBottomSheetBackgroundVariantE.Default:
      return undefined;
    case UiBottomSheetBackgroundVariantE.Transparent:
    case UiBottomSheetBackgroundVariantE.Blur:
    case UiBottomSheetBackgroundVariantE.Glass:
      return cn('bg-transparent shadow-overlay');
  }
};

const getBottomSheetBackgroundComponent = (
  backgroundVariant: UiBottomSheetBackgroundVariantT,
  backgroundBlurAmount: number,
  backgroundGlassBlurAmount: number,
  backgroundGlassColorScheme: GlassColorScheme,
  backgroundGlassFallbackVariant: UiBottomSheetBackgroundGlassFallbackVariantT,
  backgroundGlassTintAmount: number,
  blurTarget: BlurViewProps['blurTarget']
) => {
  switch (backgroundVariant) {
    case UiBottomSheetBackgroundVariantE.None:
    case UiBottomSheetBackgroundVariantE.Transparent:
      return null;
    case UiBottomSheetBackgroundVariantE.Blur:
      return (props: BottomSheetBackgroundProps) => (
        <BottomSheetBlurBackground
          {...props}
          blurAmount={backgroundBlurAmount}
          blurTarget={blurTarget}
        />
      );
    case UiBottomSheetBackgroundVariantE.Glass:
      return (props: BottomSheetBackgroundProps) => (
        <BottomSheetGlassBackground
          {...props}
          blurTarget={blurTarget}
          fallbackVariant={backgroundGlassFallbackVariant}
          glassBlurAmount={backgroundGlassBlurAmount}
          glassColorScheme={backgroundGlassColorScheme}
          glassTintAmount={backgroundGlassTintAmount}
        />
      );
    case UiBottomSheetBackgroundVariantE.Default:
      return BottomSheetDefaultBackground;
  }
};
