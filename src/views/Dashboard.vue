<template>
  <div class="dashboard">
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

    <!-- Stats Cards -->
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

    <!-- Filters -->
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

    <!-- Alerts Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white border-bottom">
        <h5 class="mb-0">
          <i class="bi bi-table me-2"></i>
          Alert Workflows
        </h5>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Alert ID</th>
                <th>Alert Name</th>
                <th>Status</th>
                <th>Agent</th>
                <!-- <th>Current Step</th>
                <th>Tools Used</th>
                <th>Execution Time</th> -->
                <!-- <th>Progress</th> -->
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="alert in filteredAlerts" 
                :key="alert.id"
                class="cursor-pointer"
                @click="openWorkflowDetails(alert)"
              >
                <td>
                  <span class="badge bg-secondary">{{ alert.ticketId }}</span>
                </td>
                <td>
                  <div class="fw-semibold">{{ alert.ticket }}</div>
                  <!-- <small class="text-muted">{{ alert.ticketId }}</small> -->
                </td>
                <td>
                  <span :class="getStatusBadgeClass(alert.status)" class="badge">
                    {{ formatStatus(alert.status) }}
                  </span>
                </td>
                <td>
                  <i class="bi bi-robot me-1"></i>
                  {{ alert.agentName }}
                </td>
                <!-- <td>{{ alert.currentStep }}</td> -->
                <!-- <td>
                  <div class="d-flex gap-1">
                    <span 
                      v-for="tool in alert.toolsUsed" 
                      :key="tool"
                      class="badge bg-light text-dark"
                    >
                      {{ tool }}
                    </span>
                  </div>
                </td> -->
                <!-- <td>
                  <i class="bi bi-clock me-1"></i>
                  {{ alert.executionTime }}
                </td> -->
                <!-- <td>
                  <div class="progress" style="height: 20px; min-width: 100px;">
                    <div 
                      class="progress-bar"
                      :class="getProgressBarClass(alert.status)"
                      :style="{ width: alert.progress + '%' }"
                      role="progressbar"
                    >
                      {{ alert.progress }}%
                    </div>
                  </div>
                </td> -->
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary"
                    @click.stop="openWorkflowDetails(alert)"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="filteredAlerts.length === 0" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted"></i>
          <p class="text-muted mt-3">No alerts found matching your filters</p>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useAlertsStore } from '@/store/alerts'
import WorkflowDetailsModal from '@/components/WorkflowDetailsModal.vue'

const alertsStore = useAlertsStore()

// Fetch alerts when component mounts
onMounted(async () => {
  await alertsStore.fetchAlerts()
})

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

const getStatusBadgeClass = (status) => {
  const classes = {
    'PENDING_APPROVAL': 'bg-warning text-dark',
    'IN_PROGRESS': 'bg-info text-white',
    'RESOLVED': 'bg-success',
    'FAILED': 'bg-danger'
  }
  return classes[status.toUpperCase()] || 'bg-secondary'
}

// const getProgressBarClass = (status) => {
//   const classes = {
//     'pending_approval': 'bg-warning',
//     'in_progress': 'bg-info',
//     'resolved': 'bg-success',
//     'failed': 'bg-danger'
//   }
//   return classes[status] || 'bg-secondary'
// }

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}


const openWorkflowDetails = (alert) => {
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

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.progress {
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  font-size: 0.75rem;
  font-weight: 600;
  transition: width 0.6s ease;
}
</style>
