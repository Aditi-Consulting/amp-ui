<template>
  <div class="resolution-management">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">
          <i class="bi bi-tools me-2"></i>
          Resolution Management
        </h2>
        <p class="text-muted mb-0">
          Manage automated resolution templates and actions
        </p>
      </div>
      <!-- <button class="btn btn-primary" @click="openAddModal">
        <i class="bi bi-plus-circle me-2"></i>
        Add New Resolution
      </button> -->
    </div>
 
    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card stat-card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small">Total Resolutions</p>
                <h3 class="mb-0">{{ resolutions.length }}</h3>
              </div>
              <div class="stat-icon bg-primary bg-opacity-10 text-primary">
                <i class="bi bi-gear-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      <div class="col-md-4">
        <div class="card stat-card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small">Active</p>
                <h3 class="mb-0">{{ activeCount }}</h3>
              </div>
              <div class="stat-icon bg-success bg-opacity-10 text-success">
                <i class="bi bi-check-circle-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      <div class="col-md-4">
        <div class="card stat-card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small">Inactive</p>
                <h3 class="mb-0">{{ inactiveCount }}</h3>
              </div>
              <div class="stat-icon bg-secondary bg-opacity-10 text-secondary">
                <i class="bi bi-pause-circle-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
 
    <!-- Resolutions Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white border-bottom">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-table me-2"></i>
            Resolution Templates
          </h5>
          <div class="input-group" style="max-width: 300px">
            <span class="input-group-text bg-white">
              <i class="bi bi-search"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Search resolutions..."
            />
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Issue Type</th>
                <th>Alert</th>
                <th>Steps</th>
                <th>Action Type</th>
                <th>Risk Level</th>
                <!-- <th>Status</th> -->
                <th>Last Updated</th>
                <!-- <th>Actions</th> -->
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="resolution in filteredResolutions"
                :key="resolution.id"
              >
                <td>
                  <span class="badge bg-secondary">{{ resolution.id }}</span>
                </td>
                <td>
                  <div
                    class="fw-semibold"
                    :data-bs-toggle="isTextTruncated(formatText(resolution.issueType), 20) ? 'tooltip' : ''"
                    :title="isTextTruncated(formatText(resolution.issueType), 20) ? formatText(resolution.issueType) : ''"
                  >
                    {{ formatText(resolution.issueType) }}
                  </div>
                </td>
                <td>
                  <small
                    class="text-muted"
                    :data-bs-toggle="isTextTruncated(resolution.description, 60) ? 'tooltip' : ''"
                    :title="isTextTruncated(resolution.description, 60) ? resolution.description : ''"
                  >
                    {{ truncateText(resolution.description, 60) }}
                  </small>
                </td>
                <td>
                  <div class="steps-container">
                    <button
                      @click="toggleSteps(resolution.id)"
                      class="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                      style="min-width: 120px;"
                    >
                      <i class="bi bi-list-ol"></i>
                      <span>{{ getStepsCount(resolution.actionPayload?.steps) }} Steps</span>
                      <i :class="isExpanded(resolution.id) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                    </button>

                    <div v-if="!isExpanded(resolution.id)" class="steps-preview mt-2">
                      <small
                        class="text-muted"
                        :data-bs-toggle="resolution.actionPayload?.steps && resolution.actionPayload.steps.length > 0 ? 'tooltip' : ''"
                        :title="resolution.actionPayload?.steps && resolution.actionPayload.steps.length > 0 ? resolution.actionPayload.steps[0] : ''"
                      >
                        {{ getStepsPreview(resolution.actionPayload?.steps) }}
                      </small>
                    </div>

                    <div v-if="isExpanded(resolution.id)" class="steps-cards mt-3">
                      <div
                        v-for="(step, index) in resolution.actionPayload?.steps"
                        :key="index"
                        class="step-card"
                      >
                        <div class="step-number">{{ index + 1 }}</div>
                        <div class="step-content">{{ step }}</div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    class="badge bg-info text-white"
                    :data-bs-toggle="isTextTruncated(resolution.actionType, 15) ? 'tooltip' : ''"
                    :title="isTextTruncated(resolution.actionType, 15) ? resolution.actionType : ''"
                  >
                    {{ resolution.actionType }}
                  </span>
                </td>
                <td>
                  <span
                    :class="
                      getRiskBadgeClass(
                        getActionPayloadRiskLevel(resolution.actionPayload)
                      )
                    "
                    class="badge"
                  >
                    {{
                      getActionPayloadRiskLevel(
                        resolution.actionPayload
                      ).toUpperCase()
                    }}
                  </span>
                </td>
                <!-- <td>
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :checked="
                        getResolutionStatus(resolution.status) === 'active'
                      "
                      @change="toggleStatus(resolution.id)"
                    />
                    <label class="form-check-label small">
                      {{
                        getResolutionStatus(resolution.status) === "active"
                          ? "Active"
                          : "Inactive"
                      }}
                    </label>
                  </div>
                </td> -->
                <td>
                  <small class="text-muted">{{
                    formatDate(resolution.updatedAt)
                  }}</small>
                </td>
                <!-- <td>
                  <div class="btn-group btn-group-sm">
                    <button
                      class="btn btn-outline-primary"
                      @click="openViewModal(resolution)"
                      title="View Details"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-outline-warning"
                      @click="openEditModal(resolution)"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger"
                      @click="confirmDelete(resolution)"
                      title="Delete"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td> -->
              </tr>
            </tbody>
          </table>
        </div>
 
        <div v-if="filteredResolutions.length === 0" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted"></i>
          <p class="text-muted mt-3">No resolutions found</p>
        </div>
      </div>
    </div>
 
    <!-- Add/Edit Resolution Modal -->
    <ResolutionModal
      v-if="showModal"
      :resolution="selectedResolution"
      :mode="modalMode"
      @close="closeModal"
      @save="handleSave"
    />
 
    <!-- View Resolution Modal -->
    <div
      v-if="showViewModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-info-circle me-2"></i>
              Resolution Details
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="showViewModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="small text-muted">Resolution ID</label>
                <div class="fw-semibold">{{ viewResolution.id }}</div>
              </div>
              <div class="col-md-6">
                <label class="small text-muted">Status</label>
                <div>
                  <span
                    :class="
                      getResolutionStatus(viewResolution.status) === 'active'
                        ? 'badge bg-success'
                        : 'badge bg-secondary'
                    "
                  >
                    {{
                      getResolutionStatus(viewResolution.status).toUpperCase()
                    }}
                  </span>
                </div>
              </div>
              <div class="col-12">
                <label class="small text-muted">Issue Type</label>
                <div class="fw-semibold">{{ viewResolution.issueType }}</div>
              </div>
              <div class="col-12">
                <label class="small text-muted">Description</label>
                <div class="alert alert-info mb-0">
                  {{ viewResolution.description }}
                </div>
              </div>
              <div class="col-md-6">
                <label class="small text-muted">Action Type</label>
                <div class="fw-semibold">{{ viewResolution.actionType }}</div>
              </div>
              <div class="col-md-6">
                <label class="small text-muted">Risk Level</label>
                <div>
                  <span
                    :class="
                      getRiskBadgeClass(
                        getActionPayloadRiskLevel(viewResolution.actionPayload)
                      )
                    "
                    class="badge"
                  >
                    {{
                      getActionPayloadRiskLevel(
                        viewResolution.actionPayload
                      ).toUpperCase()
                    }}
                  </span>
                </div>
              </div>
              <div class="col-12">
                <label class="small text-muted">Command</label>
                <div class="alert alert-dark mb-0">
                  <code class="text-white">{{
                    getActionPayloadCommand(viewResolution.actionPayload) ||
                    "N/A"
                  }}</code>
                </div>
              </div>
              <div
                class="col-12"
                v-if="viewResolution.actionPayload?.parameters?.length > 0"
              >
                <label class="small text-muted">Parameters</label>
                <div class="d-flex gap-2 flex-wrap">
                  <span
                    v-for="param in viewResolution.actionPayload.parameters"
                    :key="param"
                    class="badge bg-light text-dark"
                  >
                    {{ param }}
                  </span>
                </div>
              </div>
              <div class="col-md-6">
                <label class="small text-muted">Requires Approval</label>
                <div>
                  <span
                    :class="
                      getActionPayloadRequiresApproval(
                        viewResolution.actionPayload
                      )
                        ? 'badge bg-warning text-dark'
                        : 'badge bg-success'
                    "
                  >
                    {{
                      getActionPayloadRequiresApproval(
                        viewResolution.actionPayload
                      )
                        ? "Yes"
                        : "No"
                    }}
                  </span>
                </div>
              </div>
              <div class="col-md-6">
                <label class="small text-muted">Created By</label>
                <div class="fw-semibold">
                  {{ viewResolution.createdBy || "Unknown" }}
                </div>
              </div>
              <div class="col-md-6">
                <label class="small text-muted">Created At</label>
                <div class="fw-semibold">
                  {{ formatDate(viewResolution.createdAt) }}
                </div>
              </div>
              <div class="col-md-6">
                <label class="small text-muted">Last Updated</label>
                <div class="fw-semibold">
                  {{ formatDate(viewResolution.updatedAt) }}
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showViewModal = false"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
 
    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              Confirm Deletion
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="showDeleteModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this resolution?</p>
            <div class="alert alert-warning">
              <strong>{{ deleteResolution?.issueType }}</strong>
              <br />
              <small>{{ deleteResolution?.description }}</small>
            </div>
            <p class="text-danger mb-0">
              <i class="bi bi-exclamation-circle me-2"></i>
              This action cannot be undone.
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showDeleteModal = false"
            >
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="handleDelete">
              Delete Resolution
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useResolutionsStore } from "@/store/resolutions";
import ResolutionModal from "@/components/ResolutionModal.vue";
 
