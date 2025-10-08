import { useSignUp } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import * as React from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function PhoneScreen() {
  const { isLoaded, signUp } = useSignUp()
  const router = useRouter()

  const [localPhone, setLocalPhone] = React.useState('') // formatted like "xx-xxx-xxxx"
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  // keep only digits (max 9 for TH without the leading 0)
  const digits = localPhone.replace(/\D/g, '').slice(0, 9)

  // format as xx-xxx-xxxx
  const formatThaiLocal = (d: string) => {
    if (!d) return ''
    const a = d.slice(0, 2)
    const b = d.slice(2, 5)
    const c = d.slice(5, 9)
    return [a, b, c].filter(Boolean).join('-')
  }

  const onChangeLocal = (t: string) => setLocalPhone(formatThaiLocal(t.replace(/\D/g, '')))

  // build E.164 (+66… without the leading 0)
  const e164 = digits.length ? `+66${digits}` : ''
  const canSubmit = digits.length === 9 && !loading

  const onSubmit = async () => {
    if (!isLoaded || !canSubmit) return
    setError(null)
    setLoading(true)
    try {
      // attach phone to the in-progress sign up from step #1
      await signUp.update({ phoneNumber: e164 })

      // send SMS (4-digit on your instance)
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' })

      router.push('/(auth)/verify-phone') // go to the 4-digit code page
    } catch (err: any) {
      const msg =
        err?.errors?.map((e: any) => e.longMessage || e.message).join('\n') ||
        'Could not send code.'
      setError(msg)
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
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
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Registration#2 /merchant</Text>

            <Text style={{ fontSize: 26, fontWeight: '700', marginTop: 6 }}>
              Enter your phone number
            </Text>

            {/* country + number row */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
              <View
                style={{
                  width: 70,
                  borderRadius: 10,
                  borderWidth: 0.5,
                  borderColor: 'rgba(38,189,104,0.05)',
                  backgroundColor: '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: '#9CA3AF', fontWeight: '600' }}>+66</Text>
              </View>

              <TextInput
                placeholder="xx-xxx-xxxx"
                value={localPhone}
                onChangeText={onChangeLocal}
                keyboardType="number-pad"
                returnKeyType="go"
                onSubmitEditing={onSubmit}
                style={{
                  flex: 1,
                  borderWidth: 0.5,
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: 'rgba(38, 189, 104, 0.2)',
                  borderColor: 'rgba(38, 189, 104, 0.05)',
                }}
              />
            </View>

            {error ? <Text style={{ color: '#B91C1C', fontSize: 12 }}>{error}</Text> : null}

            <TouchableOpacity
              disabled={!canSubmit}
              onPress={onSubmit}
              style={{
                marginTop: 18,
                padding: 16,
                borderRadius: 12,
                backgroundColor: '#26BD68',
                opacity: canSubmit ? 1 : 0.5,
              }}
            >
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
