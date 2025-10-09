// app/(auth)/verify-phone.tsx
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth'
import React from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

const TEST_NUMBERS: Record<string, string> = {
  '+66655453321': '', //345623
  '+66912345678': '', //111111
}

const mapAuthError = (err: any) => {
  const s = String(err?.code || err?.message || '')
  if (s.includes('invalid-verification-code')) return 'The code is incorrect or expired. Please request a new one.'
  if (s.includes('session-expired')) return 'The verification session has expired. Please request a new code.'
  if (s.includes('too-many-requests')) return 'Too many attempts. Please wait a bit and try again.'
  return 'Something went wrong. Please try again.'
}

export default function VerifyPhone() {
  const { verificationId, phone } = useLocalSearchParams<{ verificationId: string; phone: string }>()
  const auth = getAuth()
  const router = useRouter()

  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!verificationId || !phone) router.replace('/(auth)/phone')
  }, [verificationId, phone])

  // Auto-fill & optional auto-submit for test numbers (dev only)
  React.useEffect(() => {
    if (__DEV__ && phone && TEST_NUMBERS[phone]) {
      const c = TEST_NUMBERS[phone]
      setCode(c)
      setTimeout(() => onVerify(c), 0)
    }
  }, [phone])

  const onVerify = async (override?: string) => {
    const useCode = (override ?? code).replace(/\D/g, '')
    if (!verificationId || useCode.length !== 6) return
    setError(null)
    try {
      const cred = PhoneAuthProvider.credential(String(verificationId), useCode)
      await signInWithCredential(auth, cred)
      router.replace('/')
    } catch (err: any) {
      console.log('[verify]', err?.code, err?.message)
      setError(mapAuthError(err))
    }
  }

  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        {/* centered column, no card */}
        <View style={{ flex: 1, padding: 25, gap: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', textAlign: 'center' }}>
            Verify your phone
          </Text>
          <Text style={{ color: '#6B7280', marginTop: 6, fontSize: 12, textAlign: 'center' }}>
            Please enter the OTP we just sent to your phone number {phone}
          </Text>

          <TextInput
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={6}
            // simple input, no box styling
            style={{
              marginTop: 16,
              paddingVertical: 12,
              paddingHorizontal: 14,
              fontSize: 18,
              letterSpacing: 4,
              textAlign: 'center',
              borderBottomWidth: 1,     // subtle underline only
              borderColor: '#E5E7EB',
            }}
          />

          {!!error && (
            <Text style={{ color: '#B91C1C', marginTop: 10, textAlign: 'center' }}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            onPress={() => onVerify()}
            disabled={code.length !== 6}
            style={{
              marginTop: 18,
              backgroundColor: '#26BD68',
              paddingVertical: 14,
              borderRadius: 12,
              opacity: code.length === 6 ? 1 : 0.5,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>
              Verify
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/phone')} style={{ marginTop: 12 }}>
            <Text style={{ textAlign: 'center', fontWeight: '300', color: '#111827' }}>
              Didn’t receive OTP?
            </Text>
            <Text style={{ textAlign: 'center', fontWeight: '500', color: '#26BD68', textDecorationLine: 'underline' }}>
              Resend OTP Again
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}