import React, { useRef } from "react";
import {
    NativeSyntheticEvent,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextInputKeyPressEventData,
    View,
    ViewStyle,
} from "react-native";

type PhoneInputProps = {
  localPhone: string;
  onChangeLocal: (text: string) => void;
  onSubmit?: () => void;
  error?: string;
  style?: StyleProp<ViewStyle>;
};

export const PhoneInput = ({
  localPhone,
  onChangeLocal,
  onSubmit,
  error,
  style,
}: PhoneInputProps) => {
  const inputRef = useRef<TextInput>(null);

  /**
   * 🔹 Format the number dynamically to: xx-xxx-xxxx
   */
  const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 9);
    const part1 = digits.slice(0, 2);
    const part2 = digits.slice(2, 5);
    const part3 = digits.slice(5, 9);

    let formatted = part1;
    if (part2) formatted += `-${part2}`;
    if (part3) formatted += `-${part3}`;
    return formatted;
  };

  /**
   * 🔹 Handle backspace correctly (avoid deleting dashes)
   */
  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === "Backspace" && localPhone.length > 0) {
      // avoid removing "-" accidentally
      const current = localPhone;
      if (current.endsWith("-")) {
        const newVal = current.slice(0, -1);
        onChangeLocal(newVal);
        e.preventDefault?.();
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {/* 🔹 Country code box */}
        <View style={styles.countryCodeContainer}>
          <Text style={[styles.countryCodeText, { fontFamily: "Poppins_400Regular" }]}>
            +66
          </Text>
        </View>

        {/* 🔹 Auto-formatting input field */}
        <TextInput
          ref={inputRef}
          placeholder="xx-xxx-xxxx"
          value={formatPhone(localPhone)}
          onChangeText={(text) => {
            const clean = text.replace(/\D/g, "").slice(0, 9);
            onChangeLocal(clean);
          }}
          onKeyPress={handleKeyPress}
          keyboardType="number-pad"
          returnKeyType="go"
          onSubmitEditing={onSubmit}
          style={[styles.input, { fontFamily: "Poppins_400Regular" }]}
          maxLength={11} // includes the dashes visually
          accessibilityLabel="Thai phone number input"
        />
      </View>

      {/* 🔹 Error message */}
      {!!error && (
        <Text style={[styles.errorText, { fontFamily: "Poppins_400Regular" }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  countryCodeContainer: {
    width: 70,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "rgba(38,189,104,0.08)",
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginRight: 12,
  },
  countryCodeText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(38, 189, 104, 0.12)",
    borderColor: "rgba(38, 189, 104, 0.08)",
    color: "#111827",
    fontSize: 16,
    letterSpacing: 1,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 12,
    marginTop: 4,
  },
});
