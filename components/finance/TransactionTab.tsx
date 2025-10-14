import React from 'react';
import { Text, View } from 'react-native';
import DatePills from './DatePills';
import { DateKey, Transaction } from './types';
import { financeStyles as s } from './styles';

type Props = {
  date: DateKey;
  onDateChange: (d: DateKey) => void;
  data: Transaction;
};

export default function TransactionTab({ date, onDateChange, data }: Props) {
  return (
    <>
      
      <View style={{ marginTop: 8 }}>
        <Text style={s.subdate}>{data.date}</Text>

        <View style={[s.row, { marginTop: 16, alignItems: 'flex-start' }]}>
          <View style={{ flexShrink: 1, paddingRight: 8 }}>
            <Text style={s.txTitle}>{data.title}</Text>
            <Text style={s.muted}>Transaction ID {data.id}</Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.txAmount}>{data.amountTHB.toFixed(2)} THB</Text>
            <Text style={s.muted}>{data.time}</Text>
          </View>
        </View>
      </View>
    </>
  );
}
