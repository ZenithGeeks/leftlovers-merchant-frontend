import { Fonts } from '@/constants/theme';
import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type SectionProps = PropsWithChildren<{ title: string }>;

export default function PopularMenuSection({ title, children }: SectionProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.container}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    marginBottom: 12,
    color: '#11181C',
  },
  container: {
    gap: 12,
    padding: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#fff',
  },
});
