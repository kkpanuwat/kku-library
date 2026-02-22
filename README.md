# KKU Library (Express + Postgres + Flyway)

This repo provides a ready-to-run backend + database for the **KKU Library** design-kit screens:
Books, Users, Borrow, Return, and Fines.

## Run with Docker

```bash
docker compose up --build
```

Services:
- Postgres: `localhost:5432` (data persisted in a Docker volume)
- API: `http://localhost:${HOST_PORT:-3001}` (if 3001 is taken, use `HOST_PORT=8081`)

## Deploy (DB + Flyway + API on one server)

Use `deploy/docker-compose.yml` on your server (example path: `/opt/kcode-deploy/docker-compose.yml`).

```bash
mkdir -p /opt/kcode-deploy
cp deploy/docker-compose.yml /opt/kcode-deploy/docker-compose.yml
cp deploy/.env.example /opt/kcode-deploy/.env
```

Then edit `/opt/kcode-deploy/.env` (set `JWT_SECRET` at least) and run:

```bash
cd /opt/kcode-deploy
docker compose up -d db
docker compose up flyway
docker compose up -d kku-library-api
```

## Local dev (DB in Docker + API with nodemon)

1) Start DB in Docker:

```bash
docker compose up -d db
docker compose up flyway
```

2) Set `.env` for local API:

- Use `DB_HOST=localhost` (do **not** write inline comments on the same line like `DB_HOST=localhost #...`)
- Keep `PORT=3001` (or change as you like)

3) Run API with auto-reload:

```bash
npm install
npm run dev
```

Reset DB (drop volume):

```bash
docker compose down -v
```

## Quick checks

```bash
curl http://localhost:${HOST_PORT:-3001}/health
curl http://localhost:${HOST_PORT:-3001}/dashboard
curl http://localhost:${HOST_PORT:-3001}/books
curl http://localhost:${HOST_PORT:-3001}/users
curl http://localhost:${HOST_PORT:-3001}/borrows
curl http://localhost:${HOST_PORT:-3001}/fines
```

## Main endpoints

- `POST /auth/register` (register student account)
- `POST /auth/login` (returns access token)
- `GET /dashboard` (stats + recent borrows)
- `GET /books` / `POST /books` / `PUT /books/:id` / `DELETE /books/:id`
- `GET /users` / `POST /users` / `PUT /users/:id` / `DELETE /users/:id`
- `GET /borrows` / `POST /borrows` (borrow a book)
- `POST /returns/:borrowId` (return a book, creates fine if overdue, 10 THB/day)
- `GET /fines` / `POST /fines/:id/pay`

## Example actions

Register:

```bash
curl -X POST http://localhost:${HOST_PORT:-3001}/auth/register \
  -H 'content-type: application/json' \
  -d '{"name":"Student One","email":"student1@kku.ac.th","password":"password123"}'
```

Login:

```bash
curl -X POST http://localhost:${HOST_PORT:-3001}/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"student1@kku.ac.th","password":"password123"}'
```

Dashboard (requires token):

```bash
TOKEN="PASTE_ACCESS_TOKEN"
curl http://localhost:${HOST_PORT:-3001}/dashboard -H "authorization: Bearer ${TOKEN}"
```

Borrow:

```bash
curl -X POST http://localhost:${HOST_PORT:-3001}/borrows \
  -H "authorization: Bearer ${TOKEN}" \
  -H 'content-type: application/json' \
  -d '{"userId":"U001","bookId":"B001","dueDate":"2026-03-01"}'
```

Return:

```bash
curl -X POST http://localhost:${HOST_PORT:-3001}/returns/BR001
```
