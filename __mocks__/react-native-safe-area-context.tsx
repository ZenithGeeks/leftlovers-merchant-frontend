// __mocks__/react-native-safe-area-context.tsx
import React from "react";

export const SafeAreaProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
SafeAreaProvider.displayName = "SafeAreaProvider";

export const SafeAreaView = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
SafeAreaView.displayName = "SafeAreaView";

export const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
