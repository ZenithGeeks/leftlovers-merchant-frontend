import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const DEV_DEFAULTS = __DEV__
  ? { email: 'test@mock.com', password: 'mockpass' } // 👈 fake user for local test
  : { email: '', password: '' }
  
export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  const onSignInPress = async () => {

    // 🔹 If dev mode, skip real Clerk and mock sign in
    if (__DEV__ && emailAddress === 'test@mock.com' && password === 'mockpass') {
      console.log('Mock sign-in successful')
      router.replace('/(tabs)/menu') // your app's main page
      return
    }

    if (!isLoaded) return
    Keyboard.dismiss()

    // guard against empty fields / whitespace
    if (!emailAddress.trim() || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.')
      return
    }

    try {
      console.log('DEBUG:', { emailAddress, passwordLength: password.length })
      const signInAttempt = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        console.log('Sign-in incomplete:', JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      console.error('Sign-in error:', JSON.stringify(err, null, 2))
      Alert.alert('Sign-in failed', 'Check your email/password and try again.')
    }
  }

  /*return (
    
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 20, gap: 20 }}>
      <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: '600', marginBottom: -7 }}>Sign In</Text>
      <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '200' }}>Hi Welcome back, you’ve been missed</Text>

      <Text style={{ textAlign: 'left', fontSize: 15, fontWeight: '400', marginBottom: -12  }}>Email</Text>
      <TextInput
        placeholder="Enter email"
        value={emailAddress}
        onChangeText={setEmailAddress}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
        style={{ borderWidth: 0.5, borderRadius: 8, padding: 12, backgroundColor: 'rgba(38, 189, 104, 0.2)', borderColor: 'rgba(38, 189, 104, 0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 0.5 }, shadowOpacity: 0.05, shadowRadius: 0.1}}      
      />

      <Text style={{ textAlign: 'left', fontSize: 15, fontWeight: '400', marginBottom: -12 }}>Password</Text>
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
        style={{ borderWidth: 0.5, borderRadius: 8, padding: 12, backgroundColor: 'rgba(38, 189, 104, 0.2)', borderColor: 'rgba(38, 189, 104, 0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 0.5 }, shadowOpacity: 0.05, shadowRadius: 0.1}}
      />

      <View style={{ width: '100%', alignItems: 'flex-end' }}>
        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity>
            <Text style={{ fontWeight: '400', fontSize: 12, textDecorationLine: 'underline', color: '#26BD68', marginTop: -7 }}>Forgot password?</Text>
        </TouchableOpacity>
        </Link>
      </View>

    
      <TouchableOpacity onPress={onSignInPress} style={{ padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#26BD68', backgroundColor: '#26BD68', shadowColor: '#000', shadowOffset: { width: 0, height: 0.5 }, shadowOpacity: 0.05, shadowRadius: 0.1, marginTop: 10 }}>
        <Text style={{ textAlign: 'center', fontWeight: '600', color: '#FFFFFF'  }}>Sign In</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, padding: 20  }}>
        <Text>Don't have an account?</Text>
        <Link href="/sign-up"><Text style={{ fontWeight: '600', fontSize: 12, textDecorationLine: 'underline', color: '#26BD68' }}>Sign up</Text></Link>
      </View>
    </View>
  )
}*/

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
            Hi Welcome back, you’ve been missed
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
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 0.5 },
                shadowOpacity: 0.05,
                shadowRadius: 0.1,
                letterSpacing: 0
              }}
            />
          </View>

          {/* forgot password */}
          <View style={{ width: '100%', alignItems: 'flex-end', marginTop: 8 }}>
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text style={{ fontWeight: '400', fontSize: 12, textDecorationLine: 'underline', color: '#26BD68' }}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* button */}
          <TouchableOpacity
            onPress={onSignInPress}
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#26BD68',
              borderWidth: 1,
              borderColor: '#26BD68',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 0.5 },
              shadowOpacity: 0.05,
              shadowRadius: 0.1,
            }}
          >
            <Text style={{ textAlign: 'center', fontWeight: '600', color: '#FFFFFF' }}>Sign In</Text>
          </TouchableOpacity>

          {/* footer */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 20 }}>
            <Text>Don't have an account?</Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={{ fontWeight: '600', fontSize: 12, textDecorationLine: 'underline', color: '#26BD68' }}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}