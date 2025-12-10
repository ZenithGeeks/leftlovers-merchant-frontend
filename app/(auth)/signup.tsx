// app/(authen)/signup.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

import createMerchant from "@/app/api/users";
import { ClickButton } from "@/components/Authen/ClickButton";
import { InputBox } from "@/components/Authen/InputBox";
import { PasswordInput } from "@/components/Authen/PasswordInput";
import { PhoneInput } from "@/components/Authen/PhoneInput";

import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  type User as FirebaseUser,
} from "firebase/auth";

import { type OnboardingStep } from "@/src/lib/onboarding";

const BRAND = { green: "#26BD68", text: "#0B0F10" };
const DEV = __DEV__;

// --- local onboarding save (MVP) ---
const stepKey = (uid: string) => `onboarding:step:${uid}`;
async function saveOnboardingStep(uid: string, step: OnboardingStep) {
  await AsyncStorage.setItem(stepKey(uid), step);
}

// --- validation ---
const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim().toLowerCase());

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState(DEV ? "test@example.com" : "");
  const [password, setPassword] = useState(DEV ? "12345678" : "");
  const [passwordValid, setPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email verification UI state
  const [pendingVerification, setPendingVerification] = useState(false);

  // Resend control
  const [resendCooldown, setResendCooldown] = useState(0);
  const [localPhone, setLocalPhone] = useState("");

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  /* ======================== EMAIL/PASSWORD SIGN UP ======================== */
  const handleSignUp = async () => {
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
      const cred = await createUserWithEmailAndPassword(auth, normEmail, password);

      // Send Firebase verification email
      await sendEmailVerification(cred.user);

      if (!mountedRef.current) return;

      setPendingVerification(true);
      setResendCooldown(60);
    } catch (err: unknown) {
      console.error("SignUp error:", err);

      let message = "Try again.";
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/email-already-in-use":
            message = "This email is already in use.";
            break;
          case "auth/invalid-email":
            message = "Invalid email address.";
            break;
          case "auth/weak-password":
            message = "Password is too weak.";
            break;
          default:
            message = err.message || message;
        }
      }

      Alert.alert("Sign up failed", message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  /* ================================ RESEND ================================ */
  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Session lost", "Please sign up again.");
        setPendingVerification(false);
        return;
      }

      await sendEmailVerification(user);
      setResendCooldown(30);

      Alert.alert("Code sent", "We sent the verification email again.");
    } catch (err: unknown) {
      console.warn("Resend failed:", err);
      Alert.alert("Resend failed", "Unable to resend verification email.");
    }
  };

  /* ======================= CHECK EMAIL VERIFIED ======================= */
  const handleIVerified = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const user = auth.currentUser as FirebaseUser | null;

      if (!user) {
        Alert.alert("Session lost", "Please sign up again.");
        setPendingVerification(false);
        return;
      }

      // Refresh Firebase user to get latest emailVerified
      await user.reload();

      if (!user.emailVerified) {
        Alert.alert(
          "Not verified yet",
          "Please verify your email then try again."
        );
        return;
      }

      const emailLower = user.email?.toLowerCase() ?? email.trim().toLowerCase();
      const name = emailLower.split("@")[0] || "Merchant";

      // Create merchant row in backend (same signature you used before)
      try {
        await createMerchant({
          name,
          email: emailLower,
          phone: localPhone || undefined,
          avatarUrl: null,
          role: "MERCHANT",
        });
      } catch (e: any) {
        Alert.alert(
          "Account note",
          e?.message ??
            "We couldn't finish account setup, but you can continue."
        );
      }
      await saveOnboardingStep(user.uid, "store");
      router.replace("/(auth)/storeInfo");
    } catch (err: any) {
      console.error("Verification check error:", err);
      Alert.alert("Verification failed", err?.message ?? "Try again.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  /* ================================ Renders ================================ */

  if (pendingVerification) {
    const displayEmail = email.trim().toLowerCase();

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF", padding: 28 }}>
        <Stack.Screen options={{ headerShown: false }} />

        <Text
          style={{
            fontSize: 24,
            fontFamily: "Poppins_700Bold",
            textAlign: "center",
          }}
        >
          Verify your email
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
          We sent a verification email to {displayEmail}
        </Text>

        <ClickButton
          label={loading ? "Checking..." : "I’ve verified my email"}
          onPress={handleIVerified}
          loading={loading}
          style={{ marginTop: 30 }}
        />

        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ fontFamily: "Poppins_400Regular" }}>
            Didn’t receive email?
          </Text>
          <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0}>
            <Text
              style={{
                textDecorationLine: "underline",
                color: resendCooldown > 0 ? "#9CA3AF" : "#26BD68",
                marginTop: 8,
                fontFamily: "Poppins_400Regular",
              }}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setPendingVerification(false)}
          style={{ marginTop: 24, alignItems: "center" }}
        >
          <Text style={{ color: "#6B7280" }}>Back</Text>
        </TouchableOpacity>
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
            <Text style={{ fontSize: 24, fontFamily: "Poppins_700Bold" }}>
              Create an account
            </Text>
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

          <Text
            style={{
              marginTop: 15,
              fontFamily: "Poppins_400Regular",
              fontSize: 15,
            }}
          >
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

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <Text
              style={{
                color: BRAND.text,
                fontSize: 12,
                fontFamily: "Poppins_400Regular",
              }}
            >
              Already have an account?{" "}
              <Link
                href="/(auth)/signin"
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
