<template>
  <div class="alert-creation">
    <div class="mb-4">
      <h2 class="mb-1">
        <i class="bi bi-plus-circle me-2"></i>
        Create New Alert
      </h2>
      <p class="text-muted mb-0">Submit a new alert for AI-powered workflow processing</p>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="bi bi-file-earmark-text me-2"></i>
              Alert Information
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="ticketId" class="form-label">
                    Ticket ID <span class="text-danger">*</span>
                  </label>
                  <input 
                    v-model="formData.ticketId"
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.ticketId }"
                    id="ticketId"
                    placeholder="e.g., TICK-1001"
                    required
                  >
                  <div v-if="errors.ticketId" class="invalid-feedback">
                    {{ errors.ticketId }}
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="createdBy" class="form-label">
                    Created By <span class="text-danger">*</span>
                  </label>
                  <input 
                    v-model="formData.createdBy"
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.createdBy }"
                    id="createdBy"
                    placeholder=""
                    required
                  >
                  <div v-if="errors.createdBy" class="invalid-feedback">
                    {{ errors.createdBy }}
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="severity" class="form-label">
                    Severity <span class="text-danger">*</span>
                  </label>
                  <select 
                    v-model="formData.severity"
                    class="form-select"
                    :class="{ 'is-invalid': errors.severity }"
                    id="severity"
                    required
                  >
                    <option value="">Select Severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <div v-if="errors.severity" class="invalid-feedback">
                    {{ errors.severity }}
                  </div>
                </div>

                <!-- <div class="col-md-6">
                  <label for="classification" class="form-label">
                    Classification <span class="text-danger">*</span>
                  </label>
                  <select 
                    v-model="formData.classification"
                    class="form-select"
                    :class="{ 'is-invalid': errors.classification }"
                    id="classification"
                    required
                  >
                    <option value="">Select Classification</option>
                    <option value="Application">Application</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Database">Database</option>
                    <option value="Network">Network</option>
                    <option value="Security">Security</option>
                  </select>
                  <div v-if="errors.classification" class="invalid-feedback">
                    {{ errors.classification }}
                  </div>
                </div> -->

                <div class="col-12">
                  <label for="description" class="form-label">
                    Ticket Description <span class="text-danger">*</span>
                  </label>
                  <textarea 
                    v-model="formData.ticket"
                    class="form-control"
                    :class="{ 'is-invalid': errors.ticket }"
                    id="description"
                    rows="5"
                    placeholder="Provide a detailed description of the issue..."
                    required
                  ></textarea>
                  <div v-if="errors.ticket" class="invalid-feedback">
                    {{ errors.ticket }}
                  </div>
                  <div class="form-text">
                    Minimum 20 characters. Be as specific as possible to help the AI classify and resolve the issue.
                  </div>
                </div>

                <div class="col-12">
                  <div class="alert alert-info">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    <strong>Note:</strong> Once submitted, the alert will be automatically classified by the Supervisor Agent and assigned to the appropriate resolution workflow.
                  </div>
                </div>

                <div class="col-12">
                  <div class="d-flex gap-2 justify-content-end">
                    <button 
                      type="button" 
                      class="btn btn-secondary"
                      @click="handleReset"
                    >
                      <i class="bi bi-arrow-counterclockwise me-2"></i>
                      Reset
                    </button>
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="isSubmitting"
                    >
                      <span v-if="isSubmitting">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Submitting...
                      </span>
                      <span v-else>
                        <i class="bi bi-check-circle me-2"></i>
                        Submit Alert
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <!-- Guidelines Card -->
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-header bg-light">
            <h6 class="mb-0">
              <i class="bi bi-lightbulb me-2"></i>
              Submission Guidelines
            </h6>
          </div>
          <div class="card-body">
            <ul class="list-unstyled mb-0">
              <li class="mb-2">
                <i class="bi bi-check-circle text-success me-2"></i>
                <small>Provide clear and detailed descriptions</small>
              </li>
              <li class="mb-2">
                <i class="bi bi-check-circle text-success me-2"></i>
                <small>Include relevant error messages or logs</small>
              </li>
              <li class="mb-2">
                <i class="bi bi-check-circle text-success me-2"></i>
                <small>Select appropriate severity level</small>
              </li>
              <li class="mb-2">
                <i class="bi bi-check-circle text-success me-2"></i>
                <small>Choose correct classification category</small>
              </li>
              <li class="mb-0">
                <i class="bi bi-check-circle text-success me-2"></i>
                <small>Use unique ticket IDs</small>
              </li>
            </ul>
          </div>
        </div>

        <!-- Severity Guide Card -->
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h6 class="mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Severity Levels
            </h6>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <span class="badge bg-info mb-1">LOW</span>
              <small class="d-block text-muted">Minor issues, no immediate impact</small>
            </div>
            <div class="mb-3">
              <span class="badge bg-warning text-dark mb-1">MEDIUM</span>
              <small class="d-block text-muted">Moderate impact, affects some users</small>
            </div>
            <div class="mb-3">
              <span class="badge bg-danger mb-1">HIGH</span>
              <small class="d-block text-muted">Significant impact, urgent attention needed</small>
            </div>
            <div class="mb-0">
              <span class="badge bg-danger mb-1">CRITICAL</span>
              <small class="d-block text-muted">System down, immediate action required</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div 
      v-if="showSuccessModal"
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">
              <i class="bi bi-check-circle-fill me-2"></i>
              Alert Created Successfully
            </h5>
          </div>
          <div class="modal-body text-center py-4">
            <div class="mb-3">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
            </div>
            <h5>Alert {{ createdAlertId }} has been created!</h5>
            <p class="text-muted mb-0">
              The Supervisor Agent will begin processing your alert shortly.
            </p>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary"
              @click="handleCreateAnother"
            >
              Create Another
            </button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="handleViewDashboard"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertsStore } from '@/store/alerts'

