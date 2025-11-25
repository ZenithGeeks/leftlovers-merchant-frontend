// hooks/useEmployees.ts
import { useCallback, useEffect, useState } from 'react';
import type { Employee, Owner, Role } from '@/types/employee';
import {
  createEmployee,
  disableEmployee,
  fetchEmployees,
} from '@/services/employees';

const MERCHANT_ID = process.env.EXPO_PUBLIC_MERCHANT_ID ?? '';

type AddLocalInput = {
  id?: string;            // ignored (backend generates)
  firstName: string;
  lastName: string;
  username?: string;      // optional
  email?: string;
  phone?: string;
  role: Role;             // Owner not allowed when creating
};

export function useEmployees() {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEmployees(MERCHANT_ID);
      setOwner(data.owner);
      setEmployees(data.employees ?? []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load employees');
      setOwner(null);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addEmployee = useCallback(
    async (input: AddLocalInput) => {
      // Your screen provides separate first/last + role + email/phone (+ username after tiny tweak below)
      const fullName = `${input.firstName} ${input.lastName}`.trim();
      const payload = {
        fullName,
        username: input.username?.trim() || undefined,
        email: input.email?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
        // Map UI Role to API (Owner creation is not allowed)
        role:
          (input.role === 'Owner' ? 'Manager' : input.role) as Exclude<
            Role,
            'Owner'
          >,
      };

      const created = await createEmployee(MERCHANT_ID, payload);
      setEmployees((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const removeEmployee = useCallback(async (employeeId: string) => {
    // Your Detail modal is "Disable access" — we call the disable endpoint
    await disableEmployee(MERCHANT_ID, employeeId);
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
  }, []);

  return {
    loading,
    error: err,
    owner,
    employees,
    addEmployee,
    removeEmployee,
    reload: load,
  };
}
