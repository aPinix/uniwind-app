import { BlurTargetView } from 'expo-blur';
import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useRef,
} from 'react';
import { StyleSheet, type View } from 'react-native';

const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

interface BlurViewProviderProps {
  children: ReactNode;
}

export const BlurViewProvider = ({ children }: BlurViewProviderProps) => {
  const blurTarget = useRef<View | null>(null);

  return (
    <BlurTargetContext.Provider value={blurTarget}>
      <BlurTargetView ref={blurTarget} style={styles.blurTarget}>
        {children}
      </BlurTargetView>
    </BlurTargetContext.Provider>
  );
};

export const useBlurTarget = () => {
  const blurTarget = useContext(BlurTargetContext);

  if (!blurTarget) {
    throw new Error('useBlurTarget must be used within a BlurViewProvider.');
  }

  return blurTarget;
};

const styles = StyleSheet.create({
  blurTarget: {
    flex: 1,
  },
});
