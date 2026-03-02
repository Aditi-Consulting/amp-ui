<template>
  <div class="analytics">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">
          <i class="bi bi-bar-chart-line me-2"></i>
          Analytics
        </h2>
        <p class="text-muted mb-0">Overview of alert statistics and status counts</p>
      </div>
    </div>

    <!-- Stats Cards (reusable component) -->
    <StatsCards />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAlertsStore } from '@/store/alerts'
import StatsCards from '@/components/StatsCards.vue'

const alertsStore = useAlertsStore()

// Polling for live data
let pollingInterval = null

onMounted(() => {
  alertsStore.fetchAlerts()
  pollingInterval = setInterval(() => {
    alertsStore.fetchAlerts()
  }, 5000)
})

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})
</script>

<style scoped>
.analytics {
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
</style>
