<template>
  <div class="dashboard">
    <!-- COMMENTED OUT: Dashboard header text and Create New Alert button
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">
          <i class="bi bi-speedometer2 me-2"></i>
          Alert Workflow Dashboard
        </h2>
        <p class="text-muted mb-0">Monitor and manage AI-powered alert workflows</p>
      </div>
      <router-link to="/alerts/create" class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i>
        Create New Alert
      </router-link>
    </div>
    -->

    <!-- COMMENTED OUT: Stats Cards - moved to Analytics page
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card stat-card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small">Total Alerts</p>
                <h3 class="mb-0">{{ statusCounts.all }}</h3>
              </div>
              <div class="stat-icon bg-primary bg-opacity-10 text-primary">
                <i class="bi bi-exclamation-triangle-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3">
        <div class="card stat-card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small">Pending Approval</p>
                <h3 class="mb-0">{{ statusCounts.pending_approval }}</h3>
              </div>
              <div class="stat-icon bg-warning bg-opacity-10 text-warning">
                <i class="bi bi-clock-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3">
        <div class="card stat-card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small">In Progress</p>
                <h3 class="mb-0">{{ statusCounts.in_progress }}</h3>
              </div>
              <div class="stat-icon bg-info bg-opacity-10 text-info">
                <i class="bi bi-arrow-repeat"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3">
        <div class="card stat-card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small">Resolved</p>
                <h3 class="mb-0">{{ statusCounts.resolved }}</h3>
              </div>
              <div class="stat-icon bg-success bg-opacity-10 text-success">
                <i class="bi bi-check-circle-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    END COMMENTED OUT -->

    <!-- COMMENTED OUT: Filters section (Status, Agent, Time Range, Search)
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label small text-muted">Status</label>
            <select 
              v-model="filters.status" 
              class="form-select"
              @change="updateFilters"
            >
              <option value="all">All Status</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          
          <div class="col-md-3">
            <label class="form-label small text-muted">Agent</label>
            <select 
              v-model="filters.agentName" 
              class="form-select"
              @change="updateFilters"
            >
              <option value="all">All Agents</option>
              <option value="Supervisor Agent">Supervisor Agent</option>
              <option value="Application Agent">Application Agent</option>
              <option value="Infrastructure Agent">Infrastructure Agent</option>
            </select>
          </div>
          
          <div class="col-md-3">
            <label class="form-label small text-muted">Time Range</label>
            <select 
              v-model="filters.timeRange" 
              class="form-select"
              @change="updateFilters"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div class="col-md-3">
            <label class="form-label small text-muted">Search</label>
            <div class="input-group">
              <span class="input-group-text bg-white">
                <i class="bi bi-search"></i>
              </span>
              <input 
                v-model="filters.searchQuery"
                type="text" 
                class="form-control" 
                placeholder="Search alerts..."
                @input="updateFilters"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    END COMMENTED OUT -->

    <!-- Stats Cards (reusable component) -->
    <StatsCards />

    <!-- Advanced Search -->
    <div class="mb-3">
      <button 
        class="btn btn-outline-secondary d-flex align-items-center gap-2"
        @click="showAdvancedSearch = !showAdvancedSearch"
      >
        <i class="bi bi-funnel me-1"></i>
        Advanced Search
        <i :class="showAdvancedSearch ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" style="font-size: 0.8em;"></i>
      </button>

      <!-- Filter dropdowns -->
      <div v-if="showAdvancedSearch" class="d-flex align-items-start gap-3 mt-3">
        <!-- Status multi-select dropdown -->
        <div class="advanced-filter-dropdown" ref="statusDropdownRef">
          <button 
            class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            @click="statusDropdownOpen = !statusDropdownOpen"
          >
            Status
            <span v-if="selectedStatuses.length" class="badge bg-primary rounded-pill">{{ selectedStatuses.length }}</span>
            <i :class="statusDropdownOpen ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" style="font-size: 0.75em;"></i>
          </button>
          <div v-if="statusDropdownOpen" class="dropdown-menu-custom show">
            <label 
              v-for="option in statusOptions" 
              :key="option.value" 
              class="dropdown-item-custom d-flex align-items-center gap-2"
            >
              <input 
                type="checkbox" 
                class="form-check-input m-0" 
                :value="option.value"
                v-model="selectedStatuses"
                @change="applyAdvancedFilters"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- Source System multi-select dropdown -->
        <div class="advanced-filter-dropdown" ref="sourceDropdownRef">
          <button 
            class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            @click="sourceDropdownOpen = !sourceDropdownOpen"
          >
            Source System
            <span v-if="selectedSources.length" class="badge bg-primary rounded-pill">{{ selectedSources.length }}</span>
            <i :class="sourceDropdownOpen ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" style="font-size: 0.75em;"></i>
          </button>
          <div v-if="sourceDropdownOpen" class="dropdown-menu-custom show">
            <label 
              v-for="option in sourceOptions" 
              :key="option.value" 
              class="dropdown-item-custom d-flex align-items-center gap-2"
            >
              <input 
                type="checkbox" 
                class="form-check-input m-0" 
                :value="option.value"
                v-model="selectedSources"
                @change="applyAdvancedFilters"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- Clear filters button -->
        <button 
          v-if="selectedStatuses.length || selectedSources.length"
          class="btn btn-sm btn-link text-danger text-decoration-none"
          @click="clearAdvancedFilters"
        >
          <i class="bi bi-x-circle me-1"></i>Clear Filters
        </button>
      </div>
    </div>

    <!-- Alerts Table - AG Grid -->
    <div class="card border-0 shadow-sm flex-grow-1 d-flex flex-column">
      <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-table me-2"></i>
          Alert Workflows
        </h5>
        <div class="d-flex align-items-center gap-2 pagination-top">
          <span class="text-muted small me-2">Page Size:</span>
          <select class="form-select form-select-sm" style="width: 70px;" v-model="pageSize" @change="onPageSizeChanged">
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
          <span class="text-muted small ms-2">{{ paginationInfo }}</span>
          <button class="btn btn-sm btn-outline-secondary" @click="goToFirstPage" :disabled="currentPage === 0">
            <i class="bi bi-chevron-bar-left"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary" @click="goToPrevPage" :disabled="currentPage === 0">
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="text-muted small">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
          <button class="btn btn-sm btn-outline-secondary" @click="goToNextPage" :disabled="currentPage >= totalPages - 1">
            <i class="bi bi-chevron-right"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary" @click="goToLastPage" :disabled="currentPage >= totalPages - 1">
            <i class="bi bi-chevron-bar-right"></i>
          </button>
        </div>
      </div>
      <div class="card-body p-0 flex-grow-1 d-flex flex-column">
        <ag-grid-vue
          class="ag-grid-container"
          :theme="gridTheme"
          :columnDefs="columnDefs"
          :rowData="filteredAlerts"
          :defaultColDef="defaultColDef"
          :getRowId="getRowId"
          :pagination="true"
          :paginationPageSize="pageSize"
          :paginationPageSizeSelector="[10, 15, 25, 50]"
          :paginationDisplayMode="'pages'"
          :suppressPaginationPanel="true"
          :animateRows="false"
          :suppressCellFocus="true"
          :overlayNoRowsTemplate="noRowsTemplate"
          @row-clicked="onRowClicked"
          @grid-ready="onGridReady"
          @pagination-changed="onPaginationChanged"
        />
      </div>
    </div>

    <!-- Workflow Details Modal -->
    <WorkflowDetailsModal 
      v-if="selectedAlert"
      :alert="selectedAlert"
      @close="closeWorkflowDetails"
      @approve="handleApprove"
      @reject="handleReject"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAlertsStore } from '@/store/alerts'
