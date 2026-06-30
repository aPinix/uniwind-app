import { Button } from 'heroui-native/button';

interface UiButtonProps {
  children: React.ReactNode;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  onPress: () => void;
}

export const UiButton = ({
  children,
  iconStart,
  iconEnd,
  onPress,
}: UiButtonProps) => {
  return (
    <Button onPress={onPress}>
      {iconStart}
      <Button.Label>{children}</Button.Label>
      {iconEnd}
    </Button>
  );
};
