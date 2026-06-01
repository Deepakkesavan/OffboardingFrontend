/* ============================================================================
 * TYPES.TS — Comprehensive Type Definitions for Offboarding System
 * ============================================================================ */

import type { ComponentType } from 'react';

/* ─── ENUMS & LITERAL TYPES ───────────────────────────────────────────── */

export type Role = 
  | 'employee'
  | 'manager'
  | 'hr'
  | 'finance'
  | 'stakeholder';

export type Stage =
  | 'exit_interview'
  | 'manager_review'
  | 'hr_initiation'
  | 'clearances'
  | 'final_approval'
  | 'completed';

export type RecordStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type Department =
  | 'Engineering'
  | 'Design'
  | 'Product'
  | 'Finance'
  | 'HR'
  | 'Marketing'
  | 'Sales'
  | 'Operations';

export type ClearanceDepartment =
  | 'IT'
  | 'Finance'
  | 'HR'
  | 'Facilities'
  | 'Admin'
  | 'Security';

export type ExitReason =
  | 'Resignation'
  | 'Retirement'
  | 'End of Contract'
  | 'Mutual Separation'
  | 'Other';

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/* ─── BADGE CONFIG ─────────────────────────────────────────────────── */

export interface BadgeConfig {
  variant: BadgeVariant;
  label: string;
}

/* ─── CORE ENTITIES ────────────────────────────────────────────────── */

export interface Employee {
  id: string;
  name: string;
  designation: string;
  department: Department;
  email: string;
  manager: string;
  joiningDate?: string;
  photoUrl?: string;
}

export interface OffboardingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: Department;
  email: string;
  manager: string;
  initiatedBy: string;
  initiatedAt: string;
  submittedAt: string; // ✅ Added - used in Dashboard, HRQueue, FinalApproval
  joiningDate?: string; // ✅ Added - used in FinalApproval
  currentStage: Stage;
  status: RecordStatus;
  exitReason: ExitReason;
  exitDetails?: string;
  jobDescription?: string;
  endDate: string | null;
  noticePeriod: number; // days
  createdAt: string;
  updatedAt: string;
}

export interface StageData {
  id: string;
  recordId: string;
  stageType: Stage;
  payload: Record<string, any>; // Stage-specific data (JSON)
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Clearance {
  id: string;
  recordId: string;
  department: ClearanceDepartment;
  isUnlocked: boolean;
  isCleared: boolean;
  clearedBy: string | null;
  clearedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  recordId: string;
  action: string;
  performedBy: string;
  stageBefore: string | null;
  stageAfter: string | null;
  timestamp: string;
}

/* ─── STORE / STATE ────────────────────────────────────────────────── */

export interface CurrentUser {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  manager: string;
}

export interface OffboardingStore {
  currentUser: CurrentUser;
  activeRole: Role;
  activeRecordId: string | null;
  setActiveRole: (role: Role) => void;
  setActiveRecordId: (recordId: string | null) => void;
  setCurrentUser: (user: CurrentUser) => void;
}

/* ─── API REQUEST PAYLOADS ──────────────────────────────────────────── */

export interface CreateRecordRequest {
  employeeId: string;
  employeeName: string;
  designation: string;
  department: Department;
  email: string;
  manager: string;
  exitReason: ExitReason;
  exitDetails?: string;
  jobDescription?: string;
  endDate: string | null;
  noticePeriod: number;
}

export interface UpdateRecordRequest {
  currentStage?: Stage | null;
  status?: RecordStatus | null;
  endDate?: string | null;
  exitReason?: ExitReason | null;
}

export interface CreateStageDataRequest {
  recordId: string;
  stageType: Stage;
  payload?: Record<string, any>;
  completedAt?: string | null;
}

export interface UpdateStageDataRequest {
  payload?: Record<string, any> | null;
  completedAt?: string | null;
}

export interface CreateClearanceRequest {
  recordId: string;
  department: ClearanceDepartment;
  isUnlocked?: boolean;
  isCleared?: boolean;
}

export interface UpdateClearanceRequest {
  isUnlocked?: boolean | null;
  isCleared?: boolean | null;
  clearedBy?: string | null;
  clearedAt?: string | null;
  notes?: string | null;
}

export interface CreateAuditEntryRequest {
  recordId: string;
  action: string;
  performedBy?: string | null;
  stageBefore?: string | null;
  stageAfter?: string | null;
}

/* ─── STAGE-SPECIFIC PAYLOADS ───────────────────────────────────────── */

export interface ExitInterviewPayload {
  // Original fields
  reason?: string;
  detailedFeedback?: string;
  managerFeedback?: string;
  workEnvironmentRating?: number;
  managementRating?: number;
  careerGrowthRating?: number;
  compensationRating?: number;
  workLifeBalanceRating?: number;
  wouldRecommend?: boolean;
  suggestions?: string;
  
