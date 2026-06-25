-- HRMS Oracle seed data (30 registros principales)

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO HUESPED (
      ID_HUESPED, DNI_PASAPORTE, NOMBRES, APELLIDOS, NACIONALIDAD, TELEFONO, CORREO
    ) VALUES (
      SEQ_HUESPED.NEXTVAL,
      'DOC' || LPAD(i, 6, '0'),
      'Nombre' || i,
      'Apellido' || i,
      CASE MOD(i, 3) WHEN 0 THEN 'Peru' WHEN 1 THEN 'Chile' ELSE 'Argentina' END,
      '999000' || LPAD(i, 3, '0'),
      'huesped' || i || '@mail.com'
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO HABITACION (
      ID_HABITACION, NUMERO_HABITACION, TIPO, PRECIO_NOCHE, CAPACIDAD, ESTADO
    ) VALUES (
      SEQ_HABITACION.NEXTVAL,
      TO_CHAR(100 + i),
      CASE MOD(i, 3) WHEN 0 THEN 'Suite' WHEN 1 THEN 'Deluxe' ELSE 'Estandar' END,
      220 + (i * 3),
      CASE MOD(i, 3) WHEN 0 THEN 4 WHEN 1 THEN 2 ELSE 3 END,
      'Disponible'
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO RESERVA (
      ID_RESERVA, FECHA_RESERVA, FECHA_INGRESO, FECHA_SALIDA, ESTADO, ID_HUESPED, ID_HABITACION
    ) VALUES (
      SEQ_RESERVA.NEXTVAL,
      SYSDATE - i,
      TRUNC(SYSDATE) - MOD(i, 20),
      TRUNC(SYSDATE) + MOD(i, 10) + 1,
      CASE MOD(i, 4) WHEN 0 THEN 'Confirmada' WHEN 1 THEN 'Pendiente' WHEN 2 THEN 'Cancelada' ELSE 'Finalizada' END,
      i,
      i
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO FACTURA (
      ID_FACTURA, NUMERO_FACTURA, FECHA_EMISION, MONTO_TOTAL, METODO_PAGO, ID_RESERVA
    ) VALUES (
      SEQ_FACTURA.NEXTVAL,
      'FAC-' || LPAD(i, 6, '0'),
      SYSDATE - MOD(i, 15),
      350 + (i * 10),
      CASE MOD(i, 3) WHEN 0 THEN 'Tarjeta' WHEN 1 THEN 'Transferencia' ELSE 'Efectivo' END,
      i
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO PAGO (
      ID_PAGO, FECHA_PAGO, MONTO, METODO, ID_FACTURA
    ) VALUES (
      SEQ_PAGO.NEXTVAL,
      SYSDATE - MOD(i, 12),
      350 + (i * 10),
      CASE MOD(i, 3) WHEN 0 THEN 'Tarjeta' WHEN 1 THEN 'Transferencia' ELSE 'Efectivo' END,
      i
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO EVENTO (
      ID_EVENTO, CODIGO_EVENTO, NOMBRE, DESCRIPCION, FECHA_EVENTO, COSTO
    ) VALUES (
      SEQ_EVENTO.NEXTVAL,
      'EV-' || LPAD(i, 4, '0'),
      CASE MOD(i, 5) WHEN 0 THEN 'Spa' WHEN 1 THEN 'Piscina VIP' WHEN 2 THEN 'Tour turistico' WHEN 3 THEN 'Buceo' ELSE 'Cena tematica' END,
      'Actividad recreativa numero ' || i,
      TRUNC(SYSDATE) + MOD(i, 14),
      50 + (i * 2)
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO PARTICIPACION_EVENTO (
      ID_PARTICIPACION, ID_HUESPED, ID_EVENTO, FECHA_INSCRIPCION
    ) VALUES (
      SEQ_PARTICIPACION.NEXTVAL,
      i,
      i,
      SYSDATE - MOD(i, 10)
    );
  END LOOP;
END;
/

BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO EMPLEADO (
      ID_EMPLEADO, NOMBRES, APELLIDOS, CARGO, CORREO, TELEFONO
    ) VALUES (
      SEQ_EMPLEADO.NEXTVAL,
      'Empleado' || i,
      'Hotel' || i,
      CASE MOD(i, 4) WHEN 0 THEN 'Recepcionista' WHEN 1 THEN 'Administrador' WHEN 2 THEN 'Conserje' ELSE 'Supervisor' END,
      'empleado' || i || '@hrms.com',
      '988100' || LPAD(i, 3, '0')
    );
  END LOOP;
END;
/

COMMIT;
