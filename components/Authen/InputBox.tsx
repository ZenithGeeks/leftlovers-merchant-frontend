import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type InputBoxProps = TextInputProps & {
  label: string;
  errorText?: string;
  containerTop?: number;
  labelBottom?: number;
};

export const InputBox: React.FC<InputBoxProps> = ({
  label,
  errorText,
  containerTop = 16,
  labelBottom = 6,
  style,
  ...rest
}) => {
  return (
    <View style={[styles.container, { marginTop: containerTop }]}>
      <Text className="font-poppins text-[15px]" style={{ marginBottom: labelBottom }}>
        {label}
      </Text>

      <TextInput
        {...rest}
        style={[styles.input, style]}
        placeholderTextColor="#9CA3AF"
      />

      {!!errorText && (
        <Text className="font-poppins text-[12px] text-red-600">
          {errorText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    backgroundColor: "rgba(38, 189, 104, 0.2)",
    borderWidth: 0.5,
    borderColor: "rgba(38, 189, 104, 0.05)",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#0F172A",
    letterSpacing: 0,
  },
});