import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStageData, updateRecord, addAuditEntry } from '../../api/offboardingApi';
import { STAGES } from '../../store/offboardingStore';

const RATINGS = ['1 - Very Poor', '2 - Poor', '3 - Average', '4 - Good', '5 - Excellent'];

export default function ExitInterviewForm({ record, stageData }) {
  const queryClient = useQueryClient();

  const exitStage   = stageData.find(s => s.stageType === STAGES.EXIT_INTERVIEW);
  const isSubmitted = !!exitStage?.completedAt;
  const saved       = exitStage?.payload || {};

  const [form, setForm] = useState({
    overallRating:        saved.overallRating        || '',
    managementRating:     saved.managementRating     || '',
    workCultureRating:    saved.workCultureRating     || '',
    growthRating:         saved.growthRating          || '',
    primaryReason:        saved.primaryReason         || record.exitReason || '',
    likedMost:            saved.likedMost             || '',
    improvements:         saved.improvements          || '',
    wouldRecommend:       saved.wouldRecommend        || '',
    additionalComments:   saved.additionalComments    || '',
    interviewDate:        saved.interviewDate         || '',
  });

  const onChange = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();

      await updateStageData(exitStage.id, {
        payload:     form,
        completedAt: now,
      });

      await updateRecord(record.id, {
        currentStage: STAGES.MANAGER_REVIEW,
      });

      await addAuditEntry({
        recordId:    record.id,
        action:      'exit_interview_submitted',
        performedBy: record.employeeName,
        stageBefore: STAGES.EXIT_INTERVIEW,
        stageAfter:  STAGES.MANAGER_REVIEW,
      });
    },
    onSuccess: () => {
      // Use exact: false so both string and number id variations are invalidated
      queryClient.invalidateQueries({ queryKey: ['record'],    exact: false });
      queryClient.invalidateQueries({ queryKey: ['stageData'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['auditLog'],  exact: false });
    },
  });

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">📝 Exit Interview Form</span>
        {isSubmitted
          ? <span className="badge badge-success">✓ Submitted</span>
          : <span className="badge badge-warning">Pending Submission</span>
        }
      </div>

      {isSubmitted && (
        <div className="alert alert-info" style={{ marginBottom: '24px' }}>
          ℹ This form has been submitted and is now locked. Your responses are recorded.
        </div>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label>Employee Name</label>
          <input value={record.employeeName} readOnly />
        </div>
        <div className="form-group">
          <label>Employee ID</label>
          <input value={record.employeeId} readOnly />
        </div>
        <div className="form-group">
          <label>Department</label>
          <input value={record.department} readOnly />
        </div>
        <div className="form-group">
          <label>Designation</label>
          <input value={record.designation} readOnly />
        </div>
        <div className="form-group">
          <label>Last Working Date</label>
          <input value={record.endDate} readOnly />
        </div>
        <div className="form-group">
          <label>Interview Date {!isSubmitted && <span className="required-star">*</span>}</label>
          <input
            type="date"
            value={form.interviewDate}
            onChange={onChange('interviewDate')}
            readOnly={isSubmitted}
          />
        </div>
      </div>

      <div style={{ marginTop: '24px', marginBottom: '8px' }} className="section-title">
        Satisfaction Ratings
      </div>

      <div className="form-grid cols-3" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Overall Experience',  field: 'overallRating'     },
          { label: 'Management',          field: 'managementRating'  },
          { label: 'Work Culture',        field: 'workCultureRating' },
          { label: 'Growth Opportunities',field: 'growthRating'      },
        ].map(({ label, field }) => (
          <div key={field} className="form-group">
            <label>{label} {!isSubmitted && <span className="required-star">*</span>}</label>
            <select value={form[field]} onChange={onChange(field)} disabled={isSubmitted}>
              <option value="">Select rating</option>
              {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="form-grid cols-1">
        <div className="form-group">
          <label>Primary Reason for Leaving {!isSubmitted && <span className="required-star">*</span>}</label>
          <input value={form.primaryReason} onChange={onChange('primaryReason')} readOnly={isSubmitted} />
        </div>

        <div className="form-group">
          <label>What did you like most about working here?</label>
          <textarea value={form.likedMost} onChange={onChange('likedMost')} readOnly={isSubmitted} rows={3} />
        </div>

        <div className="form-group">
          <label>What could the company improve?</label>
          <textarea value={form.improvements} onChange={onChange('improvements')} readOnly={isSubmitted} rows={3} />
        </div>

        <div className="form-group">
          <label>Would you recommend this company to others?</label>
          <select value={form.wouldRecommend} onChange={onChange('wouldRecommend')} disabled={isSubmitted}>
            <option value="">Select answer</option>
            <option value="Definitely Yes">Definitely Yes</option>
            <option value="Probably Yes">Probably Yes</option>
            <option value="Not Sure">Not Sure</option>
            <option value="Probably No">Probably No</option>
            <option value="Definitely No">Definitely No</option>
          </select>
        </div>

        <div className="form-group">
          <label>Additional Comments</label>
          <textarea value={form.additionalComments} onChange={onChange('additionalComments')} readOnly={isSubmitted} rows={3} />
        </div>
      </div>

      {!isSubmitted && (
        <>
          {mutation.isError && (
            <div className="alert alert-danger">Failed to submit. Please try again.</div>
          )}
          <div className="form-actions">
            <p style={{ marginRight: 'auto', fontSize: '.85rem' }}>
              ⚠ Once submitted, this form cannot be edited.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Exit Interview →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}