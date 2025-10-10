import mockData from '@/mockupData/loginRegis.json'
import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

/* ---------------- MOCK AUTH SETUP ---------------- */
const MOCK_AUTH = true // set false when using real Clerk backend

const MOCK_USERS = mockData.mockUsers ?? []
const MOCK_USER_MAP = new Map(
  MOCK_USERS.map((u) => [u.email.trim().toLowerCase(), u])
)

const TEST_NUMBERS: Record<string, string> = mockData.TEST_NUMBERS || {}
const EMAIL_TO_PHONE: Record<string, string> = Object.fromEntries(
  MOCK_USERS
    .filter((u) => (u.status || '').toLowerCase() === 'registered')
    .map((u) => [u.email, u.phone])
)
/* ------------------------------------------------- */

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  const onSignInPress = async () => {
    // Quick dev backdoor
    if (__DEV__ && emailAddress === 'test@mock.com' && password === 'mockpass') {
      console.log('Mock sign-in successful (dev backdoor)')
      router.replace('/(tabs)/menu')
      return
    }

    // Basic validation
    const email = emailAddress.trim().toLowerCase()
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.')
      return
    }

    /* ---------- MOCK / OFFLINE SIGN-IN ---------- */
    if (MOCK_AUTH) {
      const user = MOCK_USER_MAP.get(email)
      if (!user) {
        Alert.alert('Account not found', 'This email is not in mock data.')
        return
      }

      const isRegistered = (user.status || '').toLowerCase() === 'registered'
      if (!isRegistered) {
        Alert.alert(
          'Not registered',
          'This email is not registered yet. Please sign up first.'
        )
        return
      }

      if (user.password !== password) {
        Alert.alert('Incorrect password', 'Please check your password and try again.')
        return
      }

      // Success
      console.log('✅ MOCK sign-in success for', email)
      router.replace('/(tabs)/menu') // or '/' — your main screen
      return
    }

    /* ---------- REAL CLERK SIGN-IN ---------- */
    if (!isLoaded) return
    Keyboard.dismiss()

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        console.log('Sign-in incomplete:', JSON.stringify(signInAttempt, null, 2))
        Alert.alert('Sign-in', 'Additional steps required.')
      }
    } catch (err) {
      console.error('Sign-in error:', JSON.stringify(err, null, 2))
      Alert.alert('Sign-in failed', 'Check your email/password and try again.')
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
            <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: '600' }}>Sign In</Text>
            <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '200', marginTop: 3 }}>
              Hi, welcome back — you’ve been missed
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
                }}
              />
            </View>

            {/* Password */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: '400', marginBottom: 6 }}>Password</Text>
              <TextInput
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={onSignInPress}
                style={{
                  borderWidth: 0.5,
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: 'rgba(38, 189, 104, 0.2)',
                  borderColor: 'rgba(38, 189, 104, 0.05)',
                }}
              />
            </View>

            {/* Forgot password */}
            <View style={{ width: '100%', alignItems: 'flex-end', marginTop: 8 }}>
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity>
                  <Text
                    style={{
                      fontWeight: '400',
                      fontSize: 12,
                      textDecorationLine: 'underline',
                      color: '#26BD68',
                    }}
                  >
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={onSignInPress}
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 10,
                backgroundColor: '#26BD68',
                borderWidth: 1,
                borderColor: '#26BD68',
              }}
            >
              <Text style={{ textAlign: 'center', fontWeight: '600', color: '#FFFFFF' }}>
                Sign In
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 20 }}>
              <Text>Don't have an account?</Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text
                    style={{
                      fontWeight: '600',
                      fontSize: 12,
                      textDecorationLine: 'underline',
                      color: '#26BD68',
                    }}
                  >
                    Sign Up
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
