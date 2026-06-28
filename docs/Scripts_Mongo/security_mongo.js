// Seguridad MongoDB para HRMS
// Ejecutar como usuario administrador de MongoDB.
// Ajustar contrasenas antes de usar en un entorno real.

use("hrms");

db.createRole({
  role: "hrmsAppRole",
  privileges: [
    {
      resource: { db: "hrms", collection: "perfil_cliente" },
      actions: ["find", "insert", "update", "remove"]
    },
    {
      resource: { db: "hrms", collection: "encuestas" },
      actions: ["find", "insert", "update", "remove"]
    },
    {
      resource: { db: "hrms", collection: "historial_cliente" },
      actions: ["find", "insert", "update", "remove"]
    },
    {
      resource: { db: "hrms", collection: "recomendaciones" },
      actions: ["find", "insert", "update", "remove"]
    }
  ],
  roles: []
});

db.createRole({
  role: "hrmsReportRole",
  privileges: [
    {
      resource: { db: "hrms", collection: "perfil_cliente" },
      actions: ["find"]
    },
    {
      resource: { db: "hrms", collection: "encuestas" },
      actions: ["find"]
    },
    {
      resource: { db: "hrms", collection: "historial_cliente" },
      actions: ["find"]
    },
    {
      resource: { db: "hrms", collection: "recomendaciones" },
      actions: ["find"]
    }
  ],
  roles: []
});

db.createUser({
  user: "hrms_app",
  pwd: "HrmsMongoApp_2026",
  roles: [{ role: "hrmsAppRole", db: "hrms" }]
});

db.createUser({
  user: "hrms_report",
  pwd: "HrmsMongoReport_2026",
  roles: [{ role: "hrmsReportRole", db: "hrms" }]
});

// Consultas de verificacion para capturas.
db.getUsers();
db.getRoles({ showPrivileges: true });
