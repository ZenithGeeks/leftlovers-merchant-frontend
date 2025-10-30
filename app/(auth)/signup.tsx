// app/(authen)/signup.tsx
import { useSignUp } from "@clerk/clerk-expo";
import { Link, Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClickButton } from "@/components/Authen/ClickButton";
import { InputBox } from "@/components/Authen/InputBox";
import { PasswordInput } from "@/components/Authen/PasswordInput";
import { OtpInput } from "@/components/Authen/VerifyBox";

const BRAND = { green: "#26BD68", text: "#0B0F10" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();

  // form state
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  // verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds

  const inputsDisabled = useMemo(() => loading || !isLoaded, [loading, isLoaded]);

  // cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const onSignUpPress = useCallback(async () => {
    if (!isLoaded || loading) return;

    const email = emailAddress.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (!password) {
      Alert.alert("Missing password", "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      // 1) Create sign-up
      await signUp.create({ emailAddress: email, password });

      // 2) Send verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // 3) Show code screen
      setPendingVerification(true);
      setCooldown(30);
    } catch (err: any) {
      console.error("SignUp error:", JSON.stringify(err, null, 2));
      Alert.alert(
        "Sign up failed",
        err?.errors?.[0]?.message ?? err?.message ?? "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [emailAddress, password, isLoaded, loading, signUp]);

  const onVerifyPress = useCallback(async () => {
    if (!isLoaded || loading) return;
    if (!code.trim()) {
      Alert.alert("Missing code", "Please enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: code.trim() });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/(home)"); // change to your desired first private page
      } else {
        console.warn("Next step required:", JSON.stringify(attempt, null, 2));
        Alert.alert("Almost there", "Please complete the next step to finish sign-up.");
      }
    } catch (err: any) {
      console.error("Verify error:", JSON.stringify(err, null, 2));
      Alert.alert(
        "Verification failed",
        err?.errors?.[0]?.message ?? err?.message ?? "Please check your code and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [code, isLoaded, loading, setActive, signUp, router]);

  const onResend = useCallback(async () => {
    if (!isLoaded || cooldown > 0) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCooldown(30);
      Alert.alert("Code sent", "We’ve sent a new code to your email.");
    } catch (err: any) {
      console.warn("Resend error:", JSON.stringify(err, null, 2));
      Alert.alert("Resend failed", err?.message ?? "Unable to resend code right now.");
    }
  }, [isLoaded, cooldown, signUp]);

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
            We sent a 6-digit code to {emailAddress.trim().toLowerCase()}
          </Text>
        </View>

        {/* Your OTP component */}
        <OtpInput value={code} setValue={setCode} />

        <ClickButton
          label="Verify"
          onPress={onVerifyPress}
          loading={loading}
          style={{ marginTop: 30 }}
          disabled={inputsDisabled}
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
              setPendingVerification(false);
              setCode("");
            }}
            disabled={inputsDisabled}
          >
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---------------- Sign-up form UI ----------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 28 }}
          keyboardShouldPersistTaps="always"
        >
          <View style={{ alignItems: "center", marginTop: 8, marginBottom: 6 }}>
            <Text style={{ fontSize: 24, fontFamily: "Poppins_700Bold" }}>Create an account</Text>
            <Text
              style={{
                marginTop: 15,
                fontSize: 12,
                fontFamily: "Poppins_400Regular",
                textAlign: "center",
                color: "#6B7280",
              }}
            >
              Fill in your details below to create your account
            </Text>
          </View>

          <InputBox
            label="Email"
            placeholder="Enter your email"
            value={emailAddress}
            onChangeText={setEmailAddress}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!inputsDisabled}
          />

          <View style={{ position: "relative" }}>
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              containerTop={20}
              disabled={inputsDisabled}
            />
          </View>

          <ClickButton
            onPress={onSignUpPress}
            loading={loading}
            label="Create Account"
            style={{ marginTop: 24 }}
            disabled={inputsDisabled}
          />

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
            <Text style={{ color: BRAND.text, fontSize: 12, fontFamily: "Poppins_400Regular" }}>
              Already have an account?{" "}
              <Link
                href="../(auth)/signin"
                style={{
                  fontFamily: "Poppins_700Bold",
                  fontSize: 12,
                  textDecorationLine: "underline",
                  color: BRAND.green,
                }}
              >
                Sign In
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}