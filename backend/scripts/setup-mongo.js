require("dotenv").config();

const { MongoClient } = require("mongodb");

function buildSeedData() {
  const perfilCliente = [];
  const encuestas = [];
  const historialCliente = [];
  const recomendaciones = [];

  for (let i = 1; i <= 30; i += 1) {
    perfilCliente.push({
      _id: `P${String(i).padStart(3, "0")}`,
      idHuesped: i,
      preferencias: {
        tipoHabitacion: i % 3 === 0 ? "Suite" : i % 2 === 0 ? "Deluxe" : "Estandar",
        vista: i % 2 === 0 ? "Mar" : "Jardin",
        tipoCama: i % 3 === 0 ? "King" : "Queen",
        temperatura: 20 + (i % 5),
        dieta: i % 4 === 0 ? ["Vegetariana"] : ["Regular"],
        serviciosFavoritos: ["Spa", "Room Service"]
      },
      idiomas: ["Espanol", "Ingles"],
      fechaCreacion: new Date("2026-01-01T10:00:00Z"),
      ultimaConexion: new Date("2026-06-20T18:00:00Z")
    });

    encuestas.push({
      _id: `E${String(i).padStart(3, "0")}`,
      idHuesped: i,
      idReserva: i,
      fecha: new Date(`2026-06-${String((i % 28) + 1).padStart(2, "0")}T10:00:00Z`),
      calificacionGeneral: (i % 5) + 1,
      comentario: `Comentario de satisfaccion ${i}`
    });

    historialCliente.push({
      _id: `H${String(i).padStart(3, "0")}`,
      idHuesped: i,
      busquedas: [
        {
          fecha: new Date("2026-05-05T09:00:00Z"),
          texto: "Habitacion Deluxe"
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

    recomendaciones.push({
      _id: `R${String(i).padStart(3, "0")}`,
      idHuesped: i,
      recomendaciones: [
        {
          categoria: "Servicio",
          nombre: "Spa",
          descripcion: "Sesion de relajacion de 60 minutos",
          prioridad: 5
        },
        {
          categoria: "Evento",
          nombre: "Tour Marino",
          descripcion: "Recorrido de medio dia por la costa",
          prioridad: 4
        },
        {
          categoria: "Gastronomia",
          nombre: "Cena Gourmet",
          descripcion: "Menu degustacion en terraza",
          prioridad: 4
        }
      ],
      fechaGeneracion: new Date("2026-06-22T08:00:00Z")
    });
  }

  return { perfilCliente, encuestas, historialCliente, recomendaciones };
}

async function ensureCollection(db, name) {
  const exists = await db.listCollections({ name }).hasNext();
  if (!exists) {
    await db.createCollection(name);
  }
}

async function setupMongo() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB || "hrms";

  if (!uri) {
    throw new Error("MONGO_URI no definida en .env");
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    await ensureCollection(db, "perfil_cliente");
    await ensureCollection(db, "encuestas");
    await ensureCollection(db, "historial_cliente");
    await ensureCollection(db, "recomendaciones");

    await db.collection("perfil_cliente").createIndex({ idHuesped: 1 }, { unique: true });
    await db.collection("encuestas").createIndex({ idHuesped: 1, fecha: -1 });
    await db.collection("historial_cliente").createIndex({ idHuesped: 1 }, { unique: true });
    await db.collection("recomendaciones").createIndex({ idHuesped: 1 }, { unique: true });

    const seed = buildSeedData();

    await db.collection("perfil_cliente").deleteMany({});
    await db.collection("encuestas").deleteMany({});
    await db.collection("historial_cliente").deleteMany({});
    await db.collection("recomendaciones").deleteMany({});

    await db.collection("perfil_cliente").insertMany(seed.perfilCliente);
    await db.collection("encuestas").insertMany(seed.encuestas);
    await db.collection("historial_cliente").insertMany(seed.historialCliente);
    await db.collection("recomendaciones").insertMany(seed.recomendaciones);

    console.log(`[MongoDB] Base '${dbName}' inicializada correctamente`);
    console.log("[MongoDB] Colecciones pobladas: perfil_cliente, encuestas, historial_cliente, recomendaciones");
  } finally {
    await client.close();
  }
}

setupMongo()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[MongoDB] Error al inicializar:", error.message);
    process.exit(1);
  });

