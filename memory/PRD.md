# MahaSwayam Integrated Employment Portal - PRD

## Architecture
- **Backend**: FastAPI with JWT auth, MongoDB, real-time dashboard data APIs, global search API
- **Frontend**: React + Recharts + Shadcn UI + Tailwind CSS, dark mode, API-driven dashboards
- **Database**: MongoDB

## What's Been Implemented
### Phase 1: Core Portal
- Landing page + JWT auth with 10 role-based demo accounts
- 9 dashboards with 400+ KPIs in tabbed layouts
- Reusable chart components (bar, line, area, pie, gauge, grouped, horizontal, heatmap, sankey)

### Phase 2: Advanced Features
- Date range picker, KPI drill-down modal, heatmap & sankey visualizations, PDF/CSV export

### Phase 3: APIs + Search + Dark Mode (April 13, 2026)
- **Real-time Data APIs**: Backend serves all dashboard data via GET /api/dashboard/{type}. Date range filtering supported. Data generated server-side with seeded random for consistency.
- **Global Search**: GET /api/search?q={query} searches 400+ KPIs across all 9 dashboards. Frontend command palette (Ctrl+K) with debounced search, grouped results, navigation.
- **Dark Mode**: ThemeProvider context with localStorage persistence. Toggle in top bar. Full dark theme with proper CSS variables and dark: Tailwind classes.

## Prioritized Backlog
### P1
- Real database with actual data pipeline
- User management admin panel
- Notification system for alerts
### P2
- Network graph visualization
- Print-optimized CSS
- Mobile-responsive optimizations
