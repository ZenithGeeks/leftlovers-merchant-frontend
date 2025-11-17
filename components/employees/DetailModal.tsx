import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RoleBadge from './RoleBadge';
import type { Employee } from '@/types/employee';

export default function DetailModal({
  visible,
  onClose,
  employee,
  onDisable,
  bottomPadding,
}: {
  visible: boolean;
  onClose: () => void;
  employee: Employee | null;
  onDisable: (id: string) => void;
  bottomPadding: number;
}) {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/35">

        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="absolute inset-0"
        />

        <View
          className="bg-white rounded-t-3xl p-5"
          style={{ paddingBottom: bottomPadding + 16 }}
        >

          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-[#11181C]">
              {employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#11181C" />
            </TouchableOpacity>
          </View>

          {employee && (
            <>
              <View className="items-center mt-1">
                <RoleBadge role={employee.role} />
              </View>

              <View className="flex-row flex-wrap mt-4 gap-x-4 gap-y-4">
                <View className="w-[48%]">
                  <Text className="text-sm text-gray-500 mb-1">Full name</Text>
                  <Text className="text-base font-bold text-[#11181C]">
                    {employee.firstName} {employee.lastName}
                  </Text>
                </View>

                <View className="w-[48%]" />

                <View className="w-[48%]">
                  <Text className="text-sm text-gray-500 mb-1">Email</Text>
                  <Text className="text-base font-bold text-[#11181C]">
                    {employee.email || '-'}
                  </Text>
                </View>

                <View className="w-[48%]">
                  <Text className="text-sm text-gray-500 mb-1">Mobile number</Text>
                  <Text className="text-base font-bold text-[#11181C]">
                    {employee.phone || '-'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => onDisable(employee.id)}
                className="bg-[#E05858] rounded-full items-center justify-center py-3.5 mt-6"
              >
                <Text className="text-white font-bold text-base">
                  Disable Employee Access
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
