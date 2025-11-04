// app/(authen)/signin.tsx
import { useSignIn } from "@clerk/clerk-expo";
import { Link, Stack, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClickButton } from "@/components/Authen/ClickButton";
import { InputBox } from "@/components/Authen/InputBox";

const BRAND = { green: "#26BD68", text: "#0B0F10" };

export default function SignInPage() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  // --- Local state ---
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const inputsDisabled = loadingEmail || !isLoaded;

  const handleEmailPasswordSignIn = useCallback(async () => {
  if (!isLoaded || loadingEmail) return;
  setLoadingEmail(true);

  try {
    const attempt = await signIn.create({
      identifier,
      password,
    });

    if (attempt.status === "complete") {
      await setActive({ session: attempt.createdSessionId });
      router.replace("/(landing)/Check_can_login");
    } else {
      console.error("Unexpected sign-in step:", JSON.stringify(attempt, null, 2));
    }
  } catch (err: any) {
    console.error("Sign-in error:", JSON.stringify(err, null, 2));

    // 🔹 Clerk errors come in a predictable shape (errors[0].code)
    const code = err?.errors?.[0]?.code;
    let message = "Something went wrong. Please try again.";

    switch (code) {
      case "form_identifier_not_found":
        message = "This account does not exist.";
        break;
      case "form_password_incorrect":
        message = "Incorrect email or password.";
        break;
      case "form_identifier_exists_but_not_allowed":
        message = "This account cannot sign in with password.";
        break;
      default:
        // fallback: try longMessage from Clerk if available
        message = err?.errors?.[0]?.longMessage || message;
    }

    Alert.alert("Sign-in failed", message);
  } finally {
    setLoadingEmail(false);
  }
}, [identifier, password, isLoaded, loadingEmail, setActive, signIn, router]);

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
            <Text style={{ fontSize: 24, fontFamily: "Poppins_700Bold" }}>Sign In</Text>
            <Text
              style={{
                marginTop: 15,
                fontSize: 12,
                fontFamily: "Poppins_400Regular",
                textAlign: "center",
              }}
            >
              Hi, welcome back — you’ve been missed
            </Text>
          </View>

          <InputBox
            label="Email"
            placeholder="Enter your email"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!inputsDisabled}
          />

          {/* Password field with Show/Hide overlay */}
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

          <View style={{ width: "100%", alignItems: "flex-end", marginTop: 20, marginBottom: 15 }}>
            <Link href="/(auth)/forgotPassword" asChild>
              <TouchableOpacity disabled={inputsDisabled}>
                <Text style={{ fontSize: 12, fontFamily: "Poppins_600SemiBold", textDecorationLine: "underline", color: BRAND.green }}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          <ClickButton
            onPress={handleEmailPasswordSignIn}
            loading={loadingEmail}
            label="Sign In"
            style={{ marginTop: 8 }}
            disabled={inputsDisabled}
          />

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
            <Text style={{ color: BRAND.text, fontSize: 12, fontFamily: "Poppins_400Regular" }}>
              Don’t have an account?{" "}
              <Link
                href="/(auth)/signup"
                style={{ fontFamily: "Poppins_700Bold", fontSize: 12, textDecorationLine: "underline", color: BRAND.green }}
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