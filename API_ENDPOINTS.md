# API Endpoints Documentation

## Base Configuration
- **Base URL**: `http://localhost:8080/api/v1`
- **Content-Type**: `application/json`
- **Timeout**: 10 seconds
- **Authentication**: Bearer Token (to be implemented)

---

## 1. Alerts API

### 1.1 Get All Alerts
- **Endpoint**: `GET /alerts`
- **Description**: Retrieves a list of all alerts in the system
- **Authentication**: Required (future implementation)
- **Request Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Request Body**: None
- **Response** (200 OK):
  ```json
  [
    {
      "id": "string",
      "alertName": "string",
      "status": "pending_approval | in_progress | resolved | failed",
      "agent": "string",
      "currentStep": "string",
      "toolsUsed": ["string"],
      "executionTime": "string",
      "progress": "number",
      "createdBy": "string",
      "severity": "low | medium | high | critical",
      "ticketId": "string",
      "description": "string",
      "classification": "Infrastructure | Database | Application",
      "startTime": "ISO8601 timestamp",
      "classificationReasoning": "string",
      "supervisorProgress": [
        {
          "step": "string",
          "status": "pending | in_progress | completed | failed",
          "timestamp": "ISO8601 timestamp or null"
        }
      ],
      "applicationProgress": [
        {
          "step": "string",
          "status": "pending | in_progress | completed | failed",
          "timestamp": "ISO8601 timestamp or null",
          "details": "string or null"
        }
      ],
      "toolExecution": {
        "toolName": "string",
        "riskLevel": "low | medium | high",
        "description": "string",
        "command": "string",
        "estimatedDowntime": "string"
      }
    }
  ]
  ```

### 1.2 Create Alert
- **Endpoint**: `POST /alerts`
- **Description**: Creates a new alert in the system
- **Authentication**: Required (future implementation)
- **Request Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Request Body**:
  ```json
  {
    "description": "string (required)",
    "severity": "low | medium | high | critical (required)",
    "ticketId": "string (optional)",
    "classification": "Infrastructure | Database | Application (optional)",
    "createdBy": "string (required)"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": "string",
    "alertName": "string",
    "status": "pending_approval",
    "agent": "Supervisor Agent",
    "currentStep": "Classification",
    "toolsUsed": [],
    "executionTime": "0s",
    "progress": 10,
    "createdBy": "string",
    "severity": "string",
    "ticketId": "string",
    "description": "string",
    "classification": "string",
    "startTime": "ISO8601 timestamp",
    "classificationReasoning": "string",
    "supervisorProgress": [...],
    "applicationProgress": [...],
    "toolExecution": {...}
  }
  ```

---

## 2. Resolutions API

### 2.1 Get All Resolutions
- **Endpoint**: `GET /resolutions`
- **Description**: Retrieves a list of all resolution templates
- **Authentication**: Required (future implementation)
- **Request Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Request Body**: None
- **Response** (200 OK):
  ```json
  [
    {
      "id": "string",
      "issueType": "string",
      "description": "string",
      "actionType": "string",
      "actionPayload": {
        "command": "string",
        "parameters": ["string"],
        "riskLevel": "low | medium | high",
        "requiresApproval": "boolean"
      },
      "createdAt": "ISO8601 timestamp",
      "updatedAt": "ISO8601 timestamp",
      "createdBy": "string",
      "status": "active | inactive"
    }
  ]
  ```

### 2.2 Create Resolution
- **Endpoint**: `POST /resolutions`
- **Description**: Creates a new resolution template
- **Authentication**: Required (future implementation)
- **Request Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Request Body**:
  ```json
  {
    "issueType": "string (required)",
    "description": "string (required)",
    "actionType": "string (required)",
    "actionPayload": {
      "command": "string (required)",
      "parameters": ["string"] (required),
      "riskLevel": "low | medium | high (required)",
      "requiresApproval": "boolean (required)"
    }
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": "string",
    "issueType": "string",
    "description": "string",
    "actionType": "string",
    "actionPayload": {
      "command": "string",
      "parameters": ["string"],
      "riskLevel": "string",
      "requiresApproval": "boolean"
    },
    "createdAt": "ISO8601 timestamp",
    "updatedAt": "ISO8601 timestamp",
    "createdBy": "string",
    "status": "active"
  }
  ```

---

## 3. Kubernetes Pods API

### 3.1 Get All Kubernetes Pods
- **Endpoint**: `GET /kubernetes/pods`
- **Description**: Retrieves a list of all Kubernetes pods across namespaces
- **Authentication**: Required (future implementation)
- **Request Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Request Body**: None
- **Response** (200 OK):
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "namespace": "string",
      "status": "Running | Pending | CrashLoopBackOff | Error | Succeeded | Failed",
      "age": "string",
      "restarts": "number",
      "cpu": "string",
      "memory": "string",
      "node": "string",
      "ip": "string",
      "labels": {
        "key": "value"
      }
    }
  ]
  ```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "status": 400,
  "message": "Invalid request parameters",
  "data": {
    "errors": ["Detailed error messages"]
  }
}
```

### 401 Unauthorized
```json
{
  "status": 401,
  "message": "Unauthorized access - Please login again",
  "data": null
}
```

### 403 Forbidden
```json
{
  "status": 403,
  "message": "Access forbidden - Insufficient permissions",
  "data": null
}
```

### 404 Not Found
```json
{
  "status": 404,
  "message": "Resource not found",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "status": 500,
  "message": "Internal server error",
  "data": null
}
```

### Network Error
```json
{
  "status": 0,
  "message": "Network error - Unable to reach the server",
  "data": null
}
```

---

## Notes

1. **Authentication**: All endpoints will require Bearer token authentication in the future. The token should be included in the `Authorization` header as `Bearer {token}`.

2. **Timestamps**: All timestamps follow ISO 8601 format (e.g., `2024-01-15T10:30:00Z`).

3. **Status Values**:
   - Alert Status: `pending_approval`, `in_progress`, `resolved`, `failed`
   - Severity: `low`, `medium`, `high`, `critical`
   - Classification: `Infrastructure`, `Database`, `Application`
   - Resolution Status: `active`, `inactive`
   - Pod Status: `Running`, `Pending`, `CrashLoopBackOff`, `Error`, `Succeeded`, `Failed`

4. **Development Mode**: The application includes fallback sample data for development purposes when API calls fail.

5. **Timeout**: All API requests have a 10-second timeout configured.

6. **Base URL Configuration**: The base URL can be configured in `src/utils/api.js` based on the environment.

---

## Future Endpoints (Not Yet Implemented)

The following endpoints are referenced in the code but not yet fully implemented:

1. **Update Alert**: `PUT /alerts/{id}` or `PATCH /alerts/{id}`
2. **Delete Alert**: `DELETE /alerts/{id}`
3. **Approve Tool Execution**: `POST /alerts/{id}/approve`
4. **Reject Tool Execution**: `POST /alerts/{id}/reject`
5. **Update Resolution**: `PUT /resolutions/{id}` or `PATCH /resolutions/{id}`
6. **Delete Resolution**: `DELETE /resolutions/{id}`
7. **Toggle Resolution Status**: `PATCH /resolutions/{id}/status`
8. **Restart Pod**: `POST /kubernetes/pods/{id}/restart`
9. **Delete Pod**: `DELETE /kubernetes/pods/{id}`
10. **Get Pod Logs**: `GET /kubernetes/pods/{id}/logs`
