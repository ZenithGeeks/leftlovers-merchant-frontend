// app/(auth)/forgotPassword.tsx
import BackButton from "@/components/Authen/BackButton";
import { ClickButton } from "@/components/Authen/ClickButton";
import { InputBox } from "@/components/Authen/InputBox";
import { auth } from "@/lib/firebase";
import { Stack, useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim().toLowerCase());

  const onSendReset = useCallback(async () => {
    if (!isValidEmail(email)) {
      return Alert.alert("Invalid email", "Please enter a valid email address.");
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());

      Alert.alert(
        "Reset email sent",
        "Please check your email and follow the instructions to reset your password.",
        [
          {
            text: "Back to sign in",
            onPress: () => router.replace("/(auth)/signin"),
          },
        ]
      );
    } catch (e: any) {
      console.error("Reset password error:", e);

      const msg =
        e?.code === "auth/user-not-found"
          ? "No account found with this email."
          : "Failed to send reset email. Please try again.";

      Alert.alert("Reset failed", msg);
    } finally {
      setLoading(false);
    }
  }, [email, router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 28 }}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton style={{ marginBottom: 12 }} />

          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Text style={{ fontSize: 24, fontFamily: "Poppins_700Bold" }}>
              Forgot password
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 13,
                textAlign: "center",
                color: "#6B7280",
                fontFamily: "Poppins_400Regular",
              }}
            >
              Enter your email and we’ll send you a reset link.
            </Text>
          </View>

          <InputBox
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <View style={{ marginTop: 24 }}>
            <ClickButton
              label={loading ? "Sending…" : "Send reset email"}
              onPress={onSendReset}
              loading={loading}
              disabled={loading || !email.trim()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
