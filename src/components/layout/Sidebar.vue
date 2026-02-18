<template>
  <div class="sidebar bg-dark text-white d-flex flex-column">
    <div class="sidebar-header p-3 border-bottom border-secondary">
      <h5 class="mb-0">
        <i class="bi bi-grid-3x3-gap-fill me-2"></i>
        Navigation
      </h5>
    </div>
    
    <nav class="flex-grow-1 p-3">
      <ul class="nav flex-column">
        <li class="nav-item mb-2">
          <router-link 
            to="/" 
            class="nav-link text-white d-flex align-items-center"
            :class="{ active: isActive('/') }"
          >
            <i class="bi bi-speedometer2 me-3 fs-5"></i>
            <span>Dashboard</span>
            <span v-if="pendingCount > 0" class="badge bg-warning text-dark ms-auto">
              {{ pendingCount }}
            </span>
          </router-link>
        </li>
        
        <li class="nav-item mb-2">
          <router-link 
            to="/resolutions" 
            class="nav-link text-white d-flex align-items-center"
            :class="{ active: isActive('/resolutions') }"
          >
            <i class="bi bi-tools me-3 fs-5"></i>
            <span>Resolutions</span>
            <!-- <span class="badge bg-info ms-auto">
              {{ resolutionCount }}
            </span> -->
          </router-link>
        </li>
        
  
        
      
      </ul>
      
      <hr class="border-secondary my-3">
      
      <div class="sidebar-section">
        <h6 class="text-muted text-uppercase small mb-3">Quick Stats</h6>
        <div class="stats-card bg-dark-subtle p-3 rounded mb-2">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text small">Active Alerts</span>
            <span class="badge bg-primary">{{ activeAlertsCount }}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text small">Resolved</span>
            <span class="badge bg-success">{{ resolvedCount }}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="text small">Failed</span>
            <span class="badge bg-danger">{{ failedCount }}</span>
          </div>
        </div>
      </div>
    </nav>
    
    <div class="sidebar-footer p-3 border-top border-secondary">
      <div class="d-flex align-items-center">
        <div class="status-indicator bg-success rounded-circle me-2"></div>
        <small class="text-muted">System Online</small>
      </div>
      <small class="text-muted d-block mt-2">v1.0.0</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAlertsStore } from '@/store/alerts'
import { useResolutionsStore } from '@/store/resolutions'
import { usePodsStore } from '@/store/pods'

const route = useRoute()
const alertsStore = useAlertsStore()
const resolutionsStore = useResolutionsStore()
const podsStore = usePodsStore()

const isActive = (path) => {
  return route.path === path
}

const pendingCount = computed(() => {
  return alertsStore.alerts.filter(a => a.status === 'pending_approval').length
})

const activeAlertsCount = computed(() => {
  return alertsStore.alerts.filter(a => 
    a.status === 'pending_approval' || a.status === 'in_progress'
  ).length
})

const resolvedCount = computed(() => {
  return alertsStore.alerts.filter(a => a.status === 'resolved').length
})

const failedCount = computed(() => {
  return alertsStore.alerts.filter(a => a.status === 'failed').length
})

const resolutionCount = computed(() => {
  return resolutionsStore.resolutions.filter(r => r.status === 'active').length
})

const runningPodsCount = computed(() => {
  return podsStore.pods.filter(p => p.status === 'Running').length
})
</script>

<style scoped>
.sidebar {
  width: 280px;
  min-height: 100vh;
  position: fixed;
  top: 56px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  background-color: rgba(0, 0, 0, 0.2);
}

.nav-link {
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.nav-link.active {
  background-color: rgba(13, 110, 253, 0.3);
  border-left: 3px solid #0d6efd;
}

.stats-card {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-indicator {
  width: 10px;
  height: 10px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
