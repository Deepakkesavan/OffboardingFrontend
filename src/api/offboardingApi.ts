import axios from 'axios';
import type {
  OffboardingRecord,
  Employee,
  StageData,
  Clearance,
  AuditLogEntry,
  CreateRecordRequest,
  UpdateRecordRequest,
  CreateStageDataRequest,
  UpdateStageDataRequest,
  CreateClearanceRequest,
  UpdateClearanceRequest,
  CreateAuditEntryRequest,
  Stage,
} from '../types';

const api = axios.create({
  baseURL: 'https://workforce-dev.clarium.tech/offapi/api',
  headers: { 'Content-Type': 'application/json' },
});

/* ─── EMPLOYEES ──────────────────────────────────────────────── */
export const getEmployees = (): Promise<Employee[]> =>
  api.get('/employees').then((r) => r.data);

export const getEmployee = (id: string): Promise<Employee> =>
  api.get(`/employees/${id}`).then((r) => r.data);

/* ─── OFFBOARDING RECORDS ────────────────────────────────────── */
export const getRecords = (): Promise<OffboardingRecord[]> =>
  api.get('/offboarding-records').then((r) => r.data);

export const getRecord = (id: string): Promise<OffboardingRecord> =>
  api.get(`/offboarding-records/${id}`).then((r) => r.data);

export const createRecord = (data: Partial<OffboardingRecord>): Promise<OffboardingRecord> =>
  api
    .post<OffboardingRecord>('/offboarding-records', {
      employeeId:     data.employeeId     || 'EMP001',
      employeeName:   data.employeeName   ?? '',
      designation:    data.designation   ?? '',
      department:     data.department   ?? 'Engineering',
      email:          data.email          ?? '',
      manager:        data.manager    ?? '',
      exitReason:     data.exitReason  ?? 'Resignation',
      exitDetails:    data.exitDetails,
      jobDescription: data.jobDescription,
      endDate:        data.endDate        ?? null,
      noticePeriod:   data.noticePeriod   ?? 90,
    } satisfies CreateRecordRequest)
    .then((r) => r.data);

export const updateRecord = (id: string, data: UpdateRecordRequest): Promise<OffboardingRecord> =>
  api
    .patch<OffboardingRecord>(`/offboarding-records/${id}`, {
      currentStage: data.currentStage ?? null,
      status:       data.status       ?? null,
      endDate:      data.endDate      ?? null,
      exitReason:   data.exitReason   ?? null,
    })
    .then((r) => r.data);

export const getNoticePeriod = (id: string): Promise<{ days: number }> =>
  api.get(`/offboarding-records/${id}/notice-period`).then((r) => r.data);

/* ─── STAGE DATA ─────────────────────────────────────────────── */
export const getStageData = (recordId: string): Promise<StageData[]> =>
  api.get(`/stage-data?recordId=${recordId}`).then((r) => r.data);

export const getStageByType = (recordId: string, stageType: Stage): Promise<StageData | null> =>
  api
    .get<StageData[]>(`/stage-data?recordId=${recordId}&stageType=${stageType}`)
    .then((r) => r.data[0] ?? null);

export const createStageData = (data: CreateStageDataRequest): Promise<StageData> =>
  api
    .post<StageData>('/stage-data', {
      recordId:    data.recordId,
      stageType:   data.stageType,
      payload:     data.payload     ?? {},
      completedAt: data.completedAt ?? null,
    })
    .then((r) => r.data);

export const updateStageData = (id: string, data: UpdateStageDataRequest): Promise<StageData> =>
  api
    .patch<StageData>(`/stage-data/${id}`, {
      payload:     data.payload     ?? null,
      completedAt: data.completedAt ?? null,
    })
    .then((r) => r.data);

/* ─── CLEARANCES ─────────────────────────────────────────────── */
export const getClearances = (recordId: string): Promise<Clearance[]> =>
  api.get(`/clearances?recordId=${recordId}`).then((r) => r.data);

export const createClearance = (data: CreateClearanceRequest): Promise<Clearance> =>
  api
    .post<Clearance>('/clearances', {
      recordId:   data.recordId,
      department: data.department,
      isUnlocked: data.isUnlocked ?? true,
      isCleared:  data.isCleared  ?? false,
    })
    .then((r) => r.data);

export const updateClearance = (id: string, data: UpdateClearanceRequest): Promise<Clearance> =>
  api
    .patch<Clearance>(`/clearances/${id}`, {
      isUnlocked: data.isUnlocked ?? null,
      isCleared:  data.isCleared  ?? null,
      clearedBy:  data.clearedBy  ?? null,
      clearedAt:  data.clearedAt  ?? null,
      notes:      data.notes      ?? null,
    })
    .then((r) => r.data);

export const getAllCleared = (recordId: string): Promise<boolean> =>
  api.get(`/clearances/all-cleared/${recordId}`).then((r) => r.data);

/* ─── AUDIT LOG ──────────────────────────────────────────────── */
export const getAuditLog = (recordId: string): Promise<AuditLogEntry[]> =>
  api.get(`/audit-log?recordId=${recordId}`).then((r) => r.data);

export const addAuditEntry = (data: CreateAuditEntryRequest): Promise<AuditLogEntry> =>
  api
    .post<AuditLogEntry>('/audit-log', {
      recordId:    data.recordId,
      action:      data.action,
      performedBy: data.performedBy ?? null,
      stageBefore: data.stageBefore ?? null,
      stageAfter:  data.stageAfter  ?? null,
    })
    .then((r) => r.data);

/* ─── DEPARTMENTS ────────────────────────────────────────────── */
export const getDepartments = (): Promise<string[]> =>
  api.get('/departments').then((r) => r.data);

export default api;