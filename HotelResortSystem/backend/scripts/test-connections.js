require("dotenv").config();

const oracledb = require("oracledb");
const { MongoClient } = require("mongodb");

async function testOracle() {
  const user = process.env.ORACLE_USER;
  const password = process.env.ORACLE_PASSWORD;
  const connectString = process.env.ORACLE_CONNECT_STRING;

  if (!user || !password || !connectString) {
    console.log("[Oracle] Variables incompletas en .env");
    return false;
  }

  let connection;
  try {
    connection = await oracledb.getConnection({ user, password, connectString });
    await connection.execute("SELECT 1 FROM DUAL");
    console.log("[Oracle] Conexion exitosa");
    return true;
  } catch (error) {
    console.log("[Oracle] Error de conexion:", error.message);
    return false;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function testMongo() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB || "hrms";

  if (!uri) {
    console.log("[MongoDB] MONGO_URI no definida en .env");
    return false;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    console.log("[MongoDB] Conexion exitosa");
    return true;
  } catch (error) {
    console.log("[MongoDB] Error de conexion:", error.message);
    return false;
  } finally {
    await client.close();
  }
}

(async () => {
  const oracleOk = await testOracle();
  const mongoOk = await testMongo();

  if (oracleOk && mongoOk) {
    console.log("\nResultado: ambas conexiones OK");
    process.exit(0);
  }

  console.log("\nResultado: revisar configuracion de alguna conexion");
  process.exit(1);
})();
