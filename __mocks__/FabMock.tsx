import React from "react";
import { Pressable, Text } from "react-native";

export default function Fab(props: any) {
  return (
    <Pressable onPress={props.onPress} testID={props.testID ?? "fab"}>
      <Text>FAB</Text>
    </Pressable>
  );
}
