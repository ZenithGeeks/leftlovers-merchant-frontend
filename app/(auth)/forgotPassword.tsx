// app/(authen)/forgot-password.tsx
import BackButton from "@/components/Authen/BackButton";
import { ClickButton } from "@/components/Authen/ClickButton";
import { InputBox } from "@/components/Authen/InputBox";
import { PasswordInput } from "@/components/Authen/PasswordInput";
import { useAuth, useSignIn } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  const { isSignedIn } = useAuth();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  useEffect(() => {
    if (isSignedIn) router.replace("/(landing)/Check_can_login");
  }, [isSignedIn, router]);

  const errMsg = (e: any) =>
    e?.errors?.[0]?.longMessage || e?.errors?.[0]?.message || e?.message || "Unknown error";

  /** Step 1: Request verification code */
  const onSendCode = useCallback(async () => {
    if (!signInLoaded) return Alert.alert("Please wait", "Auth not ready yet.");
    if (!email.trim()) return Alert.alert("Missing email", "Enter your email.");
    if (!passwordValid) return Alert.alert("Weak password", "Password does not meet requirements.");
    if (confirm !== password) return Alert.alert("Passwords do not match.");

    setLoading(true);
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setSent(true);
      Alert.alert("Verification code sent", "Check your email for the OTP code.");
    } catch (e: any) {
      Alert.alert("Couldn't send code", errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [signInLoaded, signIn, email, passwordValid, confirm, password]);

  /** Step 2: Verify + Reset password */
  const onReset = useCallback(async () => {
    if (!signInLoaded) return Alert.alert("Please wait", "Auth not ready yet.");
    if (!code.trim()) return Alert.alert("Missing code", "Enter the code we emailed.");
    if (!passwordValid) return Alert.alert("Weak password");
    if (confirm !== password) return Alert.alert("Passwords do not match");

    setLoading(true);
    try {
      const res = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password,
      });

      if (res?.status === "complete" && res.createdSessionId) {
        await setActive({ session: res.createdSessionId });
        Alert.alert("Password updated", "You are now signed in.");
        router.replace("/(auth)/signin");
        return;
      }
      Alert.alert("Almost there", "Please complete the remaining steps.");
    } catch (e: any) {
      Alert.alert("Reset failed", errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [signInLoaded, signIn, code, password, passwordValid, confirm, setActive, router]);

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
          {/* Back */}
          <BackButton style={{ marginTop: -10, marginBottom: 6, left: -15 }} />

          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 6 }}>
            <Text style={{ fontSize: 24, fontFamily: "Poppins_700Bold" }}>
              Reset your password
            </Text>
            <Text
              style={{
                marginTop: 15,
                fontSize: 12,
                fontFamily: "Poppins_200ExtraLight",
                textAlign: "center",
              }}
            >
              Reset your password in a few easy steps
            </Text>
          </View>

          {/* Step 1: Request code */}
          {!sent ? (
            <>
              <InputBox
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              {/* PasswordInput with rules UI hidden, still validates silently */}
              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                value={password}
                onChangeText={setPassword}
                onValidityChange={setPasswordValid}
                rulesVisible={false}
                disabled={loading}
              />

              {/* Independent confirm field (manual typing only) */}
              <View>
                <InputBox
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
                {confirm.length > 0 && (
                  <Text
                    style={{
                      fontSize: 12,
                      marginTop: 4,
                      color: confirm === password ? "#059669" : "#B91C1C",
                      fontFamily: "Poppins_400Regular",
                    }}
                  >
                    {confirm === password
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </Text>
                )}
              </View>

              <ClickButton
                label="Send verification code"
                onPress={onSendCode}
                loading={loading}
                disabled={!email.trim() || !passwordValid || confirm !== password || loading}
                style={{ marginTop: 24 }}
              />
            </>
          ) : (
            /* Step 2: Verify code */
            <>
              <InputBox
                label="Verification Code"
                placeholder="Enter the 6-digit code"
                value={code}
                onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                editable={!loading}
              />

              <ClickButton
                label="Verify & Reset Password"
                onPress={onReset}
                loading={loading}
                disabled={!code.trim() || !passwordValid || loading}
                style={{ marginTop: 24 }}
              />

              <Text
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#6B7280",
                  fontFamily: "Poppins_300Light",
                  textAlign: "center",
                }}
              >
                We’ve sent a 6-digit code to your email. Enter it here to confirm.
              </Text>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
