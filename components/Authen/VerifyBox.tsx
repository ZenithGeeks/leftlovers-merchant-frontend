import React from "react";
import { StyleProp, StyleSheet, TextInput, TextStyle } from "react-native";

type OtpInputProps = {
  value: string;
  setValue: (text: string) => void;
  maxLength?: number;
  style?: StyleProp<TextStyle>;
};

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  setValue,
  maxLength = 6,
  style,
}) => {
  return (
    <TextInput
      value={value}
      onChangeText={(t) => setValue(t.replace(/\D/g, "").slice(0, maxLength))}
      placeholder="xxxxxx"
      keyboardType="number-pad"
      textContentType="none" // disable autofill
      autoComplete="off" // disable autofill
      maxLength={maxLength}
      style={[
        styles.input,
        { fontFamily: "Poppins_400Regular" }, // apply Poppins here
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 18,
    letterSpacing: 4,
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
});
