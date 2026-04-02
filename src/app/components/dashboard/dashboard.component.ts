import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
  ColDef,
  GetRowIdParams,
  PaginationChangedEvent
} from 'ag-grid-community';

import { AlertsStoreService } from '../../services/alerts-store.service';
import { StatsCardsComponent } from '../stats-cards/stats-cards.component';
import { WorkflowDetailsModalComponent } from '../workflow-details-modal/workflow-details-modal.component';
import { Alert, FilterOption } from '../../models/alert.model';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    StatsCardsComponent,
    WorkflowDetailsModalComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  // --- AG Grid ---
  gridApi!: GridApi;
  filteredAlerts: Alert[] = [];

  // Custom Quartz theme matching Bootstrap — mirrors Vue gridTheme
  gridTheme = themeQuartz.withParams({
    accentColor: '#0d6efd',
    borderRadius: 6,
    headerBackgroundColor: '#f8f9fa',
    headerTextColor: '#495057',
    rowHoverColor: 'rgba(13, 110, 253, 0.06)',
    fontSize: 14,
    headerFontSize: 13,
    headerFontWeight: 600,
    spacing: 6,
  });

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    cellStyle: { display: 'flex', alignItems: 'center' },
  };

  columnDefs: ColDef[] = [
    {
      headerName: 'Alert ID',
      field: 'ticketId',
      filter: 'agTextColumnFilter',
      width: 155,
      minWidth: 130,
      maxWidth: 175,
      suppressSizeToFit: true,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        return `<span style="display:inline-block;padding:0.35em 0.65em;font-size:0.85em;font-weight:600;line-height:1;text-align:center;white-space:nowrap;vertical-align:baseline;border-radius:0.375rem;color:#212529;background-color:#f8f9fa;border:1px solid #dee2e6;">${params.value}</span>`;
      }
    },
    {
      headerName: 'Alert Name',
      field: 'ticket',
      filter: 'agTextColumnFilter',
      flex: 1,
      minWidth: 300,
      wrapText: true,
      autoHeight: true,
      cellStyle: {
        'white-space': 'normal',
        'line-height': '1.5',
        'padding-top': '10px',
        'padding-bottom': '10px',
        'word-break': 'break-word',
        'display': 'block'
      },
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        return `<span style="font-weight:500;">${params.value}</span>`;
      }
    },
    {
      headerName: 'Source',
      field: 'source',
      filter: 'agTextColumnFilter',
      width: 145,
      minWidth: 120,
      maxWidth: 170,
      suppressSizeToFit: true,
      cellRenderer: (params: any) => {
        if (!params.value) return '<span style="color:#6c757d;">—</span>';
        return `<span style="font-weight:500;">${params.value}</span>`;
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      filter: 'agTextColumnFilter',
      width: 140,
      minWidth: 120,
      maxWidth: 160,
      suppressSizeToFit: true,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const { bgColor, textColor } = this.getStatusColors(params.value);
        const label = this.formatStatus(params.value);
        return `<span style="display:inline-block;padding:0.35em 0.65em;font-size:0.8em;font-weight:500;line-height:1;text-align:center;white-space:nowrap;vertical-align:baseline;border-radius:0.375rem;color:${textColor};background-color:${bgColor};">${label}</span>`;
      }
    },
    {
      headerName: 'Agent',
      field: 'agentName',
      filter: 'agTextColumnFilter',
      width: 180,
      minWidth: 150,
      maxWidth: 210,
      suppressSizeToFit: true,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        return `<span style="font-weight:500;">${params.value}</span>`;
      }
    }
  ];

  noRowsTemplate = `
    <div style="text-align: center; padding: 40px;">
      <i class="bi bi-inbox" style="font-size: 2.5rem; color: #6c757d;"></i>
      <p style="color: #6c757d; margin-top: 12px;">No alerts found matching your filters</p>
    </div>
  `;

  // Pagination state
  pageSize = 15;
  currentPage = 0;
  totalPages = 1;
  totalRows = 0;

  // Advanced Search state
  showAdvancedSearch = false;
  statusDropdownOpen = false;
  sourceDropdownOpen = false;
  selectedStatuses: string[] = [];
  selectedSources: string[] = [];

  statusOptions: FilterOption[] = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'RESOLVED', label: 'Resolved' }
  ];

  sourceOptions: FilterOption[] = [
    { value: 'Infrastructure Agent', label: 'Infrastructure Agent' },
    { value: 'Application Agent', label: 'Application Agent' },
    { value: 'Unlock Agent', label: 'Unlock Agent' }
  ];

  // Selected alert for modal
  selectedAlert: Alert | null = null;

  // ViewChild refs for click-outside detection
  @ViewChild('statusDropdownRef') statusDropdownRef!: ElementRef;
  @ViewChild('sourceDropdownRef') sourceDropdownRef!: ElementRef;

  private subscriptions = new Subscription();
  private boundHandleClickOutside = this.handleClickOutside.bind(this);
  private boundOnWindowResize = this.onWindowResize.bind(this);

  constructor(private alertsStore: AlertsStoreService) {}

  ngOnInit(): void {
    console.log('[Dashboard] ngOnInit - initializing dashboard component');

    // Initial fetch
    console.log('[Dashboard] Calling alertsStore.fetchAlerts()');
    this.alertsStore.fetchAlerts();

    // Poll every 5 seconds for new alerts (mirrors Vue setInterval)
    this.subscriptions.add(
      interval(5000).subscribe(() => {
        console.log('🔄 Checking for new alerts...');
        this.alertsStore.fetchAlerts();
      })
    );

    // Subscribe to filtered alerts
    this.subscriptions.add(
      this.alertsStore.filteredAlerts$.subscribe(alerts => {
        console.log('[Dashboard] filteredAlerts$ emission:', alerts);
        this.filteredAlerts = alerts;
      })
    );

    // Event listeners
    window.addEventListener('resize', this.boundOnWindowResize);
    document.addEventListener('click', this.boundHandleClickOutside);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    window.removeEventListener('resize', this.boundOnWindowResize);
    document.removeEventListener('click', this.boundHandleClickOutside);
    console.log('🛑 Alert polling stopped');
  }

  // --- AG Grid Helpers ---
  getRowId = (params: GetRowIdParams): string => {
    return String(params.data.id || params.data.ticketId);
  };

  get paginationInfo(): string {
    const from = this.currentPage * this.pageSize + 1;
    const to = Math.min((this.currentPage + 1) * this.pageSize, this.totalRows);
    return `${from} to ${to} of ${this.totalRows}`;
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onPaginationChanged(_event: PaginationChangedEvent): void {
    if (this.gridApi) {
      this.currentPage = this.gridApi.paginationGetCurrentPage();
      this.totalPages = this.gridApi.paginationGetTotalPages();
      this.totalRows = this.gridApi.paginationGetRowCount();
    }
  }

  onPageSizeChanged(): void {
    if (this.gridApi) {
      this.gridApi.updateGridOptions({ paginationPageSize: this.pageSize });
    }
  }

  goToFirstPage(): void {
    this.gridApi?.paginationGoToFirstPage();
  }

  goToPrevPage(): void {
    this.gridApi?.paginationGoToPreviousPage();
  }

  goToNextPage(): void {
    this.gridApi?.paginationGoToNextPage();
  }

  goToLastPage(): void {
    this.gridApi?.paginationGoToLastPage();
  }

  onRowClicked(event: RowClickedEvent): void {
    if (!event.data) {
      console.error('❌ Invalid alert data');
      return;
    }
    console.log('📂 Opening workflow details for alert:', event.data.id);
    this.selectedAlert = event.data;
    this.alertsStore.setSelectedAlert(event.data);
  }

  onWindowResize(): void {
    this.gridApi?.sizeColumnsToFit();
  }

  // --- Advanced Search ---
  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  toggleStatusDropdown(): void {
    this.statusDropdownOpen = !this.statusDropdownOpen;
    this.sourceDropdownOpen = false;
  }

  toggleSourceDropdown(): void {
    this.sourceDropdownOpen = !this.sourceDropdownOpen;
    this.statusDropdownOpen = false;
  }

  onStatusChange(value: string): void {
    const idx = this.selectedStatuses.indexOf(value);
    if (idx > -1) {
      this.selectedStatuses.splice(idx, 1);
    } else {
      this.selectedStatuses.push(value);
    }
    this.applyAdvancedFilters();
  }

  onSourceChange(value: string): void {
    const idx = this.selectedSources.indexOf(value);
    if (idx > -1) {
      this.selectedSources.splice(idx, 1);
    } else {
      this.selectedSources.push(value);
    }
    this.applyAdvancedFilters();
  }

  isStatusSelected(value: string): boolean {
    return this.selectedStatuses.includes(value);
  }

  isSourceSelected(value: string): boolean {
    return this.selectedSources.includes(value);
  }

  applyAdvancedFilters(): void {
    this.alertsStore.updateFilters({
      selectedStatuses: [...this.selectedStatuses],
      selectedSources: [...this.selectedSources]
    });
  }

  clearAdvancedFilters(): void {
    this.selectedStatuses = [];
    this.selectedSources = [];
    this.applyAdvancedFilters();
  }

  hasActiveFilters(): boolean {
    return this.selectedStatuses.length > 0 || this.selectedSources.length > 0;
  }

  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.statusDropdownRef && !this.statusDropdownRef.nativeElement.contains(target)) {
      this.statusDropdownOpen = false;
    }
    if (this.sourceDropdownRef && !this.sourceDropdownRef.nativeElement.contains(target)) {
      this.sourceDropdownOpen = false;
    }
  }

  // --- Modal ---
  closeWorkflowDetails(): void {
    this.selectedAlert = null;
  }

  handleApprove(alertId: string): void {
    this.alertsStore.approveToolExecution(alertId);
    this.closeWorkflowDetails();
  }

  handleReject(alertId: string, reason: string): void {
    this.alertsStore.rejectToolExecution(alertId, reason);
    this.closeWorkflowDetails();
  }

  // --- Helpers ---
  private normalizeStatus(status: string): string {
    // Normalize: trim, uppercase, replace spaces/hyphens with underscores
    return (status || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  }

  private getStatusColors(status: string): { bgColor: string; textColor: string } {
    const normalized = this.normalizeStatus(status);
    const colors: Record<string, { bgColor: string; textColor: string }> = {
      'OPEN': { bgColor: '#fff3e0', textColor: '#e65100' },
      'PENDING_APPROVAL': { bgColor: '#ffc107', textColor: '#212529' },
      'IN_PROGRESS': { bgColor: '#e3f2fd', textColor: '#1565c0' },
      'RESOLVED': { bgColor: '#e8f5e9', textColor: '#2e7d32' },
      'COMPLETED': { bgColor: '#e8f5e9', textColor: '#2e7d32' },
      'SUCCESS': { bgColor: '#e8f5e9', textColor: '#2e7d32' },
      'FAILED': { bgColor: '#dc3545', textColor: '#fff' },
      'PENDING': { bgColor: '#f5f5f5', textColor: '#6c757d' }
    };
    return colors[normalized] || { bgColor: '#6c757d', textColor: '#fff' };
  }

  private getStatusBadgeClass(status: string): string {
    const normalized = this.normalizeStatus(status);
    const classes: Record<string, string> = {
      'OPEN': 'bg-warning text-dark',
      'PENDING_APPROVAL': 'bg-warning text-dark',
      'IN_PROGRESS': 'bg-info text-white',
      'RESOLVED': 'bg-success',
      'COMPLETED': 'bg-success',
      'SUCCESS': 'bg-success',
      'FAILED': 'bg-danger',
      'PENDING': 'bg-secondary'
    };
    return classes[normalized] || 'bg-secondary';
  }

  private formatStatus(status: string): string {
    if (!status) return 'Unknown';
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
}
