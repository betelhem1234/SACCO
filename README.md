# SACCO

A savings and credit cooperative system built as a small Docker-based stack
with an Angular web app, a Spring Boot API, and a PostgreSQL database.

- **Web**: Angular (Nx monorepo) served by nginx
- **API**: Spring Boot 4 / Java 21 (multi-stage Dockerfile builds itself)
- **DB**: PostgreSQL 15
- **Gateway**: nginx reverse proxy that routes `/sacco/` to the web and API

Everything runs with `docker compose` — the only thing you need installed is
Docker. There is no local JDK or Node required.

## How the pieces fit together

```
                     ┌─────────────────────────────────────────┐
 browser ──► :9080 ──┤        gateway (nginx, port 9080)        │
                     │  /sacco/     ─► web container (nginx:80) │
                     │  /sacco/api/ ─► api container  (port 8080)│
                     └───────────────────┬─────────────────────┘
                                         │
                                   ┌─────▼─────┐
                                   │  api      │  Spring Boot 4 (Java 21)
                                   │  (8080)   │  JWT auth, REST endpoints
                                   └─────┬─────┘
                                         │
                                   ┌─────▼─────┐
                                   │  db       │  PostgreSQL 15
                                   │  (5433)   │  database: ngrx
                                   └───────────┘
```

| Service | Container name | Host port | Purpose |
|---------|---------------|-----------|---------|
| Gateway | `gateway`     | 9080      | Entry point; serves the app at `/sacco/` |
| Web     | `sacco-web`   | (internal)| Angular app built to static files |
| API     | `sacco-api`   | 8080      | Spring Boot REST API |
| DB      | `sacco-db`    | 5433      | PostgreSQL data store |

When you open the app you only talk to port 9080. The gateway hides the
internal ports from the outside.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (Docker Desktop on Windows/macOS,
  or Docker Engine + `docker compose` plugin on Linux)
- [git](https://git-scm.com/)
- A GitHub account

That's it. No Java, no Node, no PostgreSQL client needed.

## Quick start

1. **Clone the repository**

   ```bash
   git clone https://github.com/betelhem1234/SACCO.git
   cd SACCO
   ```

2. **Set up the `.env` file** (production passwords live here, not in git)

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and replace the example values with your own
   `POSTGRES_PASSWORD` and `APP_JWT_SECRET` (a long random string). The
   defaults in `.env.example` work for local development as-is.

3. **Create the gateway network** (once)

   ```bash
   docker network create dev-gateway
   ```

   The compose file attaches the API and web containers to this network so the
   gateway container can reach them.

4. **Start the stack**

   ```bash
   docker compose up --build
   ```

   The first build takes a few minutes (it downloads base images and compiles
   the API jar inside Docker). Later starts are quick.

5. **Open the app**

   Open http://localhost:9080/sacco/ in your browser.

## Seeded data (fresh database)

The first time the API starts against an empty database it seeds:

- **Default admin user**: `admin@company.com` / `Admin@1234`
  (change this password after the first login)
- Roles: `SUPER_ADMIN`, `ACCOUNTANT`
- Regions, subcities, branches, and education levels
- Saving types: `Monthly Mandatory Saving`, `Monthly`, `voluntary saving`
- Settings (15) such as `mandatory_partial_payment`,
  `mandatory_overflow_to_voluntary`, `mandatory_saving_type_id`,
  `registration_fee`, `share_unit_price`, withdrawal rules, and UI colors

Seeding is idempotent: restarting the API does not duplicate data.

> Note: the dev database on a long-running machine may still have the older
> `admin123` password. A brand-new database always gets `Admin@1234`.

## Configuration (`.env`)

| Variable            | Used by          | Example                                        |
|---------------------|------------------|------------------------------------------------|
| `POSTGRES_PASSWORD` | Database         | `change-me-please`                             |
| `APP_JWT_SECRET`    | API (login/JWT)  | a long random string (64+ chars recommended)   |

The JWT key is derived from `APP_JWT_SECRET` with SHA-512, so any value works
for signing, but use a long, unguessable secret outside local development.

Never commit your `.env` — it is ignored by git.

## Common commands

```bash
docker compose up -d            # start in the background
docker compose ps               # see running services
docker compose logs -f api      # follow API logs
docker compose logs -f web      # follow web logs
docker compose build api        # rebuild the API image
docker compose down             # stop containers (data is kept)
docker compose down -v          # stop AND wipe the database (fresh re-seed)
```

## Troubleshooting

**Login says "Bad credentials" but the password is right**
The API runs 5-failed-login lockout, and a too-short `APP_JWT_SECRET` used to
cause misleading errors (fixed — a good secret is still recommended). Make sure
your email/password match the seeded user. A freshly seeded database uses
`admin@company.com` / `Admin@1234`.

**`docker compose up` complains the `dev-gateway` network is missing**
Network is external; create it once:

```bash
docker network create dev-gateway
```

**Port already in use (5433 / 8080 / 9080)**
Change the host-side port in `docker-compose.yml` (e.g. `"5434:5432"`) or in
the gateway config, then restart the affected container.

**The web app builds but shows a blank page at `/sacco/`**
The API container must be reachable from the web container on the
`dev-gateway` network (`docker network connect dev-gateway sacco-api`).

## API basics

Login uses the `email` field:

```bash
curl -X POST http://localhost:9080/sacco/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"Admin@1234"}'
```

returns a JWT token; send it as `Authorization: Bearer <token>` on other calls.

## Deployment

A production server needs: Docker installed, an external gateway network, and a
server-safe gateway config (SACCO routes only — the local dev gateway also
routes a `bety` app and must not be copied to the server). Placeholder ports on
the server are **5433** (db), **8080** (api), **9080** (gateway). Full deploy
steps are documented separately.