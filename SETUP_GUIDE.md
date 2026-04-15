# MahaSwayam Portal - Complete Setup Guide

## Project Structure
```
mahaswayam_portal/
├── backend/              # FastAPI backend
│   ├── server.py         # Main server (auth + dashboard APIs + search)
│   ├── .env              # Environment variables
│   └── requirements.txt  # Python dependencies
├── frontend/             # React frontend
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── package.json      # Node dependencies
│   ├── tailwind.config.js
│   └── .env              # Frontend env
├── database/             # MongoDB dump
│   └── test_database/    # Database export
├── memory/               # Project docs
│   └── PRD.md
└── SETUP_GUIDE.md        # This file
```

## Prerequisites
- **Node.js** 18+ with Yarn
- **Python** 3.10+
- **MongoDB** 6+

## Step 1: Restore Database
```bash
mongorestore --uri="mongodb://localhost:27017" database/
```

## Step 2: Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Update .env with your settings:
#   MONGO_URL="mongodb://localhost:27017"
#   DB_NAME="test_database"
#   FRONTEND_URL="http://localhost:3000"
#   JWT_SECRET="your-secret-key"

uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

## Step 3: Frontend Setup
```bash
cd frontend
yarn install
# Update .env:
#   REACT_APP_BACKEND_URL=http://localhost:8001

yarn start
```

## Step 4: Access the Portal
Open http://localhost:3000

## Demo Accounts
| Role            | Email                          | Password      |
|-----------------|--------------------------------|---------------|
| Admin           | admin@mahaswayam.gov.in        | Admin@123     |
| CEO             | ceo@mahaswayam.gov.in          | Ceo@123       |
| AI Insights     | ai@mahaswayam.gov.in           | Ai@123        |
| Govt Officer    | officer@mahaswayam.gov.in      | Officer@123   |
| PMO             | pmo@mahaswayam.gov.in          | Pmo@123       |
| Institute       | institute@mahaswayam.gov.in    | Institute@123 |
| Employer        | employer@mahaswayam.gov.in     | Employer@123  |
| Helpdesk        | helpdesk@mahaswayam.gov.in     | Helpdesk@123  |
| Student         | student@mahaswayam.gov.in      | Student@123   |
| BI Analytics    | bi@mahaswayam.gov.in           | Bi@123        |

## Features
- 9 Role-based Dashboards with 400+ KPIs
- Real-time Data APIs (GET /api/dashboard/{type})
- Global Search across all KPIs (Ctrl+K)
- Dark Mode Toggle with localStorage persistence
- Date Range Picker with presets
- KPI Drill-down Modal
- Heatmap & Sankey Flow Visualizations
- Export to PDF & CSV
- JWT Authentication with role-based routing

## API Endpoints
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout
- `GET /api/dashboard/{type}` - Dashboard data (ceo/ai/officer/pmo/institute/employer/helpdesk/student/bi)
- `GET /api/search?q={query}` - Global search
- `GET /api/health` - Health check
