import InformationCard from '@/components/Home/InformationCard';
import ShopStatusDropdown from '@/components/Home/Status-Dropdown';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { ChartBarIcon, HandRaisedIcon } from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ShopStatus = 'closed' | 'pause' | 'busy' | 'open';

const STATUS_OPTIONS = [
  { label: 'Closed', value: 'closed' as ShopStatus },
  { label: 'Pause',  value: 'pause'  as ShopStatus },
  { label: 'Busy',   value: 'busy'   as ShopStatus },
  { label: 'Open',   value: 'open'   as ShopStatus },
];

export default function HomeScreen() {
  const [status, setStatus] = useState<ShopStatus>('open');
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;

  // Dynamically scale horizontal padding
  const horizontalPadding = screenWidth * 0.04; // 4% of screen width

  return (
    <ThemedView
      style={[
        styles.screen,
        {
          paddingTop: insets.top + 10, // safe for notch
          paddingBottom: insets.bottom + 10,
          paddingHorizontal: horizontalPadding,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <ShopStatusDropdown
          value={status}
          onChange={(v) => setStatus(v as ShopStatus)}
          options={STATUS_OPTIONS}
          size="md"
        />
      </View>

      {/* Cards Row */}
      <View style={styles.cardsRow}>
        <InformationCard
          icon={HandRaisedIcon}
          count={0}
          label="Preparing"
          backgroundColor="#fff"
        />
        <InformationCard
          icon={ChartBarIcon}
          count={0}
          textColor='#fff'
          label="THB"
          backgroundColor={Colors.light.tint}
          IconBackground='#FECD4C'
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardsRow: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: Colors.light.border,
    padding: 10,
    borderWidth: 0.5,
    flexDirection: 'row',
    gap: 14, // works on RN 0.71+, otherwise use justifyContent:'space-between'
  },
});
