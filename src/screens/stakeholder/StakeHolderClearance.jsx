import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { getClearances, updateClearance, addAuditEntry } from '../../api/offboardingApi';
import Badge from '../../components/Badge';
import { ConfirmModal } from '../../components/Modal';
import './StakeholderClearance.css';

const DEPT_ICONS = { IT: '💻', Finance: '💰', Admin: '🏠', Security: '🔐', HR: '👥' };
const DEPT_DESCS = {
  IT:       'Revoke system access, reclaim hardware, deactivate accounts',
  Finance:  'Process final settlement, clear outstanding claims',
  Admin:    'Collect office keys, ID, parking pass, access cards',
  Security: 'Deactivate building access and security credentials',
  HR:       'Issue experience letter, NOC, and relieving letter',
};

function isFinanceUnlocked(endDate) {
  if (!endDate) return false;
  return (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24) <= 2;
}

export default function StakeholderClearance({ record }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeClear, setActiveClear] = useState(null);
  const [notes,       setNotes]       = useState('');

  const {
    data: clearances = [],
    isLoading,
    refetch,
  } = useFetch(
    () => getClearances(record.id),
    [record.id],
    { refetchInterval: 8000 }
  );

  const financeUnlocked = isFinanceUnlocked(record.endDate);
  const cleared = clearances.filter(c => c.isCleared).length;
  const total   = clearances.length;

  const { mutate: confirmClear, isPending } = useMutation(
    async () => {
      const now = new Date().toISOString();
      await updateClearance(activeClear.id, {
        isCleared: true,
        clearedBy: 'Stakeholder',
        clearedAt: now,
        notes:     notes.trim() || null,
      });
      await addAuditEntry({
        recordId:    record.id,
        action:      'clearance_marked',
        performedBy: `${activeClear.department} stakeholder`,
        stageBefore: 'clearances',
        stageAfter:  'clearances',
      });
    },
    {
      onSuccess: () => {
        refetch();
        setConfirmOpen(false);
        setActiveClear(null);
        setNotes('');
      },
    }
  );

  const handleClearClick = (clearance) => {
    setActiveClear(clearance);
    setNotes('');
    setConfirmOpen(true);
  };

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      {!financeUnlocked && (
        <div className="alert alert-warning">
          ⏳ Finance clearance is locked until 2 days before the employee's last working date
          ({new Date(record.endDate).toLocaleDateString('en-IN')}).
          All other departments can proceed now.
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">🔗 Stakeholder Clearances</span>
          <span className="badge badge-neutral">{cleared} / {total} done</span>
        </div>

        <div style={{ marginBottom: 'var(--sp-lg)' }}>
          <div className="sc-progress-track">
            <div
              className="sc-progress-fill"
              style={{
                width: total ? `${(cleared / total) * 100}%` : '0%',
                background: cleared === total ? 'var(--clr-success)' : 'var(--clr-primary)',
              }}
            />
          </div>
          <p style={{ fontSize: '.8rem', marginTop: '6px', color: 'var(--clr-text-muted)' }}>
            {cleared} of {total} departments cleared
          </p>
        </div>

        <div className="sc-cards">
          {clearances.map(c => {
            const isFinance = c.department === 'Finance';
            const locked    = isFinance && !financeUnlocked;

            return (
              <div
                key={c.id}
                className={`sc-card ${c.isCleared ? 'sc-card--cleared' : ''} ${locked ? 'sc-card--locked' : ''}`}
              >
                <div className="sc-card-top">
                  <span className="sc-dept-icon">{DEPT_ICONS[c.department] || '📋'}</span>
                  <div className="sc-dept-info">
                    <div className="sc-dept-name">{c.department}</div>
                    <div className="sc-dept-desc">{DEPT_DESCS[c.department]}</div>
                  </div>
                  <div className="sc-dept-badge">
                    {c.isCleared
                      ? <Badge variant="success" dot>Cleared</Badge>
                      : locked
                      ? <Badge variant="neutral">🔒 Locked</Badge>
                      : <Badge variant="warning" dot>Pending</Badge>
                    }
                  </div>
                </div>

                {c.isCleared && (
                  <div className="sc-cleared-meta">
                    ✓ Cleared by <strong>{c.clearedBy}</strong> on {new Date(c.clearedAt).toLocaleDateString('en-IN')}
                    {c.notes && <span className="sc-cleared-notes"> · {c.notes}</span>}
                  </div>
                )}

                {!c.isCleared && !locked && (
                  <div className="sc-action-row">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleClearClick(c)}
                      disabled={isPending}
                    >
                      ✓ Mark as Cleared
                    </button>
                  </div>
                )}

                {locked && (
                  <div className="sc-locked-note">
                    Unlocks 2 days before {new Date(record.endDate).toLocaleDateString('en-IN')}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {cleared === total && total > 0 && (
          <div className="alert alert-success" style={{ margin: 'var(--sp-lg) 0 0' }}>
            🎉 All stakeholder clearances are complete. HR will proceed to final approval.
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setActiveClear(null); }}
        onConfirm={() => confirmClear()}
        title={`Confirm ${activeClear?.department} Clearance`}
        confirmLabel="Confirm Clearance"
        confirmVariant="btn-success"
        loading={isPending}
        message={
          <div>
            <p style={{ marginBottom: '16px' }}>
              You are confirming that the <strong>{activeClear?.department}</strong> department
              has completed all clearance tasks for <strong>{record.employeeName}</strong>.
            </p>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px' }}>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Any remarks about this clearance…"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        }
      />
    </div>
  );
}