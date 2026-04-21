// Task Status
export const TASK_STATUS = {
  BACKLOG: "BACKLOG",
  READY: "READY",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW: "REVIEW",
  QA: "QA",
  STAGING: "STAGING",
  DONE: "DONE",
  BLOCKED: "BLOCKED",
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

// Approval Status
export const APPROVAL_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ApprovalStatus = typeof APPROVAL_STATUS[keyof typeof APPROVAL_STATUS];

// Memory Type
export const MEMORY_TYPE = {
  CONSTITUTION: "CONSTITUTION",
  SPRINT: "SPRINT",
  TASK: "TASK",
  RESET_SUMMARY: "RESET_SUMMARY",
} as const;

export type MemoryType = typeof MEMORY_TYPE[keyof typeof MEMORY_TYPE];

// Document Type
export const DOCUMENT_TYPE = {
  CONSTITUTION: "CONSTITUTION",
  PRD: "PRD",
  ADR: "ADR",
  RELEASE_CHECKLIST: "RELEASE_CHECKLIST",
  RETROSPECTIVE: "RETROSPECTIVE",
  OTHER: "OTHER",
} as const;

export type DocumentType = typeof DOCUMENT_TYPE[keyof typeof DOCUMENT_TYPE];

// Message Role
export const MESSAGE_ROLE = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
} as const;

export type MessageRole = typeof MESSAGE_ROLE[keyof typeof MESSAGE_ROLE];

// GitHub Link Type
export const GITHUB_LINK_TYPE = {
  ISSUE: "issue",
  PR: "pr",
} as const;

export type GithubLinkType = typeof GITHUB_LINK_TYPE[keyof typeof GITHUB_LINK_TYPE];

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProjectDTO {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDTO {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  acceptanceCriteria: string | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  messages?: TaskMessageDTO[];
  decisions?: DecisionDTO[];
  approvals?: ApprovalDTO[];
  memorySnapshots?: MemorySnapshotDTO[];
  githubLinks?: GithubLinkDTO[];
}

export interface TaskMessageDTO {
  id: string;
  taskId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface DecisionDTO {
  id: string;
  taskId: string;
  title: string;
  context: string;
  decision: string;
  rationale: string | null;
  createdAt: Date;
}

export interface DocumentDTO {
  id: string;
  projectId: string | null;
  taskId: string | null;
  title: string;
  type: DocumentType;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalDTO {
  id: string;
  taskId: string;
  title: string;
  description: string | null;
  status: ApprovalStatus;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  task?: { id: string; title: string; projectId: string };
}

export interface MemorySnapshotDTO {
  id: string;
  taskId: string | null;
  type: MemoryType;
  title: string;
  content: string;
  createdAt: Date;
}

export interface GithubLinkDTO {
  id: string;
  taskId: string;
  type: GithubLinkType;
  url: string;
  number: number;
  title: string | null;
  createdAt: Date;
}

export interface AuditLogDTO {
  id: string;
  taskId: string | null;
  entity: string;
  entityId: string;
  action: string;
  before: unknown;
  after: unknown;
  actor: string | null;
  createdAt: Date;
}
