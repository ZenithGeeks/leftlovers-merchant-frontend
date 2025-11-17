// app/(authen)/phone.tsx
import { useUser } from "@clerk/clerk-expo";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  PhoneAuthProvider,
  signInWithCredential,
  type ApplicationVerifier,
} from "firebase/auth";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { OtpInput } from "@/components/Authen/VerifyBox";
import { auth } from "@/src/lib/firebase";
import { setStep } from "@/src/lib/onboarding";
import Constants from "expo-constants";

const firebaseWebConfig = {
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_FB_API_KEY || process.env.EXPO_PUBLIC_FB_API_KEY,
  authDomain: Constants.expoConfig?.extra?.EXPO_PUBLIC_FB_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FB_PROJECT_ID || process.env.EXPO_PUBLIC_FB_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.EXPO_PUBLIC_FB_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FB_APP_ID || process.env.EXPO_PUBLIC_FB_APP_ID,
};

/* ---------- helpers ---------- */
const toE164TH = (rawInput?: string) => {
  const raw = (rawInput ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("+")) return raw; // already E.164
  const digits = raw.replace(/\D/g, "");
  const core = digits.startsWith("0") ? digits.slice(1) : digits;
  return core.length === 9 ? `+66${core}` : null; // TH mobile = 9 digits after dropping leading 0
};

export default function PhoneAuthScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal | null>(null);

  // ===== prefill from signup params =====
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber?: string }>();

  // phone/otp state
  const [otp, setOtp] = useState("");
  const phoneE164 = useMemo(() => toE164TH(phoneNumber), [phoneNumber]);

  // ui state
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const verifyLock = useRef(false);

  // resend timer
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  /* ========================== SEND CODE ========================== */
  const sendCode = async () => {
    if (!phoneE164) {
      Alert.alert("Invalid phone number", "Phone from signup is missing or invalid.");
      return;
    }
    const verifier = recaptchaRef.current as unknown as ApplicationVerifier | null;
    if (!verifier) {
      Alert.alert("reCAPTCHA not ready", "Please try again in a moment.");
      return;
    }

    try {
      setSending(true);
      const provider = new PhoneAuthProvider(auth);
      const vid = await provider.verifyPhoneNumber(phoneE164, verifier);
      await verifyCode(vid);
      setCooldown(30);
      Alert.alert("Code sent", `We sent an SMS to ${phoneE164}. Enter the 6-digit code.`);
    } catch (err: any) {
      console.error("sendCode error:", err);
      let msg = "Failed to send verification code.";
      if (err?.code === "auth/too-many-requests") msg = "Too many attempts. Please try again later.";
      if (err?.code === "auth/quota-exceeded") msg = "SMS quota temporarily exceeded. Please try again later.";
      if (err?.code === "auth/invalid-phone-number") msg = "Invalid phone number format.";
      Alert.alert("Failed", msg);
    } finally {
      setSending(false);
    }
  };

  /* ========================== VERIFY CODE ========================== */
  const verifyCode = async (verificationId : string) => {
    if (!verificationId) {
      Alert.alert("Error", "Missing verification ID. Please send the code again.");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert("Invalid code", "Please enter the 6-digit code.");
      return;
    }
    if (!user || !isLoaded) {
      Alert.alert("Error", "No signed-in user.");
      return;
    }
    if (verifyLock.current) return;

    verifyLock.current = true;
    setVerifying(true);

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential); // ✅ phone verified in Firebase

      // ✅ update Clerk metadata (optional)
      const prev = (user.unsafeMetadata ?? {}) as Record<string, unknown>;
      await user.update({
        unsafeMetadata: { ...prev, phoneAdded: true, phone: phoneE164 ?? undefined },
      });

      // ✅ advance onboarding and refresh, then go to store info
      await setStep(user, "store");
      await user.reload();

      router.replace("/(auth)/storeInfo");
    } catch (err: any) {
      console.error("verifyCode error:", err);
      const code = err?.code || "";
      let msg = err?.message ?? "Could not verify the code.";
      if (code === "auth/invalid-verification-code") msg = "Invalid verification code.";
      if (code === "auth/session-expired" || code === "auth/code-expired") msg = "Code expired. Please request a new one.";
      Alert.alert("Failed", msg);
    } finally {
      setVerifying(false);
      verifyLock.current = false;
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setOtp("");
    await sendCode();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />

      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={firebaseWebConfig}
        attemptInvisibleVerification
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Verify your phone</Text>
          <Text style={styles.subtitle}>
            {phoneE164 ? `OTP code will be sent to ${phoneE164}` : "No phone number from signup."}
          </Text>

          <OtpInput
            value={otp}
            setValue={(v: string) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
            style={{ width: "100%", marginTop: 10 }}
          />

          <ClickButton
            label={verifying ? "Verifying…" : "Verify"}
            onPress={sendCode}
            disabled={verifying || otp.length !== 6}
            loading={verifying}
            style={{ marginTop: 12, width: "100%" }}
          />

          <View style={{ marginTop: 14, width: "100%", gap: 8, alignItems: "center" }}>
            <TouchableOpacity onPress={resend} disabled={cooldown > 0 || sending }>
              <Text
                style={{
                  textDecorationLine: "underline",
                  color: cooldown > 0 ? "#9CA3AF" : "#26BD68",
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", color: "#111827" },
  subtitle: { textAlign: "center", opacity: 0.7, fontSize: 12 },
});