const resolutionsStore = useResolutionsStore();
 
const searchQuery = ref("");
const showModal = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const selectedResolution = ref(null);
const viewResolution = ref(null);
const deleteResolution = ref(null);
const modalMode = ref("add");

// Add state for expandable rows
const expandedRows = ref(new Set());

const resolutions = computed(() => resolutionsStore.resolutions);
 
const filteredResolutions = computed(() => {
  if (!searchQuery.value) {
    return resolutions.value;
  }
 
  const query = searchQuery.value.toLowerCase();
  return resolutions.value.filter(
    (r) =>
      r.issueType.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.actionType.toLowerCase().includes(query)
  );
});
 
const activeCount = computed(
  () =>
    resolutions.value.filter((r) => getResolutionStatus(r.status.toLowerCase()) === "active")
      .length
);
 
const inactiveCount = computed(
  () =>
    resolutions.value.filter(
      (r) => getResolutionStatus(r.status.toLowerCase()) === "inactive"
    ).length
);
 
// Helper functions to handle null/undefined values from API
const getResolutionStatus = (status) => {
  if (status === null || status === undefined) return "inactive"; // Default to inactive if null
  return status === "active" ? "active" : "inactive";
};
 
const getActionPayloadRiskLevel = (payload) => {
  if (!payload || !payload.riskLevel) return "low"; // Default to low if missing
  return payload.riskLevel;
};
 
