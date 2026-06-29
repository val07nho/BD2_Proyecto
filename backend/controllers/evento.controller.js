const { getOracleConnection, outFormat } = require("../config/oracle");

function normalizeEstado(estado) {
  const value = String(estado || "A").toUpperCase();
  if (["A", "I"].includes(value)) {
    return value;
  }
  return "A";
}

async function listEventos(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute("SELECT * FROM EVENTO ORDER BY ID_EVENTO", [], { outFormat });
    res.json(result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function createEvento(req, res, next) {
  let connection;
  try {
    const { nombre, descripcion, fecha_evento, costo, cupos, estado } = req.body;
    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO EVENTO (ID_EVENTO, NOMBRE, DESCRIPCION, FECHA_EVENTO, COSTO, CUPOS, ESTADO)
       VALUES (SEQ_EVENTO.NEXTVAL, :nombre, :descripcion, TO_DATE(:fecha_evento, 'YYYY-MM-DD'), :costo, :cupos, :estado)`,
      {
        nombre,
        descripcion,
        fecha_evento,
        costo,
        cupos: cupos || null,
        estado: normalizeEstado(estado)
      },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Evento creado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function updateEvento(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    const { nombre, descripcion, fecha_evento, costo, cupos, estado } = req.body;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `UPDATE EVENTO
       SET NOMBRE = :nombre,
           DESCRIPCION = :descripcion,
           FECHA_EVENTO = TO_DATE(:fecha_evento, 'YYYY-MM-DD'),
           COSTO = :costo,
           CUPOS = :cupos,
           ESTADO = :estado
       WHERE ID_EVENTO = :id`,
      {
        id: Number(id),
        nombre,
        descripcion,
        fecha_evento,
        costo,
        cupos: cupos || null,
        estado: normalizeEstado(estado)
      },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json({ message: "Evento actualizado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteEvento(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      "DELETE FROM EVENTO WHERE ID_EVENTO = :id",
      { id: Number(id) },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json({ message: "Evento eliminado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function adquirirEvento(req, res, next) {
  let connection;
  try {
    const { id_reserva, id_evento, cantidad } = req.body;
    const qty = Number(cantidad || 1);

    if (!id_reserva || !id_evento) {
      return res.status(400).json({ message: "id_reserva e id_evento son requeridos" });
    }

    connection = await getOracleConnection();

    // 1. Validar que la reserva pertenezca al usuario (huésped) o sea un admin/gerente
    let idHuespedReserva = null;
    if (req.user.role === "CLIENTE") {
      const huespedResult = await connection.execute(
        "SELECT ID_HUESPED FROM HUESPED WHERE ID_USUARIO = :id_usuario",
        { id_usuario: req.user.id },
        { outFormat }
      );
      if (huespedResult.rows.length === 0) {
        return res.status(403).json({ message: "El usuario no tiene un huesped asociado." });
      }
      idHuespedReserva = huespedResult.rows[0].ID_HUESPED;
    }

    // Obtener datos de la reserva y validar
    const reservaResult = await connection.execute(
      "SELECT ID_HUESPED, ESTADO FROM RESERVA WHERE ID_RESERVA = :id_reserva",
      { id_reserva: Number(id_reserva) },
      { outFormat }
    );

    if (reservaResult.rows.length === 0) {
      return res.status(404).json({ message: "La reserva no existe." });
    }

    const reserva = reservaResult.rows[0];
    const estado = String(reserva.ESTADO).toUpperCase().trim();

    if (req.user.role === "CLIENTE" && Number(reserva.ID_HUESPED) !== Number(idHuespedReserva)) {
      return res.status(403).json({ message: "No tienes permiso para modificar esta reserva." });
    }

    if (estado !== "PENDIENTE") {
      return res.status(400).json({ message: "Solo se pueden agregar eventos a reservas PENDIENTES de pago." });
    }

    // Obtener costo y cupos del evento
    const eventoResult = await connection.execute(
      "SELECT COSTO, CUPOS, ESTADO FROM EVENTO WHERE ID_EVENTO = :id_evento",
      { id_evento: Number(id_evento) },
      { outFormat }
    );

    if (eventoResult.rows.length === 0) {
      return res.status(404).json({ message: "El evento no existe." });
    }

    const evento = eventoResult.rows[0];

    if (String(evento.ESTADO).trim() !== "A") {
      return res.status(400).json({ message: "El evento seleccionado no esta activo." });
    }

    // Validar cupos disponibles dinámicamente
    const cuposMaximos = Number(evento.CUPOS || 0);
    if (cuposMaximos > 0) {
      const reservasEventoResult = await connection.execute(
        "SELECT SUM(CANTIDAD) AS TOTAL_RESERVADOS FROM RESERVA_EVENTO WHERE ID_EVENTO = :id_evento",
        { id_evento: Number(id_evento) },
        { outFormat }
      );
      const totalReservados = Number(reservasEventoResult.rows[0]?.TOTAL_RESERVADOS || 0);
      const cuposDisponibles = cuposMaximos - totalReservados;

      if (qty > cuposDisponibles) {
        return res.status(400).json({ message: `No hay suficientes cupos disponibles. Solo quedan ${cuposDisponibles} cupos.` });
      }
    }

    const costoEvento = Number(evento.COSTO);
    const subtotalReservaEvento = costoEvento * qty;

    // 2. Insertar en RESERVA_EVENTO
    await connection.execute(
      `INSERT INTO RESERVA_EVENTO (ID_RESERVA_EVENTO, ID_RESERVA, ID_EVENTO, CANTIDAD, SUBTOTAL)
       VALUES (SEQ_RESERVA_EVENTO.NEXTVAL, :id_reserva, :id_evento, :cantidad, :subtotal)`,
      {
        id_reserva: Number(id_reserva),
        id_evento: Number(id_evento),
        cantidad: qty,
        subtotal: subtotalReservaEvento
      },
      { autoCommit: false }
    );

    // 3. Recalcular total acumulado de la reserva
    const habitacionSubtotalRes = await connection.execute(
      "SELECT SUM(SUBTOTAL) AS TOTAL_HAB FROM DETALLE_RESERVA WHERE ID_RESERVA = :id_reserva",
      { id_reserva: Number(id_reserva) },
      { outFormat }
    );
    const totalHabitacion = Number(habitacionSubtotalRes.rows[0]?.TOTAL_HAB || 0);

    const serviciosSubtotalRes = await connection.execute(
      "SELECT SUM(SUBTOTAL) AS TOTAL_SERV FROM CONSUMO_SERVICIO WHERE ID_RESERVA = :id_reserva",
      { id_reserva: Number(id_reserva) },
      { outFormat }
    );
    const totalServicios = Number(serviciosSubtotalRes.rows[0]?.TOTAL_SERV || 0);

    const eventosSubtotalRes = await connection.execute(
      "SELECT SUM(SUBTOTAL) AS TOTAL_EV FROM RESERVA_EVENTO WHERE ID_RESERVA = :id_reserva",
      { id_reserva: Number(id_reserva) },
      { outFormat }
    );
    const totalEventos = Number(eventosSubtotalRes.rows[0]?.TOTAL_EV || 0);

    const nuevoTotalReserva = totalHabitacion + totalServicios + totalEventos;

    // Actualizar total en RESERVA
    await connection.execute(
      "UPDATE RESERVA SET TOTAL = :total WHERE ID_RESERVA = :id_reserva",
      { total: nuevoTotalReserva, id_reserva: Number(id_reserva) },
      { autoCommit: false }
    );

    // 4. Si existe factura, actualizar
    const facturaRes = await connection.execute(
      "SELECT ID_FACTURA FROM FACTURA WHERE ID_RESERVA = :id_reserva",
      { id_reserva: Number(id_reserva) },
      { outFormat }
    );

    if (facturaRes.rows.length > 0) {
      const subtotalFactura = Number((nuevoTotalReserva / 1.18).toFixed(2));
      const igvFactura = Number((nuevoTotalReserva - subtotalFactura).toFixed(2));

      await connection.execute(
        `UPDATE FACTURA
         SET SUBTOTAL = :subtotal, IGV = :igv, TOTAL = :total
         WHERE ID_RESERVA = :id_reserva`,
        {
          subtotal: subtotalFactura,
          igv: igvFactura,
          total: nuevoTotalReserva,
          id_reserva: Number(id_reserva)
        },
        { autoCommit: false }
      );
    }

    await connection.commit();
    res.json({ message: "Evento adquirido exitosamente y cargado a la reserva." });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (err) {
        // ignore
      }
    }
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function getMisEventos(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();

    let idHuespedActual = null;
    if (req.user.role === "CLIENTE") {
      const huespedResult = await connection.execute(
        "SELECT ID_HUESPED FROM HUESPED WHERE ID_USUARIO = :id_usuario",
        { id_usuario: req.user.id },
        { outFormat }
      );
      if (huespedResult.rows.length === 0) {
        return res.json([]);
      }
      idHuespedActual = huespedResult.rows[0].ID_HUESPED;
    }

    let query = `
      SELECT RE.ID_RESERVA_EVENTO, RE.CANTIDAD, RE.SUBTOTAL, 
             E.NOMBRE AS EVENTO_NOMBRE, E.FECHA_EVENTO, RE.ID_RESERVA,
             HB.NUMERO AS NUMERO_HABITACION, R.ESTADO AS RESERVA_ESTADO
      FROM RESERVA_EVENTO RE
      INNER JOIN EVENTO E ON E.ID_EVENTO = RE.ID_EVENTO
      INNER JOIN RESERVA R ON R.ID_RESERVA = RE.ID_RESERVA
      LEFT JOIN DETALLE_RESERVA D ON D.ID_RESERVA = R.ID_RESERVA
      LEFT JOIN HABITACION HB ON HB.ID_HABITACION = D.ID_HABITACION
    `;

    const binds = {};
    if (req.user.role === "CLIENTE") {
      query += " WHERE R.ID_HUESPED = :id_huesped";
      binds.id_huesped = idHuespedActual;
    }

    query += " ORDER BY RE.ID_RESERVA_EVENTO DESC";

    const result = await connection.execute(query, binds, { outFormat });
    res.json(result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  listEventos,
  createEvento,
  updateEvento,
  deleteEvento,
  adquirirEvento,
  getMisEventos
};
