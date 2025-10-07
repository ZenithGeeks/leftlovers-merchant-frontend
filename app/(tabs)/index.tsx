import ShopStatusDropdown from '@/components/Home/Status-Dropdown';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  const [status, setStatus] = useState<'closed'|'pause'|'busy'|'open'>('open');
  return (
      <ThemedView style={styles.titleContainer}>
        <ShopStatusDropdown
        value={status}
        onChange={(v: string) => setStatus(v as any)}
        options={[
          { label: 'Closed', value: 'closed' },
          { label: 'Pause',  value: 'pause' },
          { label: 'Busy',   value: 'busy' },
          { label: 'Open',   value: 'open' },
        ]}
        size="md"
      />
      </ThemedView>
  );
}
const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 90,
    gap: 8,
    width: '100%',
    height: '100%',
  },
});
