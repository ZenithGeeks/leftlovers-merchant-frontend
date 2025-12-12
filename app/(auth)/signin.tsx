import { Link, Stack } from "expo-router";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
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
import { useMerchant } from "@/context/MerchantContext";
import { auth } from "@/lib/firebase";
import { fetchMerchant } from "@/services/store";

const BRAND = { green: "#26BD68", text: "#0B0F10" };

const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim().toLowerCase());

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setMerchant } = useMerchant();
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
    const cred = await signInWithEmailAndPassword(auth, normEmail, password);
    const user = cred.user;

    // ✅ FETCH MERCHANT AFTER SIGN IN
    const merchant = await fetchMerchant(user.uid);

    if (merchant) {
      setMerchant(merchant.id, merchant.status);
    } else {
      setMerchant('', 'PENDING');
    }

    // ❌ อย่า router.replace ที่นี่
    // ให้ AuthLayout จัดการ redirect
  } catch (err: unknown) {
    let message = "Something went wrong. Please try again.";
    if (err instanceof FirebaseError) {
      message = err.message || message;
    }
    Alert.alert("Sign-in failed", message);
  } finally {
    setLoading(false);
  }
}, [loading, email, password, setMerchant]);


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
            onPress={()=>null}
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
