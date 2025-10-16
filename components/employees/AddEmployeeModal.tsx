import React from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { empStyles as s } from './styles';
import type { Role } from './types';
import { ThemedView } from '@/components/themed-view';

type Props = {
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
};

export default function AddEmployeeModal(props: Props) {
  const {
    visible, onClose, topPadding, bottomPadding, horizontalPadding,
    role, setRole, fullName, setFullName, username, setUsername, email, setEmail, phone, setPhone, onSubmit,
  } = props;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <ThemedView style={[s.fullscreen, { paddingTop: topPadding + 24 }]}>
        <View style={s.fullHeader}>
          <Text style={s.header}>Employees</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#11181C" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingBottom: bottomPadding + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.chooseTitle}>Choose their role</Text>
          <Text style={s.chooseSub}>Their role will determine their level of access</Text>

          <View style={{ marginTop: 12, gap: 18 }}>
            {([
              { key: 'Manager', desc: 'Access to management features like reports' },
              { key: 'Cashier', desc: 'Access to features for transactions like orders' },
              { key: 'Stock', desc: 'Access to features for inventory like menu' },
            ] as { key: Role; desc: string }[]).map((opt) => (
              <Pressable key={opt.key} style={s.radioRow} onPress={() => setRole(opt.key)}>
                <View style={[s.radioOuter, role === opt.key && s.radioOuterActive]}>
                  {role === opt.key && <View style={s.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.radioTitle}>{opt.key === 'Manager' ? 'Store manager' : opt.key}</Text>
                  <Text style={s.radioDesc}>{opt.desc}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Text style={[s.chooseTitle, { marginTop: 24 }]}>Their Details</Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            <TextInput placeholder="Full name" value={fullName} onChangeText={setFullName} style={s.input} placeholderTextColor="#9AA0A6" />
            <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={s.input} placeholderTextColor="#9AA0A6" autoCapitalize="none" />
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={s.input} placeholderTextColor="#9AA0A6" autoCapitalize="none" keyboardType="email-address" />
            <TextInput placeholder="Mobile number" value={phone} onChangeText={setPhone} style={s.input} placeholderTextColor="#9AA0A6" keyboardType="phone-pad" />
          </View>

          <TouchableOpacity style={s.primaryBtn} onPress={onSubmit}>
            <Text style={s.primaryText}>Add Employee</Text>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}
