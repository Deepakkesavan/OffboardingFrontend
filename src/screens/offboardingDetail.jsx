import { useParams, useNavigate } from 'react-router-dom';
import { getRecord, getStageData } from '../api/offboardingApi';
import { useFetch } from '../hooks/useFetch';
import { STAGES } from '../store/offboardingStore';
import useStore from '../store/offboardingStore';
import OffboardingTimeline  from '../components/OffboardingTimeline';
import AuditLog             from '../components/AuditLog';
import ExitInterviewForm    from './employee/ExitInterviewForm';
import ExitClearanceForm    from './employee/ExitClearanceForm';
import ManagerApproval      from './manager/ManagerApproval';
import HRInitiation         from './hr/HRInitiation';
import ClearancesScreen     from './finance/ClearancesScreen';
import StakeholderClearance from './stakeholder/StakeHolderClearance';
import FinalApproval        from './hr/FinalApproval';

const STAGE_ROLE_MAP = {
  [STAGES.EXIT_INTERVIEW]: ['employee'],
  [STAGES.MANAGER_REVIEW]: ['manager'],
  [STAGES.HR_INITIATION]:  ['hr'],
  [STAGES.CLEARANCES]:     ['finance', 'stakeholder', 'hr'],
  [STAGES.FINAL_APPROVAL]: ['hr'],
  [STAGES.COMPLETED]:      [],
};

function CompletedBanner() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
      <h2>Offboarding Complete</h2>
      <p style={{ marginTop: '8px' }}>
        All stages have been successfully completed. This record is now closed.
      </p>
    </div>
  );
}

function StageScreen({ record, stageData, activeRole, onStageChange }) {
  const stage        = record.currentStage;
  const allowedRoles = STAGE_ROLE_MAP[stage] || [];
  const hasAccess    = allowedRoles.includes(activeRole);
  const props        = { record, stageData, onStageChange };

  if (stage === STAGES.COMPLETED) return <CompletedBanner />;

  if (!hasAccess) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="icon">🔒</div>
          <h3>Not your turn yet</h3>
          <p>
            This stage requires{' '}
            <strong>{allowedRoles.join(' / ')}</strong> access.
            Use the role switcher above to simulate that view.
          </p>
        </div>
      </div>
    );
  }

  if (stage === STAGES.CLEARANCES) {
    if (activeRole === 'stakeholder') return <StakeholderClearance {...props} />;
    return <ClearancesScreen {...props} />;
  }

  switch (stage) {
    case STAGES.EXIT_INTERVIEW: return <ExitInterviewForm {...props} />;
    case STAGES.MANAGER_REVIEW: return <ManagerApproval   {...props} />;
    case STAGES.HR_INITIATION:  return <HRInitiation      {...props} />;
    case STAGES.FINAL_APPROVAL: return <FinalApproval     {...props} />;
    default: return null;
  }
}

function EmployeeTabs({ record, stageData, activeRole, onStageChange }) {
  const stage    = record.currentStage;
  const showTabs =
    activeRole === 'employee' &&
    (stage === STAGES.EXIT_INTERVIEW || stage === STAGES.CLEARANCES);

  if (!showTabs) {
    return <StageScreen record={record} stageData={stageData} activeRole={activeRole} onStageChange={onStageChange} />;
  }

  return (
    <div>
      <StageScreen record={record} stageData={stageData} activeRole={activeRole} onStageChange={onStageChange} />
      <div style={{ marginTop: 'var(--sp-lg)' }}>
        <ExitClearanceForm record={record} stageData={stageData} />
      </div>
    </div>
  );
}

export default function OffboardingDetail() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const { activeRole } = useStore();

  const {
    data: record,
    isLoading: rLoad,
    refetch: refetchRecord,
  } = useFetch(() => getRecord(id), [id]);

  const {
    data: stageData = [],
    isLoading: sLoad,
    refetch: refetchStage,
  } = useFetch(() => getStageData(id), [id]);

  // Called by child stage screens after a mutation so the detail page re-fetches
  const onStageChange = () => {
    refetchRecord();
    refetchStage();
  };

  if (rLoad || sLoad) return <div className="spinner-wrap"><div className="spinner" /></div>;

  if (!record) return (
    <div className="card">
      <div className="empty-state">
        <div className="icon">❓</div>
        <h3>Record not found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 'var(--sp-xl)' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/')}
          style={{ marginBottom: '10px' }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ marginBottom: '4px' }}>{record.employeeName}</h1>
            <p>{record.designation} · {record.department} · ID: {record.employeeId}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <span className={`badge ${record.status === 'completed' ? 'badge-success' : 'badge-primary'}`}>
              {record.status === 'completed' ? '✓ Completed' : '⚡ Active'}
            </span>
            {record.endDate && (
              <span style={{ fontSize: '.8rem', color: 'var(--clr-text-muted)', fontFamily: 'var(--font-mono)' }}>
                Last day: {new Date(record.endDate).toLocaleDateString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>

      <OffboardingTimeline
        currentStage={record.currentStage}
        stageData={stageData}
        record={record}
      />

      <EmployeeTabs
        record={record}
        stageData={stageData}
        activeRole={activeRole}
        onStageChange={onStageChange}
      />

      <div style={{ marginTop: 'var(--sp-xl)' }}>
        <AuditLog recordId={id} />
      </div>
    </div>
  );
}