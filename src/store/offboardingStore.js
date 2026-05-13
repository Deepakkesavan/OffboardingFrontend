import { create } from 'zustand';

/* Phase 1: hardcoded mock user — replace with JWT-decoded user in Phase 2 */
const MOCK_USER = {
  id: 'EMP001',
  name: 'Deepak Kesavan',
  designation: 'Software Engineer',
  department: 'Engineering',
  email: 'arjun.mehta@company.com',
  manager: 'Priya Sharma',
};

export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  HR: 'hr',
  FINANCE: 'finance',
  STAKEHOLDER: 'stakeholder',
};

export const STAGES = {
  EXIT_INTERVIEW: 'exit_interview',
  MANAGER_REVIEW: 'manager_review',
  HR_INITIATION: 'hr_initiation',
  CLEARANCES: 'clearances',
  FINAL_APPROVAL: 'final_approval',
  COMPLETED: 'completed',
};

export const STAGE_ORDER = [
  STAGES.EXIT_INTERVIEW,
  STAGES.MANAGER_REVIEW,
  STAGES.HR_INITIATION,
  STAGES.CLEARANCES,
  STAGES.FINAL_APPROVAL,
  STAGES.COMPLETED,
];

export const STAGE_LABELS = {
  [STAGES.EXIT_INTERVIEW]: 'Exit Interview',
  [STAGES.MANAGER_REVIEW]: 'Manager Review',
  [STAGES.HR_INITIATION]: 'HR Initiation',
  [STAGES.CLEARANCES]: 'Dept. Clearances',
  [STAGES.FINAL_APPROVAL]: 'Final Approval',
  [STAGES.COMPLETED]: 'Completed',
};

const useStore = create((set) => ({
  /* Mock user (Phase 1) */
  currentUser: MOCK_USER,
  activeRole: ROLES.EMPLOYEE,      // toggled by DevRoleSwitcher

  /* Active offboarding record being viewed */
  activeRecordId: null,

  setActiveRole: (role) => set({ activeRole: role }),
  setActiveRecordId: (recordId) => set({ activeRecordId: recordId }),
  setCurrentUser: (user) => set({ currentUser: user }),
}));

export default useStore;