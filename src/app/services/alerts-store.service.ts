import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Alert, AlertFilters, StatusCounts } from '../models/alert.model';
import { AlertsApiService } from './alerts-api.service';

@Injectable({
  providedIn: 'root'
})
export class AlertsStoreService {

  // --- State (mirrors Pinia store refs) ---
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private selectedAlertSubject = new BehaviorSubject<Alert | null>(null);
  private filtersSubject = new BehaviorSubject<AlertFilters>({
    status: 'all',
    agentName: 'all',
    timeRange: '24h',
    searchQuery: '',
    selectedStatuses: [],
    selectedSources: []
  });

  // --- Public Observables ---
  alerts$ = this.alertsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  selectedAlert$ = this.selectedAlertSubject.asObservable();
  filters$ = this.filtersSubject.asObservable();

  /** Filtered alerts — mirrors the Pinia computed `filteredAlerts` exactly */
  filteredAlerts$: Observable<Alert[]> = combineLatest([
    this.alerts$,
    this.filters$
  ]).pipe(
    map(([alerts, filters]) => {
      let filtered = [...alerts];

      // Multi-select status filter (Advanced Search)
      if (filters.selectedStatuses && filters.selectedStatuses.length > 0) {
        filtered = filtered.filter(alert =>
          filters.selectedStatuses.some(s =>
            s.toUpperCase() === (alert.status || '').toUpperCase()
          )
        );
      }
      // Fallback: legacy single status filter
      else if (filters.status !== 'all') {
        filtered = filtered.filter(alert =>
          (alert.status || '').toUpperCase() === filters.status.toUpperCase()
        );
      }

      // Multi-select agent filter (Advanced Search — filters by agentName)
      if (filters.selectedSources && filters.selectedSources.length > 0) {
        filtered = filtered.filter(alert => {
          const agent = (alert.agentName || '').toUpperCase();
          return filters.selectedSources.some(s => agent.includes(s.toUpperCase()));
        });
      }

      // Agent filter
      if (filters.agentName !== 'all') {
        filtered = filtered.filter(alert => alert.agentName === filters.agentName);
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(alert =>
          (alert.ticket || '').toLowerCase().includes(query) ||
          (alert.ticketId || '').toLowerCase().includes(query) ||
          (alert.agentName || '').toLowerCase().includes(query)
        );
      }

      // Sort by time in descending order (most recent first)
      filtered = filtered.sort((a, b) => {
        const timeA = new Date(a.startTime || a.insertedAt || 0).getTime();
        const timeB = new Date(b.startTime || b.insertedAt || 0).getTime();
        return timeB - timeA;
      });

      return filtered;
    })
  );

  /** Status counts — mirrors the Pinia computed `statusCounts` */
  statusCounts$: Observable<StatusCounts> = this.alerts$.pipe(
    map(alerts => ({
      all: alerts.length,
      pending_approval: alerts.filter(a => (a.status || '').toUpperCase() === 'PENDING_APPROVAL').length,
      in_progress: alerts.filter(a => (a.status || '').toUpperCase() === 'IN_PROGRESS').length,
      resolved: alerts.filter(a => (a.status || '').toUpperCase() === 'RESOLVED').length,
      failed: alerts.filter(a => (a.status || '').toUpperCase() === 'FAILED').length
    }))
  );

  constructor(private alertsApi: AlertsApiService) {}

  /** Fetch alerts from API and update store */
  fetchAlerts(): void {
    console.log('[AlertsStore] fetchAlerts() called');
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.alertsApi.getAlerts().subscribe({
      next: (data) => {
        console.log('[AlertsStore] API returned alerts:', data);
        this.alertsSubject.next(data);
        this.loadingSubject.next(false);
      },
      error: (err) => {
        console.error('[AlertsStore] Error fetching alerts:', err);
        this.errorSubject.next(err.message || 'Failed to fetch alerts');
        this.loadingSubject.next(false);
      }
    });
  }

  /** Set the currently selected alert */
  setSelectedAlert(alert: Alert | null): void {
    this.selectedAlertSubject.next(alert);
  }

  /** Update filter criteria */
  updateFilters(newFilters: Partial<AlertFilters>): void {
    const current = this.filtersSubject.getValue();
    this.filtersSubject.next({ ...current, ...newFilters });
  }

  /** Approve tool execution for an alert (mirrors Pinia action) */
  approveToolExecution(alertId: string): void {
    const alerts = this.alertsSubject.getValue();
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'in_progress';
      alert.currentStep = 'Executing Fix';

      // Update supervisor progress
      const approvalStep = alert.supervisorProgress?.find(s => s.step === 'Tool Execution Approval');
      if (approvalStep) {
        approvalStep.status = 'completed';
        approvalStep.timestamp = new Date().toISOString();
      }

      // Update application progress
      const executeStep = alert.applicationProgress?.find(s => s.step === 'Execute Fix');
      if (executeStep) {
        executeStep.status = 'in_progress';
        executeStep.timestamp = new Date().toISOString();
      }

      this.alertsSubject.next([...alerts]);
    }
  }

  /** Reject tool execution for an alert (mirrors Pinia action) */
  rejectToolExecution(alertId: string, reason: string): void {
    const alerts = this.alertsSubject.getValue();
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'failed';
      alert.currentStep = 'Rejected';

      // Update supervisor progress
      const approvalStep = alert.supervisorProgress?.find(s => s.step === 'Tool Execution Approval');
      if (approvalStep) {
        approvalStep.status = 'failed';
        approvalStep.timestamp = new Date().toISOString();
      }

      this.alertsSubject.next([...alerts]);
    }
  }
}
