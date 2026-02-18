import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/api'

export const usePodsStore = defineStore('pods', () => {
  // State
  const pods = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Static sample data for fallback (can be removed once API is stable)
  const samplePods = [
    {
      id: 'pod-001',
      name: 'production-api-7d8f9c6b5-xk2lm',
      namespace: 'production',
      status: 'Running',
      age: '5d',
      restarts: 0,
      cpu: '250m',
      memory: '512Mi',
      node: 'node-1',
      ip: '10.244.1.15',
      labels: {
        app: 'api',
        version: 'v1.2.3',
        environment: 'production'
      }
    },
    {
      id: 'pod-002',
      name: 'production-api-7d8f9c6b5-9m4np',
      namespace: 'production',
      status: 'Running',
      age: '5d',
      restarts: 1,
      cpu: '280m',
      memory: '548Mi',
      node: 'node-2',
      ip: '10.244.2.18',
      labels: {
        app: 'api',
        version: 'v1.2.3',
        environment: 'production'
      }
    },
    {
      id: 'pod-003',
      name: 'production-worker-5c9d8f7a4-h6k3p',
      namespace: 'production',
      status: 'Running',
      age: '3d',
      restarts: 0,
      cpu: '150m',
      memory: '256Mi',
      node: 'node-1',
      ip: '10.244.1.22',
      labels: {
        app: 'worker',
        version: 'v2.1.0',
        environment: 'production'
      }
    },
    {
      id: 'pod-004',
      name: 'staging-api-6b7c8d9e5-t8r2q',
      namespace: 'staging',
      status: 'Running',
      age: '2d',
      restarts: 3,
      cpu: '180m',
      memory: '384Mi',
      node: 'node-3',
      ip: '10.244.3.12',
      labels: {
        app: 'api',
        version: 'v1.3.0-beta',
        environment: 'staging'
      }
    },
    {
      id: 'pod-005',
      name: 'production-redis-master-0',
      namespace: 'production',
      status: 'Running',
      age: '15d',
      restarts: 0,
      cpu: '100m',
      memory: '1Gi',
      node: 'node-2',
      ip: '10.244.2.8',
      labels: {
        app: 'redis',
        role: 'master',
        environment: 'production'
      }
    },
    {
      id: 'pod-006',
      name: 'production-postgres-0',
      namespace: 'production',
      status: 'Running',
      age: '30d',
      restarts: 0,
      cpu: '500m',
      memory: '2Gi',
      node: 'node-1',
      ip: '10.244.1.5',
      labels: {
        app: 'postgres',
        role: 'primary',
        environment: 'production'
      }
    },
    {
      id: 'pod-007',
      name: 'monitoring-prometheus-0',
      namespace: 'monitoring',
      status: 'Running',
      age: '45d',
      restarts: 2,
      cpu: '300m',
      memory: '1.5Gi',
      node: 'node-3',
      ip: '10.244.3.20',
      labels: {
        app: 'prometheus',
        component: 'server',
        environment: 'production'
      }
    },
    {
      id: 'pod-008',
      name: 'production-nginx-ingress-8f7d6c5-p9m2k',
      namespace: 'ingress-nginx',
      status: 'Running',
      age: '20d',
      restarts: 0,
      cpu: '200m',
      memory: '512Mi',
      node: 'node-2',
      ip: '10.244.2.30',
      labels: {
        app: 'nginx-ingress',
        component: 'controller',
        environment: 'production'
      }
    },
    {
      id: 'pod-009',
      name: 'development-api-4a5b6c7d8-w3x9y',
      namespace: 'development',
      status: 'CrashLoopBackOff',
      age: '1h',
      restarts: 15,
      cpu: '50m',
      memory: '128Mi',
      node: 'node-3',
      ip: '10.244.3.45',
      labels: {
        app: 'api',
        version: 'v1.4.0-dev',
        environment: 'development'
      }
    },
    {
      id: 'pod-010',
      name: 'production-frontend-9e8d7c6b5-k4j2h',
      namespace: 'production',
      status: 'Pending',
      age: '5m',
      restarts: 0,
      cpu: '0m',
      memory: '0Mi',
      node: 'node-1',
      ip: 'N/A',
      labels: {
        app: 'frontend',
        version: 'v3.0.0',
        environment: 'production'
      }
    },
    {
      id: 'pod-011',
      name: 'staging-worker-3c4d5e6f7-n8m5l',
      namespace: 'staging',
      status: 'Error',
      age: '30m',
      restarts: 8,
      cpu: '100m',
      memory: '256Mi',
      node: 'node-2',
      ip: '10.244.2.55',
      labels: {
        app: 'worker',
        version: 'v2.2.0-rc1',
        environment: 'staging'
      }
    },
    {
      id: 'pod-012',
      name: 'production-cache-redis-replica-1',
      namespace: 'production',
      status: 'Running',
      age: '15d',
      restarts: 0,
      cpu: '80m',
      memory: '768Mi',
      node: 'node-3',
      ip: '10.244.3.9',
      labels: {
        app: 'redis',
        role: 'replica',
        environment: 'production'
      }
    }
  ]

  const filters = ref({
    namespace: 'all',
    status: 'all',
    searchQuery: ''
  })

  // Computed
  const filteredPods = computed(() => {
    let filtered = pods.value

    // Namespace filter
    if (filters.value.namespace !== 'all') {
      filtered = filtered.filter(pod => pod.namespace === filters.value.namespace)
    }

    // Status filter
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(pod => pod.status === filters.value.status)
    }

    // Search filter
    if (filters.value.searchQuery) {
      const query = filters.value.searchQuery.toLowerCase()
      filtered = filtered.filter(pod => 
        pod.name.toLowerCase().includes(query) ||
        pod.namespace.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  const namespaces = computed(() => {
    const uniqueNamespaces = [...new Set(pods.value.map(pod => pod.namespace))]
    return uniqueNamespaces.sort()
  })

  const statusCounts = computed(() => {
    return {
      all: pods.value.length,
      Running: pods.value.filter(p => p.status === 'Running').length,
      Pending: pods.value.filter(p => p.status === 'Pending').length,
      CrashLoopBackOff: pods.value.filter(p => p.status === 'CrashLoopBackOff').length,
      Error: pods.value.filter(p => p.status === 'Error').length
    }
  })

  // Actions
  const fetchKubernetesPods = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await apiClient.get('/kubernetes/pods')
      pods.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err.message || 'Failed to fetch Kubernetes pods'
      console.error('Error fetching Kubernetes pods:', err)
      
      // Fallback to sample data for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using sample data as fallback')
        pods.value = samplePods
      }
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const restartPod = async (podId) => {
    const pod = pods.value.find(p => p.id === podId)
    if (pod) {
      // Simulate pod restart
      pod.status = 'Pending'
      pod.restarts += 1
      
      // Simulate pod coming back online after 2 seconds
      setTimeout(() => {
        pod.status = 'Running'
        pod.age = '0m'
      }, 2000)
      
      return { success: true, message: `Pod ${pod.name} restart initiated` }
    }
    return { success: false, message: 'Pod not found' }
  }

  const deletePod = (podId) => {
    const index = pods.value.findIndex(p => p.id === podId)
    if (index !== -1) {
      const podName = pods.value[index].name
      pods.value.splice(index, 1)
      return { success: true, message: `Pod ${podName} deleted successfully` }
    }
    return { success: false, message: 'Pod not found' }
  }

  const getPodLogs = (podId) => {
    const pod = pods.value.find(p => p.id === podId)
    if (pod) {
      // Simulate pod logs
      return {
        success: true,
        logs: `[2024-01-15 10:30:00] INFO: Application started
[2024-01-15 10:30:01] INFO: Connected to database
[2024-01-15 10:30:02] INFO: Server listening on port 8080
[2024-01-15 10:30:15] INFO: Health check passed
[2024-01-15 10:31:00] INFO: Processing request GET /api/v1/users
[2024-01-15 10:31:01] INFO: Request completed in 120ms`
      }
    }
    return { success: false, logs: 'Pod not found' }
  }

  return {
    pods,
    loading,
    error,
    fetchKubernetesPods,
    filters,
    filteredPods,
    namespaces,
    statusCounts,
    updateFilters,
    restartPod,
    deletePod,
    getPodLogs
  }
})
