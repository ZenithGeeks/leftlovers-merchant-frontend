import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const onSignUpPress = async () => {
  if (!isLoaded || loading) return
  setError(null)
  setLoading(true)

  try {
    const res = await signUp.create({ emailAddress, password })

    // If your instance unexpectedly completes here, just finish.
    if (res.status === 'complete') {
      await setActive({ session: res.createdSessionId })
      router.replace('/')
      return
    }

    // Continue to phone step
    router.push('/(auth)/phone')   // or router.push('phone') if this file is in app/(auth) too
  } catch (err: any) {
    const msg =
      err?.errors?.map((e: any) => e.longMessage || e.message).join('\n') ??
      'Unable to start sign up.'
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
                textContentType="newPassword"
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
                }}
              />
            </View>

            {error ? <Text style={{ color: '#B91C1C', fontSize: 12 }}>{error}</Text> : null}

            {/* button */}
            <TouchableOpacity
              disabled={loading}
              onPress={onSignUpPress}
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 10,
                backgroundColor: '#26BD68',
                borderWidth: 1,
                borderColor: '#26BD68',
                opacity: loading ? 0.6 : 1,
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