const getActionPayloadCommand = (payload) => {
  if (!payload || !payload.command) return null; // Return null if missing
  return payload.command;
};
 
const getActionPayloadRequiresApproval = (payload) => {
  if (
    payload?.requiresApproval === null ||
    payload?.requiresApproval === undefined
  )
    return false; // Default to false if null
  return !!payload.requiresApproval;
};
 
const getRiskBadgeClass = (risk) => {
  const classes = {
    low: "bg-success",
    medium: "bg-warning text-dark",
    high: "bg-danger",
  };
  return classes[risk] || "bg-secondary";
};
 
const truncateText = (text, length) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const  formatText = (text) => {
  if (!text) return ''
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
 
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper functions for steps
const toggleSteps = (resolutionId) => {
  if (expandedRows.value.has(resolutionId)) {
    expandedRows.value.delete(resolutionId);
  } else {
    expandedRows.value.add(resolutionId);
  }
};

const isExpanded = (resolutionId) => {
  return expandedRows.value.has(resolutionId);
};

const getStepsCount = (steps) => {
  return steps ? steps.length : 0;
};

const getStepsPreview = (steps) => {
  if (!steps || steps.length === 0) return 'No steps available';
  return steps[0].substring(0, 50) + (steps[0].length > 50 ? '...' : '');
};

// Initialize Bootstrap tooltips
const initializeTooltips = () => {
  nextTick(() => {
    // Initialize all tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => {
      return new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: 'hover focus',
        placement: 'top',
        html: false
      });
    });
  });
};

