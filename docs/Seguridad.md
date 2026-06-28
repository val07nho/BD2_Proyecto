# Seguridad del Sistema HRMS

Este proyecto implementa seguridad en tres niveles: aplicacion, Oracle y MongoDB.

## 1. Seguridad en la aplicacion

- El login genera un JWT firmado con `JWT_SECRET`.
- Las contrasenas nuevas se guardan con hash `bcrypt`.
- El frontend envia el token en `Authorization: Bearer <token>`.
- El backend valida el token en `backend/middleware/auth.middleware.js`.
- Las rutas sensibles validan roles:
  - `ADMIN`: mantenimiento de usuarios, roles y catalogos.
  - `GERENTE`: consulta y gestion operativa limitada.
  - `CLIENTE`: operaciones propias como reservas, perfil, encuestas e historial.

## 2. Seguridad en Oracle

Archivo: `docs/Scripts_SQL/security_oracle.sql`

Incluye:

- Usuario `HRMS_APP` para la aplicacion.
- Usuario `HRMS_REPORT` para reportes.
- Roles `HRMS_APP_ROLE` y `HRMS_REPORT_ROLE`.
- Privilegios minimos por tabla.
- Vista `VW_HUESPED_REPORTE` para mostrar datos sensibles enmascarados.
- Consultas de verificacion para evidenciar roles y privilegios.

## 3. Seguridad en MongoDB

Archivo: `docs/Scripts_Mongo/security_mongo.js`

Incluye:

- Rol `hrmsAppRole` con lectura/escritura solo sobre colecciones HRMS.
- Rol `hrmsReportRole` con permisos de solo lectura.
- Usuarios `hrms_app` y `hrms_report`.
- Consultas de verificacion con `db.getUsers()` y `db.getRoles()`.

## 4. Variables recomendadas

```env
JWT_SECRET=cambiar_por_una_clave_larga_y_privada
JWT_EXPIRES_IN=8h

ORACLE_USER=HRMS_APP
ORACLE_PASSWORD=HrmsApp_2026
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1

MONGO_URI=mongodb://hrms_app:HrmsMongoApp_2026@localhost:27017/hrms?authSource=hrms
MONGO_DB=hrms
```

## 5. Evidencias para la entrega

Para sustentar el punto de seguridad en la rubrica, tomar capturas de:

- Ejecucion de `security_oracle.sql`.
- Resultado de `DBA_ROLE_PRIVS` y `DBA_TAB_PRIVS`.
- Ejecucion de `security_mongo.js`.
- Resultado de `db.getUsers()` y `db.getRoles({ showPrivileges: true })`.
- Peticion al backend sin token devolviendo `401`.
- Peticion con rol no autorizado devolviendo `403`.
