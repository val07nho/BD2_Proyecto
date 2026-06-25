# Hotel Resort Management System (HRMS)

Proyecto de laboratorio para Base de Datos II (Oracle + MongoDB).

## Estructura

- `frontend/` — Servidor Node.js/Express con 7 pantallas HTML.
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
| Preferencias | MongoDB       |
| Encuestas    | MongoDB       |

## Requisitos

- Node.js 18+
- Oracle Database (XE o similar) — opcional si no se usa
- MongoDB 6+ corriendo en `localhost:27017`

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
MONGO_URI=mongodb://localhost:27017
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
- Mongo schema:  `docs/Scripts_Mongo/schema_mongo.js`
- Mongo seed:    `docs/Scripts_Mongo/seed_mongo.js`

## Notas

- El backend **arranca aunque Oracle no esté disponible**. Si Oracle falla, verás un `⚠️` en la consola pero MongoDB y las rutas de preferencias/encuestas seguirán funcionando.
- El frontend se sirve a través de Express desde `frontend/server.js` en el puerto 3000.
