# M-Paya Energy — Task Management & Resolution Tool

A full-stack field service ticketing system that ensures technicians physically verify meter serial numbers before closing a ticket. Built with Django REST Framework, PostgreSQL, and React.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, Django 4.2, Django REST Framework |
| Auth | JWT via SimpleJWT |
| Database | PostgreSQL 15 |
| Cache / Queue | Redis 7 |
| Frontend | React 18, Vite, React Router v6 |
| Dev Infrastructure | Docker Desktop (db + redis), local Django + Vite |

---

## Project Structure

```
mpaya_api/     ← Django backend
├── apps/
│   ├── authentication/   — Custom User model, JWT auth, RBAC
│   └── tickets/          — Core feature: tickets, status, resolve
├── config/               — Settings, URLs
└── manage.py

mpaya_frontend/        ← React frontend (separate SPA)
├── src/
│   ├── pages/            — LoginPage, TicketsPage, CreateTicketsPage, TechniciansPage
│   ├── components/       — Navbar
│   ├── context/          — AuthContext (JWT management)
│   └── api/              — Axios client with auto-refresh
```

---

## Running the App

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker Desktop

---

### Backend Setup

**1. Start infrastructure**
```bash
docker compose up db redis -d
```

**2. Create and activate virtual environment**
```bash
cd mpaya_api
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

**3. Install dependencies**
```bash
pip install -r requirements/development.txt
```

**4. Configure environment**
```bash
cp .env.example .env
```

Edit `.env` — set DB_PORT to match your Docker mapping (5431 or 5432).

**5. Run migrations**
```bash
python manage.py makemigrations authentication tickets
python manage.py migrate
```

**6. Create a superuser**
```bash
python manage.py createsuperuser
```

**7. Create test data**
```bash
python manage.py seed
```

**8. Start the server**
```bash
python manage.py runserver
```

**9. Run tests**
```bash
python manage.py test apps.authentication.tests --verbosity=2
python manage.py test apps.tickets.tests --verbosity=2
```

- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/api/docs/`
- Django admin: `http://localhost:8000/admin/`

---

### Frontend Setup

```bash
cd mpaya_frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

The Vite proxy forwards all `/api` calls to the Django backend automatically.

---

## User Roles

| Role | Access |
|---|---|
| `admin` | Create tickets, view all tickets, filter by date and status |
| `technician` | View assigned tickets, update status, resolve tickets |

---

## Core Feature — Close-Loop Resolution

When resolving a ticket, the backend enforces two mandatory fields:

1. **Resolution Summary** — minimum 10 characters describing what was fixed
2. **Meter Serial Number** — must exactly match the serial number on the ticket record

If either is missing or the serial does not match, the API returns a `400` with a specific error. The ticket cannot move to Resolved until both pass validation.

---

## API Documentation

See [API_DOCS.md](docs/API_DOCS.md) for the full endpoint reference, or open `/api/docs/` for the interactive Swagger UI.