import WorkflowDetailsModal from '@/components/WorkflowDetailsModal.vue'
import StatsCards from '@/components/StatsCards.vue'

// AG Grid imports
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community'

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule])

const alertsStore = useAlertsStore()

// Polling interval for auto-refresh
let pollInterval = null
let gridApi = null

// Pagination state
const pageSize = ref(15)
const currentPage = ref(0)
const totalPages = ref(1)
const totalRows = ref(0)
const paginationInfo = computed(() => {
  const from = currentPage.value * pageSize.value + 1
  const to = Math.min((currentPage.value + 1) * pageSize.value, totalRows.value)
  return `${from} to ${to} of ${totalRows.value}`
})

// Row ID getter - prevents full re-render on polling
const getRowId = (params) => String(params.data.id || params.data.ticketId)

// Fetch alerts when component mounts
onMounted(async () => {
  await alertsStore.fetchAlerts()
  
  // Start polling every 5 seconds for new alerts
  pollInterval = setInterval(() => {
    console.log('🔄 Checking for new alerts...');
    alertsStore.fetchAlerts();
  }, 5000);

  // Listen for window resize to re-fit columns
  window.addEventListener('resize', onWindowResize)

  // Listen for click outside to close advanced search dropdowns
  document.addEventListener('click', handleClickOutside)
})

