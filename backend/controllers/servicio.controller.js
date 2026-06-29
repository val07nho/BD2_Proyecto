const { getOracleConnection, outFormat } = require("../config/oracle");

async function listServicios(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute("SELECT * FROM SERVICIO ORDER BY ID_SERVICIO", [], { outFormat });
    res.json(result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function createServicio(req, res, next) {
  let connection;
  try {
    const { nombre, descripcion, precio, estado } = req.body;
    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO SERVICIO (ID_SERVICIO, NOMBRE, DESCRIPCION, PRECIO, ESTADO)
       VALUES (SEQ_SERVICIO.NEXTVAL, :nombre, :descripcion, :precio, :estado)`,
      { nombre, descripcion: descripcion || null, precio, estado: estado || "A" },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Servicio creado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function updateServicio(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, estado } = req.body;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `UPDATE SERVICIO
       SET NOMBRE = :nombre,
           DESCRIPCION = :descripcion,
           PRECIO = :precio,
           ESTADO = :estado
       WHERE ID_SERVICIO = :id`,
      { id: Number(id), nombre, descripcion: descripcion || null, precio, estado: estado || "A" },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.json({ message: "Servicio actualizado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteServicio(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      "DELETE FROM SERVICIO WHERE ID_SERVICIO = :id",
      { id: Number(id) },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.json({ message: "Servicio eliminado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function adquirirServicio(req, res, next) {
  let connection;
  try {
    const { id_reserva, id_servicio, cantidad } = req.body;
    const qty = Number(cantidad || 1);

    if (!id_reserva || !id_servicio) {
      return res.status(400).json({ message: "id_reserva e id_servicio son requeridos" });
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
      return res.status(400).json({ message: "Solo se pueden agregar servicios a reservas PENDIENTES de pago." });
    }

    // Obtener precio del servicio
    const servicioResult = await connection.execute(
      "SELECT PRECIO, ESTADO FROM SERVICIO WHERE ID_SERVICIO = :id_servicio",
      { id_servicio: Number(id_servicio) },
      { outFormat }
    );

    if (servicioResult.rows.length === 0) {
      return res.status(404).json({ message: "El servicio no existe." });
    }

    if (String(servicioResult.rows[0].ESTADO).trim() !== "A") {
      return res.status(400).json({ message: "El servicio seleccionado no esta activo." });
    }

    const precioServicio = Number(servicioResult.rows[0].PRECIO);
    const subtotalConsumo = precioServicio * qty;

    // 2. Insertar en CONSUMO_SERVICIO
    await connection.execute(
      `INSERT INTO CONSUMO_SERVICIO (ID_CONSUMO, ID_RESERVA, ID_SERVICIO, CANTIDAD, SUBTOTAL, FECHA)
       VALUES (SEQ_CONSUMO_SERVICIO.NEXTVAL, :id_reserva, :id_servicio, :cantidad, :subtotal, SYSDATE)`,
      {
        id_reserva: Number(id_reserva),
        id_servicio: Number(id_servicio),
        cantidad: qty,
        subtotal: subtotalConsumo
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
    res.json({ message: "Servicio adquirido exitosamente y cargado a la reserva." });
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

async function getMisServicios(req, res, next) {
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
      SELECT CS.ID_CONSUMO, CS.CANTIDAD, CS.SUBTOTAL, CS.FECHA,
             S.NOMBRE AS SERVICIO_NOMBRE, S.PRECIO AS SERVICIO_PRECIO,
             CS.ID_RESERVA, HB.NUMERO AS NUMERO_HABITACION, R.ESTADO AS RESERVA_ESTADO
      FROM CONSUMO_SERVICIO CS
      INNER JOIN SERVICIO S ON S.ID_SERVICIO = CS.ID_SERVICIO
      INNER JOIN RESERVA R ON R.ID_RESERVA = CS.ID_RESERVA
      LEFT JOIN DETALLE_RESERVA D ON D.ID_RESERVA = R.ID_RESERVA
      LEFT JOIN HABITACION HB ON HB.ID_HABITACION = D.ID_HABITACION
    `;

    const binds = {};
    if (req.user.role === "CLIENTE") {
      query += " WHERE R.ID_HUESPED = :id_huesped";
      binds.id_huesped = idHuespedActual;
    }

    query += " ORDER BY CS.ID_CONSUMO DESC";

    const result = await connection.execute(query, binds, { outFormat });
    res.json(result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  listServicios,
  createServicio,
  updateServicio,
  deleteServicio,
  adquirirServicio,
  getMisServicios
};
