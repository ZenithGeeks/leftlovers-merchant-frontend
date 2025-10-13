// app/(auth)/verify-phone.tsx
import mockData from '@/mockupData/loginRegis.json'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
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

const MOCK_AUTH = false // 🔹 ใช้ Firebase จริง
const TEST_NUMBERS: Record<string, string> = mockData.TEST_NUMBERS || {}

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
    flow?: string
    reset?: string
    newpw?: string
    next?: string
  }>()
  const auth = getAuth()
  const router = useRouter()

  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  // 🔹 ป้องกันเข้าโดยตรงโดยไม่มีข้อมูล
  React.useEffect(() => {
    if (!verificationId || !phone) router.replace('/(auth)/phone')
  }, [verificationId, phone])

  const isResetFlow = flow === 'reset' || reset === '1'

  // 🔹 ฟังก์ชันยืนยัน OTP
  const onVerify = async () => {
    const useCode = code.replace(/\D/g, '')
    if (useCode.length !== 6) return
    setError(null)
    setLoading(true)

    try {
      if (MOCK_AUTH) {
        // ---- MOCK ----
        const expectedCode = TEST_NUMBERS[phone.trim()]
        if (!expectedCode || useCode !== expectedCode) {
          setError('Invalid verification code.')
          return
        }
        Alert.alert('Verified successfully!')
        router.replace('/(auth)/signin')
        return
      }

      // ---- REAL FIREBASE ----
      if (!verificationId) return
      const cred = PhoneAuthProvider.credential(String(verificationId), useCode)
      await signInWithCredential(auth, cred)

      if (isResetFlow && newpw) {
        await updatePassword(auth.currentUser!, String(newpw))
        Alert.alert('Password reset', 'Your password has been updated.')
      } else {
        Alert.alert('Verification complete', 'Your phone number has been verified.')
      }

      // ✅ หลังยืนยันเสร็จ → ไปหน้า Sign In
      router.replace('/(auth)/signin')
    } catch (err: any) {
      console.log('[verify]', err?.code, err?.message)
      setError(mapAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* 🔹 ซ่อนหัวข้อ verify-phone */}
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, padding: 25, gap: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center' }}>
              {isResetFlow ? 'Confirm password reset' : 'Verify your phone'}
            </Text>
            <Text style={{ color: '#6B7280', marginTop: 6, fontSize: 12, textAlign: 'center' }}>
              Please enter the OTP sent to your phone number {phone}
            </Text>

            {/* 🔹 Input OTP */}
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
              placeholder="xxxxxx"
              keyboardType="number-pad"
              textContentType="none" // ❌ ปิด autofill
              autoComplete="off" // ❌ ปิด autofill
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

            {/* 🔹 ปุ่ม Verify */}
            <TouchableOpacity
              onPress={onVerify}
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

            {/* 🔹 ปุ่ม Resend */}
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/phone')}
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