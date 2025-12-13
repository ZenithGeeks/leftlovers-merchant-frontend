import React from "react";
import { View, Pressable, Text } from "react-native";

export default function AddSheet(props: any) {
  if (!props.visible) return null;

  return (
    <View testID="add-sheet">
      <Pressable testID="add-item-btn" onPress={props.onAddItem}>
        <Text>Add Item</Text>
      </Pressable>

      <Pressable testID="add-option-btn" onPress={props.onAddOption}>
        <Text>Add Option</Text>
      </Pressable>

      <Pressable testID="close-sheet-btn" onPress={props.onClose}>
        <Text>Close</Text>
      </Pressable>
    </View>
  );
}
