// app/(auth)/signin.tsx
import { ClickButton } from '@/components/Authen/ClickButton'
import { InputBox } from '@/components/Authen/InputBox'
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
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignInPage() {
  const router = useRouter()
  const { signIn, setActive, isLoaded } = useSignIn()

  // State
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  // Config
  const MOCK_AUTH = true
  const MOCK_USERS = mockData.mockUsers ?? []
  const MOCK_USER_MAP = new Map(MOCK_USERS.map((u) => [u.email.trim().toLowerCase(), u]))

  const onSignIn = async () => {
    const emailLower = email.trim().toLowerCase()

    if (!emailLower || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.')
      return
    }

    /* ---------- MOCK / OFFLINE SIGN-IN ---------- */
    if (MOCK_AUTH) {
      const user = MOCK_USER_MAP.get(emailLower)

      if (!user) {
        Alert.alert('Account not found', 'This email does not exist.')
        return
      }
      if ((user.status || '').toLowerCase() !== 'registered') {
        Alert.alert('Not registered', 'Please sign up first.')
        return
      }
      if (user.password !== password) {
        Alert.alert('Incorrect password', 'Please check your password and try again.')
        return
      }

      console.log('✅ Sign-in success for', emailLower)
      router.replace('/(tabs)/menu')
      return
    }

    /* ---------- REAL CLERK SIGN-IN ---------- */
    if (!isLoaded) return
    Keyboard.dismiss()

    try {
      const res = await signIn.create({ identifier: emailLower, password })
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId })
        router.replace('/')
      } else {
        Alert.alert('Sign-in', 'Additional steps required.')
      }
    } catch (err) {
      console.error('Sign-in error:', err)
      Alert.alert('Sign-in failed', 'Check your email/password and try again.')
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1,justifyContent: 'flex-start', paddingTop: 10 }}>
          <View style={{ flex: 1, padding: 25, gap: 16 }}>
            {/* Heading */}
            <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: '700' }}>Sign In</Text>
            <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '300', color: '#6B7280' }}>
              Hi, welcome back — you’ve been missed
            </Text>

            {/* Email */}
            <InputBox
              label="Email"
              placeholder="Enter email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
              containerTop={20}
              labelBottom={8}
            />

            {/* Password */}
            <InputBox
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={onSignIn}
              containerTop={16}
              labelBottom={8}
            />

            {/* Forgot password */}
            <View style={{ width: '100%', alignItems: 'flex-end', marginTop: 8 }}>
              <Link href="/(auth)/forgot-password">
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
              </Link>
            </View>

            {/* CTA */}
            <ClickButton label="Sign In" onPress={onSignIn} />

            {/* Footer */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 20 }}>
              <Text>Don't have an account?</Text>
              <Link href="/(auth)/signup">
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
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}