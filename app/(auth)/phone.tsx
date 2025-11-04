// app/(auth)/phone.tsx  (single-screen flow for send + verify)
import { useUser } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { Stack, useRouter } from 'expo-router';
import { PhoneAuthProvider, signInWithCredential, type ApplicationVerifier } from 'firebase/auth';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClickButton } from '@/components/Authen/ClickButton';
import { PhoneInput } from '@/components/Authen/PhoneInput';
import { OtpInput } from '@/components/Authen/VerifyBox';
import { auth } from '@/src/lib/firebase';

const firebaseWebConfig = {
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_FB_API_KEY || process.env.EXPO_PUBLIC_FB_API_KEY,
  authDomain: Constants.expoConfig?.extra?.EXPO_PUBLIC_FB_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FB_PROJECT_ID || process.env.EXPO_PUBLIC_FB_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.EXPO_PUBLIC_FB_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FB_APP_ID || process.env.EXPO_PUBLIC_FB_APP_ID,
};

type Mode = 'enter' | 'verify';

export default function PhoneAuthScreen() {
  const router = useRouter();
  const { user } = useUser();
  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal | null>(null);

  // --- phone state
  const [localPhone, setLocalPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const phoneE164 = useMemo(() => {
    // Accepts full E.164 (e.g., +66xxxxxxxxx). If user types Thai local mobile, convert.
    const raw = localPhone.trim();
    if (raw.startsWith('+')) return raw; // assume already E.164
    const digits = raw.replace(/\D/g, '');
    const core = digits.startsWith('0') ? digits.slice(1) : digits;
    return core.length === 9 ? `+66${core}` : null; // Thai mobile: 9 digits after leading 0
  }, [localPhone]);

  // --- otp state
  const [mode, setMode] = useState<Mode>('enter');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');

  // --- ui state
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // --- resend timer
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendCode = async () => {
    if (!phoneE164) {
      setPhoneError('Please enter a valid phone number. For Thai mobile, use 9 digits (e.g., 930966006) or type +66…');
      return;
    }

    const verifier = recaptchaRef.current as unknown as ApplicationVerifier | null;
    if (!verifier) {
      Alert.alert('reCAPTCHA not ready', 'Please try again in a moment.');
      return;
    }

    try {
      setSending(true);
      const provider = new PhoneAuthProvider(auth);
      const vid = await provider.verifyPhoneNumber(phoneE164, verifier);
      setVerificationId(vid);
      setMode('verify');
      setCooldown(30); // small cooldown before allowing resend
    } catch (err: any) {
      console.error('sendCode error:', err);
      let msg = 'Failed to send verification code.';
      if (err?.code === 'auth/too-many-requests') msg = 'Too many attempts. Please try again later.';
      if (err?.code === 'auth/quota-exceeded') msg = 'SMS quota temporarily exceeded. Please try again later.';
      if (err?.code === 'auth/invalid-phone-number') msg = 'Invalid phone number format.';
      Alert.alert('Failed', msg);
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationId) {
      Alert.alert('Error', 'Missing verification ID. Please send the code again.');
      setMode('enter');
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert('Invalid code', 'Please enter the 6-digit code.');
      return;
    }

    try {
      setVerifying(true);
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      await user?.update({
        unsafeMetadata: { ...(user?.unsafeMetadata ?? {}), phoneAdded: true, phone: phoneE164 },
      });
      Alert.alert('Success', 'Phone verified and signed in.');
      router.replace('/(auth)/storeInfo'); // adjust destination
    } catch (err: any) {
      console.error('verifyCode error:', err);
      const e = err?.code || '';
      let msg = 'Could not verify the code.';
      if (e === 'auth/invalid-verification-code') msg = 'Invalid verification code.';
      if (e === 'auth/session-expired' || e === 'auth/code-expired') msg = 'Code expired. Please request a new one.';
      Alert.alert('Failed', msg);
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setOtp('');
    await sendCode();
  };

  const editNumber = () => {
    setMode('enter');
    setOtp('');
    setVerificationId(null);
    setCooldown(0);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Keep this mounted for both steps */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={firebaseWebConfig}
        attemptInvisibleVerification
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {mode === 'enter' ? (
            <>
              <Text style={styles.title}>Enter your phone number</Text>

              <PhoneInput
                localPhone={localPhone}
                onChangeLocal={(t) => {
                  // allow + for full E.164, else digits only (drop leading 0 for TH local)
                  const clean = t.startsWith('+')
                    ? `+${t.replace(/[^\d+]/g, '').replace(/^\+{2,}/, '+')}` // keep one +
                    : t.replace(/\D/g, '').replace(/^0/, '').slice(0, 9);
                  setLocalPhone(clean);
                  if (phoneError) setPhoneError('');
                }}
                onSubmit={sendCode}
                error={phoneError}
                style={{ marginTop: 8, width: '100%' }}
              />

              <ClickButton
                label={sending ? 'Sending…' : 'Send code'}
                onPress={sendCode}
                disabled={sending || !phoneE164}
                loading={sending}
                style={{ marginTop: 12, paddingHorizontal: 0, width: '100%' }}
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>Verify your phone</Text>
              <Text style={styles.subtitle}>OTP code sent to {phoneE164}</Text>

              <OtpInput
                value={otp}
                setValue={(v: string) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
                style={{ width: '100%', marginTop: 24 }}
              />

              <ClickButton
                label={verifying ? 'Verifying…' : 'Verify'}
                onPress={verifyCode}
                disabled={verifying || otp.length !== 6}
                loading={verifying}
                style={{ marginTop: 12, paddingHorizontal: 0, width: '100%' }}
              />

              <View style={{ marginTop: 12, width: '100%', gap: 8, alignItems: "center"  }}>
                <Text style={{ fontFamily: "Poppins_400Regular" }}>Didn’t receive the code?</Text>
                  {/* Resend code */}
                  <TouchableOpacity onPress={resend} disabled={cooldown > 0 || sending}>
                    <Text
                      style={{
                      textDecorationLine: "underline",
                      color: cooldown > 0 ? "#9CA3AF" : "#26BD68",
                      marginTop: 8,
                      fontFamily: "Poppins_400Regular",
                      }}
                    >{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}</Text>
                   </TouchableOpacity>

                  {/* Edit phone number */}
                  <TouchableOpacity onPress={editNumber} style={{ marginTop: 12 }}>
                    <Text
                      style={{
                        textDecorationLine: "underline",
                        color: "#26BD68",
                        fontFamily: "Poppins_400Regular",
                      }}>Edit phone number</Text>
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
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', color: '#111827' },
  subtitle: { textAlign: 'center', opacity: 0.7, fontSize: 12 },
});