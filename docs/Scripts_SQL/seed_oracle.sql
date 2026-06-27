-- HRMS Oracle seed data (modelo con roles)

INSERT INTO ROL (ID_ROL, NOMBRE, DESCRIPCION)
VALUES (SEQ_ROL.NEXTVAL, 'CLIENTE', 'Usuario cliente del hotel');

INSERT INTO ROL (ID_ROL, NOMBRE, DESCRIPCION)
VALUES (SEQ_ROL.NEXTVAL, 'GERENTE', 'Usuario gerente con acceso a reportes');

INSERT INTO ROL (ID_ROL, NOMBRE, DESCRIPCION)
VALUES (SEQ_ROL.NEXTVAL, 'ADMIN', 'Usuario administrador del sistema');

INSERT INTO USUARIO (ID_USUARIO, ID_ROL, USERNAME, PASSWORD, ESTADO)
VALUES (SEQ_USUARIO.NEXTVAL, 3, 'admin@hrms.com', 'admin123', 'A');

INSERT INTO USUARIO (ID_USUARIO, ID_ROL, USERNAME, PASSWORD, ESTADO)
VALUES (SEQ_USUARIO.NEXTVAL, 2, 'gerente@hrms.com', 'gerente123', 'A');

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO USUARIO (ID_USUARIO, ID_ROL, USERNAME, PASSWORD, ESTADO)
    VALUES (
      SEQ_USUARIO.NEXTVAL,
      1,
      'cliente' || i || '@mail.com',
      'cliente123',
      'A'
    );

    INSERT INTO HUESPED (
      ID_HUESPED,
      ID_USUARIO,
      NOMBRES,
      APELLIDOS,
      TIPO_DOCUMENTO,
      NUMERO_DOCUMENTO,
      TELEFONO,
      CORREO,
      NACIONALIDAD
    ) VALUES (
      SEQ_HUESPED.NEXTVAL,
      SEQ_USUARIO.CURRVAL,
      'Nombre' || i,
      'Apellido' || i,
      'DNI',
      'DOC' || LPAD(i, 6, '0'),
      '999000' || LPAD(i, 3, '0'),
      'cliente' || i || '@mail.com',
      CASE MOD(i, 3) WHEN 0 THEN 'Peru' WHEN 1 THEN 'Chile' ELSE 'Argentina' END
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO HABITACION (
      ID_HABITACION,
      NUMERO,
      TIPO,
      CAPACIDAD,
      PRECIO_NOCHE,
      ESTADO,
      DESCRIPCION
    ) VALUES (
      SEQ_HABITACION.NEXTVAL,
      TO_CHAR(100 + i),
      CASE MOD(i, 3) WHEN 0 THEN 'Suite' WHEN 1 THEN 'Deluxe' ELSE 'Estandar' END,
      CASE MOD(i, 3) WHEN 0 THEN 4 WHEN 1 THEN 2 ELSE 3 END,
      220 + (i * 3),
      'DISPONIBLE',
      'Habitacion ' || TO_CHAR(100 + i) || ' con vista y servicios estandar'
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO RESERVA (
      ID_RESERVA,
      ID_HUESPED,
      FECHA_RESERVA,
      FECHA_INGRESO,
      FECHA_SALIDA,
      ESTADO,
      TOTAL
    ) VALUES (
      SEQ_RESERVA.NEXTVAL,
      i,
      SYSDATE - i,
      TRUNC(SYSDATE) - MOD(i, 20),
      TRUNC(SYSDATE) + MOD(i, 10) + 1,
      CASE MOD(i, 4)
        WHEN 0 THEN 'CONFIRMADA'
        WHEN 1 THEN 'PENDIENTE'
        WHEN 2 THEN 'CANCELADA'
        ELSE 'FINALIZADA'
      END,
      350 + (i * 10)
    );

    INSERT INTO DETALLE_RESERVA (
      ID_DETALLE,
      ID_RESERVA,
      ID_HABITACION,
      PRECIO_NOCHE,
      CANTIDAD_NOCHES,
      SUBTOTAL
    ) VALUES (
      SEQ_DETALLE_RESERVA.NEXTVAL,
      SEQ_RESERVA.CURRVAL,
      i,
      220 + (i * 3),
      2 + MOD(i, 3),
      (220 + (i * 3)) * (2 + MOD(i, 3))
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..15 LOOP
    INSERT INTO SERVICIO (
      ID_SERVICIO,
      NOMBRE,
      DESCRIPCION,
      PRECIO,
      ESTADO
    ) VALUES (
      SEQ_SERVICIO.NEXTVAL,
      'Servicio ' || i,
      'Descripcion del servicio ' || i,
      15 + (i * 2),
      'A'
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO CONSUMO_SERVICIO (
      ID_CONSUMO,
      ID_RESERVA,
      ID_SERVICIO,
      CANTIDAD,
      SUBTOTAL,
      FECHA
    ) VALUES (
      SEQ_CONSUMO_SERVICIO.NEXTVAL,
      i,
      MOD(i, 15) + 1,
      1 + MOD(i, 3),
      (15 + ((MOD(i, 15) + 1) * 2)) * (1 + MOD(i, 3)),
      SYSDATE - MOD(i, 12)
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..20 LOOP
    INSERT INTO EVENTO (
      ID_EVENTO,
      NOMBRE,
      DESCRIPCION,
      FECHA_EVENTO,
      COSTO,
      CUPOS,
      ESTADO
    ) VALUES (
      SEQ_EVENTO.NEXTVAL,
      CASE MOD(i, 5)
        WHEN 0 THEN 'Spa'
        WHEN 1 THEN 'Piscina VIP'
        WHEN 2 THEN 'Tour turistico'
        WHEN 3 THEN 'Buceo'
        ELSE 'Cena tematica'
      END,
      'Actividad recreativa numero ' || i,
      TRUNC(SYSDATE) + MOD(i, 14),
      50 + (i * 2),
      20 + MOD(i, 10),
      'A'
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..20 LOOP
    INSERT INTO RESERVA_EVENTO (
      ID_RESERVA_EVENTO,
      ID_RESERVA,
      ID_EVENTO,
      CANTIDAD,
      SUBTOTAL
    ) VALUES (
      SEQ_RESERVA_EVENTO.NEXTVAL,
      i,
      i,
      1 + MOD(i, 4),
      (50 + (i * 2)) * (1 + MOD(i, 4))
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO FACTURA (
      ID_FACTURA,
      ID_RESERVA,
      FECHA_EMISION,
      SUBTOTAL,
      IGV,
      TOTAL,
      ESTADO_PAGO
    ) VALUES (
      SEQ_FACTURA.NEXTVAL,
      i,
      SYSDATE - MOD(i, 15),
      ROUND((350 + (i * 10)) / 1.18, 2),
      ROUND((350 + (i * 10)) - ((350 + (i * 10)) / 1.18), 2),
      350 + (i * 10),
      CASE MOD(i, 3)
        WHEN 0 THEN 'PAGADO'
        WHEN 1 THEN 'PENDIENTE'
        ELSE 'ANULADO'
      END
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..20 LOOP
    INSERT INTO PAGO (
      ID_PAGO,
      ID_FACTURA,
      FECHA_PAGO,
      METODO_PAGO,
      MONTO
    ) VALUES (
      SEQ_PAGO.NEXTVAL,
      i,
      SYSDATE - MOD(i, 12),
      CASE MOD(i, 3)
        WHEN 0 THEN 'Tarjeta'
        WHEN 1 THEN 'Transferencia'
        ELSE 'Efectivo'
      END,
      350 + (i * 10)
    );
  END LOOP;
END;
/

COMMIT;
