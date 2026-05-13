import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5206/api',
  headers: { 'Content-Type': 'application/json' },
});

/* ─── EMPLOYEES ──────────────────────────────────────────────── */
export const getEmployees = () =>
  api.get('/employees').then(r => r.data);

export const getEmployee = (id) =>
  api.get(`/employees/${id}`).then(r => r.data);

/* ─── OFFBOARDING RECORDS ────────────────────────────────────── */
export const getRecords = () =>
  api.get('/offboarding-records').then(r => r.data);

export const getRecord = (id) =>
  api.get(`/offboarding-records/${id}`).then(r => r.data);

export const createRecord = (data) =>
  api.post('/offboarding-records', {
    employeeId:     data.employeeId     || data.EmployeeId     || 'EMP001',
    employeeName:   data.employeeName   || data.EmployeeName,
    designation:    data.designation    || data.Designation,
    department:     data.department     || data.Department,
    email:          data.email          || data.Email,
    manager:        data.manager        || data.Manager,
    exitReason:     data.exitReason     || data.ExitReason,
    exitDetails:    data.exitDetails    || data.ExitDetails,
    jobDescription: data.jobDescription || data.JobDescription,
    endDate:        data.endDate        || data.EndDate        || null,
    noticePeriod:   data.noticePeriod   || data.NoticePeriod   || 90,
  }).then(r => r.data);

export const updateRecord = (id, data) =>
  api.patch(`/offboarding-records/${id}`, {
    currentStage: data.currentStage || data.CurrentStage || null,
    status:       data.status       || data.Status       || null,
    endDate:      data.endDate      || data.EndDate      || null,
    exitReason:   data.exitReason   || data.ExitReason   || null,
  }).then(r => r.data);

export const getNoticePeriod = (id) =>
  api.get(`/offboarding-records/${id}/notice-period`).then(r => r.data);

/* ─── STAGE DATA ─────────────────────────────────────────────── */
export const getStageData = (recordId) =>
  api.get(`/stage-data?recordId=${recordId}`).then(r => r.data);

export const getStageByType = (recordId, stageType) =>
  api.get(`/stage-data?recordId=${recordId}&stageType=${stageType}`)
    .then(r => r.data[0] || null);

export const createStageData = (data) =>
  api.post('/stage-data', {
    recordId:    data.recordId    || data.RecordId,
    stageType:   data.stageType   || data.StageType,
    payload:     data.payload     || data.Payload     || {},
    completedAt: data.completedAt || data.CompletedAt || null,
  }).then(r => r.data);

export const updateStageData = (id, data) =>
  api.patch(`/stage-data/${id}`, {
    payload:     data.payload     || data.Payload     || null,
    completedAt: data.completedAt || data.CompletedAt || null,
  }).then(r => r.data);

/* ─── CLEARANCES ─────────────────────────────────────────────── */
export const getClearances = (recordId) =>
  api.get(`/clearances?recordId=${recordId}`).then(r => r.data);

export const createClearance = (data) =>
  api.post('/clearances', {
    recordId:   data.recordId   || data.RecordId,
    department: data.department || data.Department,
    isUnlocked: data.isUnlocked ?? data.IsUnlocked ?? true,
    isCleared:  data.isCleared  ?? data.IsCleared  ?? false,
  }).then(r => r.data);

export const updateClearance = (id, data) =>
  api.patch(`/clearances/${id}`, {
    isUnlocked: data.isUnlocked ?? data.IsUnlocked ?? null,
    isCleared:  data.isCleared  ?? data.IsCleared  ?? null,
    clearedBy:  data.clearedBy  || data.ClearedBy  || null,
    clearedAt:  data.clearedAt  || data.ClearedAt  || null,
    notes:      data.notes      || data.Notes       || null,
  }).then(r => r.data);

export const getAllCleared = (recordId) =>
  api.get(`/clearances/all-cleared/${recordId}`).then(r => r.data);

/* ─── AUDIT LOG ──────────────────────────────────────────────── */
export const getAuditLog = (recordId) =>
  api.get(`/audit-log?recordId=${recordId}`).then(r => r.data);

export const addAuditEntry = (data) =>
  api.post('/audit-log', {
    recordId:    data.recordId    || data.RecordId,
    action:      data.action      || data.Action,
    performedBy: data.performedBy || data.PerformedBy || null,
    stageBefore: data.stageBefore || data.StageBefore || null,
    stageAfter:  data.stageAfter  || data.StageAfter  || null,
  }).then(r => r.data);

/* ─── DEPARTMENTS ────────────────────────────────────────────── */
export const getDepartments = () =>
  api.get('/departments').then(r => r.data);

export default api;