# Distribuidora Nova

Sistema de gestión para la ferretería **Distribuidora Nova**.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| ORM | Drizzle |
| Base de datos | PostgreSQL 16 (Docker) |
| Modelo SQL | Script `FER_*` en `SQL/Scripts` |

## Requisitos

Antes de empezar, ten instalado:

1. **Node.js 20+** y **npm 10+**  
   - Comprobar: `node -v` y `npm -v`
2. **Docker Desktop** (incluye `docker` y `docker compose`)  
   - Comprobar: `docker -v` y `docker compose version`  
   - Docker Desktop debe estar **abierto y en ejecución** (ícono de la ballena estable)
3. Git (opcional, si clonas el repo)

> En Windows, si instalaste Docker y la terminal no reconoce `docker`, cierra y vuelve a abrir la terminal (o Cursor) para que tome el PATH.

---

## Instalación desde cero

### 1. Clonar / abrir el proyecto

```bash
cd "ruta/a/distribuidora-nova"
```

### 2. Instalar dependencias

Desde la raíz del monorepo (instala `frontend` y `backend`):

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el ejemplo y, si hace falta, ajústalo:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

El `.env` de desarrollo queda así:

```env
POSTGRES_USER=nova
POSTGRES_PASSWORD=nova123
POSTGRES_DB=ferreteria
POSTGRES_PORT=5432

DATABASE_URL=postgresql://nova:nova123@localhost:5432/ferreteria
PORT=3001
NODE_ENV=development

VITE_API_URL=http://localhost:3001/api
```

### 4. Levantar PostgreSQL (Docker)

```bash
npm run db:up
```

Esto crea/inicia el contenedor `distribuidora-nova-db` con:

- Puerto: `5432`
- Usuario: `nova`
- Contraseña: `nova123`
- Base inicial: `ferreteria` (definida en `docker-compose.yml`)

Comprobar que está sano:

```bash
docker ps
# Debe verse: distribuidora-nova-db ... (healthy) ... 0.0.0.0:5432->5432/tcp
```

### 5. Crear la base `ferreteria` (solo si no existe)

Si el volumen de Docker ya existía con otra base, créala:

```bash
docker exec -i distribuidora-nova-db psql -U nova -d postgres -c "CREATE DATABASE ferreteria;"
```

Si ya existe, PostgreSQL avisará; puedes ignorarlo o omitir este paso.

### 6. Ejecutar el script SQL del modelo

Este paso crea todas las tablas `FER_*`, índices, triggers y datos iniciales:

```bash
docker cp "SQL/Scripts/FERRETERIA_POSTGRESQL.sql" distribuidora-nova-db:/tmp/FERRETERIA_POSTGRESQL.sql

docker exec -i distribuidora-nova-db psql -U nova -d ferreteria -v ON_ERROR_STOP=1 -f /tmp/FERRETERIA_POSTGRESQL.sql
```

Verificar tablas:

```bash
docker exec -i distribuidora-nova-db psql -U nova -d ferreteria -c "\dt"
```

Debes ver solo tablas con prefijo `FER_` (ubicaciones, seguridad, productos, compras, inventario, pedidos, ventas, auditoría, reportes, etc.).

### 7. Cargar usuarios de prueba (login)

```bash
npm run db:seed
```

### 8. Arrancar backend + frontend

```bash
npm run dev
```

Abre http://localhost:5173 — deberías ver la pantalla de ingreso.

---

## URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |
| Health check | http://localhost:3001/api/health |
| PostgreSQL | `localhost:5432` (**no** se abre en el navegador) |

El health check debe responder algo como:

```json
{
  "success": true,
  "service": "Distribuidora Nova API",
  "status": "ok",
  "database": "connected"
}
```

> **Importante:** `localhost:5432` es el puerto de la base de datos, no una página web. Para explorarla usa DBeaver, pgAdmin, o `npm run db:studio` (Drizzle Studio).

---

## Credenciales de desarrollo (DB)

| Campo | Valor |
|-------|-------|
| Host | `localhost` |
| Puerto | `5432` |
| Usuario | `nova` |
| Contraseña | `nova123` |
| Base de datos | `ferreteria` |
| Connection string | `postgresql://nova:nova123@localhost:5432/ferreteria` |

