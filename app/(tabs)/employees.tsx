import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';

import {
  AddEmployeeModal,
  AvatarInitial,
  DetailModal,
  type Employee,
  EmployeeRow,
  EmployeesHeader,
  type Role,
  RoleBadge,
} from '@/components/employees';

import rawEmployees from '@/mockupData/employees.json';
import type { Employee as EmployeeType } from '@/components/employees/types';
const mockEmployees: EmployeeType[] = rawEmployees as EmployeeType[];

export default function EmployeesScreen() {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;

  const horizontalPadding = useMemo(() => {
    const pct = screenWidth * 0.05;
    return Math.max(14, Math.min(pct, 24));
  }, [screenWidth]);

  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Add form state
  const [newRole, setNewRole] = useState<Role>('Manager');
  const [newFirst, setNewFirst] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const openDetail = (emp: Employee) => { setSelected(emp); setDetailOpen(true); };
  const closeDetail = () => setDetailOpen(false);
  const openAdd = () => {
    setNewRole('Manager'); setNewFirst(''); setNewUser('');
    setNewEmail(''); setNewPhone(''); setAddOpen(true);
  };

  const addEmployee = () => {
    const parts = newFirst.trim().split(/\s+/);
    const first = parts[0] || 'New';
    const last = parts.slice(1).join(' ') || 'Employee';
    const newEmp: Employee = {
      id: String(Date.now()),
      firstName: first,
      lastName: last,
      email: newEmail || undefined,
      phone: newPhone || undefined,
      role: newRole,
    };
    setEmployees(prev => [...prev, newEmp]);
    setAddOpen(false);
  };

  const disableAccess = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setDetailOpen(false);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <ThemedView
        className="flex-1 bg-white"
        style={{ paddingTop: insets.top + 24, paddingHorizontal: horizontalPadding }}
      >
        <Text className="text-2xl font-bold text-[#11181C] mb-4">Employees</Text>

        {/* Owner (first owner) */}
        {(() => {
          const owner = employees.find(e => e.role === 'Owner');
          if (!owner) return null;
          return (
            <View className="flex-row items-center gap-4 mb-6">
              <AvatarInitial name={owner.firstName} />
              <View className="flex-1">
                <Text className="text-base font-bold text-[#11181C] mb-1">
                  {owner.firstName} {owner.lastName}
                </Text>
                <RoleBadge role="Owner" />
              </View>
            </View>
          );
        })()}

        <EmployeesHeader onAdd={openAdd} />

        <View className="mt-2 gap-5">
          {employees.filter(e => !e.isOwner).map(emp => (
            <EmployeeRow key={emp.id} item={emp} onPress={openDetail} />
          ))}
        </View>
      </ThemedView>

      <DetailModal
        visible={detailOpen}
        onClose={closeDetail}
        employee={selected}
        onDisable={disableAccess}
        bottomPadding={insets.bottom}
      />

      <AddEmployeeModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        topPadding={insets.top}
        bottomPadding={insets.bottom}
        horizontalPadding={horizontalPadding}
        role={newRole}
        setRole={setNewRole}
        fullName={newFirst}
        setFullName={setNewFirst}
        username={newUser}
        setUsername={setNewUser}
        email={newEmail}
        setEmail={setNewEmail}
        phone={newPhone}
        setPhone={setNewPhone}
        onSubmit={addEmployee}
      />
    </ScrollView>
  );
}
