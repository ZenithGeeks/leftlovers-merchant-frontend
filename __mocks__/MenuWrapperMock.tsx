import React from "react";
import { View, Text } from "react-native";

export default function MenuWrapper(props: any) {
  return (
    <View testID={`menu-wrapper-${props.title}`}>
      <Text>{`MenuWrapper:${props.title}:${props.items?.length ?? 0}`}</Text>
    </View>
  );
}
