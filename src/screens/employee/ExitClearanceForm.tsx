import { getClearances } from '../../api/offboardingApi';
import { useFetch } from '../../hooks/useFetch';
import Badge from '../../components/Badge';
import type { OffboardingRecord, Clearance, ClearanceDepartment } from '../../types';
import './ExitClearanceForm.css';

const DEPT_ICONS: Partial<Record<ClearanceDepartment, string>> = {
  IT:       '💻',
  Finance:  '💰',
  Admin:    '🏠',
  Security: '🔐',
  HR:       '👥',
};

const DEPT_DESCS: Partial<Record<ClearanceDepartment, string>> = {
  IT:       'Laptop, access cards, software licences, VPN, email revocation',
  Finance:  'Full & final settlement, payroll, expense claims, PF transfer',
  Admin:    'Office keys, ID card, parking pass, stationery items',
  Security: 'Building access revocation, CCTV footage, security badges',
  HR:       'Experience letter, relieving letter, NOC issuance',
};

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

interface ExitClearanceFormProps {
  record: OffboardingRecord;
}

export default function ExitClearanceForm({ record }: ExitClearanceFormProps) {
  const { data: clearances = [], isLoading } = useFetch<Clearance[]>(
    () => getClearances(record.id),
    [record.id],
    { refetchInterval: 8000 },
  );

  const cleared = clearances.filter((c) => c.isCleared).length;
  const total   = clearances.length;
  const allDone = total > 0 && cleared === total;
  const pct     = total ? Math.round((cleared / total) * 100) : 0;

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="exit-clearance-wrap">
      <div className="alert alert-info" style={{ marginBottom: 'var(--sp-xl)' }}>
        ℹ This page shows the status of your departmental clearances. Each department
        must sign off before your offboarding can proceed to final approval. You do not
        need to take any action here — this is a read-only view.
      </div>

      <div className="card ecf-summary-card">
        <div className="ecf-summary-row">
          <div className="ecf-summary-item">
            <div className="ecf-summary-label">Total clearances</div>
            <div className="ecf-summary-val">{total}</div>
          </div>
          <div className="ecf-summary-item">
            <div className="ecf-summary-label">Cleared</div>
            <div className="ecf-summary-val" style={{ color: 'var(--clr-success)' }}>{cleared}</div>
          </div>
          <div className="ecf-summary-item">
            <div className="ecf-summary-label">Pending</div>
            <div className="ecf-summary-val" style={{ color: 'var(--clr-warning)' }}>{total - cleared}</div>
          </div>
          <div className="ecf-summary-item">
            <div className="ecf-summary-label">Progress</div>
            <div className="ecf-summary-val">{pct}%</div>
          </div>
        </div>

        <div className="ecf-progress-bar-wrap">
          <div
            className="ecf-progress-bar-fill"
            style={{
              width: `${pct}%`,
              background: allDone ? 'var(--clr-success)' : 'var(--clr-primary)',
            }}
          />
        </div>

        {allDone && (
          <div className="alert alert-success" style={{ marginTop: 'var(--sp-md)', marginBottom: 0 }}>
            ✅ All clearances complete! The HR team will issue your final approval shortly.
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 'var(--sp-lg)' }}>
        <div className="card-header">
          <span className="card-title">Department Clearance Status</span>
        </div>

        {clearances.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px' }}>
            <div className="icon">⏳</div>
            <h3>Clearances not initiated yet</h3>
            <p>HR will send clearance requests to all departments once offboarding is initiated.</p>
          </div>
        ) : (
          <div className="ecf-dept-list">
            {clearances.map((c) => (
              <div
                key={c.id}
                className={`ecf-dept-row ${c.isCleared ? 'ecf-dept-row--cleared' : ''}`}
              >
                <div className="ecf-dept-icon">
                  {DEPT_ICONS[c.department as ClearanceDepartment] ?? '📋'}
                </div>
                <div className="ecf-dept-info">
                  <div className="ecf-dept-name">{c.department}</div>
                  <div className="ecf-dept-desc">
                    {DEPT_DESCS[c.department as ClearanceDepartment] ?? 'Department clearance'}
                  </div>
                  {c.isCleared && c.clearedAt && (
                    <div className="ecf-dept-cleared-by">
                      Cleared by {c.clearedBy} on {formatDate(c.clearedAt)}
                      {c.notes && (
                        <span className="ecf-dept-notes"> · "{c.notes}"</span>
                      )}
                    </div>
                  )}
                  {!c.isCleared && !c.isUnlocked && c.department === 'Finance' && (
                    <div className="ecf-dept-locked-note">
                      🔒 Unlocks 2 days before your last working date
                    </div>
                  )}
                </div>
                <div className="ecf-dept-status">
                  {c.isCleared ? (
                    <Badge variant="success" dot>Cleared</Badge>
                  ) : !c.isUnlocked ? (
                    <Badge variant="neutral">Locked</Badge>
                  ) : (
                    <Badge variant="warning" dot>Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}