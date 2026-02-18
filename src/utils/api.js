import axios from "axios";

/**
 * Determines the API base URL based on the current hostname.
 * This enables hybrid deployment where:
 * - VM access (localhost): Uses localhost:3002 for API
 * - External access (e.g., 10.2.5.11): Uses same IP with port 3002 for API
 *
 * @returns {string} The dynamically determined API base URL
 */
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // If running locally in VM (localhost or 127.0.0.1)
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3002/api/v1";
  }

  // If accessing from external IP (e.g., 10.2.5.11), use the same IP for API
  // This ensures the browser makes requests to the correct backend
  return `${protocol}//${hostname}:3002/api/v1`;
};

// Dynamic Base API URL
const BASE_API_URL = getApiBaseUrl();

// Log the determined API URL for debugging (remove in production if needed)
console.log("[API Config] Base URL:", BASE_API_URL);

// Create axios instance with dynamic base URL configuration
const apiClient = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add Authorization header with JWT token
    // This will be implemented in a future task when OAuth2/JWT authentication is integrated
    // Example implementation:
    // const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Return the response data directly
    return response.data;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Token expired or invalid
          console.error("Unauthorized access - Please login again");
          // TODO: Redirect to login page or refresh token
          break;
        case 403:
          // Forbidden - Insufficient permissions
          console.error("Access forbidden - Insufficient permissions");
          break;
        case 404:
          // Not found
          console.error("Resource not found");
          break;
        case 500:
          // Internal server error
          console.error("Internal server error");
          break;
        default:
          console.error(`API Error: ${status}`);
      }

      // Return a structured error object
      return Promise.reject({
        status,
        message: (data && data.message) || error.message || "An error occurred",
        data: data,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response from server - Network error");
      return Promise.reject({
        status: 0,
        message: "Network error - Unable to reach the server",
        data: null,
      });
    } else {
      // Something else happened
      console.error("Request error:", error.message);
      return Promise.reject({
        status: 0,
        message: error.message || "An unexpected error occurred",
        data: null,
      });
    }
  },
);

// Export the configured axios instance
export default apiClient;

// Export base URL for reference
export { BASE_API_URL };

// Task Agent API Functions
export const getTaskAgentProgress = async (alertId) => {
  try {
    return await apiClient.get(`task-agent/${alertId}`);
  } catch (error) {
    console.error("Error fetching task agent progress:", error);
    throw error;
  }
};
