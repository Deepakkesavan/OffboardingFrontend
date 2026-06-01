import useStore, { ROLES } from '../store/offboardingStore';
import type { Role } from '../types';

interface RoleLabel {
  role: Role;
  label: string;
}

const ROLE_LABELS: RoleLabel[] = [
  { role: ROLES.EMPLOYEE,    label: '👤 Employee'    },
  { role: ROLES.MANAGER,     label: '🧑‍💼 Manager'  },
  { role: ROLES.HR,          label: '🏢 HR'          },
  { role: ROLES.FINANCE,     label: '💰 Finance'     },
  { role: ROLES.STAKEHOLDER, label: '🔗 Stakeholder' },
];

/* DELETE THIS COMPONENT IN PHASE 2 */
export default function DevRoleSwitcher() {
  const { activeRole, setActiveRole } = useStore();

  return (
    <div className="dev-switcher">
      <span>⚙ Phase 1 · Viewing as:</span>
      <div className="dev-switcher-btns">
        {ROLE_LABELS.map(({ role, label }) => (
          <button
            key={role}
            className={`dev-btn ${activeRole === role ? 'active' : ''}`}
            onClick={() => setActiveRole(role)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}