const router = useRouter()
const alertsStore = useAlertsStore()

const formData = reactive({
  ticketId: '',
  createdBy: '',
  severity: '',
  ticket: ''
})

const errors = reactive({
  ticketId: '',
  createdBy: '',
  severity: '',
  ticket: ''
})

const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const createdAlertId = ref('')

const validateForm = () => {
  let isValid = true

  Object.keys(errors).forEach(key => errors[key] = '')

  if (!formData.ticketId.trim()) {
    errors.ticketId = 'Ticket ID is required'
    isValid = false
  }

  if (!formData.createdBy.trim()) {
    errors.createdBy = 'Created By is required'
    isValid = false
  }

  if (!formData.severity) {
    errors.severity = 'Please select a severity level'
    isValid = false
  }

  // Remove or update classification validation if not used
  // if (!formData.classification) {
  //   errors.classification = 'Please select a classification'
  //   isValid = false
  // }

  // Use ticket for description validation
  if (!formData.ticket.trim()) {
    errors.ticket = 'Description is required'
    isValid = false
  } else if (formData.ticket.trim().length < 20) {
    errors.ticket = 'Description must be at least 20 characters'
    isValid = false
  }

  return isValid
}


const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const result = await alertsStore.createAlert(formData)
    
    if (result.success) {
      createdAlertId.value = result.data.id
      showSuccessModal.value = true
    } else {
      // Show error message
      alert(`Error creating alert: ${result.error}`)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    alert('An unexpected error occurred while creating the alert. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const handleReset = () => {
  Object.keys(formData).forEach(key => formData[key] = '')
  Object.keys(errors).forEach(key => errors[key] = '')
}

const handleCreateAnother = () => {
  showSuccessModal.value = false
  handleReset()
}

const handleViewDashboard = () => {
  showSuccessModal.value = false
  router.push('/')
}
</script>

<style scoped>
.alert-creation {
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

.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.is-invalid {
  border-color: #dc3545;
}

.is-invalid:focus {
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.modal {
  display: block;
}
</style>
