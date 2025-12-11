// hooks/useEmployees.ts
import {
  createEmployee,
  disableEmployee,
  fetchEmployees,
} from '@/services/employees';
import type { Employee, Owner, Role } from '@/types/employee';
import { useCallback, useEffect, useState } from 'react';

type AddLocalInput = {
  id?: string;            // ignored (backend generates)
  firstName: string;
  lastName: string;
  username?: string;      // optional
  email?: string;
  phone?: string;
  role: Role;             // Owner not allowed when creating
};

export function useEmployees(merchantId: string) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEmployees(merchantId);
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
  }, [merchantId]);

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

      const created = await createEmployee(merchantId, payload);
      setEmployees((prev) => [created, ...prev]);
      return created;
    },
    [merchantId]
  );

  const removeEmployee = useCallback(async (employeeId: string) => {
    // Your Detail modal is "Disable access" — we call the disable endpoint
    await disableEmployee(merchantId, employeeId);
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
  }, [merchantId]);

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
