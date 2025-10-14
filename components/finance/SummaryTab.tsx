import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '@/constants/theme';
import { financeStyles as s } from './styles';

export default function SummaryTab() {
  return (
    <>
      <View style={{ marginTop: 24 }}>
        <Text style={s.label}>Net Sales</Text>
        <Text style={s.value}>+ 2000.00</Text>

        <Text style={[s.label, { marginTop: 16 }]}>Earnings</Text>
        <Text style={s.value}>+ 1500.00</Text>
      </View>

      <Text style={s.sectionTitle}>Summary Details</Text>

      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.iconCircle}>
            <Ionicons name="restaurant" size={20} color={Colors.light.tint} />
          </View>
          <Text style={s.cardTitle}>Food</Text>
        </View>

        <View style={s.row}>
          <Text style={s.rowLabel}>Net Sales</Text>
          <Text style={s.rowValue}>2000.00</Text>
        </View>
        <View style={s.row}>
          <Text style={s.rowLabel}>Deduction</Text>
          <Text style={s.rowValue}>500.00</Text>
        </View>
        <View style={s.row}>
          <Text style={[s.rowLabel, { fontFamily: Fonts.bold }]}>Net earnings</Text>
          <Text style={[s.rowValue, { fontFamily: Fonts.bold }]}>+1500.00</Text>
        </View>
      </View>
    </>
  );
}
