const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { getOracleConnection, outFormat } = require("../config/oracle");

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

function normalizeRole(role) {
  const value = String(role || "CLIENTE").toUpperCase();
  if (value === "ADMINISTRADOR") return "ADMIN";
  if (["ADMIN", "GERENTE", "CLIENTE"].includes(value)) return value;
  return "CLIENTE";
}

async function verifyPassword(rawPassword, storedPassword) {
  if (!storedPassword) return false;

  if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
    return bcrypt.compare(rawPassword, storedPassword);
  }

  return rawPassword === storedPassword;
}

function createToken(user) {
  return jwt.sign(
    {
      sub: user.ID_USUARIO,
      role: user.ROL_NOMBRE,
      username: user.USERNAME
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function register(req, res, next) {
  let connection;

  try {
    const { nombre, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email y password son requeridos" });
    }

    const normalizedRole = normalizeRole(role);
    const names = String(nombre || "").trim();
    const parts = names.split(/\s+/).filter(Boolean);
    const nombres = parts.slice(0, Math.max(parts.length - 1, 1)).join(" ") || names || "Cliente";
    const apellidos = parts.length > 1 ? parts.slice(-1).join(" ") : "General";

    connection = await getOracleConnection();

    const existsResult = await connection.execute(
      "SELECT ID_USUARIO FROM USUARIO WHERE USERNAME = :username",
      { username: email },
      { outFormat }
    );

    if (existsResult.rows.length > 0) {
      return res.status(409).json({ message: "El usuario ya existe" });
    }

    const roleResult = await connection.execute(
      "SELECT ID_ROL, NOMBRE FROM ROL WHERE UPPER(NOMBRE) = :nombre",
      { nombre: normalizedRole },
      { outFormat }
    );

    if (roleResult.rows.length === 0) {
      return res.status(400).json({ message: "Rol no valido" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
      `INSERT INTO USUARIO (ID_USUARIO, ID_ROL, USERNAME, PASSWORD, ESTADO)
       VALUES (SEQ_USUARIO.NEXTVAL, :id_rol, :username, :password, 'A')`,
      {
        id_rol: roleResult.rows[0].ID_ROL,
        username: email,
        password: hashedPassword
      },
      { autoCommit: false }
    );

    const userIdResult = await connection.execute("SELECT SEQ_USUARIO.CURRVAL AS ID_USUARIO FROM DUAL", [], { outFormat });
    const userId = userIdResult.rows[0].ID_USUARIO;

    if (normalizedRole === "CLIENTE") {
      await connection.execute(
        `INSERT INTO HUESPED (ID_HUESPED, ID_USUARIO, NOMBRES, APELLIDOS, CORREO)
         VALUES (SEQ_HUESPED.NEXTVAL, :id_usuario, :nombres, :apellidos, :correo)`,
        {
          id_usuario: userId,
          nombres,
          apellidos,
          correo: email
        },
        { autoCommit: false }
      );
    }

    await connection.commit();

    const token = jwt.sign(
      {
        sub: userId,
        role: normalizedRole,
        username: email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        role: normalizedRole,
        nombre: names || email
      }
    });
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

async function login(req, res, next) {
  let connection;

  try {
    const { email, username, password } = req.body;
    const userName = email || username;

    if (!userName || !password) {
      return res.status(400).json({ message: "email/username y password son requeridos" });
    }

    connection = await getOracleConnection();

    const result = await connection.execute(
      `SELECT U.ID_USUARIO, U.USERNAME, U.PASSWORD, U.ESTADO,
              R.NOMBRE AS ROL_NOMBRE,
              H.NOMBRES,
              H.APELLIDOS
       FROM USUARIO U
       INNER JOIN ROL R ON R.ID_ROL = U.ID_ROL
       LEFT JOIN HUESPED H ON H.ID_USUARIO = U.ID_USUARIO
       WHERE U.USERNAME = :username`,
      { username: userName },
      { outFormat }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const user = result.rows[0];

    if (user.ESTADO !== "A") {
      return res.status(403).json({ message: "Usuario inactivo" });
    }

    const validPassword = await verifyPassword(password, user.PASSWORD);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user.ID_USUARIO,
        email: user.USERNAME,
        role: normalizeRole(user.ROL_NOMBRE),
        nombre: [user.NOMBRES, user.APELLIDOS].filter(Boolean).join(" ") || user.USERNAME
      }
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  login,
  register
};
