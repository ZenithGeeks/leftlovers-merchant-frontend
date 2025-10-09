import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const validateEmail = (e: string) => /\S+@\S+\.\S+/.test(e.trim())
  const canSubmit = validateEmail(emailAddress) && password.trim().length >= 8


  const onSignUpPress = async () => {
  if (!isLoaded || loading) return
  setError(null)

  const email = emailAddress.trim()
  const pass  = password.trim()

  if (!validateEmail(email)) {
    setError('Enter a valid email address.')
    return
  }
  if (pass.length < 8) {
    setError('Password must be at least 8 characters.')
    return
  }

  setLoading(true)
  try {
    const res = await signUp.create({ emailAddress: email, password: pass })

    // go to phone step (we’ll attach phone & send SMS there)
    if (res.status !== 'complete') {
      router.push('/(auth)/phone')
      return
    }

    // if your instance completes immediately
    await setActive({ session: res.createdSessionId })
    router.replace('/')
  } catch (err: any) {
    const msg = err?.errors?.map((e: any) => e.longMessage || e.message).join('\n') ?? 'Unable to sign up.'
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
          <View style={{ flex: 1, padding: 25, justifyContent: 'flex-start', gap: 16 }}>
            <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: '600' }}>
              Create an account
            </Text>
            <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '200', marginTop: 3 }}>
              Take the first step. Fill your information below to register
            </Text>

            {/* Email */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: '400', marginBottom: 6 }}>Email</Text>
              <TextInput
                placeholder="Enter email"
                value={emailAddress}
                onChangeText={setEmailAddress}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
                style={{
                  borderWidth: 0.5,
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: 'rgba(38, 189, 104, 0.2)',
                  borderColor: 'rgba(38, 189, 104, 0.05)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 0.5 },
                  shadowOpacity: 0.05,
                  shadowRadius: 0.1,
                  letterSpacing: 0
                }}
              />
            </View>

            {/* Password */}
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: '400', marginBottom: 6 }}>Password</Text>
              <TextInput
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={onSignUpPress}
                style={{
                  borderWidth: 0.5,
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: 'rgba(38, 189, 104, 0.2)',
                  borderColor: 'rgba(38, 189, 104, 0.05)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 0.5 },
                  shadowOpacity: 0.05,
                  shadowRadius: 0.1,
                  letterSpacing: 0
                }}
              />
            </View>

            {error ? <Text style={{ color: '#B91C1C', fontSize: 12 }}>{error}</Text> : null}

            {/* button */}
            <TouchableOpacity
              disabled={loading || !canSubmit}
              onPress={onSignUpPress}
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 10,
                backgroundColor: '#26BD68',
                borderWidth: 1,
                borderColor: '#26BD68',
                opacity: loading || !canSubmit ? 0.6 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 0.5 },
                shadowOpacity: 0.05,
                shadowRadius: 0.1,
              }}
            >
              <Text style={{ textAlign: 'center', fontWeight: '600', color: '#FFFFFF' }}>
                {loading ? 'Creating...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            {/* footer */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 20 }}>
              <Text>Already have an account?</Text>
              <Link href="/(auth)/signin" asChild>
                <TouchableOpacity>
                  <Text
                    style={{
                      fontWeight: '600',
                      fontSize: 12,
                      textDecorationLine: 'underline',
                      color: '#26BD68',
                    }}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}