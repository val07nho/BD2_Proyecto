const { MongoClient } = require("mongodb");

let client;
let db;

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB || "hrms";

  if (!uri) {
    console.warn("MONGO_URI no definido. Se omite conexion a MongoDB.");
    return;
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log("Conexion MongoDB establecida");
}

function getMongoDb() {
  if (!db) {
    throw new Error("MongoDB no inicializado. Revisa configuracion y arranque.");
  }
  return db;
}

async function closeMongo() {
  if (client) {
    await client.close();
    console.log("Conexion MongoDB cerrada");
  }
}

module.exports = {
  connectMongo,
  getMongoDb,
  closeMongo
};