// Cleanup polling on unmount
onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
    console.log('🛑 Alert polling stopped');
  }
  window.removeEventListener('resize', onWindowResize)
  document.removeEventListener('click', handleClickOutside)
})

// --- Advanced Search ---
const showAdvancedSearch = ref(false)
const statusDropdownOpen = ref(false)
const sourceDropdownOpen = ref(false)
const statusDropdownRef = ref(null)
const sourceDropdownRef = ref(null)

const selectedStatuses = ref([])
const selectedSources = ref([])

const statusOptions = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'RESOLVED', label: 'Resolved' }
]

const sourceOptions = [
  { value: 'Splunk', label: 'Splunk' },
  { value: 'Kubernetes', label: 'Kubernetes' }
]

const applyAdvancedFilters = () => {
  alertsStore.updateFilters({
    selectedStatuses: selectedStatuses.value,
    selectedSources: selectedSources.value
  })
}

const clearAdvancedFilters = () => {
  selectedStatuses.value = []
  selectedSources.value = []
  applyAdvancedFilters()
}

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  if (statusDropdownRef.value && !statusDropdownRef.value.contains(event.target)) {
    statusDropdownOpen.value = false
  }
  if (sourceDropdownRef.value && !sourceDropdownRef.value.contains(event.target)) {
    sourceDropdownOpen.value = false
  }
}

const filters = ref({
  status: 'all',
  agentName: 'all',
  timeRange: '24h',
  searchQuery: ''
})

const selectedAlert = ref(null)

const filteredAlerts = computed(() => alertsStore.filteredAlerts)
const statusCounts = computed(() => alertsStore.statusCounts)

const updateFilters = () => {
  alertsStore.updateFilters(filters.value)
}

// --- AG Grid Configuration ---

// Custom Quartz theme with parameters that blend with Bootstrap
const gridTheme = themeQuartz.withParams({
  accentColor: '#0d6efd',
  borderRadius: 6,
  headerBackgroundColor: '#f8f9fa',
  headerTextColor: '#495057',
  rowHoverColor: 'rgba(13, 110, 253, 0.06)',
  fontSize: 14,
  headerFontSize: 13,
  headerFontWeight: 600,
  spacing: 6,
})

// No rows overlay template
const noRowsTemplate = `
  <div style="text-align: center; padding: 40px;">
    <i class="bi bi-inbox" style="font-size: 2.5rem; color: #6c757d;"></i>
    <p style="color: #6c757d; margin-top: 12px;">No alerts found matching your filters</p>
  </div>
`

// Default column definition
const defaultColDef = ref({
  sortable: true,
  resizable: true,
  filter: true,
  cellStyle: { display: 'flex', alignItems: 'center' },
})

