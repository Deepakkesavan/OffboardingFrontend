import './OffboardingTimeline.css';
import { STAGE_ORDER, STAGE_LABELS, STAGES } from '../store/offboardingStore';

const STAGE_ICONS = {
  [STAGES.EXIT_INTERVIEW]:  '📝',
  [STAGES.MANAGER_REVIEW]:  '👔',
  [STAGES.HR_INITIATION]:   '🏢',
  [STAGES.CLEARANCES]:      '✅',
  [STAGES.FINAL_APPROVAL]:  '🎯',
  [STAGES.COMPLETED]:       '🎉',
};

function getStepStatus(stage, currentStage, stageData) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  const stageIdx   = STAGE_ORDER.indexOf(stage);

  const data = stageData?.find(s => s.stageType === stage);
  if (data?.completedAt) return 'completed';
  if (stage === currentStage)  return 'active';
  if (stageIdx < currentIdx)   return 'completed';
  return 'locked';
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export default function OffboardingTimeline({ currentStage, stageData = [], record }) {
  return (
    <div className="timeline-wrap">
      <div className="timeline-header">
        <h3>Offboarding Progress</h3>
        {record && (
          <span className="badge badge-info">
            {record.employeeName} · {record.employeeId}
          </span>
        )}
      </div>

      <div className="timeline-steps">
        {STAGE_ORDER.map((stage, idx) => {
          const status = getStepStatus(stage, currentStage, stageData);
          const data   = stageData?.find(s => s.stageType === stage);

          return (
            <div key={stage} className={`timeline-step ${status}`}>
              <div className="step-dot">
                {status === 'completed'
                  ? '✓'
                  : status === 'active'
                  ? STAGE_ICONS[stage]
                  : idx + 1}
              </div>
              <div className="step-label">{STAGE_LABELS[stage]}</div>
              {data?.completedAt && (
                <div className="step-date">{formatDate(data.completedAt)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
