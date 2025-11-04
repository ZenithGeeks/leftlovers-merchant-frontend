// app/(auth)/notifyPage.tsx
import { setStep } from "@/src/lib/onboarding";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FinishSignUp() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const [submitting, setSubmitting] = React.useState(false);

  const onDone = React.useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Persist the “waiting for approval” step and refresh local user
      if (user) {
        await setStep(user, "notifyPage");
        await user.reload();
      }
      // Sign out to avoid layout redirecting you back to notify page
      await signOut();

      // Go to Sign In
      router.replace("/(auth)/signin");
    } catch (e) {
      console.warn("FinishSignUp onDone error:", e);
      // Fallback: still try to go to Sign In
      router.replace("/(auth)/signin");
    } finally {
      setSubmitting(false);
    }
  }, [submitting, user, signOut, router]);

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
            width: 44,
            height: 44,
            borderRadius: 22,
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
            <Text style={{ color: "#fff", fontSize: 24 }}>✓</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}