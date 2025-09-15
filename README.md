<div align="center">

# VectorVault x TiDB AgentX 2025

</div>

VectorVault is an AI-powered Security Operations Center (SOC) platform designed to proactively defend against cyber threats. It's a next-generation security solution that combines the predictive power of a Large Language Model (LLM) with the A.S.T.R.A. (Advanced Security & Token-Based Rotating Authentication) zero-trust framework. This synergy transforms cybersecurity from a reactive defense into a strategic, predictive advantage.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quickstart](#quickstart)
- [Environment](#environment)
- [Database Schema](#database-schema)
- [Usage](#usage)
- [API](#api)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Features
- 🔍 Vector similarity search across historical incidents
- 🧠 JS cosine fallback when DB vector functions are unavailable
- 🤖 Tailored LLM Model to detect, analyze, and recommend actions
- 🗃️ Automatic table/index creation (TiDB Serverless)
- ⚙️ Database Management UI: test connection, refresh, seed
- 📊 Search stats (total incidents, indexed vectors, etc.)
- 🧪 Mock Mode (no database required) for fast local demos
- 🧭 Modern UI with shadcn/ui + Tailwind, responsive layout

---

## Architecture

```
┌───────────┐     REST      ┌──────────────┐     SQL / Vector      ┌────────────────┐
│  React    │  ───────────▶ │  Express API │  ───────────────────▶ │ TiDB Serverless│
│ (Vite)    │ ◀───────────  │ (server.cjs) │  ◀─────────────────── │ (optional)     │
└───────────┘  JSON / HTTP  └──────────────┘  Fallback: JS Cosine  └────────────────┘
```

---

## Tech Stack 
### Frontend 
- **React 18 :** Main UI framework
- **TypeScript :** Type-safe JavaScript
- **Vite :** Build tools & Development Server
- **Tailwind CSS :** Utility-first CSS framework
- **shadcn/ui :** Component library built on Radix UI 
- **Radix UI :** Headless UI Primitives
- **Lucide React :** Icon Library
- **React Hooks :** useState, useEffect, useCallback
- **Custom Hooks :** useTiDBConnection, useVectorSearch, useSearchStats
- **React Router DOM :** client-side routing

### Backend 
- **Node.js :** Javascript runtime
- **Express.js :** Node.js web framework
  
### Database
- **TiDB Serverless :** MySQL-compatible distributed database
- **mysql2 :** MySQL driver for Node.js
- **Vector Search :** Native vector similarity search capabilities

### API Communication
- **RESTful APIs :** HTTP endpoints for data operations
- **CORS :** Cross-origin resource sharing
- **Fetch API :** Frontend HTTP client

### Key Dependencies
- Frontend (JSON)

```bash
{
 "react": "^18.2.0",
 "react-dom": "^18.2.0",
 "react-router-dom": "^6.8.0",
 "typescript": "^5.0.0",
 "tailwindcss": "^3.3.0",
 "@radix-ui/react-*": "various",
 "lucide-react": "^0.263.0"
}
```
- Backend (JSON)

```bash
{
 "express": "^5.1.0",
 "mysql2": "^3.6.0",
 "cors": "^2.8.5",
 "dotenv": "^17.2.2"
}
```
- Development (JSON)

```bash
{
 "vite": "^5.4.0",
 "eslint": "^8.0.0",
 "@types/express": "^4.17.0",
 "@types/cors": "^2.8.0",
 "concurrently": "^8.0.0"
}
```

---

## Quickstart
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd incident-guard-ai
npm install
```

Start both servers (API + Frontend):
```bash
npm run dev:full
# Frontend: http://localhost:8080 (Vite auto-uses 8081 if 8080 is busy)
# API:      http://localhost:3001/api/health
```

> Tip: If you see a blank page, open the printed port (often 8081) and hard refresh (Cmd+Shift+R).

---

## Environment
Create `.env` (or copy `.env.example`):
```env
# TiDB Serverless (leave placeholders for Mock Mode)
VITE_TIDB_HOST=your-tidb-host.tidbcloud.com
VITE_TIDB_PORT=4000
VITE_TIDB_USER=your-username
VITE_TIDB_PASSWORD=your-password
VITE_TIDB_DATABASE=test

# App
VITE_APP_ENV=development
```

- Real DB mode: set valid TiDB credentials. The API will auto‑create tables/indexes and use SQL vector search where supported.
- Mock mode: keep placeholders. The API returns mock stats/seed behavior and computes similarity in JS.

---

## Database Schema

Created automatically by the API on startup (when real DB is configured):

```sql
CREATE TABLE IF NOT EXISTS incidents (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  severity ENUM('Critical','High','Medium','Low') NOT NULL,
  status ENUM('Active','Investigating','Contained','Resolved','Scheduled') NOT NULL,
  timestamp DATETIME NOT NULL,
  resolution TEXT,
  tags JSON,
  sources JSON,
  embedding JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Optional vector index (depends on cluster capabilities)
CREATE VECTOR INDEX IF NOT EXISTS idx_incident_embedding
ON incidents(embedding)
DIMENSION 1536
METRIC_TYPE COSINE;
```

---

## Usage

1. Open the app → Settings → Database Management
2. Click "Test Connection"
3. If connected, click "Seed Sample Data"
4. Go to Vector Search → enter a natural language query (e.g., "DDoS attack on web infrastructure")
5. Use Advanced Filters to refine (categories, severity, status, date window, similarity threshold)

---

## API

Base URL (local): `http://localhost:3001/api`

- `GET /health`  
  Returns `{ status: 'ok', mode: 'real' | 'mock' }`.

- `GET /test-connection`  
  Tests DB connectivity or returns mock info.  
  Example: `{ success, incidents, vectorized, embeddingDimensions, mock }`.

- `GET /search-stats`  
  `{ totalIncidents, indexedVectors, searchAccuracy, avgResponseTime, mock }`.

- `POST /vector-search`  
  Body:
  ```json
  {
    "query": "DDoS attack on web infrastructure",
    "filters": {
      "categories": ["Network Security"],
      "severity": ["High", "Critical"],
      "status": ["Resolved"],
      "includeResolved": true,
      "dateRange": "30days",
      "similarityThreshold": 75
    },
    "limit": 10
  }
  ```
  Returns: `Incident[]` with `similarity` score.  
  Notes:
  - Uses SQL vector function when available.
  - Falls back to JS cosine similarity otherwise.

- `POST /seed-data`  
  Seeds 2 sample incidents in real DB mode or confirms mock data readiness.

---

## Project Structure

```
src/
├── components/
│   ├── DatabaseManager.tsx    # DB controls: test/refresh/seed
│   └── ui/                    # shadcn/ui components
├── hooks/
│   └── use-tidb.ts            # connection/search/stats hooks (API client)
├── lib/
│   ├── api.ts                 # typed API client for the backend
│   └── utils.ts               # helpers
├── pages/
│   ├── VectorSearch.tsx       # main search UI
│   └── Settings.tsx           # settings + database management
└── main.tsx                   # app bootstrap

server.cjs                     # Express API (auto-reconnect, JS cosine fallback)
```

---

## Scripts

```bash
npm run dev        # Frontend only (Vite)
npm run server     # API only (Express on 3001)
npm run dev:full   # Run API + Frontend together
npm run build      # Production build
npm run preview    # Preview production build
```

---

## Troubleshooting

- White screen: use the printed port (8081 if 8080 busy) and hard refresh (Cmd+Shift+R).
- "Disconnected from TiDB": verify `.env` values, then restart the API (`npm run server`).
- "FUNCTION ... vector_dot_product does not exist": your cluster lacks vector SQL; the API automatically falls back to JS cosine (no action required).
- Port in use: Vite automatically selects the next port (8081, 8082, …).
- Filters error: the app now guards against `null` filters; refresh and try again.

---

## Security

- Do not commit `.env`. Commit `.env.example` only.
- Use strong DB credentials and rotate regularly.
- Enforce HTTPS and secure cookies in production.
- Restrict CORS origins in production.
- Store sensitive credentials in environment variables
- Use HTTPS in production
- Implement proper authentication and authorization
- Regular security updates and patches
- Monitor API usage and costs

---

## Contributing

1. Fork the repo
2. Create a feature branch (`feat/...`)
3. Commit with conventional messages (`feat: ...`, `fix: ...`)
4. Open a PR with context and screenshots
5. Add tests if applicable
6. Submit a pull request

### Adding New Features

1. **New Incident Types**: Add to the `Incident` interface in `src/lib/tidb.ts`
2. **Custom Filters**: Extend the `SearchFilters` interface
3. **New Components**: Create in `src/components/`
4. **Database Changes**: Update the schema in `src/lib/tidb.ts`

### Common Issues
1. **Connection Failed**:
   - Verify TiDB Serverless credentials
   - Check network connectivity
   - Ensure SSL is properly configured

2. **Vector Search Not Working**:
   - Verify OpenAI API key
   - Check embedding generation
   - Ensure vector index is created

3. **Performance Issues**:
   - Optimize vector index parameters
   - Reduce search result limits
   - Use appropriate filters

### Debug Mode
Enable debug logging by setting `VITE_APP_ENV=development` in your `.env` file.


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

---

**Note**: This application requires TiDB Serverless and OpenAI API access. Please ensure you have the necessary accounts and API keys before running the application.

