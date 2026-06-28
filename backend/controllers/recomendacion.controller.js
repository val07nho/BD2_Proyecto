const { getMongoDb } = require("../config/mongodb");

const COLLECTION = "recomendaciones";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeRecomendacionPayload(body) {
  return {
    idHuesped: toNumber(body.idHuesped),
    recomendaciones: Array.isArray(body.recomendaciones) ? body.recomendaciones : [],
    fechaGeneracion: body.fechaGeneracion ? new Date(body.fechaGeneracion) : new Date()
  };
}

async function listRecomendaciones(req, res, next) {
  try {
    const db = getMongoDb();
    const data = await db.collection(COLLECTION).find({}).sort({ fechaGeneracion: -1 }).toArray();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getRecomendacionesByHuesped(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = toNumber(req.params.idHuesped);

    if (!idHuesped) {
      return res.status(400).json({ message: "idHuesped invalido" });
    }

    const data = await db.collection(COLLECTION).find({ idHuesped }).sort({ fechaGeneracion: -1 }).toArray();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function upsertRecomendaciones(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = toNumber(req.params.idHuesped);

    if (!idHuesped) {
      return res.status(400).json({ message: "idHuesped invalido" });
    }

    const payload = normalizeRecomendacionPayload({ ...req.body, idHuesped });

    await db.collection(COLLECTION).updateOne(
      { idHuesped },
      { $set: payload },
      { upsert: true }
    );

    res.json({ message: "Recomendaciones actualizadas" });
  } catch (error) {
    next(error);
  }
}

async function deleteRecomendaciones(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = toNumber(req.params.idHuesped);

    if (!idHuesped) {
      return res.status(400).json({ message: "idHuesped invalido" });
    }

    const result = await db.collection(COLLECTION).deleteOne({ idHuesped });
    if (!result.deletedCount) {
      return res.status(404).json({ message: "Recomendaciones no encontradas" });
    }

    res.json({ message: "Recomendaciones eliminadas" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listRecomendaciones,
  getRecomendacionesByHuesped,
  upsertRecomendaciones,
  deleteRecomendaciones
};
