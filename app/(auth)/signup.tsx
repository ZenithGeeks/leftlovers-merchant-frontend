// app/(authen)/signup.tsx
import { useAuth, useSignUp, useUser } from "@clerk/clerk-expo";
import { Link, Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

import { createMerchant } from "@/app/api/users";
import { ClickButton } from "@/components/Authen/ClickButton";
import { InputBox } from "@/components/Authen/InputBox";
import { PasswordInput } from "@/components/Authen/PasswordInput";
import { PhoneInput } from "@/components/Authen/PhoneInput";
import { OtpInput } from "@/components/Authen/VerifyBox";

const BRAND = { green: "#26BD68", text: "#0B0F10" };

export default function SignUpPage() {
  const router = useRouter();
  const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp();
  const { isLoaded: authLoaded, isSignedIn, signOut } = useAuth();
  useUser();

  const [email, setEmail] = useState("");
  const [fullName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email verification UI state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // Resend control
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds
  const [localPhone, setLocalPhone] = useState("");

  useEffect(() => {
    const clearExistingSession = async () => {
      if (!authLoaded) return;
      if (isSignedIn) {
        try {
          await signOut();
        } catch (e) {
          console.warn("Sign-out cleanup failed:", e);
        }
      }
    };
    clearExistingSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded]);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim().toLowerCase());

  // Convert Thai local numbers (e.g., 0812345678) to E.164 (+66…)
  const toE164TH = (input: string): string | null => {
    if (!input) return null;
    let d = input.replace(/\D/g, "");
    if (d.startsWith("0")) d = d.slice(1);
    if (d.length < 8 || d.length > 10) return null; // sanity check
    return `+66${d}`;
  };

  /* ======================== EMAIL/PASSWORD SIGN UP ======================== */
  const handleSignUp = async () => {
    if (!signUpLoaded) {
      Alert.alert("Please wait", "Auth not ready yet");
      return;
    }

    const normEmail = email.trim().toLowerCase();
    if (!isValidEmail(normEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (!password) {
      Alert.alert("Missing fields", "Enter password");
      return;
    }
    if (!passwordValid) {
      Alert.alert("Weak password", "Please meet password requirements.");
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress: normEmail,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      setCanResend(true);
      setResendCooldown(60);
    } catch (err: any) {
      console.error("SignUp error:", err);
      Alert.alert(
        "Sign up failed",
        err?.errors?.[0]?.message ?? err?.message ?? "Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================================ RESEND ================================ */
  const handleResend = async () => {
    if (!signUpLoaded || !canResend || resendCooldown > 0) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResendCooldown(30);
      Alert.alert("Code sent", "We sent the code again to your email.");
    } catch (err: any) {
      console.warn("Resend failed:", err);
      Alert.alert("Resend failed", err?.message ?? "Unable to resend.");
    }
  };

  /* =========================== VERIFY EMAIL CODE ========================== */
  const handleVerifyCode = async () => {
    if (!signUpLoaded) {
      Alert.alert("Please wait", "Auth not ready yet");
      return;
    }
    if (!verificationCode) {
      Alert.alert("Missing code", "Enter your email verification code");
      return;
    }

    setLoading(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      await signUp.reload();

      // If Clerk created a session, activate it
      const createdSessionId =
        res?.createdSessionId ?? (signUp as any)?.createdSessionId ?? null;
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }

      // Prepare backend payload
      const name = fullName.trim();
      const emailLower = email.trim().toLowerCase();
      const phoneE164 = toE164TH(localPhone);

      // Create merchant (DOB explicitly null per your requirement)
      try {
        await createMerchant({
          name,
          email: emailLower,
          dob: null,                // ✅ force null
          phone: phoneE164 ?? null, // ✅ null if invalid/empty
          role: "MERCHANT",
        });
        console.log("✅ Backend merchant user created (email/password)");
      } catch (e: any) {
        console.warn("Create merchant user failed:", e);
        Alert.alert(
          "Account note",
          e?.message ?? "We couldn't finish account setup, but you can continue."
        );
      }

      // Navigate to phone OTP screen with params (correct folder + deferred)
      const params: Record<string, string | undefined> = {
        phoneNumber: phoneE164 ?? undefined,
        ...(createdSessionId ? { sessionId: String(createdSessionId) } : {}),
      };

      // Defer to avoid "navigate before Root Layout mounts" race
      setTimeout(() => {
        router.replace({ pathname: "/(auth)/phone", params }); // ✅ correct route
      }, 0);
      // Or: InteractionManager.runAfterInteractions(() => router.replace({ pathname: "/(authen)/phone", params }));

    } catch (err: any) {
      console.error("Verification error:", err);
      Alert.alert(
        "Verification failed",
        err?.errors?.[0]?.message ?? err?.message ?? "Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================================= Renders ================================ */
  if (pendingVerification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF", padding: 28 }}>
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
          We sent a 6-digit code to your email address {email.trim().toLowerCase()}
        </Text>

        <OtpInput value={verificationCode} setValue={setVerificationCode} />

        <ClickButton
          label="Verify"
          onPress={handleVerifyCode}
          loading={loading}
          style={{ marginTop: 30 }}
        />

        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ fontFamily: "Poppins_400Regular" }}>Didn’t receive code?</Text>
          <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0}>
            <Text
              style={{
                textDecorationLine: "underline",
                color: resendCooldown > 0 ? "#9CA3AF" : "#26BD68",
                marginTop: 8,
                fontFamily: "Poppins_400Regular",
              }}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </Text>
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
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={{ marginTop: 15, fontFamily: "Poppins_400Regular", fontSize: 15 }}>
            Phone
          </Text>

          <PhoneInput
            localPhone={localPhone}
            onChangeLocal={(t) => {
              const clean = t.startsWith("+")
                ? `+${t.replace(/[^\d+]/g, "").replace(/^\+{2,}/, "+")}`
                : t.replace(/\D/g, "").replace(/^0/, "").slice(0, 9);
              setLocalPhone(clean);
            }}
            style={{ marginTop: -5, width: "100%" }}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            onValidityChange={setPasswordValid}
            rulesVisible={false}
            disabled={loading}
            containerTop={15}
          />

          <ClickButton
            onPress={handleSignUp}
            loading={loading}
            label="Create Account"
            style={{ marginTop: 24 }}
            disabled={!email || !passwordValid || loading}
          />

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
            <Text style={{ color: BRAND.text, fontSize: 12, fontFamily: "Poppins_400Regular" }}>
              Already have an account?{" "}
              <Link
                href="/(auth)/signin" // ✅ keep this consistent with your folder name
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
