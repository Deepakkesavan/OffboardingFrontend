import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateStageData, updateRecord, addAuditEntry, createStageData, createClearance
} from '../../api/offboardingApi';
import { STAGES } from '../../store/offboardingStore';

const CLEARANCE_DEPTS = ['IT', 'Finance', 'Admin', 'Security', 'HR'];

export default function HRInitiation({ record, stageData }) {
  const queryClient = useQueryClient();

  const hrStage     = stageData.find(s => s.stageType === STAGES.HR_INITIATION);
  const isCompleted = !!hrStage?.completedAt;
  const saved       = hrStage?.payload || {};

  const managerStage  = stageData.find(s => s.stageType === STAGES.MANAGER_REVIEW);
  const managerPayload = managerStage?.payload || {};

  const [form, setForm] = useState({
    hrOwner:         saved.hrOwner         || '',
    offboardingPlan: saved.offboardingPlan || '',
    assetReturn:     saved.assetReturn     || '',
    systemAccess:    saved.systemAccess    || '',
    payrollNotes:    saved.payrollNotes    || '',
  });

  const onChange = f => e => setForm(s => ({ ...s, [f]: e.target.value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();

      if (hrStage) {
        await updateStageData(hrStage.id, { payload: form, completedAt: now });
      } else {
        await createStageData({
          recordId:    record.id,
          stageType:   STAGES.HR_INITIATION,
          payload:     form,
          completedAt: now,
        });
      }

      /* Create clearance rows for each dept */
      for (const dept of CLEARANCE_DEPTS) {
        await createClearance({
          recordId:    record.id,
          department:  dept,
          isUnlocked:  dept === 'Finance' ? false : true, /* Finance unlocks at T-2 */
          isCleared:   false,
          clearedBy:   null,
          clearedAt:   null,
        });
      }

      /* Create clearances stage_data */
      await createStageData({
        recordId:    record.id,
        stageType:   STAGES.CLEARANCES,
        payload:     {},
        completedAt: null,
      });

      await updateRecord(record.id, { currentStage: STAGES.CLEARANCES });

      await addAuditEntry({
        recordId:    record.id,
        action:      'hr_offboarding_initiated',
        performedBy: form.hrOwner || 'HR Team',
        stageBefore: STAGES.HR_INITIATION,
        stageAfter:  STAGES.CLEARANCES,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['record', record.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ['stageData', record.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ['clearances', record.id], exact: false });
    },
  });

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">🏢 HR Initiation</span>
        {isCompleted
          ? <span className="badge badge-success">✓ Initiated</span>
          : <span className="badge badge-warning">Action Required</span>
        }
      </div>

      {/* Summary from previous stages */}
      <div style={{ background: 'var(--clr-surface-2)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', border: '1px solid var(--clr-border)' }}>
        <div className="section-title">Case Summary</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Employee</label>
            <input value={`${record.employeeName} (${record.employeeId})`} readOnly />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input value={record.department} readOnly />
          </div>
          <div className="form-group">
            <label>Exit Reason</label>
            <input value={record.exitReason} readOnly />
          </div>
          <div className="form-group">
            <label>Last Working Date</label>
            <input value={record.endDate} readOnly />
          </div>
          <div className="form-group">
            <label>Interview Scheduled</label>
            <input value={managerPayload.scheduledDate || '—'} readOnly />
          </div>
          <div className="form-group">
            <label>Manager Decision</label>
            <input value={managerPayload.approvalDecision || '—'} readOnly style={{ textTransform: 'capitalize' }} />
          </div>
        </div>
      </div>

      <div className="section-title">HR Offboarding Setup</div>

      <div className="form-grid">
        <div className="form-group">
          <label>HR Owner / POC {!isCompleted && <span className="required-star">*</span>}</label>
          <input value={form.hrOwner} onChange={onChange('hrOwner')} readOnly={isCompleted}
            placeholder="Name of HR handling this case" />
        </div>

        <div className="form-group">
          <label>Asset Return Plan</label>
          <input value={form.assetReturn} onChange={onChange('assetReturn')} readOnly={isCompleted}
            placeholder="Laptop, access cards, etc." />
        </div>

        <div className="form-group">
          <label>System Access Revocation</label>
          <input value={form.systemAccess} onChange={onChange('systemAccess')} readOnly={isCompleted}
            placeholder="Email, VPN, tools..." />
        </div>

        <div className="form-group">
          <label>Payroll Notes</label>
          <input value={form.payrollNotes} onChange={onChange('payrollNotes')} readOnly={isCompleted}
            placeholder="Final salary, leaves, etc." />
        </div>

        <div className="form-group full-width">
          <label>Offboarding Plan / Notes</label>
          <textarea value={form.offboardingPlan} onChange={onChange('offboardingPlan')} readOnly={isCompleted}
            rows={4} placeholder="Detailed offboarding plan and instructions for each department..." />
        </div>
      </div>

      {/* Clearances that will be triggered */}
      <div style={{ marginTop: '20px' }}>
        <div className="section-title">Clearances to be initiated</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          {CLEARANCE_DEPTS.map(d => (
            <span key={d} className={`badge ${d === 'Finance' ? 'badge-warning' : 'badge-neutral'}`}>
              {d} {d === 'Finance' ? '(unlocks at T-2)' : ''}
            </span>
          ))}
        </div>
      </div>

      {isCompleted && (
        <div className="alert alert-success" style={{ marginTop: '20px' }}>
          ✓ Offboarding initiated. Clearance requests have been sent to all departments.
        </div>
      )}

      {!isCompleted && (
        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.hrOwner}
          >
            {mutation.isPending ? 'Initiating...' : '🚀 Initiate Offboarding & Send Clearances →'}
          </button>
        </div>
      )}
    </div>
  );
}