// app/(auth)/signup.tsx
import mockData from '@/mockupData/loginRegis.json'
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

const MOCK_AUTH = true

// ---------- Password helpers ----------
const checkPassword = (v: string) => ({
  length: v.length >= 8,
  upper: /[A-Z]/.test(v),
  lower: /[a-z]/.test(v),
  number: /[0-9]/.test(v),
  special: /[^A-Za-z0-9]/.test(v),
  nospace: !/\s/.test(v),
})

const isStrongPassword = (v: string) => {
  const r = checkPassword(v)
  return r.length && r.upper && r.lower && r.number && r.special && r.nospace
}

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)


  // ---------- MOCK USERS SETUP ----------
  const mockRegisteredEmails = React.useRef<Set<string>>(
    new Set(
      (mockData?.mockUsers ?? [])
        .filter((u) => u.status === 'registered')
        .map((u) => String(u.email).trim().toLowerCase())
    )
  )

  const mockCreateUser = async (email: string, pass: string) => {
    await new Promise((r) => setTimeout(r, 400)) // simulate latency
    const key = email.trim().toLowerCase()

    if (mockRegisteredEmails.current.has(key)) {
      const err = {
        errors: [{ code: 'identifier_already_exists', message: 'Email already in use' }],
      }
      throw err
    }

    // ✅ Mock success → add new email to "registered"
    mockRegisteredEmails.current.add(key)
    return { status: 'complete', createdSessionId: 'mock-session-id' }
  }


  // Validation Email 
  const isEmailAlreadyUsedError = (err: any) => {
  const errs = err?.errors ?? []
  return errs.some(
    (e: any) =>
      e?.code === 'form_identifier_exists' ||
      e?.code === 'identifier_already_exists' ||
      /already (in use|registered|exists)/i.test(e?.longMessage || e?.message || '')
  )
}

  // Validation
  const emailOk = /\S+@\S+\.\S+/.test(emailAddress.trim())
  const pwRules = checkPassword(password)
  const pwOk = isStrongPassword(password)
  const canSubmit = emailOk && pwOk && !loading

  const onSignUpPress = async () => {
    if (!isLoaded || loading) return
    setError(null)

    const email = emailAddress.trim()
    const pass = password.trim()

    if (!emailOk) {
      setError('Enter a valid email address.')
      return
    }
    if (!pwOk) {
      setError('Password does not meet all strength requirements.')
      return
    }

    setLoading(true)
    try {
      if (MOCK_AUTH) {
        // ---- MOCK MODE ----
        const res = await mockCreateUser(email, pass)
        if (res.status === 'complete') {
          setError(null)
          router.push('/(auth)/phone') // simulate next signup step
        }
      } else {
        // ---- REAL CLERK MODE ----
        const res = await signUp.create({ emailAddress: email, password: pass })

        if (res.status !== 'complete') {
          router.push('/(auth)/phone')
          return
        }

        await setActive({ session: res.createdSessionId })
        router.replace('/')
      }
    } catch (err: any) {
      if (isEmailAlreadyUsedError(err)) {
        setError('This email is already existed.')
      } else {
        const msg =
          err?.errors?.map((e: any) => e.longMessage || e.message).join('\n') ??
          'Unable to sign up.'
        setError(msg)
        console.error(JSON.stringify(err, null, 2))
      }
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
             {error ? <Text style={{ color: '#B91C1C', fontSize: 12, marginTop: -10 }}>{error}</Text> : null}

            {/* Password */}
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: '400', marginBottom: 6 }}>Password</Text>
              <TextInput
                placeholder="Enter password"
                value={password}
                onChangeText={(t) => setPassword(t.replace(/\s/g, ''))}
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
                }}
              />

              {/* Checklist */}
              <View style={{ marginTop: 8, gap: 4 }}>
                {[
                  { ok: pwRules.length, label: 'At least 8 characters' },
                  { ok: pwRules.upper, label: 'Contains uppercase letter (A–Z)' },
                  { ok: pwRules.lower, label: 'Contains lowercase letter (a–z)' },
                  { ok: pwRules.number, label: 'Contains a number (0–9)' },
                  { ok: pwRules.special, label: 'Contains special character (!@#$%)' },
                ].map((r) => (
                  <Text
                    key={r.label}
                    style={{ fontSize: 12, color: r.ok ? '#059669' : '#B91C1C' }}
                  >
                    {r.ok ? '✓' : '•'} {r.label}
                  </Text>
                ))}
              </View>
            </View>


            {/* button */}
            <TouchableOpacity
              disabled={!canSubmit}
              onPress={onSignUpPress}
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 10,
                backgroundColor: '#26BD68',
                borderWidth: 1,
                borderColor: '#26BD68',
                opacity: canSubmit ? 1 : 0.5,
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