// components/employees/AddEmployeeModal.tsx
import React, { useMemo } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,   
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FieldLabel from '@/components/add-item/FieldLabel';
import type { Role } from '@/types/employee';

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

  // simple enable state (require: full name + username + (email or phone))
  const canSubmit = useMemo(() => {
    const hasName = fullName.trim().length > 0;
    const hasUsername = username.trim().length > 0;
    const hasContact = email.trim().length > 0 || phone.trim().length > 0;
    return hasName && hasUsername && hasContact;
  }, [fullName, username, email, phone]);

  // Offset so iOS doesn't cover inputs behind header
  const keyboardOffset = topPadding + 3 ; // header-ish height

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
      >
        <View className="flex-1 bg-white" style={{ paddingTop: topPadding + 24 }}>
          {/* Top bar */}
          <View className="px-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-[#11181C]">Add Employee</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8} accessibilityLabel="close-modal">
              <Ionicons name="close" size={22} color="#11181C" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: horizontalPadding,
              paddingBottom: bottomPadding + 24,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Role */}
            <Text className="text-lg font-bold text-[#11181C] mt-4">Choose their role</Text>
            <Text className="text-sm text-[#6B7280] mt-1">
              Their role will determine their level of access
            </Text>

            <View className="mt-3 space-y-4">
              {opts.map((opt) => {
                const active = role === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    className="flex-row gap-3 items-start"
                    onPress={() => setRole(opt.key)}
                    accessibilityRole="button"
                    accessibilityLabel={`select-role-${opt.key}`}
                  >
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center mt-0.5 ${
                        active ? 'border-green-600' : 'border-gray-400'
                      }`}
                    >
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

            {/* Details */}
            <Text className="text-lg font-bold text-[#11181C] mt-6">Their Details</Text>

            <View className="mt-3">
              <FieldLabel label="Full name" required className="pb-2" />
              <TextInput
                placeholder="Enter full name"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor="#9AA0A6"
                accessibilityLabel="input-full-name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
              />

              <FieldLabel label="Username" required className="mt-5 pb-2" />
              <TextInput
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#9AA0A6"
                autoCapitalize="none"
                accessibilityLabel="input-username"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
              />

              <FieldLabel label="Email" className="mt-5 pb-2" />
              <TextInput
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#9AA0A6"
                autoCapitalize="none"
                keyboardType="email-address"
                accessibilityLabel="input-email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
              />

              <FieldLabel label="Mobile number" className="mt-5 pb-2" />
              <TextInput
                placeholder="08x-xxx-xxxx"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor="#9AA0A6"
                keyboardType={Platform.select({ ios: 'number-pad', android: 'phone-pad' })}
                accessibilityLabel="input-phone"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
              />
              <Text className="text-[12px] text-gray-500 mt-2">
                * Please provide valid Email and Mobile number.
              </Text>
            </View>

            <TouchableOpacity
              className={`mt-7 rounded-2xl h-14 items-center justify-center py-3.5 ${
                canSubmit ? 'bg-[#26BD68]' : 'bg-gray-300'
              }`}
              disabled={!canSubmit}
              onPress={onSubmit}
              accessibilityLabel="submit-add-employee"
            >
              <Text className="text-white font-semibold text-base">
                {canSubmit ? 'Add Employee' : 'Fill required fields'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
