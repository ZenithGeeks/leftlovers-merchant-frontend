import { SignOutButton } from '@/components/Authen/SignOutButton';
import { SignedIn, useUser } from '@clerk/clerk-expo';
import { StyleSheet, Text, View } from 'react-native';

export default function CheckCanLogin() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <SignedIn>
        <Text style={styles.title}>Hello</Text>
        <Text style={styles.subtitle}>
          {user?.emailAddresses?.[0]?.emailAddress || 'No email found'}
        </Text>
        <SignOutButton />
      </SignedIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  center: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    color: '#26BD68',
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  link: {
    color: '#26BD68',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
