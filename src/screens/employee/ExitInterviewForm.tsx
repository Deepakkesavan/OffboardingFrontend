import { useState } from 'react';
import { useMutation } from '../../hooks/useFetch';
import { updateStageData, updateRecord, addAuditEntry } from '../../api/offboardingApi';
import { STAGES } from '../../store/offboardingStore';
import type { StageScreenProps, ExitInterviewPayload } from '../../types';

const RATINGS = ['1 - Very Poor', '2 - Poor', '3 - Average', '4 - Good', '5 - Excellent'] as const;

type RecommendOption =
  | 'Definitely Yes'
  | 'Probably Yes'
  | 'Not Sure'
  | 'Probably No'
  | 'Definitely No';

const RECOMMEND_OPTIONS: RecommendOption[] = [
  'Definitely Yes', 'Probably Yes', 'Not Sure', 'Probably No', 'Definitely No',
];

type RatingField = 'overallRating' | 'managementRating' | 'workCultureRating' | 'growthRating';

interface RatingFieldConfig {
  label: string;
  field: RatingField;
}

const RATING_FIELDS: RatingFieldConfig[] = [
  { label: 'Overall Experience',   field: 'overallRating'     },
  { label: 'Management',           field: 'managementRating'  },
  { label: 'Work Culture',         field: 'workCultureRating' },
  { label: 'Growth Opportunities', field: 'growthRating'      },
];

export default function ExitInterviewForm({ record, stageData, onStageChange }: StageScreenProps) {
  const exitStage   = stageData.find((s) => s.stageType === STAGES.EXIT_INTERVIEW);
  const isSubmitted = !!exitStage?.completedAt;
  const saved       = (exitStage?.payload ?? {}) as Partial<ExitInterviewPayload>;

  const [form, setForm] = useState<ExitInterviewPayload>({
    overallRating:      saved.overallRating      != null ? Number(saved.overallRating)      : undefined,
    managementRating:   saved.managementRating   != null ? Number(saved.managementRating)   : undefined,
    workCultureRating:  saved.workCultureRating  != null ? Number(saved.workCultureRating)  : undefined,
    growthRating:       saved.growthRating        != null ? Number(saved.growthRating)        : undefined,
    primaryReason:      saved.primaryReason       ?? record.exitReason ?? '',
    likedMost:          saved.likedMost           ?? '',
    improvements:       saved.improvements        ?? '',
    wouldRecommend:     saved.wouldRecommend      != null ? Boolean(saved.wouldRecommend)    : undefined,
    additionalComments: saved.additionalComments  ?? '',
    interviewDate:      saved.interviewDate       ?? '',
  });

  const onChange =
    <K extends keyof ExitInterviewPayload>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const { mutate, isPending, isError } = useMutation(
    async () => {
      if (!exitStage) throw new Error('Exit stage data not found');
      const now = new Date().toISOString();
      await updateStageData(exitStage.id, { payload: form, completedAt: now });
      await updateRecord(record.id, { currentStage: STAGES.MANAGER_REVIEW });
      await addAuditEntry({
        recordId:    record.id,
        action:      'exit_interview_submitted',
        performedBy: record.employeeName,
        stageBefore: STAGES.EXIT_INTERVIEW,
        stageAfter:  STAGES.MANAGER_REVIEW,
      });
      onStageChange(STAGES.MANAGER_REVIEW);
      return STAGES.MANAGER_REVIEW; 
    },
    { onSuccess: onStageChange },
  );

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
          <input value={record.endDate ?? ''} readOnly />
        </div>
        <div className="form-group">
          <label>
            Interview Date {!isSubmitted && <span className="required-star">*</span>}
          </label>
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
        {RATING_FIELDS.map(({ label, field }) => (
          <div key={field} className="form-group">
            <label>
              {label} {!isSubmitted && <span className="required-star">*</span>}
            </label>
            <select
              value={form[field]}
              onChange={onChange(field)}
              disabled={isSubmitted}
            >
              <option value="">Select rating</option>
              {RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="form-grid cols-1">
        <div className="form-group">
          <label>
            Primary Reason for Leaving {!isSubmitted && <span className="required-star">*</span>}
          </label>
          <input
            value={form.primaryReason}
            onChange={onChange('primaryReason')}
            readOnly={isSubmitted}
          />
        </div>
        <div className="form-group">
          <label>What did you like most about working here?</label>
          <textarea
            value={form.likedMost}
            onChange={onChange('likedMost')}
            readOnly={isSubmitted}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>What could the company improve?</label>
          <textarea
            value={form.improvements}
            onChange={onChange('improvements')}
            readOnly={isSubmitted}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>Would you recommend this company to others?</label>
          <select
            value={form.wouldRecommend === undefined ? '' : String(form.wouldRecommend)}  // ✅ Convert to string
            onChange={(e) => setForm(f => ({ ...f, wouldRecommend: e.target.value === 'true' }))}
            disabled={isSubmitted}
          >
            <option value="">Select answer</option>
            {RECOMMEND_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Additional Comments</label>
          <textarea
            value={form.additionalComments}
            onChange={onChange('additionalComments')}
            readOnly={isSubmitted}
            rows={3}
          />
        </div>
      </div>

      {!isSubmitted && (
        <>
          {isError && (
            <div className="alert alert-danger">Failed to submit. Please try again.</div>
          )}
          <div className="form-actions">
            <p style={{ marginRight: 'auto', fontSize: '.85rem' }}>
              ⚠ Once submitted, this form cannot be edited.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => mutate()}
              disabled={isPending}
            >
              {isPending ? 'Submitting...' : 'Submit Exit Interview →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}