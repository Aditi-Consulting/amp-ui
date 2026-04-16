import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Alert } from '../../models/alert.model';
import { AlertsApiService } from '../../services/alerts-api.service';

@Component({
  selector: 'app-workflow-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflow-details-modal.component.html',
  styleUrls: ['./workflow-details-modal.component.css']
})
export class WorkflowDetailsModalComponent implements OnInit, OnDestroy {
  @Input() alert!: Alert;
  @Output() close = new EventEmitter<void>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<{ alertId: string; reason: string }>();

  // Task Agent Progress state
  taskAgentData: any = null;
  taskAgentLoading = false;
  taskAgentError: string | null = null;

  // Reject modal state
  showRejectModal = false;
  rejectReason = '';

  // Confidence Score Edit state
  showConfidenceEdit = false;
  editedConfidenceScore: number | null = null;

  // Resolution Steps Edit state
  editingStepIndex: number | null = null;
  editedStepText = '';
  newSteps: string[] = [];
  localSteps: string[] = [];
  hasStepChanges = false;
  currentResolutionId: string | null = null;
  resolutionData: any = null;

  // Retry state
  isRetrying = false;
  retryError: string | null = null;

  // Polling
  private pollSubscription: Subscription | null = null;
  private pollAttempts = 0;
  private readonly MAX_POLL_ATTEMPTS = 60;

  constructor(private alertsApi: AlertsApiService) {}

