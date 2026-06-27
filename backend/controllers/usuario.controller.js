const bcrypt = require("bcryptjs");
const { getOracleConnection, outFormat } = require("../config/oracle");

async function listUsuarios(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute(
      `SELECT U.ID_USUARIO, U.USERNAME, U.ESTADO, U.FECHA_CREACION,
              U.ID_ROL, R.NOMBRE AS ROL
       FROM USUARIO U
       INNER JOIN ROL R ON R.ID_ROL = U.ID_ROL
       ORDER BY U.ID_USUARIO`,
      [],
      { outFormat }
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function createUsuario(req, res, next) {
  let connection;
  try {
    const { username, password, id_rol, estado } = req.body;
    connection = await getOracleConnection();

    const hashed = await bcrypt.hash(String(password || "123456"), 10);

    await connection.execute(
      `INSERT INTO USUARIO (ID_USUARIO, ID_ROL, USERNAME, PASSWORD, ESTADO)
       VALUES (SEQ_USUARIO.NEXTVAL, :id_rol, :username, :password, :estado)`,
      {
        id_rol: Number(id_rol),
        username,
        password: hashed,
        estado: estado || "A"
      },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Usuario creado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function updateUsuario(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    const { username, password, id_rol, estado } = req.body;
    connection = await getOracleConnection();

    let result;
    if (password) {
      const hashed = await bcrypt.hash(String(password), 10);
      result = await connection.execute(
        `UPDATE USUARIO
         SET ID_ROL = :id_rol,
             USERNAME = :username,
             PASSWORD = :password,
             ESTADO = :estado
         WHERE ID_USUARIO = :id`,
        {
          id: Number(id),
          id_rol: Number(id_rol),
          username,
          password: hashed,
          estado: estado || "A"
        },
        { autoCommit: true }
      );
    } else {
      result = await connection.execute(
        `UPDATE USUARIO
         SET ID_ROL = :id_rol,
             USERNAME = :username,
             ESTADO = :estado
         WHERE ID_USUARIO = :id`,
        {
          id: Number(id),
          id_rol: Number(id_rol),
          username,
          estado: estado || "A"
        },
        { autoCommit: true }
      );
    }

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario actualizado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteUsuario(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    await connection.execute(
      "UPDATE HUESPED SET ID_USUARIO = NULL WHERE ID_USUARIO = :id",
      { id: Number(id) },
      { autoCommit: false }
    );

    const result = await connection.execute(
      "DELETE FROM USUARIO WHERE ID_USUARIO = :id",
      { id: Number(id) },
      { autoCommit: false }
    );

    if (!result.rowsAffected) {
      await connection.rollback();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await connection.commit();
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        // no-op
      }
    }
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  listUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
};
