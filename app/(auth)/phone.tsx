// app/(auth)/phone.tsx
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha'
import { useRouter } from 'expo-router'
import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, PhoneAuthProvider } from 'firebase/auth'
import React, { useMemo, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const TEST_NUMBERS: Record<string, string> = {
  // E.164 → code (fill with YOUR pairs from the console)
  '+66655453321': '345623',
  '+66912345678': '111111',
};

// 1) Use env vars (Expo exposes EXPO_PUBLIC_*)
const firebaseConfig = {
  apiKey: "AIzaSyBys91m4Jhb80wxhb8UYrUgZWNTMqT8i0A",
  authDomain: "leftlover-customer.firebaseapp.com",
  projectId: "leftlover-customer",
  appId: "1:121450093089:web:5b2389918ce73ac3836160",
}

// 2) Initialize once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)

export default function PhoneScreen() {
  const router = useRouter()
  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal>(null)

  const [localPhone, setLocalPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 3) Normalize TH number: allow either 9 digits (drop leading 0) or raw digits typed
  const digitsOnly = localPhone.replace(/\D/g, '').slice(0, 10) // keep up to 10 in case user types leading 0
  // If starts with '0' and length>=10, drop first 0; else if length>=9 assume already trimmed.
  const th9 = useMemo(() => {
    if (!digitsOnly) return ''
    if (digitsOnly.length === 10 && digitsOnly.startsWith('0')) return digitsOnly.slice(1) // 0xxxxxxxxx -> xxxxxxxxx
    if (digitsOnly.length >= 9) return digitsOnly.slice(0, 9)
    return digitsOnly
  }, [digitsOnly])

  const e164 = th9 ? `+66${th9}` : ''
  const canSubmit = th9.length === 9 && !loading

  const formatThaiLocal = (d: string) => {
    const raw = d.replace(/\D/g, '').slice(0, 10)
    // Show as xx-xxx-xxxx (ignoring any leading 0 visually)
    const vis = raw.startsWith('0') ? raw.slice(1) : raw
    const a = vis.slice(0, 2)
    const b = vis.slice(2, 5)
    const c = vis.slice(5, 9)
    return [a, b, c].filter(Boolean).join('-')
  }

  const onChangeLocal = (t: string) => setLocalPhone(formatThaiLocal(t))

  const onSubmit = async () => {
    if (!canSubmit) return
    setError(null)
    setLoading(true)
    try {
      // 4) Send OTP — if the number is added as a Firebase **test number**, SMS won’t be sent.
      const provider = new PhoneAuthProvider(auth)
      const verificationId = await provider.verifyPhoneNumber(e164, recaptchaRef.current)

      router.push({ pathname: '/(auth)/verify-phone', params: { verificationId, phone: e164 } })
    } catch (err) {
      console.error(err)
      setError(mapAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* 5) Use app.options and invisible challenge */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={app.options as any}
        attemptInvisibleVerification
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, padding: 25, gap: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', marginTop: 6 }}>Enter your phone number</Text>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
              <View style={{ width: 70, borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(38,189,104,0.05)', backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
                <Text style={{ color: '#9CA3AF', fontWeight: '600' }}>+66</Text>
              </View>

              <TextInput
                placeholder="xx-xxx-xxxx"
                value={localPhone}
                onChangeText={onChangeLocal}
                keyboardType="number-pad"
                returnKeyType="go"
                onSubmitEditing={onSubmit}
                style={{ flex: 1, borderWidth: 0.5, borderRadius: 10, padding: 12, backgroundColor: 'rgba(38, 189, 104, 0.2)', borderColor: 'rgba(38, 189, 104, 0.05)' }}
              />
            </View>

            {!!error && <Text style={{ color: '#B91C1C', fontSize: 12 }}>{error}</Text>}

            <TouchableOpacity disabled={!canSubmit} onPress={onSubmit}
              style={{ marginTop: 18, padding: 16, borderRadius: 12, backgroundColor: '#26BD68', opacity: canSubmit ? 1 : 0.5 }}>
              <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700' }}>
                {loading ? 'Sending...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}