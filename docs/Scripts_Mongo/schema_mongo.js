// HRMS MongoDB collections and indexes

use("hrms");

db.createCollection("preferencias");
db.preferencias.createIndex({ idHuesped: 1 }, { unique: true });

db.createCollection("encuestas");
db.encuestas.createIndex({ idHuesped: 1, fecha: -1 });

db.createCollection("historial_estadias");
db.historial_estadias.createIndex({ idHuesped: 1 }, { unique: true });

db.createCollection("recomendaciones");
db.recomendaciones.createIndex({ idHuesped: 1 }, { unique: true });
