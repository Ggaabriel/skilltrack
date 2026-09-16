# Testing map

UNIT
────────────────────────
Controller → mock Service
Service    → mock Prisma


INTEGRATION
────────────────────────
Controller
    ↓
Service
    ↓
Prisma
    ↓
test DB


E2E
────────────────────────
HTTP request
    ↓
Pipes
Guards
Interceptors
    ↓
Controller
    ↓
Service
    ↓
Prisma
    ↓
test DB
    ↓
HTTP response