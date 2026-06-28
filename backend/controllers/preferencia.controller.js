const { getMongoDb } = require("../config/mongodb");

const COLLECTION = "perfil_cliente";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePerfilPayload(body) {
  const idHuesped = toNumber(body.idHuesped);

  return {
    idHuesped,
    preferencias: {
      tipoHabitacion: body.tipoHabitacion || body.tipoHabitacionFavorita || "",
      vista: body.vista || body.vistaPreferida || "",
      tipoCama: body.tipoCama || "",
      temperatura: toNumber(body.temperatura) ?? null,
      dieta: Array.isArray(body.dieta) ? body.dieta : body.dieta ? [body.dieta] : [],
      serviciosFavoritos: Array.isArray(body.serviciosFavoritos)
        ? body.serviciosFavoritos
        : body.serviciosFavoritos
          ? [body.serviciosFavoritos]
          : []
    },
    idiomas: Array.isArray(body.idiomas) ? body.idiomas : body.idiomas ? [body.idiomas] : [],
    telefonos: Array.isArray(body.telefonos) ? body.telefonos : [],
    ultimaConexion: body.ultimaConexion ? new Date(body.ultimaConexion) : new Date(),
    fechaCreacion: body.fechaCreacion ? new Date(body.fechaCreacion) : new Date()
  };
}

async function listPreferencias(req, res, next) {
  try {
    const db = getMongoDb();
    const data = await db.collection(COLLECTION).find({}).toArray();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getPreferenciaByHuesped(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = toNumber(req.params.idHuesped);

    if (!idHuesped) {
      return res.status(400).json({ message: "idHuesped invalido" });
    }

    const data = await db.collection(COLLECTION).findOne({ idHuesped });
    if (!data) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function createPreferencia(req, res, next) {
  try {
    const db = getMongoDb();
    const payload = normalizePerfilPayload(req.body);

    if (!payload.idHuesped) {
      return res.status(400).json({ message: "idHuesped es requerido" });
    }

    const result = await db.collection(COLLECTION).insertOne(payload);
    res.status(201).json({ message: "Perfil cliente creado", id: result.insertedId });
  } catch (error) {
    next(error);
  }
}

async function updatePreferencia(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = toNumber(req.params.idHuesped);

    if (!idHuesped) {
      return res.status(400).json({ message: "idHuesped invalido" });
    }

    const payload = normalizePerfilPayload({ ...req.body, idHuesped });

    const result = await db.collection(COLLECTION).updateOne(
      { idHuesped },
      {
        $set: {
          preferencias: payload.preferencias,
          idiomas: payload.idiomas,
          telefonos: payload.telefonos,
          ultimaConexion: payload.ultimaConexion
        }
      }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.json({ message: "Perfil cliente actualizado" });
  } catch (error) {
    next(error);
  }
}

async function deletePreferencia(req, res, next) {
  try {
    const db = getMongoDb();
    const idHuesped = toNumber(req.params.idHuesped);

    if (!idHuesped) {
      return res.status(400).json({ message: "idHuesped invalido" });
    }

    const result = await db.collection(COLLECTION).deleteOne({ idHuesped });
    if (!result.deletedCount) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.json({ message: "Perfil cliente eliminado" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPreferencias,
  getPreferenciaByHuesped,
  createPreferencia,
  updatePreferencia,
  deletePreferencia
};
