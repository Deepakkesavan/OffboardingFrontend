import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStageData, updateRecord, addAuditEntry, createStageData } from '../../api/offboardingApi';
import { STAGES } from '../../store/offboardingStore';

/* 90-day notice period calculator */
function calculate90Days(submittedAt) {
  if (!submittedAt) return { noticeEndDate: '', daysRemaining: null };
  const submit = new Date(submittedAt);
  const noticeEnd = new Date(submit);
  noticeEnd.setDate(noticeEnd.getDate() + 90);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((noticeEnd - now) / (1000 * 60 * 60 * 24)));
  return {
    noticeEndDate:  noticeEnd.toISOString().split('T')[0],
    daysRemaining,
  };
}

export default function FinalApproval({ record, stageData }) {
  const queryClient = useQueryClient();

  const finalStage  = stageData.find(s => s.stageType === STAGES.FINAL_APPROVAL);
  const isCompleted = !!finalStage?.completedAt;
  const saved       = finalStage?.payload || {};

  const { noticeEndDate, daysRemaining } = calculate90Days(record.submittedAt);

  const [form, setForm] = useState({
    /* Resignation form fields */
    resignationLetter:     saved.resignationLetter     || '',
    lastWorkingDate:       saved.lastWorkingDate       || record.endDate || '',
    relievingDate:         saved.relievingDate         || noticeEndDate   || '',
    /* HR final approval fields — all editable per requirement */
    noticePeriodStart:     saved.noticePeriodStart     || record.submittedAt?.split('T')[0] || '',
    noticePeriodEnd:       saved.noticePeriodEnd       || noticeEndDate || '',
    actualNoticeDays:      saved.actualNoticeDays      || '90',
    fullAndFinalDate:      saved.fullAndFinalDate      || '',
    gratuityApplicable:    saved.gratuityApplicable    || 'No',
    pfTransfer:            saved.pfTransfer            || 'No',
    exitBonus:             saved.exitBonus             || 'No',
    exitBonusAmount:       saved.exitBonusAmount       || '',
    experienceLetterDate:  saved.experienceLetterDate  || '',
    hrComments:            saved.hrComments            || '',
    approvedBy:            saved.approvedBy            || '',
  });

  const onChange = f => e => setForm(s => ({ ...s, [f]: e.target.value }));

  const missingFields = [
    !form.lastWorkingDate  && 'Last Working Date',
    !form.resignationLetter.trim() && 'Resignation Letter / Statement',
    !form.approvedBy.trim()        && 'Approved By (HR Manager)',
  ].filter(Boolean);

  const canSubmit = missingFields.length === 0;

  const mutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();

      if (finalStage) {
        await updateStageData(finalStage.id, { payload: form, completedAt: now });
      } else {
        await createStageData({
          recordId:    record.id,
          stageType:   STAGES.FINAL_APPROVAL,
          payload:     form,
          completedAt: now,
        });
      }

      await updateRecord(record.id, {
        currentStage: STAGES.COMPLETED,
        status:       'completed',
      });

      /* Mark COMPLETED stage */
      await createStageData({
        recordId:    record.id,
        stageType:   STAGES.COMPLETED,
        payload:     {},
        completedAt: now,
      });

      await addAuditEntry({
        recordId:    record.id,
        action:      'hr_final_approval_completed',
        performedBy: form.approvedBy || 'HR',
        stageBefore: STAGES.FINAL_APPROVAL,
        stageAfter:  STAGES.COMPLETED,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['record', record.id] });
      queryClient.invalidateQueries({ queryKey: ['stageData', record.id] });
    },
  });

  return (
    <div>
      {/* ─── Resignation Form ─── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📄 Resignation Form</span>
          <span className="badge badge-info">Must complete before HR Final Approval</span>
        </div>

        <div className="alert alert-warning">
          ⚠ Please fill in the resignation details below. This must be completed before HR can issue final approval.
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Employee Name</label>
            <input value={record.employeeName} readOnly />
          </div>
          <div className="form-group">
            <label>Date of Joining</label>
            <input value={record.joiningDate || '—'} readOnly />
          </div>
          <div className="form-group">
            <label>Last Working Date <span className="required-star">*</span></label>
            <input type="date" value={form.lastWorkingDate} onChange={onChange('lastWorkingDate')} readOnly={isCompleted} />
          </div>
          <div className="form-group">
            <label>Relieving Date</label>
            <input type="date" value={form.relievingDate} onChange={onChange('relievingDate')} readOnly={isCompleted} />
          </div>
          <div className="form-group full-width">
            <label>Resignation Letter / Statement <span className="required-star">*</span></label>
            <textarea value={form.resignationLetter} onChange={onChange('resignationLetter')} readOnly={isCompleted}
              rows={5} placeholder="I hereby resign from my position effective..." />
          </div>
        </div>
      </div>

      {/* ─── HR Final Approval Form ─── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🎯 HR Final Approval</span>
          {isCompleted
            ? <span className="badge badge-success">✓ Approved — Offboarding Complete</span>
            : <span className="badge badge-warning">Pending HR Approval</span>
          }
        </div>

        {/* 90-day notice info box */}
        <div style={{
          background: 'var(--clr-primary-light)',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--clr-primary)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Exit Submitted
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
              {new Date(record.submittedAt).toLocaleDateString('en-IN')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--clr-primary)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              90-Day Notice Ends
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
              {new Date(noticeEndDate).toLocaleDateString('en-IN')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--clr-primary)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Days Remaining
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '4px', color: daysRemaining <= 10 ? 'var(--clr-danger)' : 'var(--clr-text-primary)' }}>
              {daysRemaining} days
            </div>
          </div>
          <p style={{ width: '100%', margin: 0, fontSize: '.8rem', color: 'var(--clr-primary)' }}>
            ℹ All fields below are editable. The notice period dates are pre-calculated from the exit submission date (+ 90 days).
          </p>
        </div>

        <div className="section-title">Notice Period Details (Editable)</div>
        <div className="form-grid" style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label>Notice Period Start Date</label>
            <input type="date" value={form.noticePeriodStart} onChange={onChange('noticePeriodStart')} readOnly={isCompleted} />
            <span className="field-hint">Auto-set from exit submission date</span>
          </div>
          <div className="form-group">
            <label>Notice Period End Date</label>
            <input type="date" value={form.noticePeriodEnd} onChange={onChange('noticePeriodEnd')} readOnly={isCompleted} />
            <span className="field-hint">Auto-calculated (start + 90 days)</span>
          </div>
          <div className="form-group">
            <label>Actual Notice Days</label>
            <input type="number" value={form.actualNoticeDays} onChange={onChange('actualNoticeDays')} readOnly={isCompleted} />
          </div>
          <div className="form-group">
            <label>Full & Final Settlement Date</label>
            <input type="date" value={form.fullAndFinalDate} onChange={onChange('fullAndFinalDate')} readOnly={isCompleted} />
          </div>
          <div className="form-group">
            <label>Experience Letter Date</label>
            <input type="date" value={form.experienceLetterDate} onChange={onChange('experienceLetterDate')} readOnly={isCompleted} />
          </div>
        </div>

        <div className="section-title">Entitlements & Benefits</div>
        <div className="form-grid" style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label>Gratuity Applicable</label>
            <select value={form.gratuityApplicable} onChange={onChange('gratuityApplicable')} disabled={isCompleted}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label>PF Transfer Required</label>
            <select value={form.pfTransfer} onChange={onChange('pfTransfer')} disabled={isCompleted}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label>Exit Bonus Applicable</label>
            <select value={form.exitBonus} onChange={onChange('exitBonus')} disabled={isCompleted}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          {form.exitBonus === 'Yes' && (
            <div className="form-group">
              <label>Exit Bonus Amount (₹)</label>
              <input type="number" value={form.exitBonusAmount} onChange={onChange('exitBonusAmount')} readOnly={isCompleted} />
            </div>
          )}
        </div>

        <div className="form-grid cols-1">
          <div className="form-group">
            <label>Approved By (HR Manager) <span className="required-star">*</span></label>
            <input value={form.approvedBy} onChange={onChange('approvedBy')} readOnly={isCompleted}
              placeholder="HR Manager name" />
          </div>
          <div className="form-group">
            <label>HR Comments / Notes</label>
            <textarea value={form.hrComments} onChange={onChange('hrComments')} readOnly={isCompleted}
              rows={3} placeholder="Any final remarks or instructions..." />
          </div>
        </div>

        {isCompleted && (
          <div className="alert alert-success" style={{ marginTop: '20px' }}>
            🎉 Offboarding process completed successfully. All records have been locked.
          </div>
        )}

        {!isCompleted && (
          <div>
            {missingFields.length > 0 && (
              <div className="alert alert-warning" style={{ marginTop: '16px' }}>
                ⚠ Please fill in the following required fields before issuing approval:
                <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                  {missingFields.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
            )}
            <div className="form-actions" style={{ marginTop: '16px' }}>
              <p style={{ marginRight: 'auto', fontSize: '.85rem', color: 'var(--clr-text-muted)' }}>
                Once approved, all records will be locked and the offboarding is complete.
              </p>
              <button
                className="btn btn-success btn-lg"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !canSubmit}
              >
                {mutation.isPending ? 'Processing...' : '🎯 Issue Final Approval & Close Offboarding'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