// Check if text is truncated (helper function)
const isTextTruncated = (text, maxLength) => {
  return text && text.length > maxLength;
};

// Fetch resolutions on component mount
onMounted(async () => {
  try {
    await resolutionsStore.fetchResolutions();
    // Initialize tooltips after data is loaded
    initializeTooltips();
  } catch (error) {
    console.error("Error fetching resolutions:", error);
    alert("Failed to load resolutions. Please check the console for details.");
  }
});

// Watch for changes in filtered resolutions to reinitialize tooltips
watch(filteredResolutions, () => {
  nextTick(() => {
    initializeTooltips();
  });
}, { flush: 'post' });

const openAddModal = () => {
  selectedResolution.value = null;
  modalMode.value = "add";
  showModal.value = true;
};
 
const openEditModal = (resolution) => {
  selectedResolution.value = { ...resolution };
  modalMode.value = "edit";
  showModal.value = true;
};
 
const openViewModal = (resolution) => {
  viewResolution.value = { ...resolution };
  showViewModal.value = true;
};
 
const closeModal = () => {
  showModal.value = false;
  selectedResolution.value = null;
};
 
const handleSave = async (resolutionData) => {
  if (modalMode.value === "add") {
    const result = await resolutionsStore.addResolution(resolutionData);
 
    if (result.success) {
      closeModal();
      // Refresh data after add
      await resolutionsStore.fetchResolutions();
    } else {
      alert(`Error adding resolution: ${result.error}`);
    }
  } else {
    resolutionsStore.updateResolution(
      selectedResolution.value.id,
      resolutionData
    );
    closeModal();
    // Refresh data after update
    await resolutionsStore.fetchResolutions();
  }
};
 
const toggleStatus = async (id) => {
  await resolutionsStore.toggleResolutionStatus(id);
  // Refresh data after toggle
  await resolutionsStore.fetchResolutions();
};
 
const confirmDelete = (resolution) => {
  deleteResolution.value = resolution;
  showDeleteModal.value = true;
};
 
const handleDelete = async () => {
  await resolutionsStore.deleteResolution(deleteResolution.value.id);
  showDeleteModal.value = false;
  deleteResolution.value = null;
  // Refresh data after delete
  await resolutionsStore.fetchResolutions();
};
</script>
 
<style scoped>
.resolution-management {
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
 
.table tbody tr {
  transition: background-color 0.2s ease;
}
 
.table tbody tr:hover {
  background-color: rgba(13, 110, 253, 0.05);
}
 
.form-check-input:checked {
  background-color: #198754;
  border-color: #198754;
}
 
.modal {
  display: block;
}
 
code {
  font-size: 0.9rem;
}

.steps-container {
  min-width: 250px;
  position: relative;
}

.steps-preview {
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  margin-top: 0.5rem;
  font-style: italic;
}

.steps-cards {
  max-width: 400px;
  max-height: 300px;
  overflow-y: auto;
}

.step-card {
  display: flex;
  align-items: flex-start;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  gap: 0.75rem;
}

.step-card:hover {
  background: #e9ecef;
  border-color: #0d6efd;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-card:last-child {
  margin-bottom: 0;
}

.step-number {
  background: #0d6efd;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-content {
  font-size: 13px;
  line-height: 1.4;
  color: #495057;
  flex: 1;
}

/* Custom scrollbar for steps container */
.steps-cards::-webkit-scrollbar {
  width: 4px;
}

.steps-cards::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.steps-cards::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.steps-cards::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .steps-container {
    min-width: 200px;
  }

  .steps-cards {
    max-width: 300px;
  }

  .step-content {
    font-size: 12px;
  }
}
</style>
