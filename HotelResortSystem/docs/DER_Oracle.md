# DER Oracle - HRMS

## Entidades principales

- HUESPED
- HABITACION
- RESERVA
- FACTURA
- PAGO
- EVENTO
- PARTICIPACION_EVENTO
- EMPLEADO

## Relaciones clave

- HUESPED 1..N RESERVA
- HABITACION 1..N RESERVA
- RESERVA 1..N FACTURA
- FACTURA 1..N PAGO
- HUESPED N..M EVENTO (via PARTICIPACION_EVENTO)

## Reglas

- Estado de habitacion: Disponible, Ocupada, Mantenimiento.
- Estado de reserva: Confirmada, Pendiente, Cancelada, Finalizada.
- Metodo de pago: Tarjeta, Transferencia, Efectivo.

## Seguridad sugerida

- Usuario `hrms_app` con privilegios minimos (SELECT, INSERT, UPDATE, DELETE sobre esquema).
- Auditoria de `RESERVA` y `FACTURA`.
- Enmascarar datos sensibles de documento y telefono para reportes.
