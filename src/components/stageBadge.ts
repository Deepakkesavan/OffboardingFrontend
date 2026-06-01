import type { Stage, BadgeConfig } from '../types'; // ✅ Import BadgeConfig

// Change return type from Record<Stage, BadgeVariant> to Record<Stage, BadgeConfig>
export const STAGE_BADGES: Record<Stage, BadgeConfig> = {
  exit_interview: { variant: 'info',    label: 'Exit Interview'   },
  manager_review: { variant: 'warning', label: 'Manager Review'   },
  hr_initiation:  { variant: 'primary', label: 'HR Initiation'    },
  clearances:     { variant: 'warning', label: 'Dept. Clearances' },
  final_approval: { variant: 'danger',  label: 'Final Approval'   },
  completed:      { variant: 'success', label: 'Completed'        },
};