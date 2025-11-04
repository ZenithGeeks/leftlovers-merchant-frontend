// app/(authen)/forgot-password.tsx
import BackButton from "@/components/Authen/BackButton";
import { ClickButton } from "@/components/Authen/ClickButton";
import { InputBox } from "@/components/Authen/InputBox";
import { PasswordInput } from "@/components/Authen/PasswordInput";
import { OtpInput } from "@/components/Authen/VerifyBox";
import { useAuth, useSignIn } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BRAND = { green: "#26BD68" };

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds

  useEffect(() => {
    if (isSignedIn) router.replace("/(landing)/Check_can_login");
  }, [isSignedIn, router]);

  // cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const inputsDisabled = useMemo(() => loading || !signInLoaded, [loading, signInLoaded]);

  const errMsg = (e: any) =>
    e?.errors?.[0]?.longMessage || e?.errors?.[0]?.message || e?.message || "Unknown error";

  /** Step 1: Request verification code */
  const onSendCode = useCallback(async () => {
    if (!signInLoaded) return Alert.alert("Please wait", "Auth not ready yet.");
    if (!email.trim()) return Alert.alert("Missing email", "Enter your email.");
    if (password.length < 8)
      return Alert.alert("Weak password", "Password must be at least 8 characters.");
    if (confirm !== password) return Alert.alert("Passwords do not match.");

    setLoading(true);
    try {
      // Ask Clerk to send a reset code to the email
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });

      setPendingVerification(true);
      setCooldown(60);
      Alert.alert("Verification code sent", "Check your email for the OTP code.");
    } catch (e: any) {
      Alert.alert("Couldn't send code", errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [signInLoaded, signIn, email, password, confirm]);

  /** Step 1b: Resend verification code */
  const onResend = useCallback(async () => {
    if (!signInLoaded || cooldown > 0) return;
    if (!email.trim()) return Alert.alert("Missing email", "Enter your email.");
    try {
      // Recreate request to trigger another email code
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setCooldown(60);
      Alert.alert("Code sent", "We’ve sent a new code to your email.");
    } catch (e: any) {
      Alert.alert("Resend failed", errMsg(e));
    }
  }, [signInLoaded, signIn, email, cooldown]);

  /** Step 2: Verify + Reset password */
  const onReset = useCallback(async () => {
    if (!signInLoaded) return Alert.alert("Please wait", "Auth not ready yet.");
    if (!code.trim()) return Alert.alert("Missing code", "Enter the code we emailed.");
    if (password.length < 8)
      return Alert.alert("Weak password", "Password must be at least 8 characters.");
    if (confirm !== password) return Alert.alert("Passwords do not match.");

    setLoading(true);
    try {
      const res = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password,
      });

      if (res?.status === "complete" && res.createdSessionId) {
        await setActive({ session: res.createdSessionId });
        Alert.alert("Password updated", "You can sign in with your new password.");
        router.replace("/(auth)/signin");
        return;
      }
      Alert.alert("Almost there", "Please complete the remaining steps.");
    } catch (e: any) {
      Alert.alert("Reset failed", errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [signInLoaded, signIn, code, password, confirm, setActive, router]);

  // ---------------- Verification UI ----------------
  if (pendingVerification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF", padding: 28 }}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={{ alignItems: "center", marginTop: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontFamily: "Poppins_700Bold", textAlign: "center" }}>
            Enter Verification Code
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: 12,
              textAlign: "center",
              color: "#6B7280",
              fontFamily: "Poppins_400Regular",
            }}
          >
            We sent a 6-digit code to {email.trim().toLowerCase()}
          </Text>
        </View>

        {/* OTP input */}
        <OtpInput value={code} setValue={(t: string) => setCode(t.replace(/\D/g, "").slice(0, 6))} />

        <ClickButton
          label="Verify & Reset Password"
          onPress={onReset}
          loading={loading}
          disabled={
            inputsDisabled ||
            !code.trim() ||
            password.length < 8 ||
            confirm !== password
          }
          style={{ marginTop: 24 }}
        />

        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ fontFamily: "Poppins_400Regular" }}>Didn’t receive code?</Text>
          <TouchableOpacity onPress={onResend} disabled={cooldown > 0 || inputsDisabled}>
            <Text
              style={{
                textDecorationLine: "underline",
                color: cooldown > 0 ? "#9CA3AF" : BRAND.green,
                marginTop: 8,
                fontFamily: "Poppins_400Regular",
              }}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: "center", marginTop: 24 }}>
          <TouchableOpacity
            onPress={() => {
              // go back to step 1 if needed
              setPendingVerification(false);
              setCode("");
            }}
            disabled={inputsDisabled}
          >
            <Text
              style={{
                textDecorationLine: "underline",
                color: BRAND.green,
                fontFamily: "Poppins_400Regular",
                marginTop: -10,
              }}
            >
              Change email or password
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 28, paddingBottom: -10 }}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton style={{ marginTop: -10, marginBottom: 6, left: -15 }} />

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

          <InputBox
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            style={{ marginBottom: -5 }}
          />

          <View style={{ position: "relative" }}>
            <PasswordInput
              label="New Password"
              placeholder="Enter the password"
              value={password}
              onChangeText={setPassword}
              containerTop={20}
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
              autoCorrect={false}
            />
          </View>

          <View>
            <InputBox
              label="Confirm New Password"
              placeholder="Confirm the password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoCapitalize="none"
              textContentType="none"
              importantForAutofill="no"
              autoCorrect={false}
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
                {confirm === password ? "Passwords match" : "Passwords do not match"}
              </Text>
            )}
          </View>

          <ClickButton
            label="Send verification code"
            onPress={onSendCode}
            loading={loading}
            disabled={
              inputsDisabled ||
              !email.trim() ||
              password.length < 8 ||
              confirm !== password
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
