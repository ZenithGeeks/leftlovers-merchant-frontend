import React from 'react'
import { Text, TextInput, TextInputProps, View } from 'react-native'

type InputBoxProps = TextInputProps & {
  label: string
  errorText?: string
  containerTop?: number   // spacing above the whole block
  labelBottom?: number    // spacing below the label
}

export const InputBox: React.FC<InputBoxProps> = ({
  label,
  errorText,
  containerTop = 16,
  labelBottom = 6,
  style,
  ...rest
}) => {
  return (
    <View style={{ marginTop: containerTop }}>
      <Text style={{ fontSize: 15, fontWeight: '400', marginBottom: labelBottom }}>
        {label}
      </Text>
      <TextInput
        {...rest}
        style={[
          {
            borderWidth: 0.5,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: 'rgba(38, 189, 104, 0.15)',
            borderColor: 'rgba(38, 189, 104, 0.1)',
            letterSpacing: 0,
            fontSize: 15,
          },
          style as any,
        ]}
      />
      {!!errorText && (
        <Text style={{ marginTop: 6, fontSize: 12, color: '#B91C1C' }}>{errorText}</Text>
      )}
    </View>
  )
}
