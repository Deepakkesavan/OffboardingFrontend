import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecord } from '../api/offboardingApi';
import { useMutation } from '../hooks/useFetch';
import { STAGES } from '../store/offboardingStore';
import { exitDetailPath } from '../app.routes';
import type { OffboardingRecord, Department, ExitReason } from '../types';

const DEPARTMENTS: Department[] = [
  'Engineering', 'Design', 'Product', 'Finance',
  'HR', 'Marketing', 'Sales', 'Operations',
];

const REASONS: ExitReason[] = [
  'Resignation', 'Retirement', 'End of Contract', 'Mutual Separation', 'Other',
];

interface NewRequestForm {
  employeeName:   string;
  employeeId:     string;
  designation:    string;
  department:     Department | '';
  email:          string;
  manager:        string;
  endDate:        string;
  exitReason:     ExitReason | '';
  exitDetails:    string;
  jobDescription: string;
  noticePeriod:   string;
}

type FormErrors = Partial<Record<keyof NewRequestForm, string>>;

export default function NewRequest() {
  const navigate = useNavigate();

  const [form, setForm] = useState<NewRequestForm>({
    employeeName:   '',
    employeeId:     '',
    designation:    '',
    department:     '',
    email:          '',
    manager:        '',
    endDate:        '',
    exitReason:     '',
    exitDetails:    '',
    jobDescription: '',
    noticePeriod:   '90',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const { mutate, isPending, isError } = useMutation<OffboardingRecord, NewRequestForm>(
    async (data) => {
      const record = await createRecord({
        ...data,
        department:   data.department as Department,
        exitReason:   data.exitReason as ExitReason,
        noticePeriod: parseInt(data.noticePeriod, 10) || 90,
        currentStage: STAGES.EXIT_INTERVIEW,
        status:       'in_progress',
        submittedAt:  new Date().toISOString(),
      });
      return record;
    },
    {
      onSuccess: (record) => navigate(exitDetailPath(record.id)),
    },
  );

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.employeeName.trim()) e.employeeName  = 'Required';
    if (!form.employeeId.trim())   e.employeeId    = 'Required';
    if (!form.designation.trim())  e.designation   = 'Required';
    if (!form.department)          e.department    = 'Required';
    if (!form.email.trim())        e.email         = 'Required';
    if (!form.manager.trim())      e.manager       = 'Required';
    if (!form.endDate)             e.endDate       = 'Required';
    if (!form.exitReason)          e.exitReason    = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange =
    <K extends keyof NewRequestForm>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutate(form);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Initiate Exit</h1>
        <p>Fill in the employee details to begin the offboarding process.</p>
      </div>

      <form onSubmit={onSubmit}>
        {/* ─── Employee Info ─── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Employee Information</span>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name <span className="required-star">*</span></label>
              <input value={form.employeeName} onChange={onChange('employeeName')} placeholder="e.g. Arjun Mehta" />
              {errors.employeeName && <span className="field-error">{errors.employeeName}</span>}
            </div>

            <div className="form-group">
              <label>Employee ID <span className="required-star">*</span></label>
              <input value={form.employeeId} onChange={onChange('employeeId')} placeholder="e.g. EMP001" />
              {errors.employeeId && <span className="field-error">{errors.employeeId}</span>}
            </div>

            <div className="form-group">
              <label>Designation <span className="required-star">*</span></label>
              <input value={form.designation} onChange={onChange('designation')} placeholder="e.g. Software Engineer" />
              {errors.designation && <span className="field-error">{errors.designation}</span>}
            </div>

            <div className="form-group">
              <label>Department <span className="required-star">*</span></label>
              <select value={form.department} onChange={onChange('department')}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <span className="field-error">{errors.department}</span>}
            </div>

            <div className="form-group">
              <label>Work Email <span className="required-star">*</span></label>
              <input type="email" value={form.email} onChange={onChange('email')} placeholder="name@company.com" />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Reporting Manager <span className="required-star">*</span></label>
              <input value={form.manager} onChange={onChange('manager')} placeholder="Manager's name" />
              {errors.manager && <span className="field-error">{errors.manager}</span>}
            </div>
          </div>
        </div>

        {/* ─── Exit Details ─── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Exit Details</span>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Proposed End Date <span className="required-star">*</span></label>
              <input type="date" value={form.endDate} onChange={onChange('endDate')} />
              {errors.endDate && <span className="field-error">{errors.endDate}</span>}
            </div>

            <div className="form-group">
              <label>Notice Period (days)</label>
              <input type="number" value={form.noticePeriod} onChange={onChange('noticePeriod')} min="0" />
            </div>

            <div className="form-group">
              <label>Reason for Exit <span className="required-star">*</span></label>
              <select value={form.exitReason} onChange={onChange('exitReason')}>
                <option value="">Select reason</option>
                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.exitReason && <span className="field-error">{errors.exitReason}</span>}
            </div>

            <div className="form-group full-width">
              <label>Exit Details / Comments</label>
              <textarea
                value={form.exitDetails}
                onChange={onChange('exitDetails')}
                placeholder="Briefly describe the circumstances or any relevant notes..."
              />
            </div>

            <div className="form-group full-width">
              <label>Job Description / Handover Notes</label>
              <textarea
                value={form.jobDescription}
                onChange={onChange('jobDescription')}
                placeholder="Key responsibilities and knowledge to be transferred..."
              />
            </div>
          </div>
        </div>

        {isError && (
          <div className="alert alert-danger">
            ⚠ Failed to create request. Please try again.
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={isPending}>
            {isPending ? 'Creating...' : 'Initiate Offboarding →'}
          </button>
        </div>
      </form>
    </div>
  );
}