## Usuarios de prueba (QA / login HU1)

Tras el script SQL, carga los usuarios con el seeder (`seeders/usuarios.seed.js`):

```bash
npm run db:seed
```

Login en http://localhost:5173 con **correo** y **contraseña**:

| Correo | Contraseña | Nombre | Rol | Estado | Para qué sirve en QA |
|--------|------------|--------|-----|--------|----------------------|
| `admin@nova.com` | `Admin123!` | Ana Administradora | Administrador | Activo | Entra al menú de administrador |
| `supervisor@nova.com` | `Super123!` | Carlos Supervisor | Supervisor | Activo | Entra al menú de supervisor |
| `operador@nova.com` | `Opera123!` | Luis Operador | Operador | Activo | Entra al menú de operador (caso feliz) |
| `inactivo@nova.com` | `Inactivo123!` | Maria Inactiva | Operador | Inactivo | **No** debe entrar; pide contactar al administrador |

**Casos rápidos de prueba**

1. Login correcto con cualquiera de los tres activos → menú según rol.
2. Correo válido + contraseña incorrecta → «Correo o contraseña incorrectos».
3. Usuario inactivo con contraseña correcta → no entra.
4. Cerrar sesión → vuelve al login; el botón atrás no reabre el sistema.

API de autenticación:

- `POST /api/auth/login` — `{ "correo", "contrasena" }`
- `POST /api/auth/logout` — requiere Bearer token
- `GET /api/auth/me` — requiere Bearer token

---

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala dependencias del monorepo |
| `npm run dev` | Backend + frontend en paralelo |
| `npm run dev:backend` | Solo API (puerto 3001) |
| `npm run dev:frontend` | Solo React (puerto 5173) |
| `npm run db:up` | Inicia PostgreSQL en Docker |
| `npm run db:down` | Detiene PostgreSQL (conserva datos) |
| `npm run db:generate` | Genera migraciones Drizzle |
| `npm run db:push` | Empuja schema Drizzle a la DB |
| `npm run db:migrate` | Aplica migraciones Drizzle |
| `npm run db:studio` | Abre Drizzle Studio |

---

## Estructura del proyecto

```
distribuidora-nova/
├── backend/                 # API Express + Drizzle
│   ├── src/
│   ├── drizzle.config.cjs
│   └── package.json
├── frontend/                # React + Vite
│   ├── src/
│   └── package.json
├── SQL/
│   ├── Scripts/
│   │   └── FERRETERIA_POSTGRESQL.sql   # Modelo oficial (tablas FER_*)
│   ├── DBMLs/                          # Diagramas para dbdiagram.io
│   └── Diagramas-ER/                   # Export PNG/SVG del E/R
├── seeders/
│   └── usuarios.seed.js     # Usuarios de prueba (login HU1)
├── docker-compose.yml       # PostgreSQL 16
├── .env.example
├── package.json             # Workspaces npm
└── README.md
```

---

## Resumen rápido (cuando ya instalaste todo una vez)

```bash
# Docker Desktop abierto
npm run db:up
npm run dev
```

Si la base está vacía o es un entorno nuevo, vuelve a correr el paso 6 (script SQL).

---

## Solución de problemas

| Problema | Qué hacer |
|----------|-----------|
| `docker` no se reconoce | Abre Docker Desktop; reinicia la terminal; verifica PATH |
| `database: disconnected` en `/api/health` | Corre `npm run db:up` y espera a que el contenedor esté `healthy` |
| Puerto 5432 ocupado | Cierra otra instancia de Postgres o cambia el puerto en `docker-compose.yml` y `.env` |
| El script SQL falla a mitad | Revisa el error; si las tablas ya existen, usa una DB limpia o elimina el volumen (`docker compose down -v`) y repite desde el paso 4 |
| Frontend no habla con la API | Confirma `VITE_API_URL=http://localhost:3001/api` y que el backend esté en 3001 |

### Reinicio limpio de la base (borra datos del volumen)

```bash
npm run db:down
docker compose down -v
npm run db:up
# Luego crear DB si hace falta y volver a ejecutar SQL/Scripts/FERRETERIA_POSTGRESQL.sql
```
