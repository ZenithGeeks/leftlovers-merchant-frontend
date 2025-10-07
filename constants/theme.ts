
const tintColorLight = '#26BD68'; // main green
// const tintColorDark = '#26BD68'; // same tint for dark mode
const accentColor = '#009E45';   // darker shade (for pressed/active stroke)

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: tintColorLight,
    accent: accentColor,
    icon: '#687076',
    tabIconDefault: '#94A3B8', // gray-400
    tabIconSelected: tintColorLight,
    border: '#E5E7EB', // light border if needed
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorLight,
    accent: accentColor,
    icon: '#9BA1A6',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorLight,
    border: '#1F2937', // subtle border for dark mode
  },
};

export const Fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};
