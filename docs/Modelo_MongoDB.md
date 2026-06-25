# Modelo MongoDB - HRMS

## Colecciones

- preferencias
- encuestas
- historial_estadias
- recomendaciones

## Documento ejemplo: preferencias

```json
{
  "_id": "P001",
  "idHuesped": 1,
  "vista": "Mar",
  "tipoCama": "King",
  "dieta": "Vegetariana",
  "noFumador": true,
  "almohadasEspeciales": "Ortopedicas"
}
```

## Documento ejemplo: encuestas

```json
{
  "_id": "E001",
  "idHuesped": 1,
  "fecha": "2026-06-20",
  "calificacion": 5,
  "comentario": "Excelente atencion"
}
```

## Indices sugeridos

- preferencias: `{ idHuesped: 1 }` unico
- encuestas: `{ idHuesped: 1, fecha: -1 }`
- historial_estadias: `{ idHuesped: 1 }` unico
- recomendaciones: `{ idHuesped: 1 }` unico

## Seguridad sugerida

- Crear usuario de aplicacion con rol `readWrite` solo en DB `hrms`.
- Habilitar autenticacion SCRAM y cifrado TLS en despliegue productivo.
- Aplicar rotacion de credenciales por periodo academico.
