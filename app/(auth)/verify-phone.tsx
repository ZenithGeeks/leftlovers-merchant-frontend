// app/(auth)/verify-phone.tsx
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
  updatePassword,
} from 'firebase/auth'
import React from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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
  const { verificationId, phone, flow, reset, newpw, next } = useLocalSearchParams<{
    verificationId: string
    phone: string
    flow?: string        // 'reset' | 'onboard' (from phone.tsx)
    reset?: string       // legacy: '1' means reset flow
    newpw?: string       // only for reset flow
    next?: string        // optional override for non-reset flow
  }>()
  const auth = getAuth()
  const router = useRouter()

  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  // guard
  React.useEffect(() => {
    if (!verificationId || !phone) router.replace('/(auth)/phone')
  }, [verificationId, phone])

  // dev autofill
  React.useEffect(() => {
    if (__DEV__ && phone && TEST_NUMBERS[phone]) {
      const c = TEST_NUMBERS[phone]
      setCode(c)
      setTimeout(() => onVerify(c), 0)
    }
  }, [phone])

  const isResetFlow = flow === 'reset' || reset === '1'

  const onVerify = async (override?: string) => {
    const useCode = (override ?? code).replace(/\D/g, '')
    if (!verificationId || useCode.length !== 6) return
    setError(null)
    setLoading(true)
    try {
      const cred = PhoneAuthProvider.credential(String(verificationId), useCode)
      const userCred = await signInWithCredential(auth, cred)

      if (isResetFlow) {
        // Forgot-password: update password then go to Sign in
        if (newpw && userCred.user) {
          await updatePassword(userCred.user, String(newpw))
          router.replace('/(auth)/signin')
        } else {
          Alert.alert('Password reset', 'Missing new password info.')
        }
        return
      }

      // Normal verification (signup/login)
      const dest = next && String(next).length ? String(next) : '/(auth)/store-info'
      router.replace(dest)
    } catch (err: any) {
      console.log('[verify]', err?.code, err?.message)
      setError(mapAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, padding: 25, gap: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center' }}>
              {isResetFlow ? 'Confirm password reset' : 'Verify your phone'}
            </Text>
            <Text style={{ color: '#6B7280', marginTop: 6, fontSize: 12, textAlign: 'center' }}>
              Please enter the OTP we just sent to your phone number {phone}
            </Text>

            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
              placeholder="xxxxxx"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={6}
              style={{
                marginTop: 16,
                paddingVertical: 12,
                paddingHorizontal: 14,
                fontSize: 18,
                letterSpacing: 4,
                textAlign: 'center',
                borderBottomWidth: 1,
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
              disabled={code.length !== 6 || loading}
              style={{
                marginTop: 18,
                backgroundColor: '#26BD68',
                paddingVertical: 14,
                borderRadius: 12,
                opacity: code.length === 6 && !loading ? 1 : 0.5,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>
                {loading ? 'Verifying…' : 'Verify'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace(isResetFlow ? '/(auth)/forgot-password' : '/(auth)/phone')}
              style={{ marginTop: 12 }}
            >
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
  )
}