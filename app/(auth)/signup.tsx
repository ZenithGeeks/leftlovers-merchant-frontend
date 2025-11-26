// app/(auth)/signup.tsx
import { ClickButton } from '@/components/Authen/ClickButton'
import { InputBox } from '@/components/Authen/InputBox'
import mockData from '@/mockupData/loginRegis.json'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
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

  // Live password rules (recomputed when `password` changes)
  const pwRules = React.useMemo(() => checkPassword(password), [password])

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
<<<<<<< Updated upstream
    mockRegisteredEmails.current.add(key)
    return { status: 'complete', createdSessionId: 'mock-session-id' }
=======

    const normEmail = email.trim().toLowerCase();
    if (!isValidEmail(normEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (!password) {
      Alert.alert("Missing fields", "Enter password");
      return;
    }
    if (!passwordValid) {
      Alert.alert("Weak password", "Please meet password requirements.");
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress: normEmail,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      setCanResend(true);
      setResendCooldown(60);
    } catch (err: any) {
      console.error("SignUp error:", err);
      Alert.alert(
        "Sign up failed",
        err?.errors?.[0]?.message ?? err?.message ?? "Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================================ RESEND ================================ */
  const handleResend = async () => {
    if (!signUpLoaded || !canResend || resendCooldown > 0) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResendCooldown(30);
      Alert.alert("Code sent", "We sent the code again to your email.");
    } catch (err: any) {
      console.warn("Resend failed:", err);
      Alert.alert("Resend failed", err?.message ?? "Unable to resend.");
    }
  };

  /* =========================== VERIFY EMAIL CODE ========================== */
  const handleVerifyCode = async () => {
    if (!signUpLoaded) {
      Alert.alert("Please wait", "Auth not ready yet");
      return;
    }
    if (!verificationCode) {
      Alert.alert("Missing code", "Enter your email verification code");
      return;
    }

    setLoading(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      await signUp.reload();

      // If Clerk created a session, activate it
      const createdSessionId =
        res?.createdSessionId ?? (signUp as any)?.createdSessionId ?? null;
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }

      // Prepare backend payload
      const name = fullName.trim();
      const emailLower = email.trim().toLowerCase();

      ////////////////////////joy fix//////////////////////
          // Create merchant user row in backend
    try {
      await createMerchant({
        name,
        email: emailLower,
        phone: localPhone || undefined,
        avatarUrl: null,
        
      });
      console.log("Backend merchant user created (email/password)");
    } catch (e: any) {
      console.warn("Create merchant user failed:", e);
      Alert.alert(
        "Account note",
        e?.message ?? "We couldn't finish account setup, but you can continue."
      );
    }
/////////////////////////joy fix end//////////////////////

      router.replace({ pathname: "/(auth)/storeInfo", params: { userId: user?.id } });
    } catch (err: any) {
      console.error("Verification error:", err);
      Alert.alert(
        "Verification failed",
        err?.errors?.[0]?.message ?? err?.message ?? "Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================================= Renders ================================ */
  if (pendingVerification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF", padding: 28 }}>
        <Text style={{ fontSize: 24, fontFamily: "Poppins_700Bold", textAlign: "center" }}>
          Enter Verification Code
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            textAlign: "center",
            color: "#6B7280",
            fontFamily: "Poppins_400Regular",
          }}
        >
          We sent a 6-digit code to your email address {email.trim().toLowerCase()}
        </Text>

        <OtpInput value={verificationCode} setValue={setVerificationCode} />

        <ClickButton
          label="Verify"
          onPress={handleVerifyCode}
          loading={loading}
          style={{ marginTop: 30 }}
        />

        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ fontFamily: "Poppins_400Regular" }}>Didn’t receive code?</Text>
          <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0}>
            <Text
              style={{
                textDecorationLine: "underline",
                color: resendCooldown > 0 ? "#9CA3AF" : "#26BD68",
                marginTop: 8,
                fontFamily: "Poppins_400Regular",
              }}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
>>>>>>> Stashed changes
  }

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
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1,justifyContent: 'flex-start', paddingTop: 10  }}>
          <View style={{ flex: 1, padding: 25, gap: 16 }}>
            {/* Heading */}
            <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: '700' }}>
              Create an account
            </Text>
            <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '300', color: '#6B7280' }}>
              Take the first step.
            </Text>
            <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '300', color: '#6B7280', marginTop: -10}}>
              Fill your information below to register
            </Text>

            {/* Email */}
            <InputBox
              label="Email"
              placeholder="Enter email"
              value={emailAddress}
              onChangeText={setEmailAddress}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
              containerTop={20}
              labelBottom={8}
          
            />
            {!!error && !emailOk && (
              <Text style={{ color: '#B91C1C', fontSize: 12, marginTop: -6 }}>{error}</Text>
            )}

            {/* Password */}
            <InputBox
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={(t) => setPassword(t.replace(/\s/g, ''))}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={onSignUpPress}
              containerTop={16}
              labelBottom={8}
          
            />

            {/* Password checklist (hidden until typing or error) */}
            {(password.length > 0 || !!error) ? (
              <View style={{ marginTop: 8, gap: 4 }}>
                {error ? (
                  <Text style={{ color: '#B91C1C', fontSize: 12, marginBottom: 4 }}>{error}</Text>
                ) : null}

                {[
                  { ok: pwRules.length, label: 'At least 8 characters' },
                  { ok: pwRules.upper,  label: 'Contains uppercase letter (A–Z)' },
                  { ok: pwRules.lower,  label: 'Contains lowercase letter (a–z)' },
                  { ok: pwRules.number, label: 'Contains a number (0–9)' },
                  { ok: pwRules.special,label: 'Contains special character (!@#$%)' },
                ].map((r) => (
                  <Text key={r.label} style={{ fontSize: 12, color: r.ok ? '#059669' : '#B91C1C' }}>
                    {r.ok ? '✓' : '•'} {r.label}
                  </Text>
                ))}
              </View>
            ) : null}

            {/* CTA */}
            <ClickButton
              label={loading ? 'Creating…' : 'Continue'}
              onPress={onSignUpPress}
              disabled={!canSubmit}
            />

            {/* Footer */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 20 }}>
              <Text>Already have an account?</Text>
              <Link href="/(auth)/signin">
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
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}