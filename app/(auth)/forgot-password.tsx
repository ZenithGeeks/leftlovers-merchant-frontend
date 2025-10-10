// app/(auth)/forgot-password.tsx
import { useRouter } from 'expo-router'
import React from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Firebase (app + auth + RN persistence)
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import { getApp, getApps, initializeApp } from 'firebase/app'
import { PhoneAuthProvider, getAuth, getReactNativePersistence, initializeAuth, } from 'firebase/auth'

// reCAPTCHA (Expo)
import mockData from '@/mockupData/loginRegis.json'
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha'

const MOCK_AUTH = true // set false when using real Firebase
const TEST_NUMBERS: Record<string, string> = mockData.TEST_NUMBERS || {}
const EMAIL_TO_PHONE: Record<string, string> = Object.fromEntries(
  (mockData.mockUsers ?? [])
    .filter((u) => (u.status || '').toLowerCase() === 'registered')
    .map((u) => [u.email, u.phone])
)

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    'AIzaSyBys91m4Jhb80wxhb8UYrUgZWNTMqT8i0A',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    'leftlover-customer.firebaseapp.com',
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'leftlover-customer',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    'leftlover-customer.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '121450093089',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    '1:121450093089:web:5b2389918ce73ac3836160',
}

// ---- Initialize Firebase (once) ----
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : (() => {
        try {
          return getAuth(app)
        } catch {
          return initializeAuth(app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage),
          })
        }
      })()

export default function ForgotPassword() {
  const router = useRouter()
  const recaptchaRef = React.useRef<FirebaseRecaptchaVerifierModal>(null)

  const [email, setEmail] = React.useState('')
  const [pw, setPw] = React.useState('')
  const [pw2, setPw2] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  // --- password validation helpers ---
  const checkPassword = (v: string) => ({
    length: v.length >= 8,
    upper: /[A-Z]/.test(v),
    lower: /[a-z]/.test(v),
    number: /[0-9]/.test(v),
    special: /[^A-Za-z0-9]/.test(v),
    nospace: !/\s/.test(v),
  })
  const isStrongPassword = (v: string) => {
    const r = checkPassword(v)
    return r.length && r.upper && r.lower && r.number && r.special && r.nospace
  }

  // Validation
  const emailOk = /\S+@\S+\.\S+/.test(email.trim())
  const pwRules = checkPassword(pw)
  const pwOk = isStrongPassword(pw)
  const match = pw && pw2 && pw === pw2
  const canSubmit = emailOk && pwOk && match && !loading

  // ---- HANDLE SEND OTP ----
  const onSendOtp = async () => {
    if (!canSubmit) return

    const trimmedEmail = email.trim().toLowerCase()
    const phone = EMAIL_TO_PHONE[trimmedEmail]

    if (!phone) {
      Alert.alert(
        'Not found',
        'No phone number is associated with this email in mock/test data.'
      )
      return
    }

    try {
      setLoading(true)
      if (MOCK_AUTH) {
        // ---- MOCK FLOW ----
        const mockCode = TEST_NUMBERS[phone]
        if (!mockCode) {
          Alert.alert(
            'Mock data error',
            `No mock OTP found for ${phone}. Please add it to loginRegis.json.`
          )
          return
        }

        Alert.alert('Mock OTP Sent', `Use this code to verify: ${mockCode}`)

        router.push({
          pathname: '/(auth)/verify-phone',
          params: {
            verificationId: 'mock',
            phone,
            next: '/(auth)/signin',
            newpw: pw,
            reset: '1',
          },
        })
        return
      }

      // ---- REAL FIREBASE FLOW ----
      const provider = new PhoneAuthProvider(auth)
      const verificationId = await provider.verifyPhoneNumber(
        phone,
        recaptchaRef.current!
      )

      router.push({
        pathname: '/(auth)/verify-phone',
        params: {
          verificationId,
          phone,
          next: '/(auth)/signin',
          newpw: pw,
          reset: '1',
        },
      })
    } catch (e: any) {
      console.warn('[forgot/send-otp]', e?.code, e?.message)
      Alert.alert('Couldn’t send OTP', e?.message || 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={app.options as any}
        attemptInvisibleVerification
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, padding: 24 }}>
            {/* Back */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ position: 'absolute', left: 4, top: 8 }}>
                <Text style={{ fontSize: 25, lineHeight: 22 }}>‹</Text>
              </View>
            </TouchableOpacity>

            <Text style={{ fontSize: 28, fontWeight: '800', marginTop: 8 }}>
              Reset your password
            </Text>
            <Text style={{ color: '#6B7280', marginTop: 6 }}>
              Reset your password in a few steps
            </Text>

            {/* Email */}
            <View style={{ marginTop: 22 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 8 }}>
                Email
              </Text>
              <TextInput
                placeholder="Merchant@gmail.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                style={{
                  borderWidth: 0.5,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: 'rgba(38, 189, 104, 0.12)',
                  borderColor: 'rgba(38, 189, 104, 0.08)',
                  letterSpacing: 0,
                }}
              />
              {!emailOk && !!email && (
                <Text style={{ color: '#B91C1C', marginTop: 6, fontSize: 12 }}>
                  Enter a valid email.
                </Text>
              )}
            </View>

