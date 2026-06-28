const { getMongoDb } = require("../config/mongodb");

const COLLECTION = "historial_cliente";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeHistorialPayload(body) {
  return {
    idHuesped: toNumber(body.idHuesped),
    busquedas: Array.isArray(body.busquedas) ? body.busquedas : [],
    visitas: Array.isArray(body.visitas) ? body.visitas : [],
    ultimasReservas: Array.isArray(body.ultimasReservas) ? body.ultimasReservas : []
  };
}

async function listHistoriales(req, res, next) {
  try {
    const db = getMongoDb();
    const data = await db.collection(COLLECTION).find({}).toArray();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getHistorialByHuesped(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = toNumber(req.params.idHuesped);

    if (!idHuesped) {
      return res.status(400).json({ message: "idHuesped invalido" });
    }

    const data = await db.collection(COLLECTION).findOne({ idHuesped });
    if (!data) {
      return res.status(404).json({ message: "Historial no encontrado" });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function upsertHistorial(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = toNumber(req.params.idHuesped);

    if (!idHuesped) {
      return res.status(400).json({ message: "idHuesped invalido" });
    }

    const payload = normalizeHistorialPayload({ ...req.body, idHuesped });

    await db.collection(COLLECTION).updateOne(
      { idHuesped },
      { $set: payload },
      { upsert: true }
    );

    res.json({ message: "Historial actualizado" });
  } catch (error) {
    next(error);
  }
}

async function deleteHistorial(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = toNumber(req.params.idHuesped);

    if (!idHuesped) {
      return res.status(400).json({ message: "idHuesped invalido" });
    }

    const result = await db.collection(COLLECTION).deleteOne({ idHuesped });
    if (!result.deletedCount) {
      return res.status(404).json({ message: "Historial no encontrado" });
    }

    res.json({ message: "Historial eliminado" });
  } catch (error) {
    next(error);
  }
}

async function registrarVisita(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = toNumber(req.params.idHuesped);
    const { modulo, accion } = req.body;

    if (!idHuesped) {
      return res.status(400).json({ message: "idHuesped invalido" });
    }

    await db.collection(COLLECTION).updateOne(
      { idHuesped },
      { 
        $push: { 
          visitas: { 
            fecha: new Date(), 
            modulo: String(modulo || ""), 
            accion: String(accion || "") 
          } 
        } 
      },
      { upsert: true }
    );

    res.json({ message: "Visita registrada" });
  } catch (error) {
    next(error);
  }
}

async function registrarBusqueda(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = toNumber(req.params.idHuesped);
    const { texto } = req.body;

    if (!idHuesped) {
      return res.status(400).json({ message: "idHuesped invalido" });
    }

    await db.collection(COLLECTION).updateOne(
      { idHuesped },
      { 
        $push: { 
          busquedas: { 
            fecha: new Date(), 
            texto: String(texto || "") 
          } 
        } 
      },
      { upsert: true }
    );

    res.json({ message: "Búsqueda registrada" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listHistoriales,
  getHistorialByHuesped,
  upsertHistorial,
  deleteHistorial,
  registrarVisita,
  registrarBusqueda
};
