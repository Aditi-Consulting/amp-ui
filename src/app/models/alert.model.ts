export interface Alert {
  id: string;
  ticketId: string;
  ticket: string;
  source: string;
  status: string;
  agentName: string;
  severity?: string;
  reasoning?: string;
  classification?: string;
  confidence?: number;
  currentStep?: string;
  startTime?: string;
  insertedAt?: string;
  processedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  issueType?: string;
  description?: string;
  workflowState?: string;
  pendingAction?: PendingAction | null;
  supervisorProgress?: WorkflowStep[];
  applicationProgress?: WorkflowStep[];
  steps?: WorkflowStep[];
  toolResults?: ToolResult[];
  logs?: LogEntry[];
}

export interface PendingAction {
  toolName: string;
  parameters: Record<string, any>;
  description?: string;
}

export interface WorkflowStep {
  id?: string;
  step: string;
  name?: string;
  status: string;
  timestamp?: string;
  details?: string;
}

export interface ToolResult {
  toolName: string;
  result: any;
  timestamp?: string;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  level?: string;
}

export interface AlertFilters {
  status: string;
  agentName: string;
  timeRange: string;
  searchQuery: string;
  selectedStatuses: string[];
  selectedSources: string[];
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface StatusCounts {
  all: number;
  pending_approval: number;
  in_progress: number;
  resolved: number;
  failed: number;
}

// --- Resolution Models ---

export interface ActionPayload {
  steps?: string[];
  riskLevel?: string;
  [key: string]: any;
}

export interface Resolution {
  id: number | string;
  issueType: string;
  description: string;
  actionType: string;
  status: string;
  updatedAt?: string;
  createdAt?: string;
  actionPayload?: ActionPayload;
}
