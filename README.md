# 🚀 Intelligent Alert Management Platform

A modern, AI-powered Alert Workflow Dashboard built with Vue.js 3, Bootstrap 5, and Pinia for monitoring and processing alerts from infrastructure systems.

![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4FC08D?style=flat&logo=vue.js)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat&logo=bootstrap)
![Pinia](https://img.shields.io/badge/Pinia-2.1-FFD859?style=flat&logo=pinia)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Pages Overview](#pages-overview)
- [State Management](#state-management)
- [Customization](#customization)
- [Future Enhancements](#future-enhancements)

## ✨ Features

### 🎯 Core Functionality

- **Dashboard**: Real-time alert workflow monitoring with advanced filtering
- **Alert Creation**: Intuitive form for submitting new alerts
- **Resolution Management**: CRUD operations for automated resolution templates
- **Workflow Details**: Comprehensive modal showing alert progress and approval workflow

### 🔥 Key Highlights

- ✅ **AI-Powered Classification**: Automatic alert categorization
- ✅ **Multi-Agent System**: Supervisor and Application agents
- ✅ **Approval Workflow**: Manual approval for high-risk operations
- ✅ **Real-time Progress**: Step-by-step execution tracking
- ✅ **Responsive Design**: Mobile-friendly Bootstrap 5 UI
- ✅ **Modular Architecture**: Clean, maintainable code structure
- ✅ **Dummy Data**: Pre-populated with realistic sample data

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue.js | 3.4.21 | Progressive JavaScript framework |
| Vue Router | 4.3.0 | Client-side routing |
| Pinia | 2.1.7 | State management |
| Bootstrap | 5.3.3 | UI framework |
| Bootstrap Icons | 1.11.3 | Icon library |
| Vite | 5.1.6 | Build tool and dev server |

## 📁 Project Structure

```
alert-management-platform/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css              # Global styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.vue        # Main layout wrapper
│   │   │   ├── Navbar.vue            # Top navigation bar
│   │   │   └── Sidebar.vue           # Side navigation menu
│   │   ├── WorkflowDetailsModal.vue  # Alert workflow details
│   │   └── ResolutionModal.vue       # Add/Edit resolution
│   ├── views/
│   │   ├── Dashboard.vue             # Main dashboard
│   │   ├── AlertCreation.vue         # Create new alert
│   │   └── ResolutionManagement.vue  # Manage resolutions
│   ├── store/
│   │   ├── alerts.js                 # Alerts state management
│   │   └── resolutions.js            # Resolutions state
│   ├── router/
│   │   └── index.js                  # Route configuration
│   ├── App.vue                       # Root component
│   └── main.js                       # Application entry point
├── index.html                        # HTML entry point
├── vite.config.js                    # Vite configuration
├── package.json                      # Dependencies
└── README.md                         # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**

```bash
cd alert-management-platform
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm run dev
```

4. **Open your browser**

Navigate to `http://localhost:3000`

The application will automatically open in your default browser.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## 📄 Pages Overview

### 1. Dashboard (`/`)

**Purpose**: Central hub for monitoring all alert workflows

**Features**:
- Statistics cards (Total, Pending, In Progress, Resolved)
- Advanced filtering (Status, Agent, Time Range, Search)
- Interactive alerts table with progress bars
- Click-to-view workflow details modal

**Key Components**:
- Status badges with color coding
- Progress indicators
- Real-time statistics
- Workflow details modal integration

### 2. Alert Creation (`/alerts/create`)

**Purpose**: Submit new alerts for AI processing

**Features**:
- Form validation
- Severity selection (Low, Medium, High, Critical)
- Classification categories (Application, Infrastructure, Database, etc.)
- Success modal with navigation options
- Guidelines and severity reference

**Validation Rules**:
- Ticket ID format: `TICK-XXXX`
- Description minimum: 20 characters
- All fields required

### 3. Resolution Management (`/resolutions`)

**Purpose**: Manage automated resolution templates

**Features**:
- CRUD operations (Create, Read, Update, Delete)
- Risk level indicators
- Active/Inactive status toggle
- Command templates with parameters
- Approval requirement settings

**Resolution Properties**:
- Issue Type
- Description
- Action Type
- Command with parameters
- Risk Level (Low, Medium, High)
- Requires Approval flag

## 🗄 State Management

### Pinia Stores

#### 1. Alerts Store (`store/alerts.js`)

**State**:
- `alerts`: Array of alert objects
- `selectedAlert`: Currently selected alert
- `filters`: Filter criteria

**Actions**:
- `setSelectedAlert(alert)`
- `updateFilters(filters)`
- `approveToolExecution(alertId)`
- `rejectToolExecution(alertId, reason)`
- `createAlert(alertData)`

**Computed**:
- `filteredAlerts`: Filtered alert list
- `statusCounts`: Count by status

#### 2. Resolutions Store (`store/resolutions.js`)

**State**:
- `resolutions`: Array of resolution templates
- `selectedResolution`: Currently selected resolution

**Actions**:
- `addResolution(data)`
- `updateResolution(id, updates)`
- `deleteResolution(id)`
- `toggleResolutionStatus(id)`

## 🎨 Customization

### Styling

The application uses Bootstrap 5 with custom CSS variables defined in `src/assets/styles/main.css`:

```css
:root {
  --primary-color: #0d6efd;
  --secondary-color: #6c757d;
  --success-color: #198754;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #0dcaf0;
}
```

### Adding New Alert Types

1. Update `src/store/alerts.js` with new classification
2. Add to dropdown in `src/views/AlertCreation.vue`
3. Update validation rules if needed

### Adding New Resolution Actions

1. Add action type to `src/components/ResolutionModal.vue`
2. Update resolution store if needed
3. Implement backend API integration

## 🔌 Backend Integration

The application is designed with dummy data for demonstration. To integrate with a real backend:

### 1. Replace Store Actions

Update Pinia store actions to make API calls:

```javascript
// Example: alerts.js
const createAlert = async (alertData) => {
  const response = await fetch('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alertData)
  })
  const newAlert = await response.json()
  alerts.value.unshift(newAlert)
  return newAlert
}
```

### 2. Add API Service Layer

Create `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL

export const alertsAPI = {
  getAll: () => fetch(`${API_BASE_URL}/alerts`).then(r => r.json()),
  create: (data) => fetch(`${API_BASE_URL}/alerts`, {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(r => r.json()),
  // ... more methods
}
```

### 3. Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

## 🚀 Future Enhancements

### Planned Features

- [ ] **Real-time Updates**: WebSocket integration for live data
- [ ] **Authentication**: User login and role-based access control
- [ ] **Dark Mode**: Theme toggle with persistence
- [ ] **Export/Import**: Configuration backup and restore
- [ ] **Advanced Analytics**: Charts and metrics dashboard
- [ ] **Notification System**: Email and Slack notifications
- [ ] **Audit Logs**: Track all user actions
- [ ] **Multi-language**: i18n support
- [ ] **Mobile App**: React Native companion app
- [ ] **AI Chat**: Interactive AI assistant for troubleshooting

### Backend API Endpoints

Recommended API structure:

```
GET    /api/alerts              # List all alerts
POST   /api/alerts              # Create new alert
GET    /api/alerts/:id          # Get alert details
PUT    /api/alerts/:id          # Update alert
DELETE /api/alerts/:id          # Delete alert
POST   /api/alerts/:id/approve  # Approve tool execution
POST   /api/alerts/:id/reject   # Reject tool execution

GET    /api/resolutions         # List resolutions
POST   /api/resolutions         # Create resolution
PUT    /api/resolutions/:id     # Update resolution
DELETE /api/resolutions/:id     # Delete resolution
```

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using Vue.js 3 and Bootstrap 5**
