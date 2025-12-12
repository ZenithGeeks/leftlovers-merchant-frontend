import React from "react";
import { View, Text } from "react-native";

export default function OptionWrapper(props: any) {
  return (
    <View testID={`option-wrapper-${props.groupId}`}>
      <Text>{`OptionWrapper:${props.title}`}</Text>
    </View>
  );
}
