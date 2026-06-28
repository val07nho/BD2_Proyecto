const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

function normalizeRole(role) {
  const value = String(role || "").toUpperCase();
  if (value === "ADMINISTRADOR") return "ADMIN";
  if (["ADMIN", "GERENTE", "CLIENTE"].includes(value)) return value;
  return "";
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Token de autenticacion requerido" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: Number(payload.sub),
      username: payload.username,
      role: normalizeRole(payload.role)
    };
    return next();
  } catch {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
}

function requireRole(...allowedRoles) {
  const allowed = allowedRoles.map(normalizeRole);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Token de autenticacion requerido" });
    }

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: "No tienes permisos para esta operacion" });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
