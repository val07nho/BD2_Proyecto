// HRMS MongoDB seed data (30 registros por colecciÃ³n)

use("hrms");

db.encuestas.deleteMany({});
db.historial_cliente.deleteMany({});
db.perfil_cliente.deleteMany({});
db.recomendaciones.deleteMany({});

const encuestas = [];
const historialCliente = [];
const perfilCliente = [];
const recomendaciones = [];

for (let i = 1; i <= 30; i++) {

  encuestas.push({
    _id: `E${String(i).padStart(3, "0")}`,
    idHuesped: i,
    idReserva: i,
    fecha: new Date(`2026-06-${String((i % 28) + 1).padStart(2, "0")}T10:00:00Z`),
    calificacionGeneral: (i % 5) + 1,
    comentario: `Comentario de satisfacciÃ³n ${i}`,
    criterios: [
      { nombre: "Limpieza", puntaje: ((i + 1) % 5) + 1 },
      { nombre: "AtenciÃ³n", puntaje: ((i + 2) % 5) + 1 },
      { nombre: "Comodidad", puntaje: ((i + 3) % 5) + 1 }
    ]
  });

  historialCliente.push({
    _id: `H${String(i).padStart(3, "0")}`,
    idHuesped: i,
    busquedas: [
      {
        fecha: new Date("2026-05-05T09:00:00Z"),
        texto: "HabitaciÃ³n Deluxe"
      },
      {
        fecha: new Date("2026-06-10T13:00:00Z"),
        texto: "Paquetes fin de semana"
      }
    ],
    visitas: [
      {
        fecha: new Date("2026-06-01T11:00:00Z"),
        modulo: "Landing",
        accion: "Ver habitaciones"
      },
      {
        fecha: new Date("2026-06-12T16:30:00Z"),
        modulo: "Cliente",
        accion: "Crear reserva"
      }
    ],
    ultimasReservas: [
      {
        idReserva: i,
        fechaIngreso: new Date("2026-07-10T00:00:00Z"),
        fechaSalida: new Date("2026-07-15T00:00:00Z")
      }
    ]
  });

  perfilCliente.push({
    _id: `P${String(i).padStart(3, "0")}`,
    idHuesped: i,
    preferencias: {
      tipoHabitacion: i % 3 === 0 ? "Suite" : i % 2 === 0 ? "Deluxe" : "Estandar",
      vista: i % 2 === 0 ? "Mar" : "JardÃ­n",
      tipoCama: i % 3 === 0 ? "King" : "Queen",
      almohadas: i % 2 === 0 ? "Suave" : "OrtopÃ©dica",
      temperatura: 20 + (i % 5),
      dieta: i % 4 === 0 ? ["Vegetariana"] : ["Regular"],
      serviciosFavoritos: ["Spa", "Room Service"]
    },
    idiomas: ["EspaÃ±ol", "InglÃ©s"],
    favoritos: [
      {
        categoria: "Evento",
        nombre: "Cena Gourmet"
      },
      {
        categoria: "Servicio",
        nombre: "Masaje"
      }
    ],
    ultimaConexion: new Date("2026-06-20T18:00:00Z"),
    fechaCreacion: new Date("2026-01-01T10:00:00Z")
  });

  recomendaciones.push({
    _id: `R${String(i).padStart(3, "0")}`,
    idHuesped: i,
    recomendaciones: [
      {
        categoria: "Servicio",
        nombre: "Spa",
        descripcion: "SesiÃ³n de relajaciÃ³n de 60 minutos",
        prioridad: 5
      },
      {
        categoria: "Evento",
        nombre: "Tour Marino",
        descripcion: "Recorrido de medio dÃ­a por la costa",
        prioridad: 4
      }
    ],
    fechaGeneracion: new Date("2026-06-22T08:00:00Z")
  });

}

db.encuestas.insertMany(encuestas);
db.historial_cliente.insertMany(historialCliente);
db.perfil_cliente.insertMany(perfilCliente);
db.recomendaciones.insertMany(recomendaciones);
