const { getMongoDb } = require("../config/mongodb");

async function listPreferencias(req, res, next) {
  try {
    const db = getMongoDb();
    const data = await db.collection("preferencias").find({}).toArray();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function createPreferencia(req, res, next) {
  try {
    const db = getMongoDb();
    const payload = {
      idHuesped: Number(req.body.idHuesped),
      vista: req.body.vista,
      tipoCama: req.body.tipoCama,
      dieta: req.body.dieta,
      noFumador: Boolean(req.body.noFumador),
      almohadasEspeciales: req.body.almohadasEspeciales || ""
    };

    const result = await db.collection("preferencias").insertOne(payload);
    res.status(201).json({ message: "Preferencia creada", id: result.insertedId });
  } catch (error) {
    next(error);
  }
}

async function updatePreferencia(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = Number(req.params.idHuesped);

    const result = await db.collection("preferencias").updateOne(
      { idHuesped },
      {
        $set: {
          vista: req.body.vista,
          tipoCama: req.body.tipoCama,
          dieta: req.body.dieta,
          noFumador: Boolean(req.body.noFumador),
          almohadasEspeciales: req.body.almohadasEspeciales || ""
        }
      }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ message: "Preferencia no encontrada" });
    }

    res.json({ message: "Preferencia actualizada" });
  } catch (error) {
    next(error);
  }
}

async function deletePreferencia(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = Number(req.params.idHuesped);

    const result = await db.collection("preferencias").deleteOne({ idHuesped });
    if (!result.deletedCount) {
      return res.status(404).json({ message: "Preferencia no encontrada" });
    }

    res.json({ message: "Preferencia eliminada" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPreferencias,
  createPreferencia,
  updatePreferencia,
  deletePreferencia
};
