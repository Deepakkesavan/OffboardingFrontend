import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { getClearances, updateClearance, updateRecord, createStageData, addAuditEntry, updateStageData } from '../../api/offboardingApi';
import { STAGES } from '../../store/offboardingStore';
import useStore from '../../store/offboardingStore';

const DEPT_ICONS = { IT: '💻', Finance: '💰', Admin: '🏠', Security: '🔐', HR: '👥' };

function isFinanceUnlocked(endDate) {
  if (!endDate) return false;
  const diff = (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24);
  return diff <= 2;
}

export default function ClearancesScreen({ record, stageData, onStageChange }) {
  const { activeRole } = useStore();

  const {
    data: clearances = [],
    isLoading,
    refetch: refetchClearances,
  } = useFetch(() => getClearances(record.id), [record.id]);

  const clearanceStage  = stageData.find(s => s.stageType === STAGES.CLEARANCES);
  const isAllDone       = clearances.length > 0 && clearances.every(c => c.isCleared);
  const allCleared      = clearances.filter(c => c.isCleared).length;
  const financeUnlocked = isFinanceUnlocked(record.endDate);

  const { mutate: markCleared, isPending: isClearing } = useMutation(
    async ({ clearance, notes }) => {
      await updateClearance(clearance.id, {
        isCleared: true,
        clearedBy: `${activeRole} user`,
        clearedAt: new Date().toISOString(),
        notes,
      });
    },
    { onSuccess: refetchClearances }
  );

  const { mutate: advance, isPending: isAdvancing } = useMutation(
    async () => {
      const now = new Date().toISOString();
      if (clearanceStage) {
        await updateStageData(clearanceStage.id, { payload: {}, completedAt: now });
      }
      await createStageData({
        recordId:    record.id,
        stageType:   STAGES.FINAL_APPROVAL,
        payload:     {},
        completedAt: null,
      });
      await updateRecord(record.id, { currentStage: STAGES.FINAL_APPROVAL });
      await addAuditEntry({
        recordId:    record.id,
        action:      'all_clearances_done',
        performedBy: 'System',
        stageBefore: STAGES.CLEARANCES,
        stageAfter:  STAGES.FINAL_APPROVAL,
      });
    },
    { onSuccess: onStageChange }
  );

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      {!financeUnlocked && (
        <div className="alert alert-warning">
          ⏳ Finance clearance is locked. It will unlock 2 days before the employee's last working date
          ({new Date(record.endDate).toLocaleDateString('en-IN')}).
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">✅ Department Clearances</span>
          <span className="badge badge-neutral">{allCleared} / {clearances.length} cleared</span>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ height: '6px', background: 'var(--clr-border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${clearances.length ? (allCleared / clearances.length) * 100 : 0}%`,
              background: 'var(--clr-success)',
              borderRadius: '3px',
              transition: 'width .4s ease',
            }} />
          </div>
          <p style={{ fontSize: '.8rem', marginTop: '6px', color: 'var(--clr-text-muted)' }}>
            {allCleared} of {clearances.length} departments cleared
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {clearances.map(c => (
            <ClearanceRow
              key={c.id}
              clearance={c}
              activeRole={activeRole}
              financeUnlocked={financeUnlocked}
              onClear={(notes) => markCleared({ clearance: c, notes })}
              isProcessing={isClearing}
            />
          ))}
        </div>

        {isAllDone && (
          <div className="form-actions" style={{ marginTop: '24px' }}>
            <div className="alert alert-success" style={{ flex: 1, margin: 0 }}>
              ✓ All departments have cleared. Ready to proceed to final approval.
            </div>
            <button
              className="btn btn-primary"
              onClick={() => advance()}
              disabled={isAdvancing}
            >
              {isAdvancing ? 'Processing...' : 'Proceed to Final Approval →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ClearanceRow({ clearance, financeUnlocked, onClear, isProcessing }) {
  const [showForm, setShowForm] = useState(false);
  const [notes,    setNotes]    = useState('');

  const isFinance = clearance.department === 'Finance';
  const locked    = isFinance && !financeUnlocked;

  return (
    <div style={{
      border: `1px solid ${clearance.isCleared ? 'var(--clr-success-bg)' : 'var(--clr-border)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '16px',
      background: clearance.isCleared ? 'var(--clr-success-bg)' : locked ? 'var(--clr-surface-2)' : 'var(--clr-surface)',
      opacity: locked ? .6 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>{DEPT_ICONS[clearance.department] || '📋'}</span>
          <div>
            <div style={{ fontWeight: 600 }}>{clearance.department}</div>
            {clearance.isCleared && (
              <div style={{ fontSize: '.8rem', color: 'var(--clr-success)' }}>
                Cleared by {clearance.clearedBy} · {new Date(clearance.clearedAt).toLocaleDateString('en-IN')}
              </div>
            )}
            {locked && <div style={{ fontSize: '.8rem', color: 'var(--clr-warning)' }}>🔒 Unlocks at T-2</div>}
            {clearance.notes && <div style={{ fontSize: '.8rem', color: 'var(--clr-text-muted)', marginTop: '2px' }}>{clearance.notes}</div>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {clearance.isCleared
            ? <span className="badge badge-success">✓ Cleared</span>
            : locked
            ? <span className="badge badge-warning">🔒 Locked</span>
            : <span className="badge badge-neutral">Pending</span>
          }
          {!clearance.isCleared && !locked && (
            <button className="btn btn-success btn-sm" onClick={() => setShowForm(f => !f)} disabled={isProcessing}>
              Mark Cleared
            </button>
          )}
        </div>
      </div>

      {showForm && !clearance.isCleared && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--clr-border)' }}>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>Clearance Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Any notes about the clearance..." />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            <button
              className="btn btn-success btn-sm"
              onClick={() => { onClear(notes); setShowForm(false); }}
              disabled={isProcessing}
            >
              ✓ Confirm Cleared
            </button>
          </div>
        </div>
      )}
    </div>
  );
}