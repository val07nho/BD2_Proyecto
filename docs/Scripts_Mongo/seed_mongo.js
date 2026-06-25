// HRMS MongoDB seed data (30 registros por coleccion)

use("hrms");

db.preferencias.deleteMany({});
db.encuestas.deleteMany({});
db.historial_estadias.deleteMany({});
db.recomendaciones.deleteMany({});

const preferencias = [];
const encuestas = [];
const historial = [];
const recomendaciones = [];

for (let i = 1; i <= 30; i += 1) {
  preferencias.push({
    _id: `P${String(i).padStart(3, "0")}`,
    idHuesped: i,
    vista: i % 2 === 0 ? "Mar" : "Jardin",
    tipoCama: i % 3 === 0 ? "King" : "Queen",
    dieta: i % 4 === 0 ? "Vegetariana" : "Regular",
    noFumador: i % 2 === 0,
    almohadasEspeciales: i % 5 === 0 ? "Ortopedicas" : "Estandar"
  });

  encuestas.push({
    _id: `E${String(i).padStart(3, "0")}`,
    idHuesped: i,
    fecha: `2026-06-${String((i % 28) + 1).padStart(2, "0")}`,
    calificacion: (i % 5) + 1,
    comentario: `Comentario de satisfaccion ${i}`
  });

  historial.push({
    _id: `H${String(i).padStart(3, "0")}`,
    idHuesped: i,
    estadias: [
      {
        fechaIngreso: "2026-01-10",
        fechaSalida: "2026-01-15"
      },
      {
        fechaIngreso: "2026-03-05",
        fechaSalida: "2026-03-08"
      }
    ]
  });

  recomendaciones.push({
    _id: `R${String(i).padStart(3, "0")}`,
    idHuesped: i,
    recomendaciones: ["Spa", "Tour Marino", "Cena Gourmet"]
  });
}

db.preferencias.insertMany(preferencias);
db.encuestas.insertMany(encuestas);
db.historial_estadias.insertMany(historial);
db.recomendaciones.insertMany(recomendaciones);