// Helper functions for cell rendering
const getStatusBadgeClass = (status) => {
  const classes = {
    'PENDING_APPROVAL': 'bg-warning text-dark',
    'IN_PROGRESS': 'bg-info text-white',
    'RESOLVED': 'bg-success',
    'FAILED': 'bg-danger'
  }
  return classes[status.toUpperCase()] || 'bg-secondary'
}

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Column definitions
const columnDefs = ref([
  {
    headerName: 'Alert ID',
    field: 'ticketId',
    filter: 'agTextColumnFilter',
    width: 155,
    minWidth: 130,
    maxWidth: 175,
    suppressSizeToFit: true,
    cellRenderer: (params) => {
      if (!params.value) return ''
      return `<span class="badge bg-light text-dark border fw-semibold" style="font-size: 0.85em;">${params.value}</span>`
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
    cellRenderer: (params) => {
      if (!params.value) return ''
      return `<span class="fw-medium">${params.value}</span>`
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
    cellRenderer: (params) => {
      if (!params.value) return '<span class="text-muted" style="font-size: 0.85em;">—</span>'
      const val = params.value.toUpperCase()
      let icon = ''
      let badgeClass = 'bg-secondary'
      if (val.includes('KUBERNETES') || val.includes('K8S')) {
        icon = '<i class="bi bi-cloud me-1"></i>'
        badgeClass = 'bg-primary'
      } else if (val.includes('SPLUNK')) {
        icon = '<i class="bi bi-bar-chart-line me-1"></i>'
        badgeClass = 'bg-success'
      }
      return `<span class="badge ${badgeClass}" style="font-size: 0.8em;">${icon}${params.value}</span>`
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
    cellRenderer: (params) => {
      if (!params.value) return ''
      const badgeClass = getStatusBadgeClass(params.value)
      const label = formatStatus(params.value)
      return `<span class="badge ${badgeClass}" style="font-size: 0.8em;">${label}</span>`
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
    cellRenderer: (params) => {
      if (!params.value) return ''
      return `<span><i class="bi bi-robot me-1 text-primary"></i>${params.value}</span>`
    }
  }
])

// Grid ready event
const onGridReady = (params) => {
  gridApi = params.api
  params.api.sizeColumnsToFit()
}

// Window resize handler
const onWindowResize = () => {
  if (gridApi) {
    gridApi.sizeColumnsToFit()
  }
}

// Pagination handlers
const onPaginationChanged = () => {
  if (gridApi) {
    currentPage.value = gridApi.paginationGetCurrentPage()
    totalPages.value = gridApi.paginationGetTotalPages()
    totalRows.value = gridApi.paginationGetRowCount()
  }
}

const onPageSizeChanged = () => {
  if (gridApi) {
    gridApi.paginationSetPageSize(pageSize.value)
  }
}

const goToFirstPage = () => {
  if (gridApi) gridApi.paginationGoToFirstPage()
}

const goToPrevPage = () => {
  if (gridApi) gridApi.paginationGoToPreviousPage()
}

const goToNextPage = () => {
  if (gridApi) gridApi.paginationGoToNextPage()
}

const goToLastPage = () => {
  if (gridApi) gridApi.paginationGoToLastPage()
}

// Row click handler - opens the workflow details modal
const onRowClicked = (event) => {
  if (!event.data || !event.data.id) {
    console.error('❌ Invalid alert data');
    return;
  }
  console.log('📂 Opening workflow details for alert:', event.data.id);
  selectedAlert.value = event.data
  alertsStore.setSelectedAlert(event.data)
}

const openWorkflowDetails = (alert) => {
  if (!alert || !alert.id) {
    console.error('❌ Invalid alert data');
    return;
  }
  
  console.log('📂 Opening workflow details for alert:', alert.id);
  selectedAlert.value = alert
  alertsStore.setSelectedAlert(alert)
}

const closeWorkflowDetails = () => {
  selectedAlert.value = null
}

const handleApprove = (alertId) => {
  alertsStore.approveToolExecution(alertId)
  closeWorkflowDetails()
}

const handleReject = (alertId, reason) => {
  alertsStore.rejectToolExecution(alertId, reason)
  closeWorkflowDetails()
}
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.3s ease-in;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.cursor-pointer {
  cursor: pointer;
}

/* AG Grid Container */
.ag-grid-container {
  flex: 1;
  width: 100%;
}

/* Ensure the card and card-body fill remaining space */
.card.flex-grow-1 {
  overflow: hidden;
  min-height: 0;
}

.card-body.flex-grow-1 {
  overflow: hidden;
  min-height: 0;
}

/* AG Grid row cursor and hover */
:deep(.ag-row) {
  cursor: pointer;
}

/* Enable proper text wrapping in cells */
:deep(.ag-cell-wrap-text) {
  word-break: break-word;
  white-space: normal !important;
  line-height: 1.5;
}

/* Ensure auto-height rows align content vertically */
:deep(.ag-row .ag-cell) {
  display: flex;
  align-items: center;
}

/* Alert Name column - allow block display for wrapping */
:deep(.ag-row .ag-cell[col-id="ticket"]) {
  display: block !important;
  align-items: unset;
}

/* Style badges inside AG Grid cells */
:deep(.ag-cell .badge) {
  font-weight: 500;
  padding: 0.35em 0.65em;
  font-size: 0.85em;
}

/* Smoother AG Grid pagination - hidden since we use custom top pagination */
:deep(.ag-paging-panel) {
  display: none !important;
}

/* Override global transition that can affect AG Grid rendering */
:deep(.ag-root-wrapper *) {
  transition: none !important;
}

/* Restore transitions only for interactive elements within grid */
:deep(.ag-cell .badge),
:deep(.ag-cell .btn) {
  transition: all 0.15s ease !important;
}

/* Advanced Search Dropdowns */
.advanced-filter-dropdown {
  position: relative;
}

.dropdown-menu-custom {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1050;
  min-width: 200px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  margin-top: 4px;
}

.dropdown-item-custom {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #212529;
  transition: background-color 0.15s ease;
  user-select: none;
}

.dropdown-item-custom:hover {
  background-color: #f0f4ff;
}

.dropdown-item-custom .form-check-input {
  cursor: pointer;
  width: 1em;
  height: 1em;
}

.dropdown-item-custom .form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>
