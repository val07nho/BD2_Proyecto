const { ObjectId } = require("mongodb");
const { getMongoDb } = require("../config/mongodb");

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function listEncuestas(req, res, next) {
  try {
    const db = getMongoDb();
    const data = await db.collection("encuestas").find({}).sort({ fecha: -1 }).toArray();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function listEncuestasByHuesped(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = toNumber(req.params.idHuesped);

    if (!idHuesped) {
      return res.status(400).json({ message: "idHuesped invalido" });
    }

    const data = await db.collection("encuestas").find({ idHuesped }).sort({ fecha: -1 }).toArray();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function createEncuesta(req, res, next) {
  try {
    const db = getMongoDb();
    const payload = {
      idHuesped: toNumber(req.body.idHuesped),
      idReserva: toNumber(req.body.idReserva),
      fecha: req.body.fecha ? new Date(req.body.fecha) : new Date(),
      calificacion: toNumber(req.body.calificacion),
      calificacionGeneral: toNumber(req.body.calificacionGeneral),
      comentario: req.body.comentario || ""
    };

    if (!payload.idHuesped) {
      return res.status(400).json({ message: "idHuesped es requerido" });
    }

    if (!payload.calificacion && !payload.calificacionGeneral) {
      return res.status(400).json({ message: "calificacion o calificacionGeneral es requerida" });
    }

    const result = await db.collection("encuestas").insertOne(payload);
    res.status(201).json({ message: "Encuesta creada", id: result.insertedId });
  } catch (error) {
    next(error);
  }
}

async function deleteEncuesta(req, res, next) {
  try {
    const db = getMongoDb();
    const encuestaId = req.params.id;
    const query = ObjectId.isValid(encuestaId) ? { _id: new ObjectId(encuestaId) } : { _id: encuestaId };

    const result = await db.collection("encuestas").deleteOne(query);
    if (!result.deletedCount) {
      return res.status(404).json({ message: "Encuesta no encontrada" });
    }

    res.json({ message: "Encuesta eliminada" });
  } catch (error) {
    next(error);
  }
}

async function getEncuestasStats(req, res, next) {
  try {
    const db = getMongoDb();
    const pipeline = [
      {
        $addFields: {
          score: {
            $ifNull: ["$calificacionGeneral", "$calificacion"]
          }
        }
      },
      {
        $match: {
          score: { $type: "number" }
        }
      },
      {
        $group: {
          _id: null,
          totalEncuestas: { $sum: 1 },
          promedioSatisfaccion: { $avg: "$score" }
        }
      }
    ];

    const [kpi = { totalEncuestas: 0, promedioSatisfaccion: 0 }] = await db
      .collection("encuestas")
      .aggregate(pipeline)
      .toArray();

    const distribucion = await db
      .collection("encuestas")
      .aggregate([
        {
          $addFields: {
            score: {
              $ifNull: ["$calificacionGeneral", "$calificacion"]
            }
          }
        },
        {
          $match: {
            score: { $type: "number" }
          }
        },
        {
          $group: {
            _id: "$score",
            total: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
      .toArray();

    const comentariosRecientes = await db
      .collection("encuestas")
      .find({ comentario: { $exists: true, $ne: "" } })
      .project({ idHuesped: 1, comentario: 1, fecha: 1, calificacion: 1, calificacionGeneral: 1 })
      .sort({ fecha: -1 })
      .limit(10)
      .toArray();

    res.json({
      totalEncuestas: kpi.totalEncuestas,
      promedioSatisfaccion: Number((kpi.promedioSatisfaccion || 0).toFixed(2)),
      distribucion,
      comentariosRecientes
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listEncuestas,
  listEncuestasByHuesped,
  createEncuesta,
  deleteEncuesta,
  getEncuestasStats
};
