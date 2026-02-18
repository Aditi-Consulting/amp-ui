<template>
  <div
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div
          class="modal-header"
          :class="mode === 'add' ? 'bg-primary' : 'bg-warning'"
        >
          <h5 class="modal-title text-white">
            <i
              :class="mode === 'add' ? 'bi bi-plus-circle' : 'bi bi-pencil'"
              class="me-2"
            ></i>
            {{ mode === "add" ? "Add New Resolution" : "Edit Resolution" }}
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            @click="$emit('close')"
          ></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row g-3">
              <div class="col-12">
                <label for="issueType" class="form-label">
                  Issue Type <span class="text-danger">*</span>
                </label>
                <input
                  v-model="formData.issueType"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.issueType }"
                  id="issueType"
                  placeholder="e.g., High CPU Usage"
                  required
                />
                <div v-if="errors.issueType" class="invalid-feedback">
                  {{ errors.issueType }}
                </div>
              </div>

              <div class="col-12">
                <label for="description" class="form-label">
                  Description <span class="text-danger">*</span>
                </label>
                <textarea
                  v-model="formData.description"
                  class="form-control"
                  :class="{ 'is-invalid': errors.description }"
                  id="description"
                  rows="3"
                  placeholder="Detailed description of the issue..."
                  required
                ></textarea>
                <div v-if="errors.description" class="invalid-feedback">
                  {{ errors.description }}
                </div>
              </div>

              <div class="col-md-6">
                <label for="actionType" class="form-label">
                  Action Type <span class="text-danger">*</span>
                </label>
                <select
                  v-model="formData.actionType"
                  class="form-select"
                  :class="{ 'is-invalid': errors.actionType }"
                  id="actionType"
                  required
                >
                  <option value="">Select Action Type</option>
                  <option value="Pod Restart">Pod Restart</option>
                  <option value="Configuration Update">
                    Configuration Update
                  </option>
                  <option value="Database Index Creation">
                    Database Index Creation
                  </option>
                  <option value="Log Cleanup">Log Cleanup</option>
                  <option value="Application Restart">
                    Application Restart
                  </option>
                  <option value="Cache Configuration">
                    Cache Configuration
                  </option>
                  <option value="Service Restart">Service Restart</option>
                  <option value="Certificate Renewal">
                    Certificate Renewal
                  </option>
                  <option value="Custom Script">Custom Script</option>
                </select>
                <div v-if="errors.actionType" class="invalid-feedback">
                  {{ errors.actionType }}
                </div>
              </div>

              <div class="col-md-6">
                <label for="riskLevel" class="form-label">
                  Risk Level <span class="text-danger">*</span>
                </label>
                <select
                  v-model="formData.actionPayload.riskLevel"
                  class="form-select"
                  :class="{ 'is-invalid': errors.riskLevel }"
                  id="riskLevel"
                  required
                >
                  <option value="">Select Risk Level</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div v-if="errors.riskLevel" class="invalid-feedback">
                  {{ errors.riskLevel }}
                </div>
              </div>

              <div class="col-12">
                <label for="command" class="form-label">
                  Command <span class="text-danger">*</span>
                </label>
                <textarea
                  v-model="formData.actionPayload.command"
                  class="form-control font-monospace"
                  :class="{ 'is-invalid': errors.command }"
                  id="command"
                  rows="3"
                  placeholder="e.g., kubectl rollout restart deployment/{deployment_name}"
                  required
                ></textarea>
                <div v-if="errors.command" class="invalid-feedback">
                  {{ errors.command }}
                </div>
                <div class="form-text">
                  Use {parameter_name} for dynamic parameters
                </div>
              </div>

              <div class="col-12">
                <label for="parameters" class="form-label"> Parameters </label>
                <div class="input-group mb-2">
                  <input
                    v-model="newParameter"
                    type="text"
                    class="form-control"
                    placeholder="Enter parameter name (e.g., deployment_name)"
                    @keyup.enter="addParameter"
                  />
                  <button
                    class="btn btn-outline-primary"
                    type="button"
                    @click="addParameter"
                  >
                    <i class="bi bi-plus-circle me-1"></i>
                    Add
                  </button>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                  <span
                    v-for="(param, index) in formData.actionPayload.parameters"
                    :key="index"
                    class="badge bg-light text-dark d-flex align-items-center"
                  >
                    {{ param }}
                    <button
                      type="button"
                      class="btn-close btn-close-sm ms-2"
                      style="font-size: 0.6rem"
                      @click="removeParameter(index)"
                    ></button>
                  </span>
                </div>
              </div>

              <div class="col-12">
                <div class="form-check">
                  <input
                    v-model="formData.actionPayload.requiresApproval"
                    class="form-check-input"
                    type="checkbox"
                    id="requiresApproval"
                  />
                  <label class="form-check-label" for="requiresApproval">
                    Requires Manual Approval
                  </label>
                </div>
                <small class="text-muted">
                  If checked, this action will require supervisor approval
                  before execution
                </small>
              </div>

              <div class="col-12">
                <div class="alert alert-info mb-0">
                  <i class="bi bi-info-circle-fill me-2"></i>
                  <strong>Note:</strong> Make sure the command is tested and
                  safe to execute in production environments.
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn"
            :class="mode === 'add' ? 'btn-primary' : 'btn-warning'"
            @click="handleSubmit"
          >
            <i
              :class="mode === 'add' ? 'bi bi-check-circle' : 'bi bi-save'"
              class="me-2"
            ></i>
            {{ mode === "add" ? "Create Resolution" : "Update Resolution" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";

const props = defineProps({
  resolution: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: "add",
    validator: (value) => ["add", "edit"].includes(value),
  },
});

const emit = defineEmits(["close", "save"]);

const formData = reactive({
  issueType: "",
  description: "",
  actionType: "",
  actionPayload: {
    command: "",
    parameters: [],
    riskLevel: "",
    requiresApproval: false,
  },
});

const errors = reactive({
  issueType: "",
  description: "",
  actionType: "",
  command: "",
  riskLevel: "",
});

const newParameter = ref("");

// Initialize form data if editing
watch(
  () => props.resolution,
  (resolution) => {
    if (resolution && props.mode === "edit") {
      formData.issueType = resolution.issueType;
      formData.description = resolution.description;
      formData.actionType = resolution.actionType;
      formData.actionPayload = { ...resolution.actionPayload };
    }
  },
  { immediate: true }
);

const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  if (!formData.issueType.trim()) {
    errors.issueType = "Issue type is required";
    isValid = false;
  }

  if (!formData.description.trim()) {
    errors.description = "Description is required";
    isValid = false;
  }

  if (!formData.actionType) {
    errors.actionType = "Action type is required";
    isValid = false;
  }

  if (!formData.actionPayload.command.trim()) {
    errors.command = "Command is required";
    isValid = false;
  }

  if (!formData.actionPayload.riskLevel) {
    errors.riskLevel = "Risk level is required";
    isValid = false;
  }

  return isValid;
};

const addParameter = () => {
  if (
    newParameter.value.trim() &&
    !formData.actionPayload.parameters.includes(newParameter.value.trim())
  ) {
    formData.actionPayload.parameters.push(newParameter.value.trim());
    newParameter.value = "";
  }
};

const removeParameter = (index) => {
  formData.actionPayload.parameters.splice(index, 1);
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }

  emit("save", { ...formData });
};
</script>

<style scoped>
.modal {
  display: block;
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

.font-monospace {
  font-family: "Courier New", monospace;
  font-size: 0.9rem;
}

.badge {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
}
</style>
