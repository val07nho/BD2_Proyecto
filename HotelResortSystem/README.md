# Hotel Resort Management System (HRMS)

Proyecto de laboratorio para Base de Datos II (Oracle + MongoDB).

## Estructura

- `frontend/`: 7 pantallas para la simulacion de uso.
- `backend/`: API Node.js con rutas CRUD para Oracle y MongoDB.
- `docs/`: DER, modelo de documentos, scripts de creacion y carga.

## Modulos implementados

- Huespedes
- Habitaciones
- Reservas
- Facturacion
- Eventos y actividades
- Preferencias
- Encuestas

## Requisitos

- Node.js 18+
- Oracle Database (XE o similar)
- MongoDB 6+

## Backend

1. Ir a `backend/`
2. Ejecutar `npm install`
3. Copiar `.env.example` a `.env` y ajustar credenciales
4. Ejecutar `npm run dev`

API base: `http://localhost:4000/api`

## Frontend

Abrir archivos HTML de `frontend/` en navegador, por ejemplo `dashboard.html`.

## Scripts DB

- Oracle schema: `docs/Scripts_SQL/schema_oracle.sql`
- Oracle seed: `docs/Scripts_SQL/seed_oracle.sql`
- Mongo schema/index: `docs/Scripts_Mongo/schema_mongo.js`
- Mongo seed: `docs/Scripts_Mongo/seed_mongo.js`

## Seguridad sugerida

- Usuario dedicado de aplicacion para Oracle y MongoDB.
- Privilegios minimos.
- Credenciales via variables de entorno.
