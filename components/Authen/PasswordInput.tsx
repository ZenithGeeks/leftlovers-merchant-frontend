// components/Authen/PasswordInput.tsx
import { InputBox } from "@/components/Authen/InputBox";
import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

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
  showRulesInitially?: boolean;

  // Policy
  minLength?: number;
  requireUpper?: boolean;
  requireLower?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;

  // Notify parent about validity against the policy
  onValidityChange?: (isValid: boolean) => void;

  // NEW: native TextInput hints to control autofill/AutoFill
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  importantForAutofill?: TextInputProps["importantForAutofill"];
  autoCorrect?: boolean;
};

const BRAND = { ok: "#059669", err: "#B91C1C", green: "#26BD68" };

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

  // Defaults that DISABLE autofill/AutoFill
  autoComplete = "off",
  textContentType = "none",
  importantForAutofill = "no",
  autoCorrect = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showRules, setShowRules] = useState(showRulesInitially);

  const rules = useMemo(
    () => ({
      length: value.length >= minLength,
      upper: !requireUpper || /[A-Z]/.test(value),
      lower: !requireLower || /[a-z]/.test(value),
      number: !requireNumber || /\d/.test(value),
      special: !requireSpecial || /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/+=~`]/.test(value),
    }),
    [value, minLength, requireUpper, requireLower, requireNumber, requireSpecial]
  );

  const policyOk = rules.length && rules.upper && rules.lower && rules.number && rules.special;

  useEffect(() => {
    setShowRules(showRulesInitially ? true : value.length > 0);
  }, [value, showRulesInitially, focused]);

  useEffect(() => {
    onValidityChange?.(policyOk);
  }, [policyOk, onValidityChange]);

  return (
    <View style={style}>
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
          autoComplete={autoComplete}
          textContentType={textContentType}
          importantForAutofill={importantForAutofill}
          autoCorrect={autoCorrect}
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
