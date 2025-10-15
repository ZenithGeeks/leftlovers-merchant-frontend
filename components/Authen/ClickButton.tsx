import React from 'react'
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'

type ClickButtonProps = TouchableOpacityProps & {
  label: string
}

export const ClickButton: React.FC<ClickButtonProps> = ({ label, disabled, style, ...rest }) => {
  return (
    <TouchableOpacity
      {...rest}
      disabled={disabled}
      style={[
        {
          marginTop: 10,
          padding: 14,
          borderRadius: 10,
          backgroundColor: '#26BD68',
          borderWidth: 1,
          borderColor: '#26BD68',
          opacity: disabled ? 0.5 : 1,
        },
        style as any,
      ]}
    >
      <Text style={{ textAlign: 'center', fontWeight: '600', color: '#FFFFFF' }}>{label}</Text>
    </TouchableOpacity>
  )
}