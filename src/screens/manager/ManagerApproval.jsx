import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStageData, updateRecord, addAuditEntry, updateStageData } from '../../api/offboardingApi';
import { STAGES } from '../../store/offboardingStore';

export default function ManagerApproval({ record, stageData }) {
  const queryClient = useQueryClient();

  const managerStage = stageData.find(s => s.stageType === STAGES.MANAGER_REVIEW);
  const isCompleted  = !!managerStage?.completedAt;
  const saved        = managerStage?.payload || {};

  const exitStage    = stageData.find(s => s.stageType === STAGES.EXIT_INTERVIEW);
  const exitPayload  = exitStage?.payload || {};

  const [form, setForm] = useState({
    scheduledDate:       saved.scheduledDate       || '',
    scheduledTime:       saved.scheduledTime       || '',
    interviewMode:       saved.interviewMode       || 'In-Person',
    managerNotes:        saved.managerNotes        || '',
    handoverPlan:        saved.handoverPlan        || '',
    approvalDecision:    saved.approvalDecision    || '',
    rejectionReason:     saved.rejectionReason     || '',
  });

  const onChange = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const mutation = useMutation({
    mutationFn: async (decision) => {
      const now = new Date().toISOString();
      const payload = { ...form, approvalDecision: decision };

      if (managerStage) {
        await updateStageData(managerStage.id, { payload, completedAt: now });
      } else {
        await createStageData({
          recordId:    record.id,
          stageType:   STAGES.MANAGER_REVIEW,
          payload,
          completedAt: now,
        });
      }

      if (decision === 'approved') {
        await createStageData({
          recordId:    record.id,
          stageType:   STAGES.HR_INITIATION,
          payload:     {},
          completedAt: null,
        });
        await updateRecord(record.id, { currentStage: STAGES.HR_INITIATION });
      }

      await addAuditEntry({
        recordId:    record.id,
        action:      `manager_${decision}`,
        performedBy: record.manager,
        stageBefore: STAGES.MANAGER_REVIEW,
        stageAfter:  decision === 'approved' ? STAGES.HR_INITIATION : STAGES.MANAGER_REVIEW,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['record', record.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ['stageData', record.id], exact: false });
    },
  });

  const isApproved = saved.approvalDecision === 'approved';
  const isRejected = saved.approvalDecision === 'rejected';

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">👔 Manager Review</span>
        {isCompleted
          ? <span className={`badge ${isApproved ? 'badge-success' : 'badge-danger'}`}>
              {isApproved ? '✓ Approved' : '✗ Rejected'}
            </span>
          : <span className="badge badge-warning">Awaiting Manager Action</span>
        }
      </div>

      {/* Employee summary */}
      <div style={{ background: 'var(--clr-surface-2)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', border: '1px solid var(--clr-border)' }}>
        <div className="section-title">Exit Interview Summary</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Employee</label>
            <input value={record.employeeName} readOnly />
          </div>
          <div className="form-group">
            <label>Reason for Exit</label>
            <input value={record.exitReason} readOnly />
          </div>
          <div className="form-group">
            <label>Last Working Date</label>
            <input value={record.endDate} readOnly />
          </div>
          <div className="form-group">
            <label>Overall Rating Given</label>
            <input value={exitPayload.overallRating || '—'} readOnly />
          </div>
        </div>
      </div>

      {/* Interview scheduling */}
      <div className="section-title">Schedule Exit Interview</div>
      <div className="form-grid" style={{ marginBottom: '24px' }}>
        <div className="form-group">
          <label>Interview Date {!isCompleted && <span className="required-star">*</span>}</label>
          <input type="date" value={form.scheduledDate} onChange={onChange('scheduledDate')} readOnly={isCompleted} />
        </div>
        <div className="form-group">
          <label>Interview Time</label>
          <input type="time" value={form.scheduledTime} onChange={onChange('scheduledTime')} readOnly={isCompleted} />
        </div>
        <div className="form-group">
          <label>Mode</label>
          <select value={form.interviewMode} onChange={onChange('interviewMode')} disabled={isCompleted}>
            <option>In-Person</option>
            <option>Video Call</option>
            <option>Phone</option>
          </select>
        </div>
      </div>

      <div className="form-grid cols-1">
        <div className="form-group">
          <label>Manager Notes / Observations</label>
          <textarea value={form.managerNotes} onChange={onChange('managerNotes')} readOnly={isCompleted} rows={3}
            placeholder="Notes from the exit interview..." />
        </div>
        <div className="form-group">
          <label>Handover Plan</label>
          <textarea value={form.handoverPlan} onChange={onChange('handoverPlan')} readOnly={isCompleted} rows={3}
            placeholder="Describe the knowledge transfer and handover plan..." />
        </div>

        {isRejected && (
          <div className="form-group">
            <label>Rejection Reason</label>
            <textarea value={form.rejectionReason} onChange={onChange('rejectionReason')} readOnly={isCompleted} rows={2} />
          </div>
        )}
      </div>

      {isCompleted && (
        <div className={`alert ${isApproved ? 'alert-success' : 'alert-danger'}`} style={{ marginTop: '16px' }}>
          {isApproved
            ? '✓ Exit approved. This record has been forwarded to HR.'
            : '✗ Exit rejected. The employee has been notified.'}
        </div>
      )}

      {!isCompleted && (
        <div className="form-actions">
          <button
            className="btn btn-danger btn-outline"
            onClick={() => mutation.mutate('rejected')}
            disabled={mutation.isPending}
          >
            ✗ Reject Exit
          </button>
          <button
            className="btn btn-success"
            onClick={() => mutation.mutate('approved')}
            disabled={mutation.isPending || !form.scheduledDate}
          >
            {mutation.isPending ? 'Processing...' : '✓ Approve & Forward to HR →'}
          </button>
        </div>
      )}
    </div>
  );
}