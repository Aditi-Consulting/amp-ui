import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/api'

export const useAlertsStore = defineStore('alerts', () => {
  // State
  const alerts = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Static sample data for fallback (can be removed once API is stable)
  const sampleAlerts = [
    {
      id: 'ALT-001',
      alertName: 'High CPU Usage - Production Pod',
      status: 'pending_approval',
      agent: 'Supervisor Agent',
      currentStep: 'Tool Execution Approval',
      toolsUsed: ['kubectl', 'prometheus'],
      executionTime: '2m 34s',
      progress: 65,
      createdBy: 'system',
      severity: 'high',
      ticketId: 'TICK-1001',
      description: 'CPU usage exceeded 90% threshold on production-api-pod-1',
      classification: 'Infrastructure',
      startTime: '2024-01-15T10:30:00Z',
      classificationReasoning: 'Alert classified as Infrastructure issue based on CPU metrics and pod resource constraints. The issue is related to resource allocation and scaling policies.',
      supervisorProgress: [
        { step: 'Alert Received', status: 'completed', timestamp: '2024-01-15T10:30:00Z' },
        { step: 'Classification', status: 'completed', timestamp: '2024-01-15T10:30:15Z' },
        { step: 'Agent Assignment', status: 'completed', timestamp: '2024-01-15T10:30:30Z' },
        { step: 'Tool Execution Approval', status: 'in_progress', timestamp: '2024-01-15T10:32:00Z' },
        { step: 'Resolution Verification', status: 'pending', timestamp: null }
      ],
      applicationProgress: [
        { step: 'Analyze Metrics', status: 'completed', timestamp: '2024-01-15T10:31:00Z', details: 'CPU usage: 92%, Memory: 78%' },
        { step: 'Identify Root Cause', status: 'completed', timestamp: '2024-01-15T10:31:30Z', details: 'Memory leak detected in application' },
        { step: 'Prepare Resolution', status: 'in_progress', timestamp: '2024-01-15T10:32:00Z', details: 'Preparing pod restart command' },
        { step: 'Execute Fix', status: 'pending', timestamp: null, details: null },
        { step: 'Verify Resolution', status: 'pending', timestamp: null, details: null }
      ],
      toolExecution: {
        toolName: 'kubectl restart',
        riskLevel: 'medium',
        description: 'Restart the affected pod to clear memory leak and restore normal operation',
        command: 'kubectl rollout restart deployment/production-api -n production',
        estimatedDowntime: '30 seconds'
      }
    },
    {
      id: 'ALT-002',
      alertName: 'Database Connection Pool Exhausted',
      status: 'in_progress',
      agent: 'Application Agent',
      currentStep: 'Executing Fix',
      toolsUsed: ['psql', 'pgbouncer'],
      executionTime: '5m 12s',
      progress: 80,
      createdBy: 'monitoring-system',
      severity: 'critical',
      ticketId: 'TICK-1002',
      description: 'Database connection pool reached maximum capacity causing application timeouts',
      classification: 'Database',
      startTime: '2024-01-15T10:25:00Z',
      classificationReasoning: 'Alert classified as Database issue due to connection pool exhaustion and query timeout patterns.',
      supervisorProgress: [
        { step: 'Alert Received', status: 'completed', timestamp: '2024-01-15T10:25:00Z' },
        { step: 'Classification', status: 'completed', timestamp: '2024-01-15T10:25:10Z' },
        { step: 'Agent Assignment', status: 'completed', timestamp: '2024-01-15T10:25:20Z' },
        { step: 'Tool Execution Approval', status: 'completed', timestamp: '2024-01-15T10:26:00Z' },
        { step: 'Resolution Verification', status: 'in_progress', timestamp: '2024-01-15T10:30:00Z' }
      ],
      applicationProgress: [
        { step: 'Analyze Metrics', status: 'completed', timestamp: '2024-01-15T10:26:00Z', details: 'Active connections: 100/100' },
        { step: 'Identify Root Cause', status: 'completed', timestamp: '2024-01-15T10:27:00Z', details: 'Long-running queries blocking pool' },
        { step: 'Prepare Resolution', status: 'completed', timestamp: '2024-01-15T10:28:00Z', details: 'Increase pool size and kill blocking queries' },
        { step: 'Execute Fix', status: 'in_progress', timestamp: '2024-01-15T10:29:00Z', details: 'Applying configuration changes' },
        { step: 'Verify Resolution', status: 'pending', timestamp: null, details: null }
      ],
      toolExecution: {
        toolName: 'pgbouncer config update',
        riskLevel: 'low',
        description: 'Increase connection pool size and terminate long-running queries',
        command: 'pgbouncer -R && psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = \'idle in transaction\'"',
        estimatedDowntime: '0 seconds'
      }
    },
    {
      id: 'ALT-003',
      alertName: 'API Response Time Degradation',
      status: 'resolved',
      agent: 'Application Agent',
      currentStep: 'Completed',
      toolsUsed: ['curl', 'jq', 'kubectl'],
      executionTime: '8m 45s',
      progress: 100,
      createdBy: 'apm-system',
      severity: 'medium',
      ticketId: 'TICK-1003',
      description: 'API endpoint /api/v1/users showing 3x slower response times',
      classification: 'Application',
      startTime: '2024-01-15T10:15:00Z',
      classificationReasoning: 'Alert classified as Application issue based on API performance metrics and application logs showing slow query execution.',
      supervisorProgress: [
        { step: 'Alert Received', status: 'completed', timestamp: '2024-01-15T10:15:00Z' },
        { step: 'Classification', status: 'completed', timestamp: '2024-01-15T10:15:10Z' },
        { step: 'Agent Assignment', status: 'completed', timestamp: '2024-01-15T10:15:20Z' },
        { step: 'Tool Execution Approval', status: 'completed', timestamp: '2024-01-15T10:16:00Z' },
        { step: 'Resolution Verification', status: 'completed', timestamp: '2024-01-15T10:23:00Z' }
      ],
      applicationProgress: [
        { step: 'Analyze Metrics', status: 'completed', timestamp: '2024-01-15T10:16:00Z', details: 'Response time: 1200ms (baseline: 400ms)' },
        { step: 'Identify Root Cause', status: 'completed', timestamp: '2024-01-15T10:17:00Z', details: 'Missing database index on user_id column' },
        { step: 'Prepare Resolution', status: 'completed', timestamp: '2024-01-15T10:18:00Z', details: 'Create index on users table' },
        { step: 'Execute Fix', status: 'completed', timestamp: '2024-01-15T10:20:00Z', details: 'Index created successfully' },
        { step: 'Verify Resolution', status: 'completed', timestamp: '2024-01-15T10:23:00Z', details: 'Response time: 380ms' }
      ],
      toolExecution: {
        toolName: 'database index creation',
        riskLevel: 'low',
        description: 'Create missing database index to improve query performance',
        command: 'CREATE INDEX CONCURRENTLY idx_users_user_id ON users(user_id)',
        estimatedDowntime: '0 seconds'
      }
    },
    {
      id: 'ALT-004',
      alertName: 'Disk Space Critical - Log Volume',
      status: 'failed',
      agent: 'Infrastructure Agent',
      currentStep: 'Failed',
      toolsUsed: ['df', 'du', 'find'],
      executionTime: '3m 20s',
      progress: 45,
      createdBy: 'system',
      severity: 'critical',
      ticketId: 'TICK-1004',
      description: 'Log volume /var/log reached 95% capacity',
      classification: 'Infrastructure',
      startTime: '2024-01-15T10:10:00Z',
      classificationReasoning: 'Alert classified as Infrastructure issue due to disk space constraints on system volume.',
      supervisorProgress: [
        { step: 'Alert Received', status: 'completed', timestamp: '2024-01-15T10:10:00Z' },
        { step: 'Classification', status: 'completed', timestamp: '2024-01-15T10:10:10Z' },
        { step: 'Agent Assignment', status: 'completed', timestamp: '2024-01-15T10:10:20Z' },
        { step: 'Tool Execution Approval', status: 'completed', timestamp: '2024-01-15T10:11:00Z' },
        { step: 'Resolution Verification', status: 'failed', timestamp: '2024-01-15T10:13:00Z' }
      ],
      applicationProgress: [
        { step: 'Analyze Metrics', status: 'completed', timestamp: '2024-01-15T10:11:00Z', details: 'Disk usage: 95%, Available: 2GB' },
        { step: 'Identify Root Cause', status: 'completed', timestamp: '2024-01-15T10:11:30Z', details: 'Old log files not being rotated' },
        { step: 'Prepare Resolution', status: 'completed', timestamp: '2024-01-15T10:12:00Z', details: 'Delete logs older than 30 days' },
        { step: 'Execute Fix', status: 'failed', timestamp: '2024-01-15T10:13:00Z', details: 'Permission denied - requires manual intervention' },
        { step: 'Verify Resolution', status: 'failed', timestamp: null, details: null }
      ],
      toolExecution: {
        toolName: 'log cleanup',
        riskLevel: 'medium',
        description: 'Remove old log files to free up disk space',
        command: 'find /var/log -name "*.log" -mtime +30 -delete',
        estimatedDowntime: '0 seconds'
      }
    },
    {
      id: 'ALT-005',
      alertName: 'Redis Cache Hit Rate Low',
      status: 'pending_approval',
      agent: 'Supervisor Agent',
      currentStep: 'Classification',
      toolsUsed: ['redis-cli'],
      executionTime: '1m 15s',
      progress: 25,
      createdBy: 'monitoring-system',
      severity: 'low',
      ticketId: 'TICK-1005',
      description: 'Redis cache hit rate dropped below 70% threshold',
      classification: 'Application',
      startTime: '2024-01-15T10:35:00Z',
      classificationReasoning: 'Alert classified as Application issue based on cache performance metrics indicating inefficient cache usage patterns.',
      supervisorProgress: [
        { step: 'Alert Received', status: 'completed', timestamp: '2024-01-15T10:35:00Z' },
        { step: 'Classification', status: 'in_progress', timestamp: '2024-01-15T10:35:30Z' },
        { step: 'Agent Assignment', status: 'pending', timestamp: null },
        { step: 'Tool Execution Approval', status: 'pending', timestamp: null },
        { step: 'Resolution Verification', status: 'pending', timestamp: null }
      ],
      applicationProgress: [
        { step: 'Analyze Metrics', status: 'pending', timestamp: null, details: null },
        { step: 'Identify Root Cause', status: 'pending', timestamp: null, details: null },
        { step: 'Prepare Resolution', status: 'pending', timestamp: null, details: null },
        { step: 'Execute Fix', status: 'pending', timestamp: null, details: null },
        { step: 'Verify Resolution', status: 'pending', timestamp: null, details: null }
      ],
      toolExecution: {
        toolName: 'redis analysis',
        riskLevel: 'low',
        description: 'Analyze cache patterns and adjust TTL settings',
        command: 'redis-cli --stat',
        estimatedDowntime: '0 seconds'
      }
    }
  ]

  const selectedAlert = ref(null)
  const filters = ref({
    status: 'all',
    agentName: 'all',
    timeRange: '24h',
    searchQuery: ''
  })

  // Computed
  const filteredAlerts = computed(() => {
    let filtered = alerts.value

    // Status filter
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(alert => alert.status.toUpperCase() === filters.value.status.toUpperCase())
    }

    // Agent filter
    if (filters.value.agentName !== 'all') {
      filtered = filtered.filter(alert => alert.agentName === filters.value.agentName)
    }

    // Search filter
    if (filters.value.searchQuery) {
      const query = filters.value.searchQuery.toLowerCase()
      filtered = filtered.filter(alert => 
        alert.ticket.toLowerCase().includes(query) ||
        alert.ticketId.toLowerCase().includes(query) ||
        alert.agentName.toLowerCase().includes(query)
      )
    }

    // Sort by time in descending order (most recent first)
    filtered = filtered.sort((a, b) => {
      const timeA = new Date(a.startTime || a.insertedAt || 0)
      const timeB = new Date(b.startTime || b.insertedAt || 0)
      return timeB - timeA // Descending order
    })

    return filtered
  })

  const statusCounts = computed(() => {
    return {
      all: alerts.value.length,
      pending_approval: alerts.value.filter(a => a.status.toUpperCase() === 'PENDING_APPROVAL').length,
      in_progress: alerts.value.filter(a => a.status.toUpperCase() === 'IN_PROGRESS').length,
      resolved: alerts.value.filter(a => a.status.toUpperCase() === 'RESOLVED').length,
      failed: alerts.value.filter(a => a.status.toUpperCase() === 'FAILED').length
    }
  })

  // Actions
  const fetchAlerts = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await apiClient.get('/alerts')
      alerts.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err.message || 'Failed to fetch alerts'
      console.error('Error fetching alerts:', err)
      
      // Fallback to sample data for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using sample data as fallback')
        alerts.value = sampleAlerts
      }
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const setSelectedAlert = (alert) => {
    selectedAlert.value = alert
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const approveToolExecution = (alertId) => {
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.status = 'in_progress'
      alert.currentStep = 'Executing Fix'
      
      // Update supervisor progress
      const approvalStep = alert.supervisorProgress.find(s => s.step === 'Tool Execution Approval')
      if (approvalStep) {
        approvalStep.status = 'completed'
        approvalStep.timestamp = new Date().toISOString()
      }
      
      // Update application progress
      const executeStep = alert.applicationProgress.find(s => s.step === 'Execute Fix')
      if (executeStep) {
        executeStep.status = 'in_progress'
        executeStep.timestamp = new Date().toISOString()
      }
    }
  }

  const rejectToolExecution = (alertId, reason) => {
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.status = 'failed'
      alert.currentStep = 'Rejected'
      
      // Update supervisor progress
      const approvalStep = alert.supervisorProgress.find(s => s.step === 'Tool Execution Approval')
      if (approvalStep) {
        approvalStep.status = 'failed'
        approvalStep.timestamp = new Date().toISOString()
      }
    }
  }

  const createAlert = async (alertData) => {
    loading.value = true
    error.value = null
    
    try {
      const newAlert = await apiClient.post('/alerts', alertData)
      
      // Add the new alert to the local state
      alerts.value.unshift(newAlert)
      
      return { success: true, data: newAlert }
    } catch (err) {
      error.value = err.message || 'Failed to create alert'
      console.error('Error creating alert:', err)
      
      // Fallback to local creation for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Creating alert locally as fallback')
        const localAlert = {
          id: alerts.value.length + 1,
          ticketId: `TICK-${Math.random().toString(36).substr(2, 8)}`,
          createdBy: alertData.createdBy || 'Manual Entry',
          severity: alertData.severity || 'Medium',
          issueType: alertData.issueType || null,
          ticket: alertData.ticket || alertData.description || 'No description provided',
          insertedAt: new Date().toISOString(),
          classification: alertData.classification || null,
          confidence: alertData.confidence || null,
          reasoning: alertData.reasoning || null,
          agentName: alertData.agentName || null,
          status: alertData.status || null,
          processedAt: null,
          // You can add other fields as needed
        }
        
        alerts.value.unshift(localAlert)
        return { success: true, data: localAlert }
      }
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    selectedAlert,
    filters,
    filteredAlerts,
    statusCounts,
    setSelectedAlert,
    updateFilters,
    approveToolExecution,
    rejectToolExecution,
    createAlert
  }
})
