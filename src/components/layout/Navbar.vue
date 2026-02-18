<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
    <div class="container-fluid">
      <a class="navbar-brand d-flex align-items-center" href="#">
        <i class="bi bi-shield-check fs-4 me-2"></i>
        <span class="fw-bold">Alert Management Platform</span>
      </a>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle d-flex align-items-center" 
              href="#" 
              role="button" 
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-bell-fill me-2"></i>
              <span class="badge bg-danger rounded-pill">{{ alertCount }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <h6 class="dropdown-header">Recent Alerts</h6>
              </li>
              <li v-for="alert in recentAlerts" :key="alert.id">
                <a class="dropdown-item" href="#" @click.prevent="viewAlert(alert)">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <div class="fw-semibold">{{ alert.alertName }}</div>
                      <small class="text-muted">{{ alert.currentStep }}</small>
                    </div>
                    <span :class="getStatusBadgeClass(alert.status)" class="badge ms-2">
                      {{ formatStatus(alert.status) }}
                    </span>
                  </div>
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <router-link to="/" class="dropdown-item text-center">
                  View All Alerts
                </router-link>
              </li>
            </ul>
          </li>
          
          <li class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle d-flex align-items-center" 
              href="#" 
              role="button" 
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-person-circle fs-5 me-1"></i>
              <span>Admin User</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="#">
                  <i class="bi bi-person me-2"></i>Profile
                </a>
              </li>
              <!-- <li>
                <router-link to="/settings" class="dropdown-item">
                  <i class="bi bi-gear me-2"></i>Settings
                </router-link>
              </li> -->
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item text-danger" href="#">
                  <i class="bi bi-box-arrow-right me-2"></i>Logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAlertsStore } from '@/store/alerts'
import { useRouter } from 'vue-router'

const alertsStore = useAlertsStore()
const router = useRouter()

const alertCount = computed(() => {
  return alertsStore.alerts.filter(a => 
    a.status === 'pending_approval' || a.status === 'in_progress'
  ).length
})

const recentAlerts = computed(() => {
  return alertsStore.alerts
    .filter(a => a.status === 'pending_approval' || a.status === 'in_progress')
    .slice(0, 3)
})

const getStatusBadgeClass = (status) => {
  const classes = {
    'pending_approval': 'bg-warning',
    'in_progress': 'bg-info',
    'resolved': 'bg-success',
    'failed': 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}

const formatStatus = (status) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const viewAlert = (alert) => {
  alertsStore.setSelectedAlert(alert)
  router.push('/')
}
</script>

<style scoped>
.navbar {
  z-index: 1030;
}

.navbar-brand {
  font-size: 1.1rem;
}

.dropdown-menu {
  min-width: 150px;
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 0.75rem 1rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
}
</style>
