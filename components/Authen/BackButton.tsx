// components/BackButton.tsx
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useRouter } from 'expo-router'
import type { SymbolViewProps, SymbolWeight } from 'expo-symbols'
import React from 'react'
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'

type BackButtonProps = {
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  size?: number            
  rounded?: boolean      
  color?: string       
  iconName?: SymbolViewProps['name'] 
  iconWeight?: SymbolWeight          
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  style,
  size = 44,
  rounded = false,
  color = '#000000',
  iconName = 'chevron.left',
  iconWeight = 'regular',
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
      activeOpacity={0.8}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: rounded ? size / 2 : 10 },
        style as any,
      ]}
    >
      <IconSymbol
        name={iconName}
        size={Math.max(18, Math.floor(size * 0.58))}
        color={color}
        weight={iconWeight}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
})

export default BackButton