import React from "react";
import { View, Pressable, Text } from "react-native";

export default function ContentSwitcher(props: any) {
  return (
    <View testID="content-switcher">
      <Pressable testID="tab-items" onPress={() => props.onChange("items")}>
        <Text>Items</Text>
      </Pressable>
      <Pressable testID="tab-options" onPress={() => props.onChange("options")}>
        <Text>Options</Text>
      </Pressable>
    </View>
  );
}
