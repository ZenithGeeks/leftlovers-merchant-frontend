import { useRouter } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function FinishSignUp() {
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* App Name */}
      <Text
        style={{
          fontSize: 40,
          fontWeight: '800',
          color: '#2EA44F',
          textShadowColor: 'rgba(0,0,0,0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
          letterSpacing: 0,
        }}
      >
        leftlovers
      </Text>

      {/* Logo image (replace with your image path) */}
      <Image
        source={require('@/assets/images/logo.jpg')} // change path to match your logo file
        style={{
          width: 350,
          height: 350,
          resizeMode: 'contain',
          marginVertical: -35,
          zIndex: -1,
        }}
      />

      {/* Subtitle */}
      <Text
        style={{
          fontSize: 40,
          fontWeight: '800',
          color: '#2EA44F',
          textShadowColor: 'rgba(0,0,0,0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
          marginBottom: 28,
        }}
      >
        Merchant
      </Text>

      {/* Notification box */}
      <View
        style={{
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 14,
          padding: 20,
          backgroundColor: '#fff',
          width: '100%',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6 }}>
          We’ve received your details!
        </Text>
        <Text style={{ color: '#4B5563', fontSize: 14, lineHeight: 20 }}>
          Please wait while we review your application. You’ll get a notification once it’s approved.
        </Text>

        <TouchableOpacity
  onPress={() => router.replace('/(auth)/signin')}
  activeOpacity={0.7}
  style={{
    alignSelf: 'center',
    marginTop: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2EA44F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  }}
>
  <Text style={{ color: '#fff', fontSize: 24 }}>✓</Text>
</TouchableOpacity>

      </View>


    </SafeAreaView>
  )
}