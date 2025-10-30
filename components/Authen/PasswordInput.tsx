// components/Authen/PasswordInput.tsx
import { InputBox } from "@/components/Authen/InputBox";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

type PasswordInputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (t: string) => void;

  // Visual spacing forwarded to InputBox
  containerTop?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;

  // Behavior
  disabled?: boolean;
  rulesVisible?: boolean;
  showRulesInitially?: boolean; // if true, rules are shown even before focus/typing

  // Policy
  minLength?: number;
  requireUpper?: boolean;
  requireLower?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;

  // Callback to parent when overall validity changes (password policy only)
  onValidityChange?: (isValid: boolean) => void;
};

const BRAND = {
  ok: "#059669",
  err: "#B91C1C",
  green: "#26BD68",
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label = "Password",
  placeholder = "Enter your password",
  value,
  onChangeText,
  containerTop = 20,
  style,
  textStyle,
  disabled = false,
  showRulesInitially = false,
  minLength = 8,
  requireUpper = true,
  requireLower = true,
  requireNumber = true,
  requireSpecial = true,
  onValidityChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showRules, setShowRules] = useState(showRulesInitially);

  // Compute rules
  const rules = useMemo(() => {
    return {
      length: value.length >= minLength,
      upper: !requireUpper || /[A-Z]/.test(value),
      lower: !requireLower || /[a-z]/.test(value),
      number: !requireNumber || /\d/.test(value),
      special: !requireSpecial || /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/+=~`]/.test(value),
    };
  }, [value, minLength, requireUpper, requireLower, requireNumber, requireSpecial]);

  const policyOk = rules.length && rules.upper && rules.lower && rules.number && rules.special;

  // Auto show/hide rules: show when focused OR has any value; hide on blur if empty
  useEffect(() => {
    if (showRulesInitially) {
      setShowRules(true);
    } else {
      setShowRules( value.length > 0);
    }
  }, [focused, value, showRulesInitially]);

  // Notify parent when policy validity changes
  useEffect(() => {
    onValidityChange?.(policyOk);
  }, [policyOk, onValidityChange]);

  return (
    <View style={style}>
      {/* Field with Show/Hide overlay */}
      <View style={{ position: "relative" }}>
        <InputBox
          label={label}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          containerTop={containerTop}
          editable={!disabled}
          style={{ paddingRight: 64 }}
        />

        {!!value && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            activeOpacity={0.7}
            style={styles.showToggle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={disabled}
          >
            <Text style={styles.showToggleText}>{showPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Inline rules */}
      {showRules && (
        <View style={{ marginTop: 8 }}>
          {[
            { ok: rules.length, label: `At least ${minLength} characters` },
            requireUpper ? { ok: rules.upper, label: "Contains uppercase letter (A–Z)" } : null,
            requireLower ? { ok: rules.lower, label: "Contains lowercase letter (a–z)" } : null,
            requireNumber ? { ok: rules.number, label: "Contains a number (0–9)" } : null,
            requireSpecial ? { ok: rules.special, label: "Contains special character (!@#$%)" } : null,
          ]
            .filter(Boolean)
            .map((r: any) => (
              <Text
                key={r.label}
                accessibilityRole="text"
                style={[styles.ruleText, { color: r.ok ? BRAND.ok : BRAND.err }, textStyle]}
              >
                {r.ok ? "✓" : "•"} {r.label}
              </Text>
            ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  showToggle: {
    position: "absolute",
    right: 12,
    top: 50,
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  showToggleText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: BRAND.green,
  },
  ruleText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});

export default PasswordInput;
