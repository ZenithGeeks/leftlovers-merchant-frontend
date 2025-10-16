import React from 'react';
import { Text, View } from 'react-native';
import { empStyles as s } from './styles';

export default function AvatarInitial({ name }: { name: string }) {
  const letter = name.trim()[0]?.toUpperCase() ?? '?';
  return (
    <View style={s.avatar}>
      <Text style={s.avatarText}>{letter}</Text>
    </View>
  );
}
