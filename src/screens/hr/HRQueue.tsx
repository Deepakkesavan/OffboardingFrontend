import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecords } from '../../api/offboardingApi';
import { useFetch } from '../../hooks/useFetch';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import { STAGE_BADGES } from '../../components/stageBadge';
import StatCard from '../../components/StatCard';
import { exitDetailPath } from '../../app.routes';
import type { OffboardingRecord, Stage } from '../../types';
import './HRQueue.css';

type FilterValue = 'all' | Stage;
type SortKey = 'submittedAt' | 'endDate' | 'employeeName';

interface FilterOption {
  value: FilterValue;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all',            label: 'All'              },
  { value: 'hr_initiation',  label: 'Needs Initiation' },
  { value: 'clearances',     label: 'In Clearances'    },
  { value: 'final_approval', label: 'Final Approval'   },
  { value: 'completed',      label: 'Completed'        },
];

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

interface DaysChipProps {
  endDate: string | null | undefined;
}

function DaysChip({ endDate }: DaysChipProps) {
  const days = daysUntil(endDate);
  if (days === null) return null;
  if (days < 0)  return <span className="days-chip days-chip--past">Ended {Math.abs(days)}d ago</span>;
  if (days <= 2) return <span className="days-chip days-chip--urgent">{days}d left ⚠</span>;
  if (days <= 7) return <span className="days-chip days-chip--soon">{days}d left</span>;
  return <span className="days-chip">{days}d left</span>;
}

export default function HRQueue() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('submittedAt');

  const { data: records = [], isLoading } = useFetch<OffboardingRecord[]>(
    getRecords,
    [],
    { refetchInterval: 10000 },
  );

  const stats = {
    needsAction: records.filter((r) =>
      (['hr_initiation', 'final_approval'] as Stage[]).includes(r.currentStage),
    ).length,
    inProgress:  records.filter((r) => r.currentStage === 'clearances').length,
    urgentT2:    records.filter((r) => {
      const d = daysUntil(r.endDate);
      return d !== null && d <= 2 && r.currentStage !== 'completed';
    }).length,
    completed:   records.filter((r) => r.currentStage === 'completed').length,
  };

  const filtered = records
    .filter((r) => filter === 'all' || r.currentStage === filter)
    .filter((r) => {
      const q = search.toLowerCase();
      return (
        !q ||
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeId.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'endDate')      return new Date(a.endDate ?? '').getTime() - new Date(b.endDate ?? '').getTime();
      if (sortBy === 'employeeName') return a.employeeName.localeCompare(b.employeeName);
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <PageHeader
        title="HR Queue"
        subtitle="All exit cases requiring HR attention."
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/initiate')}>
            + New Request
          </button>
        }
      />

      <div className="stat-grid" style={{ marginBottom: 'var(--sp-xl)' }}>
        <StatCard label="Needs action"  value={stats.needsAction} color="var(--clr-primary)" icon="⚡" />
        <StatCard label="In clearances" value={stats.inProgress}  color="var(--clr-warning)" icon="🔄" />
        <StatCard
          label="Urgent (T-2)"
          value={stats.urgentT2}
          color="var(--clr-danger)"
          icon="⚠"
          note={stats.urgentT2 > 0 ? 'Ending within 2 days' : null}
        />
        <StatCard label="Completed" value={stats.completed} color="var(--clr-success)" icon="✅" />
      </div>

      <div className="hrq-toolbar card" style={{ padding: '12px 20px' }}>
        <div className="hrq-filter-tabs">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`hrq-filter-tab ${filter === opt.value ? 'active' : ''}`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
              <span className="hrq-filter-count">
                {opt.value === 'all'
                  ? records.length
                  : records.filter((r) => r.currentStage === opt.value).length}
              </span>
            </button>
          ))}
        </div>

        <div className="hrq-toolbar-right">
          <input
            className="hrq-search"
            placeholder="Search name, ID, dept…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="hrq-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
          >
            <option value="submittedAt">Sort: Newest</option>
            <option value="endDate">Sort: End date</option>
            <option value="employeeName">Sort: Name</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--sp-md)' }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <div className="icon">📭</div>
            <h3>No records found</h3>
            <p>Try adjusting the filter or search query.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="hrq-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Stage</th>
                  <th>Submitted</th>
                  <th>End Date</th>
                  <th>Time Left</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const badge    = STAGE_BADGES[r.currentStage] ?? STAGE_BADGES.exit_interview;
                  const days     = daysUntil(r.endDate);
                  const isUrgent = days !== null && days <= 2 && r.currentStage !== 'completed';

                  return (
                    <tr key={r.id} className={isUrgent ? 'hrq-row-urgent' : ''}>
                      <td>
                        <div className="hrq-emp-name">{r.employeeName}</div>
                        <div className="hrq-emp-id">{r.employeeId}</div>
                      </td>
                      <td>{r.department}</td>
                      <td><Badge variant={badge.variant} dot>{badge.label}</Badge></td>
                      <td className="hrq-mono">
                        {new Date(r.submittedAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="hrq-mono">
                        {r.endDate
                          ? new Date(r.endDate).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td><DaysChip endDate={r.endDate} /></td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(exitDetailPath(r.id))}
                        >
                          Open →
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