import { BlurView, type BlurViewProps } from 'expo-blur';
import {
  type GlassColorScheme,
  GlassView,
  type GlassViewProps,
  isGlassEffectAPIAvailable,
} from 'expo-glass-effect';
import { forwardRef, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';
import Animated, {
  type DerivedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { useUniwind } from 'uniwind';
import { cn } from '@/lib/utils';

const defaultAndroidBlurMethod: BlurViewProps['blurMethod'] =
  'dimezisBlurViewSdk31Plus';

export const ThemeViewVariantE = {
  Default: 'default',
  Transparent: 'transparent',
  Tint: 'tint',
  Blur: 'blur',
  Glass: 'glass',
  None: 'none',
} as const;

export type ThemeViewVariantT =
  (typeof ThemeViewVariantE)[keyof typeof ThemeViewVariantE];
export type ThemeViewGlassColorScheme = GlassColorScheme;
export type ThemeViewBlurTarget = BlurViewProps['blurTarget'];

type ThemeViewGlassFallbackVariantT = Exclude<
  ThemeViewVariantT,
  typeof ThemeViewVariantE.Glass
>;

export interface ThemeViewProps extends ViewProps {
  children?: ReactNode;
  variant?: ThemeViewVariantT;

  blurAmount?: number;
  animatedBlurIntensity?: DerivedValue<number>;
  blurMethod?: BlurViewProps['blurMethod'];
  blurReductionFactor?: BlurViewProps['blurReductionFactor'];
  blurTarget?: BlurViewProps['blurTarget'];
  blurTint?: BlurViewProps['tint'];

  glassBlurAmount?: number;
  glassColorScheme?: GlassColorScheme;
  glassEffectStyle?: GlassViewProps['glassEffectStyle'];
  glassFallbackVariant?: ThemeViewGlassFallbackVariantT;
  glassIsInteractive?: boolean;
  glassTintAmount?: number;
  glassTintColor?: string;

  tintAmount?: number;
  tintColor?: string;
  tintDarkRgb?: string;
  tintLightRgb?: string;
}

export const ThemeView = forwardRef<View, ThemeViewProps>(
  (
    {
      animatedBlurIntensity,
      blurAmount = 50,
      blurMethod = defaultAndroidBlurMethod,
      blurReductionFactor,
      blurTarget,
      blurTint = 'systemMaterial',
      children,
      className,
      glassBlurAmount = 0,
      glassColorScheme = 'auto',
      glassEffectStyle = 'regular',
      glassFallbackVariant = ThemeViewVariantE.Blur,
      glassIsInteractive = false,
      glassTintAmount = 0,
      glassTintColor,
      tintAmount = 12,
      tintColor,
      tintDarkRgb = '0, 0, 0',
      tintLightRgb = '255, 255, 255',
      variant = ThemeViewVariantE.Transparent,
      ...props
    },
    ref
  ) => {
    const { theme } = useUniwind();
    const resolvedVariant =
      variant === ThemeViewVariantE.Glass && !getIsThemeViewGlassAvailable()
        ? glassFallbackVariant
        : variant;
    const tintLayerColor =
      tintColor ??
      getThemeViewTintColor({
        amount: tintAmount,
        darkRgb: tintDarkRgb,
        lightRgb: tintLightRgb,
        theme,
      });
    const glassTintLayerColor =
      glassTintColor ??
      getThemeViewTintColor({
        amount: glassTintAmount,
        darkRgb: '0, 0, 0',
        lightRgb: '255, 255, 255',
        theme,
      });
    const resolvedBlurAmount =
      variant === ThemeViewVariantE.Glass &&
      resolvedVariant === ThemeViewVariantE.Blur
        ? glassBlurAmount
        : blurAmount;

    if (resolvedVariant === ThemeViewVariantE.None) {
      return null;
    }

    if (
      resolvedVariant === ThemeViewVariantE.Default ||
      resolvedVariant === ThemeViewVariantE.Transparent
    ) {
      return (
        <View className={className} ref={ref} {...props}>
          {children}
        </View>
      );
    }

    if (resolvedVariant === ThemeViewVariantE.Tint) {
      return (
        <View
          className={cn('overflow-hidden bg-transparent', className)}
          ref={ref}
          {...props}
        >
          {tintLayerColor && (
            <View
              className="absolute inset-0"
              pointerEvents="none"
              style={{ backgroundColor: tintLayerColor }}
            />
          )}
          {children}
        </View>
      );
    }

    if (resolvedVariant === ThemeViewVariantE.Blur) {
      return (
        <View
          className={cn('overflow-hidden bg-transparent', className)}
          ref={ref}
          {...props}
        >
          <ThemeBlurLayer
            amount={resolvedBlurAmount}
            animatedIntensity={animatedBlurIntensity}
            blurMethod={blurMethod}
            blurReductionFactor={blurReductionFactor}
            blurTarget={blurTarget}
            className="absolute inset-0 bg-transparent"
            pointerEvents="none"
            tint={blurTint}
          />
          {children}
        </View>
      );
    }

    return (
      <View
        className={cn('overflow-hidden bg-transparent', className)}
        ref={ref}
        {...props}
      >
        {glassBlurAmount > 0 && (
          <ThemeBlurLayer
            amount={glassBlurAmount}
            blurMethod={blurMethod}
            blurReductionFactor={blurReductionFactor}
            blurTarget={blurTarget}
            className="absolute inset-0 bg-transparent"
            pointerEvents="none"
            tint={blurTint}
          />
        )}
        {glassTintLayerColor && (
          <View
            className="absolute inset-0"
            pointerEvents="none"
            style={{ backgroundColor: glassTintLayerColor }}
          />
        )}
        <GlassView
          className="absolute inset-0 bg-transparent"
          colorScheme={glassColorScheme}
          glassEffectStyle={glassEffectStyle}
          isInteractive={glassIsInteractive}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }
);

ThemeView.displayName = 'ThemeView';

export const getIsThemeViewGlassAvailable = () => {
  try {
    return Platform.OS === 'ios' && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
};

export const getThemeViewBoundedAmount = (amount: number) => {
  return Number.isFinite(amount) ? Math.min(Math.max(amount, 0), 100) : 0;
};

export const getThemeViewAlphaColor = (rgb: string, amount: number) => {
  return `rgba(${rgb}, ${getThemeViewBoundedAmount(amount) / 100})`;
};

const getThemeViewTintColor = ({
  amount,
  darkRgb,
  lightRgb,
  theme,
}: {
  amount: number;
  darkRgb: string;
  lightRgb: string;
  theme: string;
}) => {
  if (getThemeViewBoundedAmount(amount) <= 0) {
    return undefined;
  }

  return getThemeViewAlphaColor(theme === 'light' ? lightRgb : darkRgb, amount);
};

const RBlurView = Animated.createAnimatedComponent(BlurView);

interface ThemeBlurLayerProps
  extends Omit<BlurViewProps, 'children' | 'intensity'> {
  amount: number;
  animatedIntensity?: DerivedValue<number>;
}

const ThemeBlurLayer = ({
  amount,
  animatedIntensity,
  blurMethod,
  ...props
}: ThemeBlurLayerProps) => {
  if (animatedIntensity) {
    return (
      <ThemeAnimatedBlurLayer
        {...props}
        animatedIntensity={animatedIntensity}
        blurMethod={blurMethod}
        initialAmount={amount}
      />
    );
  }

  return (
    <BlurView
      {...props}
      blurMethod={blurMethod}
      intensity={getThemeViewBoundedAmount(amount)}
    />
  );
};

interface ThemeAnimatedBlurLayerProps
  extends Omit<BlurViewProps, 'children' | 'intensity'> {
  animatedIntensity: DerivedValue<number>;
  initialAmount: number;
}

const ThemeAnimatedBlurLayer = ({
  animatedIntensity,
  initialAmount,
  ...props
}: ThemeAnimatedBlurLayerProps) => {
  const animatedProps = useAnimatedProps<BlurViewProps>(() => ({
    intensity: getThemeViewBoundedAmount(animatedIntensity.get()),
  }));

  return (
    <RBlurView
      {...props}
      animatedProps={animatedProps}
      intensity={getThemeViewBoundedAmount(initialAmount)}
    />
  );
};
