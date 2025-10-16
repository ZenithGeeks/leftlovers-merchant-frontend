import { Fonts } from '@/constants/theme';
import React, { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';

type SectionProps = PropsWithChildren<{ title: string }>;

export default function PopularMenuSection({ title, children }: SectionProps) {
  return (
    <View className="mt-3 mb-6">
      <Text
        className="text-[18px] text-slate-900 mb-3"
        style={{ fontFamily: Fonts.bold }}
      >
        {title}
      </Text>

      <View className="rounded-3xl border border-neutral-300 bg-white p-3 gap-3">
        {children}
      </View>
    </View>
  );
}
