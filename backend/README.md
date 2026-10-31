# Brightloop backend

## Run locally (PowerShell)

From the repository root, open a backend terminal:

```powershell
cd backend
$env:SECRET_KEY = & .\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(48))"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

The database is created automatically at `backend/subscription.db`. If it has no administrator, startup creates the initial administrator without a public admin-registration endpoint. Use the same `SECRET_KEY` for the lifetime of the local server session. To create an administrator interactively instead, run `\.venv\Scripts\python.exe -m app.create_admin` before starting the server.

On backend startup, if the database has no administrator, one initial admin is created with email `admin@yourcompany.com` and temporary password `Admin@12345` for development. The admin must change this password after first login. Existing admin passwords are never reset during startup. Override the initial account before first startup with `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`, and optionally `INITIAL_ADMIN_NAME`. Production startup requires `INITIAL_ADMIN_PASSWORD` when the database has no admin; set it through the deployment environment and do not commit it.

The API is at `http://127.0.0.1:8000`, and Swagger documentation is at `http://127.0.0.1:8000/docs`. The default CORS origins are `http://localhost:5173` and `http://127.0.0.1:5173`; override them with a comma-separated `CORS_ORIGINS` environment variable if needed.

Password reset email requires `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. `FRONTEND_URL` can override the default reset-link origin (`http://localhost:5173`). Without SMTP configuration, reset requests still receive a generic response and no reset token is exposed.

## Frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend defaults to `http://127.0.0.1:8000/api`. Set `VITE_API_BASE_URL` before starting Vite to use a different API URL.