{/* New password */}
<View style={{ marginTop: 16 }}>
  <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 8 }}>
    New Password
  </Text>
  <TextInput
    placeholder="Enter new password"
    value={pw}
    onChangeText={(t) => setPw(t.replace(/\s/g, ''))}
    secureTextEntry
    autoCapitalize="none"
    autoCorrect={false}
    // suppress iOS strong password / autofill
    textContentType={Platform.select({ ios: 'oneTimeCode', default: 'none' })}
    autoComplete="off"
    importantForAutofill="no"
    passwordRules=""
    style={{
      borderWidth: 0.5,
      borderRadius: 12,
      padding: 12,
      backgroundColor: 'rgba(38, 189, 104, 0.12)',
      borderColor: 'rgba(38, 189, 104, 0.08)',
    }}
  />

  {/* Checklist */}
  <View style={{ marginTop: 8, gap: 4 }}>
    {[
      { ok: pwRules.length, label: 'At least 8 characters' },
      { ok: pwRules.upper, label: 'Contains uppercase letter (A–Z)' },
      { ok: pwRules.lower, label: 'Contains lowercase letter (a–z)' },
      { ok: pwRules.number, label: 'Contains a number (0–9)' },
      { ok: pwRules.special, label: 'Contains special character (!@#$%)' },
    ].map((r) => (
      <Text
        key={r.label}
        style={{ fontSize: 12, color: r.ok ? '#059669' : '#B91C1C' }}
      >
        {r.ok ? '✓' : '•'} {r.label}
      </Text>
    ))}
  </View>
</View>

{/* Confirm password */}
<View style={{ marginTop: 16 }}>
  <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 8 }}>
    Confirm New Password
  </Text>
  <TextInput
    placeholder="Re-enter password"
    value={pw2}
    onChangeText={(t) => setPw2(t.replace(/\s/g, ''))}
    secureTextEntry
    autoCapitalize="none"
    autoCorrect={false}
    // suppress iOS strong password / autofill
    textContentType={Platform.select({ ios: 'oneTimeCode', default: 'none' })}
    autoComplete="off"
    importantForAutofill="no"
    passwordRules=""
    style={{
      borderWidth: 0.5,
      borderRadius: 12,
      padding: 12,
      backgroundColor: 'rgba(38, 189, 104, 0.12)',
      borderColor: 'rgba(38, 189, 104, 0.08)',
    }}
  />
  {!!pw2 && pw !== pw2 && (
    <Text style={{ color: '#B91C1C', marginTop: 6, fontSize: 12 }}>
      Passwords don’t match.
    </Text>
  )}
</View>


            {/* Send OTP */}
            <TouchableOpacity
              disabled={!canSubmit}
              onPress={onSendOtp}
              style={{
                marginTop: 24,
                backgroundColor: '#26BD68',
                paddingVertical: 16,
                borderRadius: 12,
                opacity: canSubmit ? 1 : 0.5,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                {loading ? 'Sending…' : 'Send OTP to Confirm'}
              </Text>
            </TouchableOpacity>

            <Text style={{ color: '#6B7280', marginTop: 12, fontSize: 12 }}>
              We’ll text a 6-digit code to the phone number linked with this
              account.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}