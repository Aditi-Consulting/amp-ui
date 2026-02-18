import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/utils/api'

export const useResolutionsStore = defineStore('resolutions', () => {
  // State
  const resolutions = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Static sample data for fallback (can be removed once API is stable)
  const sampleResolutions = [
    {
      id: 5,
      issueType: 'port_misconfiguration',
      description: 'Port configuration issue detected in service configuration',
      actionType: 'Port Configuration Fix',
      actionPayload: {
        command: 'kubectl patch service {service_name} -p \'{"spec":{"ports":[{"port":{target_port},"targetPort":{target_port}}]}}\'',
        parameters: ['service_name', 'target_port'],
        riskLevel: 'medium',
        requiresApproval: true,
        steps: [
          'Identify the service with port misconfiguration',
          'Check current port mappings and target ports',
          'Update service configuration with correct port mapping',
          'Verify service connectivity after port fix',
          'Test application endpoint accessibility'
        ]
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'ops-team',
      status: 'active'
    },
    {
      id: 6,
      issueType: 'pod_down',
      description: 'Alert: we got pod down in default namespace',
      actionType: 'restart_pod',
      actionPayload: {
        command: 'kubectl delete pod {pod_name} -n {namespace}',
        parameters: ['pod_name', 'namespace'],
        riskLevel: 'medium',
        requiresApproval: true,
        steps: [
          'Fetch the list of pods in the \'default\' namespace',
          'Identify the pod that is down from the list',
          'Check the health/status of the identified pod to confirm it is unhealthy',
          'If the pod is confirmed unhealthy, restart the pod'
        ]
      },
      createdAt: '2024-01-15T09:30:00Z',
      updatedAt: '2024-01-15T09:30:00Z',
      createdBy: 'k8s-operator',
      status: 'active'
    },
    {
      id: 8,
      issueType: 'swap_usage_high',
      description: 'High swap usage detected on system nodes',
      actionType: 'Memory Cleanup',
      actionPayload: {
        command: 'sudo swapoff -a && sudo swapon -a && echo 3 > /proc/sys/vm/drop_caches',
        parameters: [],
        riskLevel: 'high',
        requiresApproval: true,
        steps: [
          'Monitor current swap usage and memory statistics',
          'Identify processes consuming excessive memory',
          'Clear system page cache and buffer cache',
          'Restart swap to force memory optimization',
          'Verify swap usage has decreased to acceptable levels'
        ]
      },
      createdAt: '2024-01-15T08:15:00Z',
      updatedAt: '2024-01-15T08:15:00Z',
      createdBy: 'system-monitor',
      status: 'active'
    },
    {
      id: 9,
      issueType: 'workflow_issue',
      description: 'Workflow execution failure detected in CI/CD pipeline',
      actionType: 'Pipeline Restart',
      actionPayload: {
        command: 'gh workflow run {workflow_name} --ref {branch}',
        parameters: ['workflow_name', 'branch'],
        riskLevel: 'low',
        requiresApproval: false,
        steps: [
          'Analyze failed workflow logs for root cause',
          'Check repository permissions and secrets',
          'Restart the failed workflow with same parameters',
          'Monitor workflow execution progress',
          'Verify successful completion of all workflow steps'
        ]
      },
      createdAt: '2024-01-15T07:45:00Z',
      updatedAt: '2024-01-15T07:45:00Z',
      createdBy: 'ci-cd-bot',
      status: 'active'
    },
    {
      id: 11,
      issueType: 'scaling_required',
      description: 'Application requires horizontal scaling due to high load',
      actionType: 'Horizontal Pod Autoscaling',
      actionPayload: {
        command: 'kubectl scale deployment {deployment_name} --replicas={replica_count} -n {namespace}',
        parameters: ['deployment_name', 'replica_count', 'namespace'],
        riskLevel: 'low',
        requiresApproval: false,
        steps: [
          'Analyze current CPU and memory usage metrics',
          'Calculate optimal number of replicas needed',
          'Scale deployment to handle increased load',
          'Monitor resource utilization after scaling',
          'Verify application performance meets SLA requirements'
        ]
      },
      createdAt: '2024-01-15T06:20:00Z',
      updatedAt: '2024-01-15T06:20:00Z',
      createdBy: 'auto-scaler',
      status: 'active'
    },
    {
      id: 12,
      issueType: 'over_provisioned_replicas',
      description: 'Too many replicas running, causing resource waste',
      actionType: 'Scale Down',
      actionPayload: {
        command: 'kubectl scale deployment {deployment_name} --replicas={target_replicas} -n {namespace}',
        parameters: ['deployment_name', 'target_replicas', 'namespace'],
        riskLevel: 'medium',
        requiresApproval: true,
        steps: [
          'Monitor current load and resource utilization',
          'Calculate minimum required replicas for current load',
          'Gradually scale down replicas to optimal count',
          'Ensure load balancing remains effective',
          'Verify no service disruption during scale down'
        ]
      },
      createdAt: '2024-01-15T05:10:00Z',
      updatedAt: '2024-01-15T05:10:00Z',
      createdBy: 'cost-optimizer',
      status: 'active'
    },
    {
      id: 13,
      issueType: 'service_404',
      description: 'Service returning 404 errors for valid requests',
      actionType: 'Service Route Fix',
      actionPayload: {
        command: 'kubectl patch ingress {ingress_name} -p \'{"spec":{"rules":[{"http":{"paths":[{"path":"{path}","backend":{"service":{"name":"{service_name}","port":{"number":{port}}}}}]}}]}}\'',
        parameters: ['ingress_name', 'path', 'service_name', 'port'],
        riskLevel: 'high',
        requiresApproval: true,
        steps: [
          'Check ingress configuration and routing rules',
          'Verify service endpoints are healthy and responding',
          'Update ingress path mapping if misconfigured',
          'Test service accessibility through ingress',
          'Monitor error rates to confirm issue resolution'
        ]
      },
      createdAt: '2024-01-15T04:30:00Z',
      updatedAt: '2024-01-15T04:30:00Z',
      createdBy: 'ingress-controller',
      status: 'active'
    },
    {
      id: 14,
      issueType: 'endpoint_not_found',
      description: 'API endpoint not accessible or misconfigured',
      actionType: 'Endpoint Configuration',
      actionPayload: {
        command: 'kubectl annotate service {service_name} prometheus.io/path={endpoint_path} prometheus.io/port={port}',
        parameters: ['service_name', 'endpoint_path', 'port'],
        riskLevel: 'low',
        requiresApproval: false,
        steps: [
          'Verify service is running and accessible',
          'Check endpoint configuration in service definition',
          'Update service annotations with correct endpoint path',
          'Restart any dependent monitoring or ingress controllers',
          'Test endpoint accessibility and proper response'
        ]
      },
      createdAt: '2024-01-15T03:15:00Z',
      updatedAt: '2024-01-15T03:15:00Z',
      createdBy: 'api-monitor',
      status: 'active'
    },
    {
      id: 15,
      issueType: 'service_error',
      description: 'Service experiencing internal errors and failures',
      actionType: 'Service Restart',
      actionPayload: {
        command: 'kubectl rollout restart deployment/{deployment_name} -n {namespace}',
        parameters: ['deployment_name', 'namespace'],
        riskLevel: 'high',
        requiresApproval: true,
        steps: [
          'Capture current service logs for error analysis',
          'Check service health endpoints and status',
          'Perform rolling restart to clear any stuck processes',
          'Monitor service recovery and error rate reduction',
          'Verify all dependent services are functioning normally'
        ]
      },
      createdAt: '2024-01-15T02:00:00Z',
      updatedAt: '2024-01-15T02:00:00Z',
      createdBy: 'error-detector',
      status: 'active'
    }
  ]

  const selectedResolution = ref(null)

  // Actions
  const fetchResolutions = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await apiClient.get('/resolutions')
      resolutions.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err.message || 'Failed to fetch resolutions'
      console.error('Error fetching resolutions:', err)
      
      // Fallback to sample data for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using sample data as fallback')
        resolutions.value = sampleResolutions
      }
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const addResolution = async (resolutionData) => {
    loading.value = true
    error.value = null
    
    try {
      const newResolution = await apiClient.post('/resolutions', resolutionData)
      
      // Add the new resolution to the local state
      resolutions.value.unshift(newResolution)
      
      return { success: true, data: newResolution }
    } catch (err) {
      error.value = err.message || 'Failed to add resolution'
      console.error('Error adding resolution:', err)
      
      // Fallback to local creation for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Creating resolution locally as fallback')
        const localResolution = addResolutionLocally(resolutionData)
        return { success: true, data: localResolution }
      }
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const addResolutionLocally = (resolutionData) => {
    const newResolution = {
      id: `RES-${String(resolutions.value.length + 1).padStart(3, '0')}`,
      ...resolutionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      status: 'active'
    }
    resolutions.value.unshift(newResolution)
    return newResolution
  }

  const updateResolution = (id, updates) => {
    const index = resolutions.value.findIndex(r => r.id === id)
    if (index !== -1) {
      resolutions.value[index] = {
        ...resolutions.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      return resolutions.value[index]
    }
    return null
  }

  const deleteResolution = (id) => {
    const index = resolutions.value.findIndex(r => r.id === id)
    if (index !== -1) {
      resolutions.value.splice(index, 1)
      return true
    }
    return false
  }

  const setSelectedResolution = (resolution) => {
    selectedResolution.value = resolution
  }

  const toggleResolutionStatus = (id) => {
    const resolution = resolutions.value.find(r => r.id === id)
    if (resolution) {
      resolution.status = resolution.status === 'active' ? 'inactive' : 'active'
      resolution.updatedAt = new Date().toISOString()
    }
  }

  return {
    resolutions,
    loading,
    error,
    fetchResolutions,
    selectedResolution,
    addResolution,
    updateResolution,
    deleteResolution,
    setSelectedResolution,
    toggleResolutionStatus
  }
})
