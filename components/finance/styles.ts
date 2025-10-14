import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

export const financeStyles = StyleSheet.create({
  // Tabs
  tabContainer: { flexDirection: 'row', alignItems: 'center', gap: 28, marginBottom: 12 },
  tabText: { fontSize: 16, color: '#555', fontFamily: Fonts.medium },
  activeTab: { color: Colors.light.tint, fontFamily: Fonts.bold },
  activeLine: { height: 2, backgroundColor: Colors.light.tint, marginTop: 4 },

  // Date pills
  dateFilter: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24, marginTop: 8 },
  dateButton: { paddingVertical: 6, paddingHorizontal: 16, borderWidth: 1, borderRadius: 20 },
  dateButtonActive: { borderColor: Colors.light.tint, backgroundColor: '#E8F5E9' },
  dateButtonInactive: { borderColor: '#B0B0B0', backgroundColor: '#fff' },
  dateButtonText: { fontSize: 14, fontFamily: Fonts.semibold },
  dateTextActive: { color: Colors.light.tint },
  dateTextInactive: { color: '#444' },

  // Typography
  label: { fontSize: 14, fontFamily: Fonts.medium, color: '#444' },
  value: { fontSize: 20, fontFamily: Fonts.bold, color: '#000' },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.bold, marginTop: 24, marginBottom: 12 },

  // Card (Summary)
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  iconCircle: {
    width: 40, height: 40, backgroundColor: '#E8F5E9', borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontSize: 18, fontFamily: Fonts.semibold },

  // Rows
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  rowLabel: { fontSize: 14, fontFamily: Fonts.medium, color: '#333' },
  rowValue: { fontSize: 14, fontFamily: Fonts.medium, color: '#000' },

  // Tx / Payout rows
  subdate: { fontSize: 14, fontFamily: Fonts.bold, color: '#333' },
  txTitle: { fontSize: 16, fontFamily: Fonts.semibold, color: '#11181C' },
  muted: { fontSize: 12, color: '#9AA0A6', fontFamily: Fonts.medium },
  txAmount: { fontSize: 16, fontFamily: Fonts.bold, color: '#000' },

  // Badge
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8F5E9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    marginTop: 6, alignSelf: 'flex-end',
  },
  badgeText: { color: Colors.light.tint, fontFamily: Fonts.bold, fontSize: 14 },
});
