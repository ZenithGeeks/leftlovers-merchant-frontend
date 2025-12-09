import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/providers/AuthProvider";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { LogBox } from "react-native";
import "react-native-reanimated";
import './globals.css';
if (__DEV__) {
  LogBox.ignoreLogs([
    "Open debugger to view warnings.",
    "SafeAreaView has been deprecated",
  ]);
}
try { SplashScreen.preventAutoHideAsync(); } catch {}

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const clerkPublishableKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!clerkPublishableKey) {
    console.error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
    // Render nothing or a fallback UI to avoid crashing during development
    return null;
  }

  if (!fontsLoaded) return null;

  return (
    
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(pages)" />
          <Stack.Screen name="(auth)" />
        </Stack>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </AuthProvider>
  );
}