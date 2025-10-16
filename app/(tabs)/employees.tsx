import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Components ---
import {
  AddEmployeeModal,
  AvatarInitial,
  DetailModal,
  type Employee,
  EmployeeRow,
  EmployeesHeader,
  type Role,
  RoleBadge,
  empStyles as s,
} from '@/components/employees';

// --- Mock Data ---
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

  // --- State ---
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // --- Add Form ---
  const [newRole, setNewRole] = useState<Role>('Manager');
  const [newFirst, setNewFirst] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // --- Handlers ---
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

    setEmployees((prev) => [...prev, newEmp]);
    setAddOpen(false);
  };

  const disableAccess = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setDetailOpen(false);
  };

  // --- Render ---
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <ThemedView
        style={[
          styles.container,
          { paddingTop: insets.top + 24, paddingHorizontal: horizontalPadding },
        ]}
      >
        <Text style={s.header}>Employees</Text>

        {/* Owner (first owner found) */}
        {(() => {
          const owner = employees.find((e) => e.role === 'Owner');
          if (!owner) return null;
          return (
            <View style={[s.rowItem, { marginBottom: 24 }]}>
              <AvatarInitial name={owner.firstName} />
              <View style={{ flex: 1 }}>
                <Text style={s.name}>
                  {owner.firstName} {owner.lastName}
                </Text>
                <RoleBadge role="Owner" />
              </View>
            </View>
          );
        })()}

        {/* Header with Add button */}
        <EmployeesHeader onAdd={openAdd} />

        {/* Employees List */}
        <View style={{ gap: 22, marginTop: 8 }}>
          {employees
            .filter((e) => !e.isOwner)
            .map((emp) => (
              <EmployeeRow key={emp.id} item={emp} onPress={openDetail} />
            ))}
        </View>
      </ThemedView>

      {/* Detail Modal */}
      <DetailModal
        visible={detailOpen}
        onClose={closeDetail}
        employee={selected}
        onDisable={disableAccess}
        bottomPadding={insets.bottom}
      />

      {/* Add Employee Modal */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
});
