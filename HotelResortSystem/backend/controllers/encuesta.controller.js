const { ObjectId } = require("mongodb");
const { getMongoDb } = require("../config/mongodb");

async function listEncuestas(req, res, next) {
  try {
    const db = getMongoDb();
    const data = await db.collection("encuestas").find({}).sort({ fecha: -1 }).toArray();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function createEncuesta(req, res, next) {
  try {
    const db = getMongoDb();
    const payload = {
      idHuesped: Number(req.body.idHuesped),
      fecha: req.body.fecha,
      calificacion: Number(req.body.calificacion),
      comentario: req.body.comentario || ""
    };

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

module.exports = {
  listEncuestas,
  createEncuesta,
  deleteEncuesta
};
