import React from 'react'
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'

type ClickButtonProps = TouchableOpacityProps & {
  label: string
  loading?: boolean
}

export const ClickButton: React.FC<ClickButtonProps> = ({
  label,
  loading,
  disabled,
  style,
  ...rest
}) => (
  <TouchableOpacity
    {...rest}
    disabled={disabled || loading}
    activeOpacity={0.8}
    style={[styles.button, (disabled || loading) && styles.disabled, style]}
  >
    <Text style={styles.label}>{loading ? 'Loading…' : label}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#26BD68',
    borderWidth: 1,
    borderColor: '#26BD68',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
})
