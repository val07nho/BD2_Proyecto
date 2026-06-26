require("dotenv").config();

const { MongoClient } = require("mongodb");

function buildSeedData() {
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

  return { preferencias, encuestas, historial, recomendaciones };
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

    await ensureCollection(db, "preferencias");
    await ensureCollection(db, "encuestas");
    await ensureCollection(db, "historial_estadias");
    await ensureCollection(db, "recomendaciones");

    await db.collection("preferencias").createIndex({ idHuesped: 1 }, { unique: true });
    await db.collection("encuestas").createIndex({ idHuesped: 1, fecha: -1 });
    await db.collection("historial_estadias").createIndex({ idHuesped: 1 }, { unique: true });
    await db.collection("recomendaciones").createIndex({ idHuesped: 1 }, { unique: true });

    const seed = buildSeedData();

    await db.collection("preferencias").deleteMany({});
    await db.collection("encuestas").deleteMany({});
    await db.collection("historial_estadias").deleteMany({});
    await db.collection("recomendaciones").deleteMany({});

    await db.collection("preferencias").insertMany(seed.preferencias);
    await db.collection("encuestas").insertMany(seed.encuestas);
    await db.collection("historial_estadias").insertMany(seed.historial);
    await db.collection("recomendaciones").insertMany(seed.recomendaciones);

    console.log(`[MongoDB] Base '${dbName}' inicializada correctamente`);
    console.log("[MongoDB] Colecciones pobladas: preferencias, encuestas, historial_estadias, recomendaciones");
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
