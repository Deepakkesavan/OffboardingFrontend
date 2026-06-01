import { create } from 'zustand';
import type { CurrentUser, OffboardingStore, Role, Stage } from '../types';

/* Phase 1: hardcoded mock user — replace with JWT-decoded user in Phase 2 */
const MOCK_USER: CurrentUser = {
  id: 'EMP001',
  name: 'Deepak Kesavan',
  designation: 'Software Engineer',
  department: 'Engineering',
  email: 'arjun.mehta@company.com',
  manager: 'Priya Sharma',
};

export const ROLES = {
  EMPLOYEE:    'employee',
  MANAGER:     'manager',
  HR:          'hr',
  FINANCE:     'finance',
  STAKEHOLDER: 'stakeholder',
} as const satisfies Record<string, Role>;

export const STAGES = {
  EXIT_INTERVIEW: 'exit_interview',
  MANAGER_REVIEW: 'manager_review',
  HR_INITIATION:  'hr_initiation',
  CLEARANCES:     'clearances',
  FINAL_APPROVAL: 'final_approval',
  COMPLETED:      'completed',
} as const satisfies Record<string, Stage>;

export const STAGE_ORDER: Stage[] = [
  STAGES.EXIT_INTERVIEW,
  STAGES.MANAGER_REVIEW,
  STAGES.HR_INITIATION,
  STAGES.CLEARANCES,
  STAGES.FINAL_APPROVAL,
  STAGES.COMPLETED,
];

export const STAGE_LABELS: Record<Stage, string> = {
  exit_interview: 'Exit Interview',
  manager_review: 'Manager Review',
  hr_initiation:  'HR Initiation',
  clearances:     'Dept. Clearances',
  final_approval: 'Final Approval',
  completed:      'Completed',
};

const useStore = create<OffboardingStore>((set) => ({
  currentUser:    MOCK_USER,
  activeRole:     ROLES.EMPLOYEE,
  activeRecordId: null,

  setActiveRole:      (role) => set({ activeRole: role }),
  setActiveRecordId:  (recordId) => set({ activeRecordId: recordId }),
  setCurrentUser:     (user) => set({ currentUser: user }),
}));

export default useStore;