const oracledb = require("oracledb");

async function initializeOraclePool() {
  const user = (process.env.ORACLE_USER || "").trim();
  const password = (process.env.ORACLE_PASSWORD || "").trim();
  const connectString = (process.env.ORACLE_CONNECT_STRING || "").trim();

  if (!user || !password || !connectString) {
    console.warn("Variables Oracle incompletas. Se omite creacion de pool.");
    return;
  }

  const poolConfig = {
    user,
    password,
    connectString,
    poolMin: Number(process.env.ORACLE_POOL_MIN || 1),
    poolMax: Number(process.env.ORACLE_POOL_MAX || 5),
    poolIncrement: Number(process.env.ORACLE_POOL_INCREMENT || 1)
  };

  // SYS requiere privilegio SYSDBA (como "SYS as sysdba" en SQL Developer)
  if (user.toUpperCase() === "SYS") {
    poolConfig.privilege = oracledb.SYSDBA;
  }

  await oracledb.createPool(poolConfig);
  console.log(`Pool Oracle inicializado → ${user}@${connectString}`);
}


async function getOracleConnection() {
  return oracledb.getConnection();
}

async function closeOraclePool() {
  try {
    await oracledb.getPool().close(10);
    console.log("Pool Oracle cerrado");
  } catch (error) {
    if (error.message.includes("NJS-047")) {
      return;
    }
    console.error("Error cerrando pool Oracle:", error.message);
  }
}

module.exports = {
  initializeOraclePool,
  getOracleConnection,
  closeOraclePool,
  outFormat: oracledb.OUT_FORMAT_OBJECT
};
