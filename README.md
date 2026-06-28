# Hotel Resort Management System (HRMS)

Proyecto de laboratorio para Base de Datos II (Oracle + MongoDB).

## Estructura

- `frontend/` — Aplicacion Angular (standalone + routing) con flujo por roles.
- `backend/`  — API Node.js con rutas CRUD para Oracle y MongoDB.
- `docs/`     — DER, modelo de documentos, scripts de creación y carga.

## Módulos implementados

| Módulo       | Base de datos |
|--------------|---------------|
| Huéspedes    | Oracle        |
| Habitaciones | Oracle        |
| Reservas     | Oracle        |
| Facturación  | Oracle        |
| Eventos      | Oracle        |
| Perfil cliente | MongoDB     |
| Encuestas      | MongoDB     |
| Historial cliente | MongoDB  |
| Recomendaciones | MongoDB    |

## Requisitos

- Node.js 18+
- Oracle Database (XE o similar) — opcional si no se usa
- MongoDB Atlas o MongoDB 6+

---

## Puesta en marcha

### 1. Instalar dependencias (una sola vez)

```powershell
# Desde la carpeta HotelResortSystem/
npm run install:all
```

O manualmente:
```powershell
cd backend  && npm install
cd ../frontend && npm install
```

### 2. Configurar variables de entorno

```powershell
# Copia el ejemplo y edita con tus credenciales reales
copy backend\.env.example backend\.env
```

Edita `backend/.env`:
```
PORT=4000
MONGO_URI=mongodb+srv://<db_user>:<db_password>@cluster0proyecto.e6bqz9m.mongodb.net/
MONGO_DB=hrms

# Solo si tienes Oracle:
ORACLE_USER=system
ORACLE_PASSWORD=tu_contraseña
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
```

### 3. Arrancar el backend (Terminal 1)

```powershell
cd backend
npm run dev
# API disponible en http://localhost:4000
```

### 4. Arrancar el frontend (Terminal 2)

```powershell
cd frontend
npm run dev
# Frontend disponible en http://localhost:3000
```

## Flujo de autenticacion y roles (Angular)

Landing -> Login/Registro (JWT) -> redireccion por rol:

- `CLIENTE` -> `/cliente`
- `ADMIN` -> `/administrador`
- `GERENTE` -> `/gerente`

Rutas Angular principales:

- `src/app/landing/landing.routes.ts`
- `src/app/auth/auth.routes.ts`
- `src/app/cliente/cliente.routes.ts`
- `src/app/administrador/administrador.routes.ts`
- `src/app/gerente/gerente.routes.ts`

El frontend mantiene la conexion al backend en `http://localhost:4000/api` por medio de `src/app/core/services/api.service.ts`.

JWT:

- Se envia automaticamente en `Authorization: Bearer <token>` con `src/app/core/interceptors/auth.interceptor.ts`.
- Los guards `auth.guard` y `role.guard` protegen rutas por sesion y rol.

Importante: El backend actual aun no incluye endpoints de autenticacion (`/api/auth/login`, `/api/auth/register`).
La aplicacion Angular ya esta preparada para consumirlos en cuanto los agregues.

## URLs

| Servicio    | URL                          |
|-------------|------------------------------|
| Frontend    | http://localhost:3000        |
| Dashboard   | http://localhost:3000/dashboard.html |
| API Backend | http://localhost:4000/api    |
| Health API  | http://localhost:4000/api/health |

## Scripts DB

- Oracle schema: `docs/Scripts_SQL/schema_oracle.sql`
- Oracle seed:   `docs/Scripts_SQL/seed_oracle.sql`
- Oracle security: `docs/Scripts_SQL/security_oracle.sql`
- Mongo schema:  `docs/Scripts_Mongo/schema_mongo.js`
- Mongo seed:    `docs/Scripts_Mongo/seed_mongo.js`
- Mongo security: `docs/Scripts_Mongo/security_mongo.js`

## Seguridad

La seguridad esta documentada en `docs/Seguridad.md`.

- Autenticacion JWT en el backend.
- Hash de contrasenas con `bcrypt`.
- Middleware de proteccion por token y rol en `backend/middleware/auth.middleware.js`.
- Usuarios/roles de minimo privilegio para Oracle y MongoDB.
- Vista Oracle con datos sensibles enmascarados para reportes.

## Notas

- El backend **arranca aunque Oracle no esté disponible**. Si Oracle falla, verás un `⚠️` en la consola pero MongoDB y las rutas de preferencias/encuestas seguirán funcionando.
- El frontend se sirve a través de Express desde `frontend/server.js` en el puerto 3000.
- Las 4 colecciones MongoDB usadas por la API son: `perfil_cliente`, `encuestas`, `historial_cliente` y `recomendaciones`.
- Rutas MongoDB disponibles: `/api/perfiles-cliente` (alias `/api/preferencias`), `/api/encuestas`, `/api/historial-cliente`, `/api/recomendaciones`.
