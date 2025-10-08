import { useSignUp } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import * as React from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function VerifyPhone() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const canVerify = code.length === 4

  const onVerify = async () => {
    if (!isLoaded || !canVerify) return
    setError(null)
    try {
      const attempt = await signUp.attemptPhoneNumberVerification({ code })
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId })
        router.replace('/')
      } else {
        console.log('Not complete:', JSON.stringify(attempt, null, 2))
      }
    } catch (err: any) {
      const msg =
        err?.errors?.map((e: any) => e.longMessage || e.message).join('\n') ||
        'Invalid code. Try again.'
      setError(msg)
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, padding: 25, gap: 16 }}>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Registration#3 /merchant</Text>
            <Text style={{ fontSize: 26, fontWeight: '700', marginTop: 6 }}>Verify your phone</Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              Enter the 4-digit code we sent via SMS
            </Text>

            <View style={{ marginTop: 10 }}>
              <TextInput
                placeholder="1234"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="go"
                onSubmitEditing={onVerify}
                style={{
                  borderWidth: 0.5,
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: 'rgba(38, 189, 104, 0.2)',
                  borderColor: 'rgba(38, 189, 104, 0.05)',
                  textAlign: 'center',
                  fontSize: 18,
                  letterSpacing: 6,
                }}
              />
            </View>

            {error ? <Text style={{ color: '#B91C1C', fontSize: 12 }}>{error}</Text> : null}

            <TouchableOpacity
              disabled={!canVerify}
              onPress={onVerify}
              style={{
                marginTop: 18,
                padding: 16,
                borderRadius: 12,
                backgroundColor: '#26BD68',
                opacity: canVerify ? 1 : 0.5,
              }}
            >
              <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700' }}>Verify</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
