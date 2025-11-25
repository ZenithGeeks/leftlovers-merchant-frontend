//Use for app/signin and app/signup
import { Link } from 'expo-router'
import React from 'react'
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

type AuthBoxProps = {
  title: string
  subtitle?: string
  email: string
  password: string
  setEmail: (text: string) => void
  setPassword: (text: string) => void
  onSubmit: () => void
  buttonLabel?: string
  footerText?: string
  footerLinkLabel?: string
  footerLinkHref?: string
}

export const AuthBox: React.FC<AuthBoxProps> = ({
  title,
  subtitle,
  email,
  password,
  setEmail,
  setPassword,
  onSubmit,
  buttonLabel,
  footerText,
  footerLinkLabel,
  footerLinkHref,
}) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ 
            flexGrow: 1, 
            justifyContent: 'flex-start', //align content at the top
            padding: 25,
            paddingTop: 40 //extra space from the top
        }}
        >
          <View style={{ gap: 16 }}>
            {/* Title & subtitle */}
            <Text style={{ textAlign: 'center', fontSize: 26, fontWeight: '700' }}>{title}</Text>
            {subtitle ? (
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: '300',
                  color: '#6B7280',
                }}
              >
                {subtitle}
              </Text>
            ) : null}

            {/* Email input */}
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: '400', marginBottom: 6 }}>Email</Text>
              <TextInput
                placeholder="Enter email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
                style={{
                  borderWidth: 0.5,
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: 'rgba(38, 189, 104, 0.15)',
                  borderColor: 'rgba(38, 189, 104, 0.1)',
                }}
              />
            </View>

            {/* Password input */}
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
                onSubmitEditing={onSubmit}
                style={{
                  borderWidth: 0.5,
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: 'rgba(38, 189, 104, 0.15)',
                  borderColor: 'rgba(38, 189, 104, 0.1)',
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

            {/* Submit button */}
            {buttonLabel && (
              <TouchableOpacity
                onPress={onSubmit}
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
                  {buttonLabel}
                </Text>
              </TouchableOpacity>
            )}

            {/* Footer */}
            {footerText && footerLinkLabel && footerLinkHref && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                  marginTop: 20,
                }}
              >
                <Text>{footerText}</Text>
                <Link href={footerLinkHref} asChild>
                  <TouchableOpacity>
                    <Text
                      style={{
                        fontWeight: '600',
                        fontSize: 12,
                        textDecorationLine: 'underline',
                        color: '#26BD68',
                      }}
                    >
                      {footerLinkLabel}
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}