import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { DateKey } from '../../types/finance';

export function DatePills({
  value,
  onChange,
}: {
  value: DateKey;
  onChange: (v: DateKey) => void;
}) {
  const options: DateKey[] = [
    'Today',
    'Yesterday',
    'This week',
    'This month',
    'This year',
    'Last year',
  ];

  return (
    <View className="mt-2 mb-6">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 12 }}
      >
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            className={`px-4 py-1.5 rounded-full border ${
              value === opt
                ? 'bg-green-50 border-green-600'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                value === opt ? 'text-green-600' : 'text-gray-700'
              }`}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
