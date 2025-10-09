import { SignOutButton } from '@/components/Authen/SignOutButton'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View } from 'react-native'

export default function Page() {
  const { user } = useUser()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'flex-end', // 👈 pushes content down
        alignItems: 'center',
        paddingBottom: 60,          // space from bottom edge
      }}
    >
      <SignedIn>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>
            Hello, {user?.emailAddresses[0].emailAddress}
          </Text>
          <SignOutButton />
        </View>
      </SignedIn>

      <SignedOut>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Link href="/(auth)/signin">
            <Text style={{ fontSize: 16, color: '#26BD68', textDecorationLine: 'underline' }}>
              Sign in
            </Text>
          </Link>
          <Link href="/(auth)/signup">
            <Text style={{ fontSize: 16, color: '#26BD68', textDecorationLine: 'underline' }}>
              Sign up
            </Text>
          </Link>
        </View>
      </SignedOut>
    </View>
  )
}
