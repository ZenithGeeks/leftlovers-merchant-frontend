import React from "react";
import { Text, View } from "react-native";

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
};

export const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <View style={{ alignItems: "center" }}>
      <Text
        style={{
          fontSize: 24,
          fontFamily: "Poppins_700Bold",
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={{
            marginTop: 10,
            fontSize: 12,
            fontFamily: "Poppins_400Regular",
            textAlign: "center",
            color: "#6B7280",
            maxWidth: 260,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};
