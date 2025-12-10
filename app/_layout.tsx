import { useColorScheme } from "@/hooks/use-color-scheme";
import { auth } from "@/lib/firebase";
import { AuthProvider } from "@/providers/AuthProvider";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import React, { useEffect, useState } from "react";
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
export type FirebaseAuthState = {
  user: FirebaseUser | null;
  isLoaded: boolean;
};

export const FirebaseAuthContext = React.createContext<FirebaseAuthState>({
  user: null,
  isLoaded: false,
});
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold,
  });
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoaded(true);
    });
    return unsub;
  }, []);
  
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace("/(landing)");
    }
  }, [user, isLoaded]);
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);
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