  ngOnInit(): void {
    this.fetchTaskAgentProgress();

    this.pollAttempts = 0;
    this.pollSubscription = interval(5000).subscribe(async () => {
      this.pollAttempts++;
      console.log(`🔄 Auto-polling modal data... (Attempt ${this.pollAttempts}/${this.MAX_POLL_ATTEMPTS})`);

      if (this.pollAttempts >= this.MAX_POLL_ATTEMPTS) {
        console.warn('⏰ Max polling attempts reached. Stopping auto-refresh.');
        this.stopPolling();
        this.taskAgentError = 'Auto-refresh timeout. Please close and reopen the alert.';
        return;
      }

      this.fetchTaskAgentProgress();

      const status = this.taskAgentData?.taskAgentSummary?.workflowStatus?.toLowerCase();
      if (status === 'completed' || status === 'resolved' || status === 'failed') {
        console.log('✅ Workflow done, stopping modal poll');
        this.stopPolling();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
    console.log('🛑 Modal polling stopped');
  }

  private stopPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = null;
    }
  }

  // ─── API: Task Agent Progress ───────────────────────────────────────────────

  fetchTaskAgentProgress(): void {
    if (!this.alert?.id) return;

    this.taskAgentLoading = true;
    this.taskAgentError = null;

    console.log(`📡 Fetching task agent progress for alert ${this.alert.id}...`);

    this.alertsApi.getTaskAgentProgress(this.alert.id).subscribe({
      next: (response) => {
        if (!response) {
          console.warn('⚠️ No data received yet - alert might be processing');
          this.taskAgentData = null;
          this.taskAgentLoading = false;
          return;
        }

        this.taskAgentData = response;
        console.log('✅ Task agent data loaded successfully');
        this.taskAgentLoading = false;
        // Open first node by default (only on first load, not on every poll refresh)
        if (!this.firstNodeInitialized) {
          this.openAccordions.add('taskNode0');
          this.firstNodeInitialized = true;
        }
        this.fetchResolutionData(response);
      },
      error: (error) => {
        console.error('❌ Error fetching task agent progress:', error);
        if (error.status === 404) {
          console.log('⏳ Alert not processed yet, will retry...');
          this.taskAgentData = null;
          this.taskAgentError = null;
        } else {
          this.taskAgentError = 'Unable to load workflow data. Retrying...';
        }
        this.taskAgentLoading = false;
      }
    });
  }

  // ─── Retry ───────────────────────────────────────────────────────────────────

  handleRetry(): void {
    if (!this.alert?.id || this.isRetrying) return;

    this.isRetrying = true;
    this.retryError = null;

    // Call 1: reset alert status → on success → Call 2: trigger agent by source
    this.alertsApi.retryAlert(this.alert.id)
      .pipe(
        switchMap(() => {
          console.log('✅ Call 1 success — alert reset, triggering agent...');
          return this.alertsApi.triggerAgentBySource(this.alert.id);
        })
      )
      .subscribe({
        next: () => {
          console.log('✅ Call 2 success — agent triggered for alert', this.alert.id);
          this.isRetrying = false;

          // Clear previous agent result so UI shows fresh loading state
          this.taskAgentData = null;
          this.taskAgentError = null;
          this.resolutionData = null;
          this.localSteps = [];
          this.firstNodeInitialized = false;
          this.openAccordions.clear();

          // Reset and restart polling to pick up the new agent result
          this.stopPolling();
          this.pollAttempts = 0;
          this.fetchTaskAgentProgress();
          this.pollSubscription = interval(5000).subscribe(() => {
            this.pollAttempts++;
            if (this.pollAttempts >= this.MAX_POLL_ATTEMPTS) {
              this.stopPolling();
              this.taskAgentError = 'Auto-refresh timeout. Please close and reopen the alert.';
              return;
            }
            this.fetchTaskAgentProgress();
            const status = this.taskAgentData?.taskAgentSummary?.workflowStatus?.toLowerCase();
            if (status === 'completed' || status === 'resolved' || status === 'failed') {
              this.stopPolling();
            }
          });
        },
        error: (err) => {
          console.error('❌ Retry failed:', err);
          this.isRetrying = false;
          this.retryError = err.message || 'Retry failed. Please try again.';
        }
      });
  }

  // ─── API: Resolution Data ───────────────────────────────────────────────────

  private fetchResolutionData(taskAgentResponse: any): void {
    let resolutionId: string | null = null;

    // Strategy 1: read_from_db node
    const readFromDbNode = taskAgentResponse?.executionNodes?.find(
      (node: any) => node.nodeName === 'read_from_db'
    );
    if (readFromDbNode?.fullResult) {
      const idMatch = readFromDbNode.fullResult.match(/ID:\s*(\d+)/);
      if (idMatch?.[1]) {
        resolutionId = idMatch[1];
        console.log('Extracted Resolution ID from read_from_db:', resolutionId);
      }
    }

    // Strategy 2: generate_resolution node
    if (!resolutionId) {
      const generateNode = taskAgentResponse?.executionNodes?.find(
        (node: any) => node.nodeName === 'generate_resolution'
      );
      if (generateNode?.fullResult) {
        try {
          const data = JSON.parse(generateNode.fullResult);
          const idMatch = data.summary?.match(/Resolution ID:\s*(\d+)/);
          if (idMatch?.[1]) {
            resolutionId = idMatch[1];
            console.log('Extracted Resolution ID from generate_resolution (JSON):', resolutionId);
          }
        } catch {
          const idMatch = generateNode.fullResult.match(/Resolution ID:\s*(\d+)/);
          if (idMatch?.[1]) {
            resolutionId = idMatch[1];
            console.log('Extracted Resolution ID from generate_resolution (string):', resolutionId);
          }
        }
      }
    }

    if (!resolutionId) {
      console.log('No resolution ID found in any node');
      return;
    }

    this.currentResolutionId = resolutionId;

    this.alertsApi.getResolutionById(resolutionId).subscribe({
      next: (resolutionDetails) => {
        console.log('Fetched Resolution Details:', resolutionDetails);
        this.resolutionData = resolutionDetails;
        const steps = resolutionDetails?.actionPayload?.steps || [];
        if (steps.length > 0) {
          this.localSteps = [...steps];
          this.hasStepChanges = false;
        }
      },
      error: (err) => console.error('Error fetching resolution data:', err)
    });
  }

  // ─── Approve / Reject ───────────────────────────────────────────────────────

  handleApprove(): void {
    this.approve.emit(this.alert.id);
  }

  handleReject(): void {
    if (this.rejectReason.trim()) {
      this.reject.emit({ alertId: this.alert.id, reason: this.rejectReason });
      this.showRejectModal = false;
      this.rejectReason = '';
    }
  }

  // ─── Confidence Score Edit ──────────────────────────────────────────────────

  toggleEdit(): void {
    this.showConfidenceEdit = !this.showConfidenceEdit;
    if (this.showConfidenceEdit) {
      this.editedConfidenceScore = this.taskAgentData.confidenceScore;
    }
  }

  cancelEdit(): void {
    this.showConfidenceEdit = false;
    this.editedConfidenceScore = null;
  }

  incrementScore(): void {
    if (this.editedConfidenceScore !== null && this.editedConfidenceScore < 100) {
      this.editedConfidenceScore++;
    }
  }

  decrementScore(): void {
    if (this.editedConfidenceScore !== null && this.editedConfidenceScore > 15) {
      this.editedConfidenceScore--;
    }
  }

  saveConfidenceScore(): void {
    if (this.editedConfidenceScore === null || this.editedConfidenceScore < 15 || this.editedConfidenceScore > 100) {
      alert('Please enter a valid confidence score between 15 and 100');
      return;
    }
    if (this.editedConfidenceScore === this.taskAgentData.confidenceScore) {
      alert('No changes detected. The confidence score is already set to ' + this.editedConfidenceScore + '%');
      return;
    }

    this.alertsApi.updateConfidenceScore(this.taskAgentData.id, this.editedConfidenceScore).subscribe({
      next: () => {
        this.taskAgentData.confidenceScore = this.editedConfidenceScore;
        this.showConfidenceEdit = false;
        alert('Confidence score updated successfully to ' + this.editedConfidenceScore + '%');
        console.log('Confidence score updated successfully:', this.editedConfidenceScore);
      },
      error: (err) => {
        console.error('Failed to update confidence score:', err);
        alert('Failed to update confidence score. Please try again.');
      }
    });
  }

  // ─── Resolution Steps Edit ──────────────────────────────────────────────────

  get isReadOnlyResolution(): boolean {
    // Source-based read-only check removed — all alerts are now editable
    // const source = (this.alert?.source || '').toLowerCase();
    // return source === 'splunk' || source === 'servicenow';
    return false;
  }

  get parsedStepsWithSubSteps(): Array<{ mainStep: string; subSteps: string[]; isSubStepOnly?: boolean }> {
    // Removed isReadOnlyResolution guard — parsedStepsWithSubSteps is no longer gated by source
    // if (!this.isReadOnlyResolution || !this.localSteps.length) return [];
    if (!this.localSteps.length) return [];

    const result: Array<{ mainStep: string; subSteps: string[]; isSubStepOnly?: boolean }> = [];
    let currentMainStep: { mainStep: string; subSteps: string[] } | null = null;

    this.localSteps.forEach((step) => {
      const trimmedStep = step.trim();
      if (trimmedStep.startsWith('-')) {
        if (currentMainStep) {
          currentMainStep.subSteps.push(trimmedStep);
        } else {
          result.push({ mainStep: trimmedStep, subSteps: [], isSubStepOnly: true });
        }
      } else {
        currentMainStep = { mainStep: trimmedStep, subSteps: [] };
        result.push(currentMainStep);
      }
    });

    return result;
  }

  startEditStep(stepIdx: number, stepText: string): void {
    this.editingStepIndex = stepIdx;
    this.editedStepText = stepText;
  }

  cancelEditStep(): void {
    this.editingStepIndex = null;
    this.editedStepText = '';
  }

  saveEditStep(stepIdx: number): void {
    if (!this.editedStepText.trim()) {
      alert('Step text cannot be empty');
      return;
    }
    this.localSteps[stepIdx] = this.editedStepText;
    this.hasStepChanges = true;
    this.cancelEditStep();
  }

  deleteStep(stepIdx: number): void {
    if (confirm('Are you sure you want to delete this step?')) {
      this.localSteps.splice(stepIdx, 1);
      this.hasStepChanges = true;
    }
  }

  addNewStepField(): void {
    this.newSteps.push('');
  }

  removeNewStep(newStepIdx: number): void {
    this.newSteps.splice(newStepIdx, 1);
  }

  saveAllNewSteps(): void {
    const validNewSteps = this.newSteps.filter(s => s.trim());
    if (validNewSteps.length > 0) {
      this.localSteps.push(...validNewSteps);
      this.hasStepChanges = true;
    }

    if (!this.hasStepChanges) {
      alert('No changes to save');
      return;
    }
    if (!this.currentResolutionId) {
      alert('Resolution ID not found. Cannot save steps.');
      return;
    }

    this.alertsApi.updateResolutionSteps(this.currentResolutionId, this.localSteps).subscribe({
      next: (result) => {
        console.log('Steps saved successfully:', result);
        alert('All changes saved successfully!');
        this.hasStepChanges = false;
        this.newSteps = [];
      },
      error: (err) => {
        console.error('Error saving steps:', err);
        alert('Failed to save steps: ' + (err.message || 'Unknown error'));
      }
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /** Normalize status string: trim, uppercase, replace spaces/hyphens with underscores */
  private normalizeStatus(status: string): string {
    return (status || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  }

  /** Centralized status color map — same colors used in AG Grid table */
  private getStatusColors(status: string): { bgColor: string; textColor: string } {
    const normalized = this.normalizeStatus(status);
    const colors: Record<string, { bgColor: string; textColor: string }> = {
      'OPEN': { bgColor: '#fff3e0', textColor: '#e65100' },
      'PENDING_APPROVAL': { bgColor: '#ffc107', textColor: '#212529' },
      'IN_PROGRESS': { bgColor: '#e3f2fd', textColor: '#1565c0' },
      'RESOLVED': { bgColor: '#e8f5e9', textColor: 'rgb(116, 153, 118)' },
      'COMPLETED': { bgColor: '#e8f5e9', textColor: 'rgb(116, 153, 118)' },
      'SUCCESS': { bgColor: '#e8f5e9', textColor: 'rgb(116, 153, 118)' },
      'FAILED': { bgColor: '#dc3545', textColor: '#fff' },
      'PENDING': { bgColor: '#f5f5f5', textColor: '#6c757d' },
      'ERROR': { bgColor: '#dc3545', textColor: '#fff' }
    };
    return colors[normalized] || { bgColor: '#6c757d', textColor: '#fff' };
  }

  /** Returns inline style object for status badges — ensures consistency with AG Grid */
  getStatusBadgeStyle(status: string): Record<string, string> {
    const { bgColor, textColor } = this.getStatusColors(status);
    return {
      'background-color': bgColor,
      'color': textColor,
      'font-weight': '500'
    };
  }

  /** Parse fix_steps from suggestions_for_fix node's fullResult */
  parseSuggestionsFixSteps(node: any): string[] | null {
    if (node.nodeName !== 'suggestions_for_fix' || !node.fullResult) return null;
    try {
      const data = JSON.parse(node.fullResult);
      if (Array.isArray(data.fix_steps) && data.fix_steps.length > 0) {
        return data.fix_steps;
      }
    } catch {
      // Not valid JSON — ignore
    }
    return null;
  }

  parseFetchResolutionData(node: any): any {
    if (
      (node.nodeName !== 'fetch_resolution' && node.nodeName !== 'generate_resolution') ||
      !node.fullResult
    ) return null;

    try {
      let data: any = null;
      let isPlainString = false;

      try {
        data = JSON.parse(node.fullResult);
      } catch {
        if (node.nodeName === 'generate_resolution') {
          isPlainString = true;
        } else {
          return null;
        }
      }

      let summaryLines: string[] = [];

      if (node.nodeName === 'fetch_resolution') {
        summaryLines = data.summary
          ? data.summary
              .split('\n')
              .filter((line: string) => line.trim() && !line.toLowerCase().includes('confidence scores'))
              .map((line: string) => line.replace(/^-\s*/, '').trim())
          : [];
      } else if (node.nodeName === 'generate_resolution') {
        if (isPlainString) {
          const parts = node.fullResult.split('|').map((l: string) => l.trim());
          parts.forEach((part: string) => {
            summaryLines.push(...part.split(',').map((l: string) => l.trim()).filter((l: string) => l));
          });
        } else {
          if (data.summary) {
            const parts = data.summary.split('|').map((l: string) => l.trim());
            parts.forEach((part: string) => {
              summaryLines.push(...part.split(',').map((l: string) => l.trim()).filter((l: string) => l));
            });
          }
          if (data.generated_count !== undefined) {
            summaryLines.push(`generated_count: ${data.generated_count}`);
          }
        }
      }

      let showSteps = false;
      if (node.nodeName === 'fetch_resolution') {
        showSteps = data.resolutions_found > 0 && !!this.resolutionData && this.localSteps.length > 0;
      } else if (node.nodeName === 'generate_resolution') {
        if (isPlainString) {
          showSteps = !!this.resolutionData && this.localSteps.length > 0;
        } else {
          showSteps = data.generated_count > 0 && !!this.resolutionData && this.localSteps.length > 0;
        }
      }

      return {
        summary: summaryLines,
        steps: showSteps ? this.localSteps : [],
        resolutionId: this.currentResolutionId,
        hasData: summaryLines.length > 0 || this.localSteps.length > 0,
        showSteps
      };
    } catch (error) {
      console.error('Error parsing fetch_resolution data:', error);
      return null;
    }
  }

  getProgressPercentage(): number {
    if (!this.taskAgentData?.taskAgentSummary) return 0;
    const { completedSteps, totalSteps } = this.taskAgentData.taskAgentSummary;
    if (!totalSteps || totalSteps === 0) return 0;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  /** Returns inline style for progress bar — consistent with status colors */
  getProgressBarStyle(status: string): Record<string, string> {
    const { bgColor, textColor } = this.getStatusColors(status);
    return {
      'background-color': bgColor,
      'color': textColor
    };
  }

  getStepIcon(status: string): string {
    const normalized = this.normalizeStatus(status);
    const icons: Record<string, string> = {
      'SUCCESS': 'bi bi-check-circle-fill',
      'COMPLETED': 'bi bi-check-circle-fill',
      'RESOLVED': 'bi bi-check-circle-fill',
      'IN_PROGRESS': 'bi bi-arrow-clockwise',
      'PENDING': 'bi bi-clock',
      'OPEN': 'bi bi-circle',
      'FAILED': 'bi bi-x-circle-fill',
      'ERROR': 'bi bi-x-circle-fill'
    };
    return icons[normalized] || 'bi bi-circle';
  }

  /** Returns inline style for step icons — matches status colors */
  getStepIconStyle(status: string): Record<string, string> {
    const { textColor } = this.getStatusColors(status);
    return { 'color': textColor };
  }

  getStatusBadgeClass(status: string): string {
    // Keep minimal class for badge shape, colors are now via inline style
    return '';
  }

  getSeverityBadgeClass(severity: string): string {
    if (!severity) return 'bg-secondary';
    const classes: Record<string, string> = {
      LOW: 'bg-info',
      MEDIUM: 'bg-warning text-dark',
      HIGH: 'bg-danger',
      CRITICAL: 'bg-danger'
    };
    return classes[severity.toUpperCase()] || 'bg-secondary';
  }

  formatStatus(status: string): string {
    if (!status) return 'Unknown';
    return status.split('_').map(w =>
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join(' ');
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatNodeName(nodeName: string): string {
    return nodeName
      ? nodeName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'Unknown Node';
  }

  calculateExecutionTime(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return 'N/A';
    const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  // ─── Accordion (pure Angular, no Bootstrap JS required) ─────────────────────
  private openAccordions = new Set<string>();
  private firstNodeInitialized = false;

  toggleAccordion(id: string): void {
    if (this.openAccordions.has(id)) {
      this.openAccordions.delete(id);
    } else {
      this.openAccordions.add(id);
    }
  }

  isAccordionOpen(id: string): boolean {
    return this.openAccordions.has(id);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
