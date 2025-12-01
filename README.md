# Health-Care-Analysis

A comprehensive health data analysis platform with AI-powered insights, data processing backend, and interactive frontend dashboard.

## Architecture
- **AI Engine** (Python) - Analyzes health metrics and generates insights
- **Backend API** (FastAPI) - Processes CSV uploads and serves data
- **Frontend** (React/Vite) - Interactive dashboard with charts and visualizations

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm

### One-Command Startup
```bash
# Start the entire portal with one command
chmod +x start_portal.sh
./start_portal.sh
```

This will:
- ✅ Start the backend server on http://localhost:8000
- ✅ Start the frontend on http://localhost:5173
- ✅ Handle all dependencies automatically
- ✅ Provide a sample CSV file for testing

### Manual Setup (Alternative)

1. **Setup All Components**:
```bash
chmod +x setup_all.sh
./setup_all.sh
```

2. **Start Backend** (Terminal 1):
```bash
cd health-backend-java/health-backend
source venv/bin/activate
uvicorn app.main:app --reload
```

3. **Start Frontend** (Terminal 2):
```bash
cd FrontEnd
npm run dev
```

### Testing the Portal
1. Open http://localhost:5173
2. Create an account or login
3. Upload the provided `sample_health_data_wide.csv` file
4. View your health analytics on the dashboard

## Data Format

### Supported CSV Formats

**Long Format** (metric-value pairs):
```csv
user_id,date,metric,value,type,notes
u001,2024-01-15,steps,8500,walking,Morning jog
u001,2024-01-15,heart_rate,72,resting,After breakfast
u001,2024-01-15,sleep,7.5,,Good night sleep
```

**Wide Format** (recommended for easy upload):
```csv
user_id,date,heart_rate,steps,sleep_hours,water_liters,calories_burned
user1,2024-01-01,72,8500,7.5,2.2,2100
user1,2024-01-02,74,9200,7.2,2.4,2250
```

### Required Columns
- `user_id`: String identifier
- `date`: ISO date (YYYY-MM-DD)
- Health metrics: `heart_rate`, `steps`, `sleep_hours`, `water_liters`, etc.

## API Endpoints
- `POST /upload` - Upload health data CSV
- `GET /data/{data_id}/summary` - Get analysis summary
- `GET /data/{data_id}/trends` - Get trend data
- `GET /data/{data_id}/anomalies` - Get anomaly detection

## Features
- 📊 **Interactive Dashboards** - Real-time health metrics visualization
- 📈 **Trend Analysis** - Track health patterns over time
- ⚠️ **Anomaly Detection** - Automatic health alerts and warnings
- 🔄 **Multi-format Support** - Upload CSV files in various formats
- 👤 **User Management** - Personal accounts with data persistence
- 🎨 **Modern UI** - Dark theme with neon accents
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔒 **Data Privacy** - Local storage with secure processing

## Portal Status
✅ **FULLY FUNCTIONAL** - All components working correctly
- Backend API with health data processing
- Frontend dashboard with real-time updates
- File upload with automatic data transformation
- User authentication and data persistence
- Interactive charts and visualizations
