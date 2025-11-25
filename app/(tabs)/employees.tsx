import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';

import {
  AddEmployeeModal,
  AvatarInitial,
  DetailModal,
  EmployeeRow,
  EmployeesHeader,
  RoleBadge,
  type Employee,
  type Role,
} from '@/components/employees';

import { useEmployees } from '@/hooks/useEmployees';

export default function EmployeesScreen() {
  const insets = useSafeAreaInsets();

  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = useMemo(() => {
    const pct = screenWidth * 0.05; 
    return Math.max(16, Math.min(pct, 28));
  }, [screenWidth]);

  const { employees, owner, addEmployee, removeEmployee } = useEmployees();

  const [selected, setSelected] = useState<Employee | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [newRole, setNewRole] = useState<Role>('Manager');
  const [newFirst, setNewFirst] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const openDetail = (emp: Employee) => {
    setSelected(emp);
    setDetailOpen(true);
  };
  const closeDetail = () => setDetailOpen(false);
  const openAdd = () => {
    setNewRole('Manager');
    setNewFirst('');
    setNewUser('');
    setNewEmail('');
    setNewPhone('');
    setAddOpen(true);
  };

  const handleAdd = async () => {
  const parts = newFirst.trim().split(/\s+/);
  const first = parts[0] || 'New';
  const last = parts.slice(1).join(' ') || 'Employee';

  await addEmployee({
    firstName: first,
    lastName: last,
    username: newUser,          
    email: newEmail || undefined,
    phone: newPhone || undefined,
    role: newRole,
  });

  setAddOpen(false);
};


  const handleDisableAccess = (id: string) => {
    removeEmployee(id);
    closeDetail();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 96, 
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView
          className="w-full"
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View className="mb-6 gap-3">
            <Text className="text-[36px] font-extrabold text-[#0B1220]">
              Employees
            </Text>
          </View>
        </ThemedView>

        <ThemedView
          className="flex-1 w-full"
          style={{ paddingHorizontal: horizontalPadding }}
        >
          {owner && (
            <View className="flex-row items-center gap-4 mb-6">
              <AvatarInitial name={owner.firstName} />
              <View className="flex-1">
                <Text className="text-base font-bold text-[#11181C] mb-1">
                  {owner.firstName} {owner.lastName}
                </Text>
                <RoleBadge role="Owner" />
              </View>
            </View>
          )}

          <EmployeesHeader onAdd={openAdd} />

          <View className="mt-2 gap-5 mb-10">
            {employees
              .filter((e) => e.role !== 'Owner')
              .map((emp) => (
                <EmployeeRow key={emp.id} item={emp} onPress={openDetail} />
              ))}
          </View>
        </ThemedView>
      </ScrollView>

      <DetailModal
        visible={detailOpen}
        onClose={closeDetail}
        employee={selected}
        onDisable={handleDisableAccess}
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
        onSubmit={handleAdd}
      />
    </View>
  );
}
