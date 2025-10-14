import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatePills from './DatePills';
import { DateKey, Payout } from './types';
import { financeStyles as s } from './styles';
import { Colors } from '@/constants/theme';

type Props = {
  date: DateKey;
  onDateChange: (d: DateKey) => void;
  data: Payout;
};

export default function PayoutTab({ date, onDateChange, data }: Props) {
  return (
    <>
      

      <View style={[s.row, { marginTop: 8 }]}>
        <View>
          <Text style={s.label}>Balance</Text>
          <Text style={s.value}>{data.balanceTHB.toFixed(2)} THB</Text>
        </View>
        <View>
          <Text style={s.label}>Owe to Leftlovers</Text>
          <Text style={s.value}>{data.oweTHB.toFixed(2)} THB</Text>
        </View>
      </View>

      <Text style={[s.sectionTitle, { marginTop: 24 }]}>Payout details</Text>

      <View style={[s.row, { alignItems: 'flex-start', marginTop: 8 }]}>
        <View style={{ flexShrink: 1, paddingRight: 8 }}>
          <Text style={s.txTitle}>{data.detailDate}</Text>
          <Text style={s.muted}>{data.processedAt}</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.txAmount}>{data.amountTHB.toFixed(2)} THB</Text>
          <View style={s.badge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.light.tint} />
            <Text style={s.badgeText}>{data.status}</Text>
          </View>
        </View>
      </View>
    </>
  );
}
