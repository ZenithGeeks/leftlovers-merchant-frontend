// app/(auth)/notifyPage.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "@/lib/firebase";
import { signOut, type User as FirebaseUser } from "firebase/auth";

import { setStep, type OnboardingStep } from "@/src/lib/onboarding";

// Store step per Firebase UID (local MVP)
const stepKey = (uid: string) => `onboarding:step:${uid}`;

async function saveOnboardingStep(uid: string, step: OnboardingStep) {
  await AsyncStorage.setItem(stepKey(uid), step);
}

export default function NotifyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const onDone = React.useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const user = auth.currentUser as FirebaseUser | null;

      // ✅ Persist the “waiting for approval” step
      if (user) {
        await setStep(user, "notifyPage", saveOnboardingStep);
      }

      // ✅ Sign out to avoid redirect loops
      await signOut(auth);

      // ✅ Go to Sign In
      router.replace("/(auth)/signin");
    } catch (e) {
      console.warn("notifyPage onDone error:", e);
      router.replace("/(auth)/signin");
    } finally {
      setSubmitting(false);
    }
  }, [submitting, router]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* App Name */}
      <Text
        style={{
          fontSize: 40,
          fontFamily: "Poppins_700Bold",
          color: "#2EA44F",
          textShadowColor: "rgba(0,0,0,0.15)",
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
          letterSpacing: 0,
        }}
      >
        leftlovers
      </Text>

      {/* Logo */}
      <Image
        source={require("@/assets/images/logo.jpg")}
        style={{
          width: 350,
          height: 350,
          resizeMode: "contain",
          marginVertical: -35,
          zIndex: -1,
        }}
      />

      {/* Subtitle */}
      <Text
        style={{
          fontSize: 40,
          fontFamily: "Poppins_700Bold",
          color: "#2EA44F",
          textShadowColor: "rgba(0,0,0,0.15)",
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
          marginBottom: 28,
        }}
      >
        Merchant
      </Text>

      {/* Notification box */}
      <View
        style={{
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 14,
          padding: 20,
          backgroundColor: "#fff",
          width: "100%",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontFamily: "Poppins_600SemiBold",
            color: "#111827",
            marginBottom: 6,
          }}
        >
          We’ve received your details!
        </Text>
        <Text
          style={{
            color: "#4B5563",
            fontSize: 14,
            fontFamily: "Poppins_400Regular",
            lineHeight: 20,
          }}
        >
          Please wait while we review your application. You’ll get a notification
          once it’s approved.
        </Text>

        <TouchableOpacity
          onPress={onDone}
          activeOpacity={0.7}
          disabled={submitting}
          style={{
            alignSelf: "center",
            marginTop: 20,
            width: 300,
            height: 35,
            borderRadius: 20,
            backgroundColor: submitting ? "#9CA3AF" : "#2EA44F",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 15, fontWeight:600 }}>Finish</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
