# MonadhamaDZ — Backend

AI Government Intelligence Platform — Backend API.

Built with **Python 3.12+**, **FastAPI**, **SQLAlchemy 2.0** (async), **PostgreSQL**, **JWT Authentication**, and **Clean Architecture**.

## Quick Start

### Prerequisites

- Python 3.12+
- PostgreSQL 16+
- Docker (optional, for containerized deployment)

### Local Development

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate    # Windows
source .venv/bin/activate # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env — at minimum set SECRET_KEY to a long random value

# 4. Start PostgreSQL and ensure the database exists
createdb monadhama

# 5. Run database migrations
alembic upgrade head

# 6. Seed the super admin account
python -m app.db.seed

# 7. Start the development server
uvicorn app.main:app --reload --port 8000
```

### Docker Deployment

```bash
# Start all services
docker compose up -d

# Run migrations
docker compose exec api alembic upgrade head

# Seed super admin
docker compose exec api python -m app.db.seed

# View logs
docker compose logs -f api
```

## API Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/health` | Health check | No |
| POST | `/api/v1/auth/login` | Authenticate (email + password) | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/users` | Create a user | Yes (user:create) |
| GET | `/api/v1/users` | List users | Yes (user:list) |
| GET | `/api/v1/users/me` | Current user profile | Yes |
| GET | `/api/v1/users/{id}` | Get user by ID | Yes (user:read) |
| PATCH | `/api/v1/users/{id}` | Update user | Yes (user:update) |
| DELETE | `/api/v1/users/{id}` | Deactivate user | Yes (user:delete) |

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Architecture

```
backend/
├── app/
│   ├── api/v1/endpoints/    # HTTP route handlers
│   ├── core/                # Config, security, database, logging
│   ├── dependencies/        # FastAPI dependencies (auth, DB)
│   ├── middleware/          # Request logging middleware
│   ├── models/              # SQLAlchemy ORM models
│   ├── repositories/        # Data-access layer (repository pattern)
│   ├── schemas/             # Pydantic v2 request/response schemas
│   ├── services/            # Business logic layer
│   ├── utils/               # Enums, helpers
│   ├── db/                  # Base, migrations, seed scripts
│   ├── tests/               # pytest test suite
│   ├── ai/                  # Future — AI services
│   ├── analytics/           # Future — Analytics engine
│   ├── reports/             # Future — Report generation
│   └── notifications/       # Future — Notification services
└── main.py                  # Application entry point
```

## Role-Based Access Control

| Role | Permissions |
|---|---|
| **Super Admin** | Full access — user management, configuration, audit |
| **Government Admin** | User management (no delete), scoring, reports, config |
| **Province Manager** | Province-specific scores, insights, risks, recommendations |
| **Analyst** | Read scores/insights/risks, create and read reports |
| **Viewer** | Read-only access to province data and reports |

## Running Tests

```bash
# Ensure the test database exists
createdb monadhama_test

# Run tests
pytest -v

# With coverage
pytest --cov=app --cov-report=term-missing
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── exceptions.py
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── auth.py
│   │           ├── health.py
│   │           └── users.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── logging.py
│   │   └── security.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── common.py
│   │   └── user.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   └── user_service.py
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   └── user_repository.py
│   ├── dependencies/
│   │   ├── __init__.py
│   │   └── auth.py
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── logging_middleware.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── enums.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── seed.py
│   │   └── migrations/
│   │       ├── env.py
│   │       ├── script.py.mako
│   │       └── versions/
│   │           └── .gitkeep
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_health.py
│   │   └── test_auth.py
│   ├── ai/               # Future
│   ├── analytics/        # Future
│   ├── reports/          # Future
│   └── notifications/    # Future
├── alembic.ini
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .dockerignore
├── requirements.txt
└── README.md
```
