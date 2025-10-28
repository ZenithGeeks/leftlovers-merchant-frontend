import React from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Role } from '@/types/employee.ts';

export default function AddEmployeeModal({
  visible,
  onClose,
  topPadding,
  bottomPadding,
  horizontalPadding,
  role,
  setRole,
  fullName,
  setFullName,
  username,
  setUsername,
  email,
  setEmail,
  phone,
  setPhone,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  topPadding: number;
  bottomPadding: number;
  horizontalPadding: number;
  role: Role;
  setRole: (r: Role) => void;
  fullName: string;
  setFullName: (v: string) => void;
  username: string;
  setUsername: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  onSubmit: () => void;
}) {
  const opts: { key: Role; desc: string }[] = [
    { key: 'Manager', desc: 'Access to management features like reports' },
    { key: 'Cashier', desc: 'Access to features for transactions like orders' },
    { key: 'Stock', desc: 'Access to features for inventory like menu' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} presentationStyle="fullScreen" onRequestClose={onClose}>
      <View className="flex-1 bg-white" style={{ paddingTop: topPadding + 24 }}>
        {/* Top bar */}
        <View className="px-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-[#11181C]">Employees</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#11181C" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingBottom: bottomPadding + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-lg font-bold text-[#11181C] mt-4">Choose their role</Text>
          <Text className="text-sm text-[#6B7280] mt-1">Their role will determine their level of access</Text>

          <View className="mt-3 space-y-4">
            {opts.map(opt => {
              const active = role === opt.key;
              return (
                <TouchableOpacity key={opt.key} className="flex-row gap-3 items-start" onPress={() => setRole(opt.key)}>
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mt-0.5 ${active ? 'border-green-600' : 'border-gray-400'}`}>
                    {active && <View className="w-3 h-3 rounded-full bg-green-600" />}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-[#11181C]">
                      {opt.key === 'Manager' ? 'Store manager' : opt.key}
                    </Text>
                    <Text className="text-sm text-[#6B7280] mt-1">{opt.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-lg font-bold text-[#11181C] mt-6">Their Details</Text>

          <View className="mt-3 space-y-3">
            <TextInput
              placeholder="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#9AA0A6"
              className="h-14 rounded-xl border border-gray-300 px-3 text-sm"
            />
            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#9AA0A6"
              autoCapitalize="none"
              className="h-14 rounded-xl border border-gray-300 px-3 text-sm"
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#9AA0A6"
              autoCapitalize="none"
              keyboardType="email-address"
              className="h-14 rounded-xl border border-gray-300 px-3 text-sm"
            />
            <TextInput
              placeholder="Mobile number"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#9AA0A6"
              keyboardType="phone-pad"
              className="h-14 rounded-xl border border-gray-300 px-3 text-sm"
            />
          </View>

          <TouchableOpacity className="mt-7 bg-green-600 rounded-full h-14 items-center justify-center py-3.5" onPress={onSubmit}>
            <Text className="text-white font-bold text-base">Add Employee</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
