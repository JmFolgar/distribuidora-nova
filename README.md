# Distribuidora Nova

Sistema de gestión para la ferretería **Distribuidora Nova**.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| ORM | Drizzle |
| Base de datos | PostgreSQL (Docker) |

## Requisitos

- Node.js 20+
- Docker Desktop (para PostgreSQL)
- npm 10+

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar PostgreSQL
npm run db:up

# 3. Aplicar migraciones (cuando existan tablas)
npm run db:migrate

# 4. Arrancar backend + frontend
npm run dev
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:3001/api  
- Health check: http://localhost:3001/api/health  

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Backend + frontend en paralelo |
| `npm run dev:backend` | Solo API |
| `npm run dev:frontend` | Solo React |
| `npm run db:up` | Inicia PostgreSQL en Docker |
| `npm run db:down` | Detiene PostgreSQL |
| `npm run db:generate` | Genera migraciones Drizzle |
| `npm run db:migrate` | Aplica migraciones |
| `npm run db:studio` | Abre Drizzle Studio |
| `npm run db:seed` | Datos de prueba |

## Estructura

```
distribuidora-nova/
├── backend/          # Express + Drizzle
├── frontend/         # React + Vite
├── docker-compose.yml
└── package.json      # Workspaces
```

## Credenciales de desarrollo (DB)

- Host: `localhost:5432`
- Usuario: `nova`
- Contraseña: `nova123`
- Base de datos: `distribuidora_nova`