  // ✅ Additional fields used in ExitInterviewForm
  overallRating?: number;
  workCultureRating?: number;
  growthRating?: number;
  primaryReason?: string;
  likedMost?: string;
  improvements?: string;
  additionalComments?: string;
  interviewDate?: string;
}

export interface ManagerReviewPayload {
  approvalStatus?: 'approved' | 'rejected' | 'pending';
  managerComments?: string;
  performanceRating?: number;
  rehireEligible?: boolean;
  knowledgeTransferPlan?: string;
  
  // ✅ Additional fields used in ManagerApproval
  scheduledDate?: string;
  scheduledTime?: string;
  interviewMode?: string;
  managerNotes?: string;
  handoverPlan?: string;
  approvalDecision?: 'approved' | 'rejected' | 'pending';
  rejectionReason?: string;
}

export interface HRInitiationPayload {
  offboardingChecklist?: string[];
  exitInterviewScheduled?: boolean;
  lastWorkingDay?: string;
  assetReturnDeadline?: string;
  finalSettlementDate?: string;
  hrNotes?: string;
  
  // ✅ Additional fields used in HRInitiation
  hrOwner?: string;
  offboardingPlan?: string;
  assetReturn?: string;
  systemAccess?: string;
  payrollNotes?: string;
}

export interface FinalApprovalPayload {
  approvalStatus?: 'approved' | 'rejected' | 'pending';
  finalComments?: string;
  exitDocumentsSigned?: boolean;
  settlementCompleted?: boolean;
  certificateIssued?: boolean;
  
  // ✅ Additional fields used in FinalApproval
  resignationLetter?: string;
  lastWorkingDate?: string;
  relievingDate?: string;
  noticePeriodStart?: string;
  noticePeriodEnd?: string;
  actualNoticeDays?: string;
  fullAndFinalDate?: string;
  gratuityApplicable?: string;
  pfTransfer?: string;
  exitBonus?: string;
  exitBonusAmount?: string;
  experienceLetterDate?: string;
  hrComments?: string;
  approvedBy?: string;
}

/* ─── COMPONENT PROPS ───────────────────────────────────────────────── */

export interface StageScreenProps {
  record: OffboardingRecord;
  stageData: StageData[];
  activeRole: Role;
  onStageChange: (newStage: Stage) => void;
}

export interface ExitClearanceFormProps {
  record: OffboardingRecord;
  stageData: StageData[]; // ✅ Added - used in offboardingDetail.tsx
}

/* ─── ROUTE DEFINITIONS ──────────────────────────────────────────────── */

export interface RouteDefinition {
  path: string;
  name: string; // ✅ Changed from 'label' to 'name'
  element: ComponentType; // ✅ Added - used in app.routes.ts
  icon?: string;
  roles?: Role[];
}

export interface NavRouteDefinition {
  path: string;
  name: string; // ✅ Changed from 'label' to 'name'
  icon?: string;
  showInNav?: boolean;
}

/* ─── UTILITY TYPES ───────────────────────────────────────────────────── */

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];