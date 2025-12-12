import React from "react";
import { View } from "react-native";

export const ThemedView = ({ children, ...props }: any) => {
  return <View {...props}>{children}</View>;
};
