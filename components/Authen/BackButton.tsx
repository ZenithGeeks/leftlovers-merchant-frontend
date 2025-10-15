import { useRouter } from 'expo-router'
import React from 'react'
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native'

type BackButtonProps = {
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  size?: number          // button box size (width/height)
  rounded?: boolean      // make the touch area circular
  useIconSymbol?: boolean
  color?: string         // icon color (defaults to black)
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  style,
  size = 44,
  rounded = false,
  useIconSymbol = false,
  color = '#000000',     // <-- default BLACK
}) => {
  const router = useRouter()

  const handlePress = React.useCallback(() => {
    if (onPress) return onPress()
    router.back()
  }, [onPress, router])

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: rounded ? size / 2 : 10,
          backgroundColor: 'transparent',
        },
        style as any,
      ]}
    >
      {/* If you want to use expo-symbols, replace this View with your IconSymbol */}
      <View style={{ position: 'absolute', left: 4 }}>
        <Text style={{ fontSize: 25, lineHeight: 22, fontWeight: '800', color }}>
          ‹
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default BackButton