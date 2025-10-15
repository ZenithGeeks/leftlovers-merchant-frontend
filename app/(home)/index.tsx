// app/index.tsx
import { SignOutButton } from '@/components/Authen/SignOutButton'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import React from 'react'
import {
  Image,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Page() {
  const { user } = useUser()
  const { width } = useWindowDimensions()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'} />

      {/* HERO */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: -20 }}>
        <Text
          accessibilityRole="header"
          style={{
            fontSize: 40,
            fontWeight: '800',
            color: '#2EA44F',
            textShadowColor: 'rgba(0,0,0,0.15)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 6,
            letterSpacing: 0.5,
            marginBottom: 6,
          }}
        >
          leftlovers
        </Text>

        <Image
          // change this path to your actual logo file
          source={require('@/assets/images/logo.jpg')}
          style={{
            width: 450,
            height: 450,
            resizeMode: 'contain',
            marginVertical: -35,
            zIndex: -1,
          }}
          accessible
          accessibilityLabel="Leftlovers logo"
        />

        <Text
          style={{
            fontSize: 36,
            fontWeight: '800',
            color: '#2EA44F',
            textShadowColor: 'rgba(0,0,0,0.15)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 6,
            marginBottom: 10,
          }}
        >
          Merchant
        </Text>
      </View>

      {/* FOOTER AUTH AREA */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 28,
          alignItems: 'center',
          gap: 10,
        }}
      >
        <SignedIn>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 16, color: '#111827' }}>
              Hello, {user?.emailAddresses?.[0]?.emailAddress}
            </Text>
            <SignOutButton />
          </View>
        </SignedIn>

        <SignedOut>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Link href="/(auth)/signin" asChild>
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#2EA44F',
                }}
              >
                <Text style={{ color: '#2EA44F', fontWeight: '700' }}>Start Your Journey</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </SignedOut>
      </View>
    </SafeAreaView>
  )
}
