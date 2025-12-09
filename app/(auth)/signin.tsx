import { Link, Stack, useRouter } from "expo-router";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClickButton } from "@/components/Authen/ClickButton";
import { InputBox } from "@/components/Authen/InputBox";
import { auth } from "@/lib/firebase";

const BRAND = { green: "#26BD68", text: "#0B0F10" };

const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim().toLowerCase());

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputsDisabled = loading;

  const canSubmit = useMemo(() => {
    const normEmail = email.trim().toLowerCase();
    return isValidEmail(normEmail) && password.length > 0 && !loading;
  }, [email, password, loading]);

  const handleEmailPasswordSignIn = useCallback(async () => {
    if (loading) return;

    const normEmail = email.trim().toLowerCase();
    if (!isValidEmail(normEmail) || !password) {
      Alert.alert("Missing info", "Please enter a valid email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, normEmail, password);
      router.replace("/(tabs)/home");
    } catch (err: unknown) {
      let message = "Something went wrong. Please try again.";

      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/user-not-found":
            message = "This account does not exist.";
            break;
          case "auth/wrong-password":
          case "auth/invalid-credential":
            message = "Incorrect email or password.";
            break;
          case "auth/too-many-requests":
            message = "Too many attempts. Please try again later.";
            break;
          case "auth/invalid-email":
            message = "This email address is invalid.";
            break;
          default:
            message = err.message || message;
        }
      }

      Alert.alert("Sign-in failed", message);
    } finally {
      setLoading(false);
    }
  }, [email, password, loading, router]);

  const handleForgotPassword = useCallback(async () => {
    const normEmail = email.trim().toLowerCase();

    if (!isValidEmail(normEmail)) {
      Alert.alert("Invalid email", "Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, normEmail);
      Alert.alert("Email sent", "Check your inbox for a reset link.");
    } catch (err: unknown) {
      let message = "Unable to send reset email.";
      if (err instanceof FirebaseError) {
        message = err.message || message;
      }
      Alert.alert("Reset failed", message);
    }
  }, [email]);

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
              Sign in
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontSize: 12,
                fontFamily: "Poppins_400Regular",
                textAlign: "center",
                color: "#6B7280",
              }}
            >
              Welcome back! Please sign in to continue.
            </Text>
          </View>

          <InputBox
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!inputsDisabled}
          />

          <View style={{ position: "relative" }}>
            <InputBox
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              containerTop={20}
              onSubmitEditing={handleEmailPasswordSignIn}
              style={{ paddingRight: 64 }}
              editable={!inputsDisabled}
            />

            {!!password && (
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                activeOpacity={0.7}
                style={styles.showToggle}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                disabled={inputsDisabled}
              >
                <Text style={styles.showToggleText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={handleForgotPassword}
            disabled={inputsDisabled}
            style={{ marginTop: 12, alignSelf: "flex-end" }}
          >
            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: 12,
                color: BRAND.green,
                textDecorationLine: "underline",
              }}
            >
              Forgot password?
            </Text>
          </TouchableOpacity>

          <ClickButton
            label={loading ? "Signing in..." : "Sign In"}
            onPress={handleEmailPasswordSignIn}
            disabled={!canSubmit}
            style={{ marginTop: 22 }}
          />

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 18 }}>
            <Text style={{ color: BRAND.text, fontSize: 12, fontFamily: "Poppins_400Regular" }}>
              Don’t have an account?{" "}
              <Link
                href="/(auth)/signup"
                style={{
                  fontFamily: "Poppins_700Bold",
                  fontSize: 12,
                  textDecorationLine: "underline",
                  color: BRAND.green,
                }}
              >
                Sign Up
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  showToggle: {
    position: "absolute",
    right: 12,
    top: 50,
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  showToggleText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#26BD68",
  },
});
