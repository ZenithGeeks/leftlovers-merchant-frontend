import { useLocalSearchParams, useRouter } from 'expo-router'
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth'
import React from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function VerifyPhone() {
  const { verificationId, phone } = useLocalSearchParams<{ verificationId: string; phone: string }>()
  const auth = getAuth()
  const router = useRouter()

  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const canVerify = code.length === 6

  const onVerify = async () => {
    if (!verificationId || !canVerify) return
    setError(null)
    try {
      const credential = PhoneAuthProvider.credential(verificationId as string, code)
      await signInWithCredential(auth, credential) // ✅ ยืนยันสำเร็จ (ด้วยเบอร์ test ไม่ต้องมี SMS จริง)

      // TODO: อัปเดต backend/Clerk metadata ของ user ให้รู้ว่าเบอร์นี้ verified แล้ว
      // เช่น POST ไปที่ API ของคุณเพื่อบันทึก phone และสถานะ verified
      router.replace('/')  // หรือไปหน้าถัดไป
    } catch (err: any) {
      setError(err?.message || 'Invalid code. Try again.')
      console.error(err)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, padding: 25, gap: 16 }}>
            <Text style={{ fontSize: 26, fontWeight: '700', marginTop: 6 }}>Verify your phone</Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>Enter the 6-digit code sent to {phone}</Text>

            <TextInput
              placeholder="123456"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="go"
              onSubmitEditing={onVerify}
              style={{ borderWidth: 0.5, borderRadius: 10, padding: 12, backgroundColor: 'rgba(38, 189, 104, 0.2)', borderColor: 'rgba(38, 189, 104, 0.05)', textAlign: 'center', fontSize: 18, letterSpacing: 4 }}
            />

            {error ? <Text style={{ color: '#B91C1C', fontSize: 12 }}>{error}</Text> : null}

            <TouchableOpacity disabled={!canVerify} onPress={onVerify}
              style={{ marginTop: 18, padding: 16, borderRadius: 12, backgroundColor: '#26BD68', opacity: canVerify ? 1 : 0.5 }}>
              <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700' }}>Verify</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
