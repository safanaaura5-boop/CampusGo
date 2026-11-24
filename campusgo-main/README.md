# E-Parking Pangkalpinang

The project is split into two independent Node.js applications:

- `backend/` serves the Express API and owns the database configuration.
- `frontend/` serves the React application through Vite and proxies `/api` requests to the backend.

## Requirements

Node.js 20.19+ (or 22.12+) and npm.

## Run locally

The existing MySQL database `eparking_pangkalpinang` must be running locally and contain the application tables. The backend connects to it directly; it does not create or seed a database.

Install each application's dependencies once:

```powershell
Set-Location backend
npm install
```

```powershell
Set-Location frontend
npm install
```

Copy `backend/.env.example` to `backend/.env` and set your MySQL credentials if they differ from the local Laragon defaults. Then run each app in its own terminal:

Terminal 1 (API):

```powershell
Set-Location backend
npm run dev
```

Terminal 2 (web app):

```powershell
Set-Location frontend
npm run dev
```

Open the frontend at <http://localhost:5173>. The backend API runs at <http://localhost:3001>; its health endpoint is <http://localhost:3001/api/health>. Frontend API calls use the Vite proxy, so the browser does not need a separate API URL or CORS configuration.

## Configuration

The backend uses `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, and `MYSQL_PASSWORD` from `backend/.env`; the database name is fixed to `eparking_pangkalpinang`. `PORT` controls the API port and `JWT_SECRET` controls token signing.

The frontend reads `FRONTEND_PORT` and `API_PROXY_TARGET` from `frontend/.env`. The default proxy target is the local API at `http://127.0.0.1:3001`.
