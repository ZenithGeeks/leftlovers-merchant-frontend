import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { empStyles as s } from './styles';
import RoleBadge from './RoleBadge';
import type { Employee } from './types';

type Props = {
  visible: boolean;
  onClose: () => void;
  employee: Employee | null;
  onDisable: (id: string) => void;
  bottomPadding: number;
};

export default function DetailModal({ visible, onClose, employee, onDisable, bottomPadding }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose} />
      <View style={[s.sheet, { paddingBottom: bottomPadding + 16 }]}>
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>{employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#11181C" />
          </TouchableOpacity>
        </View>

        {employee && (
          <>
            <View style={{ alignItems: 'center', marginTop: 2 }}>
              <RoleBadge role={employee.role} />
            </View>

            <View style={s.infoGrid}>
              <View style={s.infoCol}>
                <Text style={s.mutedLabel}>Full name</Text>
                <Text style={s.infoValue}>{employee.firstName} {employee.lastName}</Text>
              </View>
              <View style={s.infoCol} />
              <View style={s.infoCol}>
                <Text style={s.mutedLabel}>Email</Text>
                <Text style={s.infoValue}>{employee.email || '-'}</Text>
              </View>
              <View style={s.infoCol}>
                <Text style={s.mutedLabel}>Mobile number</Text>
                <Text style={s.infoValue}>{employee.phone || '-'}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => onDisable(employee.id)} style={s.dangerBtn}>
              <Text style={s.dangerText}>Disable Employee Access</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}
