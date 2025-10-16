import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

export const empStyles = StyleSheet.create({
  header: { fontSize: 24, fontFamily: Fonts.bold, color: '#11181C', marginBottom: 16 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.bold, color: '#11181C' },
  sectionSub: { fontSize: 14, fontFamily: Fonts.medium, color: '#6B7280', marginTop: 6 },
  addText: { fontSize: 18, fontFamily: Fonts.bold, color: Colors.light.tint },

  rowItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontFamily: Fonts.semibold, color: '#11181C' },
  name: { fontSize: 16, fontFamily: Fonts.bold, color: '#11181C', marginBottom: 6 },

  badge: { alignSelf: 'flex-start', backgroundColor: '#E8F5E9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: Colors.light.tint, fontFamily: Fonts.bold, fontSize: 12 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { fontSize: 20, fontFamily: Fonts.bold, color: '#11181C' },

  infoGrid: { marginTop: 14, rowGap: 16, columnGap: 16, flexDirection: 'row', flexWrap: 'wrap' },
  infoCol: { width: '48%' },
  mutedLabel: { color: '#6B7280', fontFamily: Fonts.medium, marginBottom: 6 },
  infoValue: { color: '#11181C', fontFamily: Fonts.bold, fontSize: 16 },

  dangerBtn: { backgroundColor: '#E05858', borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 24 },
  dangerText: { color: '#fff', fontFamily: Fonts.bold, fontSize: 16 },

  // Add Employee FULL SCREEN
  fullscreen: { flex: 1, backgroundColor: '#fff' },
  fullHeader: { paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  chooseTitle: { fontSize: 18, fontFamily: Fonts.bold, color: '#11181C' },
  chooseSub: { fontSize: 14, fontFamily: Fonts.medium, color: '#6B7280', marginTop: 6 },

  radioRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#9AA0A6',
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  radioOuterActive: { borderColor: Colors.light.tint },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.light.tint },
  radioTitle: { fontSize: 16, fontFamily: Fonts.bold, color: '#11181C' },
  radioDesc: { fontSize: 14, fontFamily: Fonts.medium, color: '#6B7280', marginTop: 4 },

  input: {
    height: 54, borderRadius: 12, borderWidth: 1.5, borderColor: '#D1D5DB',
    paddingHorizontal: 14, fontFamily: Fonts.medium, fontSize: 14, backgroundColor: '#fff',
  },
  primaryBtn: { marginTop: 18, backgroundColor: Colors.light.tint, borderRadius: 999, height: 52, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontFamily: Fonts.bold, fontSize: 16 },
});
