// jest.setup.ts

// IMPORTANT: use doMock (not mock) to avoid hoist + css-interop injected vars crash
jest.doMock("react-native-safe-area-context", () => {
  const SafeAreaProvider = ({ children }: any) => children ?? null;
  const SafeAreaView = ({ children }: any) => children ?? null;

  // some libs read displayName
  (SafeAreaProvider as any).displayName = "SafeAreaProvider";
  (SafeAreaView as any).displayName = "SafeAreaView";

  return {
    SafeAreaProvider,
    SafeAreaView,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, bottom: 0, left: 0, right: 0 },
    },
  };
});

// Avoid vector-icons native/font issues in Jest
jest.doMock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));
