# Snip — URL Shortener

A minimal URL-shortener built as a learning project for the **NUS-ISS AI-SDLC** workshop.  
One backend, two clients — all living in the **same Git repository**, each on its own branch, wired together here as Git submodules.

---

## Architecture: one backend, two clients

```
┌─────────────────────────────────────┐
│           Snip Backend              │
│  Node.js · Express · JSON file DB  │
│  http://localhost:3000              │
└──────────────┬──────────────────────┘
               │  REST API
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  Angular 19 │  │  CLI (Bun)  │
│  Frontend   │  │  snip.js    │
│  :4200      │  │  terminal   │
└─────────────┘  └─────────────┘
```

Both clients talk to the same REST API.  
The backend is the single source of truth for link storage.

---

## API contract

| Method | Path             | Body / Params          | Response                                      |
|--------|------------------|------------------------|-----------------------------------------------|
| POST   | `/shorten`       | `{ "url": "<long>" }`  | `201 { code, url, shortUrl, hits, createdAt }` |
| GET    | `/links`         | —                      | `200 [ { code, url, shortUrl, hits, … } ]`    |
| GET    | `/:code`         | path param `:code`     | `302` redirect to original URL                |
| GET    | `/health`        | —                      | `200 { status: "ok" }`                        |

All error responses use `{ "error": "<message>" }` with an appropriate HTTP status code.

---

## Repository layout — branch-per-layer + submodules

```
ai-sdlc-snip-demo (GitHub repo)
│
├── branch: main      ← you are here (superproject)
│     README.md
│     .gitmodules
│     backend/   ──► submodule → branch: backend
│     frontend/  ──► submodule → branch: frontend
│     cli/       ──► submodule → branch: cli
│
├── branch: backend   ← Express server source
├── branch: frontend  ← Angular 19 app source
└── branch: cli       ← Bun CLI source
```

Each submodule folder is a full Git checkout of the same remote repo on its own branch.  
The superproject (`main`) stores only a commit pointer per submodule — it never stores the actual source files.

---

## Cloning

> **Plain `git clone` leaves submodule folders empty.**  
> Always clone with `--recurse-submodules`:

```bash
git clone --recurse-submodules https://github.com/shermannws/ai-sdlc-snip-demo
cd ai-sdlc-snip-demo
```

If you already cloned without the flag, initialise after the fact:

```bash
git submodule update --init --recursive
```

---

## Running all three pieces

### 1 — Backend (Node.js / Express)

```bash
cd backend
npm install
node server.js
# Listening on http://localhost:3000
```

### 2 — Frontend (Angular 19)

```bash
cd frontend
npm install
npx ng serve
# Open http://localhost:4200 in your browser
```

The Angular dev server proxies or calls `http://localhost:3000` directly.  
Make sure the backend is running first.

### 3 — CLI (Bun)

```bash
cd cli
bun install          # install deps (if any)
node cli.js help     # or: bun run cli.js help

# Shorten a URL
node cli.js shorten https://example.com/very/long/path

# List all links
node cli.js list
```

---

## Update workflow

### Making changes inside a submodule

```bash
# 1. Work inside the submodule directory
cd backend          # (or frontend / cli)

# 2. Edit files, then commit and push on the submodule's own branch
git add .
git commit -m "fix: your message here"
git push origin backend   # push to the submodule branch

cd ..   # back to the superproject
```

### Bumping the superproject pointer

```bash
# Pull the latest commit from a submodule's tracking branch
git submodule update --remote backend   # (or frontend / cli)

# Stage the updated pointer
git add backend

# Commit the pointer bump in the superproject
git commit -m "chore: bump backend submodule pointer"
git push origin main
```

### Keeping everything in sync after someone else updates

```bash
# In the superproject
git pull
git submodule update --recursive
```

---

## Tech stack

| Layer    | Technology                     |
|----------|-------------------------------|
| Backend  | Node.js 22 · Express 5        |
| Frontend | Angular 19 · TypeScript        |
| CLI      | Node.js / Bun · Commander.js  |
| Storage  | JSON flat-file (`links.json`) |

---

*Built during the NUS-ISS AI-SDLC workshop.*
