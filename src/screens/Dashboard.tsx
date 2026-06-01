import { useNavigate } from 'react-router-dom';
import { getRecords } from '../api/offboardingApi';
import { useFetch } from '../hooks/useFetch';
import useStore from '../store/offboardingStore';
import { exitDetailPath } from '../app.routes';
import type { OffboardingRecord, Stage } from '../types';

interface StageBadgeMeta {
  cls: string;
  label: string;
}

const STATUS_BADGE: Partial<Record<Stage, StageBadgeMeta>> & { default: StageBadgeMeta } = {
  exit_interview: { cls: 'badge-info',    label: 'Exit Interview' },
  manager_review: { cls: 'badge-warning', label: 'Manager Review' },
  hr_initiation:  { cls: 'badge-primary', label: 'HR Initiation'  },
  clearances:     { cls: 'badge-warning', label: 'Clearances'     },
  final_approval: { cls: 'badge-danger',  label: 'Final Approval' },
  completed:      { cls: 'badge-success', label: 'Completed'      },
  default:        { cls: 'badge-info',    label: 'Exit Interview' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useStore();

  const { data: records = [], isLoading } = useFetch<OffboardingRecord[]>(getRecords);

  const stats = {
    total:     records.length,
    active:    records.filter((r) => r.currentStage !== 'completed').length,
    completed: records.filter((r) => r.currentStage === 'completed').length,
    pending:   records.filter((r) =>
      (['manager_review', 'hr_initiation', 'final_approval'] as Stage[]).includes(r.currentStage),
    ).length,
  };

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {currentUser.name.split(' ')[0]} 👋</h1>
        <p>Here's an overview of all offboarding activity.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Requests</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: 'var(--clr-primary)' }}>{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Action</div>
          <div className="stat-value" style={{ color: 'var(--clr-warning)' }}>{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{ color: 'var(--clr-success)' }}>{stats.completed}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Exit Cases</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/initiate')}
          >
            + New Request
          </button>
        </div>

        {records.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>No exit cases yet</h3>
            <p>Create a new request to get started.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={() => navigate('/initiate')}
            >
              Initiate First Exit
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Current Stage</th>
                  <th>Submitted</th>
                  <th>End Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const badge =
                    STATUS_BADGE[r.currentStage] ?? STATUS_BADGE.default;
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.employeeName}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--clr-text-muted)' }}>
                          {r.employeeId}
                        </div>
                      </td>
                      <td>{r.department}</td>
                      <td>
                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '.85rem' }}>
                        {new Date(r.submittedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '.85rem' }}>
                        {r.endDate
                          ? new Date(r.endDate).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(exitDetailPath(r.id))}
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}