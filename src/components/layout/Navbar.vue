<template>
  <nav class="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm" style="background-color: #1fb3d9; padding: 10px 30px 10px 30px;">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand d-flex align-items-center text-decoration-none">
        <span class="fw-bold" style="color: #00213A;">AI OPS</span>
      </router-link>

      <div class="d-flex align-items-center gap-5">
        <router-link to="/analytics" class="nav-link text-white d-flex align-items-center nav-text-link" style="font-size: 1.25rem;">
          <i class="bi bi-bar-chart-line me-1"></i>
          Analytics
        </router-link>
        <router-link to="/resolutions" class="nav-link text-white d-flex align-items-center nav-text-link" style="font-size: 1.25rem;">
          <i class="bi bi-tools me-1"></i>
          Resolutions
        </router-link>
      </div>

      <!-- COMMENTED OUT: Notification bell and Admin profile dropdowns
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
      END COMMENTED OUT -->
    </div>
  </nav>
</template>

<script setup>
/* COMMENTED OUT: Notification and profile logic - no longer needed
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
*/
</script>

<style scoped>
.navbar {
  z-index: 1030;
  min-height: 90px;
}

.navbar-brand {
  font-size: 2rem;
  outline: none !important;
  box-shadow: none !important;
}

.navbar-brand:focus,
.navbar-brand:active {
  outline: none !important;
  box-shadow: none !important;
}

.resolutions-link {
  cursor: pointer;
  text-decoration: none;
  opacity: 0.85;
  transition: opacity 0.2s;
}

.resolutions-link:hover {
  opacity: 1;
  text-decoration: none;
}

.nav-text-link {
  cursor: pointer;
  text-decoration: none !important;
  opacity: 0.85;
  transition: opacity 0.2s;
  outline: none !important;
  box-shadow: none !important;
}

.nav-text-link:hover {
  opacity: 1;
  text-decoration: none !important;
}

.nav-text-link:focus,
.nav-text-link:active {
  outline: none !important;
  box-shadow: none !important;
}
</style>
