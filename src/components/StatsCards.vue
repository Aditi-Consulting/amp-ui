<template>
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
</template>

<script setup>
import { computed } from 'vue'
import { useAlertsStore } from '@/store/alerts'

const alertsStore = useAlertsStore()

const statusCounts = computed(() => alertsStore.statusCounts)
</script>

<style scoped>
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
</style>
