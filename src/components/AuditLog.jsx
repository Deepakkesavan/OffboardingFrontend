import { getAuditLog } from '../api/offboardingApi';
import { useFetch } from '../hooks/useFetch';
import './AuditLog.css';

const ACTION_LABELS = {
  record_created:               { label: 'Offboarding initiated',          icon: '🚀', variant: 'info'    },
  exit_interview_submitted:     { label: 'Exit interview submitted',        icon: '📝', variant: 'info'    },
  manager_approved:             { label: 'Manager approved exit',           icon: '✅', variant: 'success' },
  manager_rejected:             { label: 'Manager rejected exit',           icon: '❌', variant: 'danger'  },
  hr_offboarding_initiated:     { label: 'HR initiated offboarding',        icon: '🏢', variant: 'primary' },
  all_clearances_done:          { label: 'All clearances completed',        icon: '✅', variant: 'success' },
  clearance_marked:             { label: 'Dept. clearance marked',          icon: '☑️', variant: 'neutral' },
  hr_final_approval_completed:  { label: 'Final approval issued',           icon: '🎯', variant: 'success' },
};

const VARIANT_COLORS = {
  info:    'var(--clr-info)',
  success: 'var(--clr-success)',
  danger:  'var(--clr-danger)',
  primary: 'var(--clr-primary)',
  warning: 'var(--clr-warning)',
  neutral: 'var(--clr-text-muted)',
};

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function AuditLog({ recordId }) {
  const { data: logs = [], isLoading } = useFetch(
    () => getAuditLog(recordId),
    [recordId]
  );

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="audit-wrap card">
      <div className="card-header">
        <span className="card-title">🗒 Activity Log</span>
        <span style={{ fontSize: '.8rem', color: 'var(--clr-text-muted)' }}>{logs.length} events</span>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px' }}>
          <div className="icon" style={{ fontSize: '2rem' }}>📭</div>
          <p>No activity recorded yet.</p>
        </div>
      ) : (
        <div className="audit-timeline">
          {[...logs].reverse().map((log, idx) => {
            const meta  = ACTION_LABELS[log.action] || { label: log.action, icon: '•', variant: 'neutral' };
            const color = VARIANT_COLORS[meta.variant];
            const isLast = idx === logs.length - 1;

            return (
              <div key={log.id} className={`audit-item ${isLast ? 'audit-item--last' : ''}`}>
                <div className="audit-dot-col">
                  <div className="audit-dot" style={{ background: color }}>
                    <span>{meta.icon}</span>
                  </div>
                  {!isLast && <div className="audit-line" />}
                </div>

                <div className="audit-content">
                  <div className="audit-label" style={{ color }}>{meta.label}</div>
                  <div className="audit-meta">
                    <span>by <strong>{log.performedBy}</strong></span>
                    {log.stageBefore && log.stageAfter && (
                      <span className="audit-stage-change">
                        {log.stageBefore} → {log.stageAfter}
                      </span>
                    )}
                  </div>
                  <div className="audit-time">{formatDateTime(log.timestamp)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}