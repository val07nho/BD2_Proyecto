require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { initializeOraclePool, closeOraclePool } = require("./config/oracle");
const { connectMongo, closeMongo } = require("./config/mongodb");

const huespedRoutes = require("./routes/huesped.routes");
const habitacionRoutes = require("./routes/habitacion.routes");
const reservaRoutes = require("./routes/reserva.routes");
const facturaRoutes = require("./routes/factura.routes");
const eventoRoutes = require("./routes/evento.routes");
const preferenciaRoutes = require("./routes/preferencia.routes");
const encuestaRoutes = require("./routes/encuesta.routes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", async (req, res) => {
  res.json({ status: "ok", service: "HRMS API" });
});

app.use("/api/huespedes", huespedRoutes);
app.use("/api/habitaciones", habitacionRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/facturas", facturaRoutes);
app.use("/api/eventos", eventoRoutes);
app.use("/api/preferencias", preferenciaRoutes);
app.use("/api/encuestas", encuestaRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor", details: err.message });
});

async function startServer() {
  try {
    await initializeOraclePool();
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`HRMS API ejecutandose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error.message);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  try {
    await closeOraclePool();
    await closeMongo();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

startServer();
