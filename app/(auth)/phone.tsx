// app/(auth)/phone.tsx  (single-screen flow for send + verify)
import { useUser } from "@clerk/clerk-expo";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { Stack, useRouter } from "expo-router";
import { getApp } from "firebase/app";
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
import { PhoneInput } from "@/components/Authen/PhoneInput";
import { OtpInput } from "@/components/Authen/VerifyBox";
import { auth } from "@/src/lib/firebase";
import { setStep } from "@/src/lib/onboarding";

type Mode = "enter" | "verify";

export default function PhoneAuthScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal | null>(null);

  // --- phone state
  const [localPhone, setLocalPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const phoneE164 = useMemo(() => {
    const raw = localPhone.trim();
    if (raw.startsWith("+")) return raw;
    const digits = raw.replace(/\D/g, "");
    const core = digits.startsWith("0") ? digits.slice(1) : digits;
    return core.length === 9 ? `+66${core}` : null;
  }, [localPhone]);

  // --- otp state
  const [mode, setMode] = useState<Mode>("enter");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  // --- ui state
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const verifyLock = useRef(false);

  // --- resend timer
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendCode = async () => {
    if (!phoneE164) {
      setPhoneError(
        "Please enter a valid phone number. For Thai mobile, use 9 digits (e.g., 930966006) or type +66…"
      );
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
      setVerificationId(vid);
      setMode("verify");
      setCooldown(60);
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

  const verifyCode = async () => {
    // ✅ Validate BEFORE locking to avoid stuck lock on early returns
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
      await signInWithCredential(auth, credential);

      // Mark on Clerk (client metadata)
      const prev = (user.unsafeMetadata ?? {}) as Record<string, unknown>;
      await user.update({
        unsafeMetadata: { ...prev, phoneAdded: true, phone: phoneE164 ?? undefined },
      });

      // Advance to "store" step, then force local refresh
      await setStep(user, "store");
      await user.reload(); // 🔁 make _layout see the new step immediately

      // Hard fallback redirect (so you aren’t 100% relying on the layout)
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
      verifyLock.current = false; // ✅ always release the lock
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setOtp("");
    await sendCode();
  };

  const editNumber = () => {
    setMode("enter");
    setOtp("");
    setVerificationId(null);
    setCooldown(0);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Use the SAME Firebase app config that initialized `auth` */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={getApp().options as any}
        attemptInvisibleVerification
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {mode === "enter" ? (
            <>
              <Text style={styles.title}>Enter your phone number</Text>

              <PhoneInput
                localPhone={localPhone}
                onChangeLocal={(t) => {
                  const clean = t.startsWith("+")
                    ? `+${t.replace(/[^\d+]/g, "").replace(/^\+{2,}/, "+")}`
                    : t.replace(/\D/g, "").replace(/^0/, "").slice(0, 9);
                  setLocalPhone(clean);
                  if (phoneError) setPhoneError("");
                }}
                onSubmit={sendCode}
                error={phoneError}
                style={{ marginTop: 8, width: "100%" }}
              />

              <ClickButton
                label={sending ? "Sending…" : "Send code"}
                onPress={sendCode}
                disabled={sending || !phoneE164}
                loading={sending}
                style={{ marginTop: 12, paddingHorizontal: 0, width: "100%" }}
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>Verify your phone</Text>
              <Text style={styles.subtitle}>OTP code sent to {phoneE164}</Text>

              <OtpInput
                value={otp}
                setValue={(v: string) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
                style={{ width: "100%", marginTop: 5 }}
              />

              <ClickButton
                label={verifying ? "Verifying…" : "Verify"}
                onPress={verifyCode}
                disabled={verifying || otp.length !== 6}
                loading={verifying}
                style={{ marginTop: 12, paddingHorizontal: 0, width: "100%" }}
              />

              <View style={{ marginTop: 12, width: "100%", gap: 8, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_400Regular" }}>Didn’t receive the code?</Text>

                <TouchableOpacity onPress={resend} disabled={cooldown > 0 || sending}>
                  <Text
                    style={{
                      textDecorationLine: "underline",
                      color: cooldown > 0 ? "#9CA3AF" : "#26BD68",
                      marginTop: 8,
                      fontFamily: "Poppins_400Regular",
                    }}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={editNumber} style={{ marginTop: 12 }}>
                  <Text
                    style={{
                      textDecorationLine: "underline",
                      color: "#26BD68",
                      fontFamily: "Poppins_400Regular",
                    }}
                  >
                    Edit phone number
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
