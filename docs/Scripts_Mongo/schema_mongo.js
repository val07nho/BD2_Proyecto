// HRMS MongoDB schema con validadores e índices

use("hrms");

db.createCollection("encuestas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["idHuesped", "idReserva", "fecha", "calificacionGeneral"],
      properties: {
        idHuesped: { bsonType: "int" },
        idReserva: { bsonType: "int" },
        fecha: { bsonType: "date" },
        calificacionGeneral: {
          bsonType: "int",
          minimum: 1,
          maximum: 5
        },
        comentario: { bsonType: "string" },
        criterios: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["nombre", "puntaje"],
            properties: {
              nombre: { bsonType: "string" },
              puntaje: {
                bsonType: "int",
                minimum: 1,
                maximum: 5
              }
            }
          }
        }
      }
    }
  }
});

db.createCollection("historial_cliente", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["idHuesped"],
      properties: {
        idHuesped: { bsonType: "int" },
        busquedas: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              fecha: { bsonType: "date" },
              texto: { bsonType: "string" }
            }
          }
        },
        visitas: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              fecha: { bsonType: "date" },
              modulo: { bsonType: "string" },
              accion: { bsonType: "string" }
            }
          }
        },
        ultimasReservas: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              idReserva: { bsonType: "int" },
              fechaIngreso: { bsonType: "date" },
              fechaSalida: { bsonType: "date" }
            }
          }
        }
      }
    }
  }
});

db.createCollection("perfil_cliente", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["idHuesped", "preferencias", "fechaCreacion"],
      properties: {
        idHuesped: {
          bsonType: "int",
          description: "ID del huésped registrado en Oracle"
        },
        preferencias: {
          bsonType: "object",
          properties: {
            tipoHabitacion: { bsonType: "string" },
            vista: { bsonType: "string" },
            tipoCama: { bsonType: "string" },
            almohadas: { bsonType: "string" },
            temperatura: { bsonType: "int" },
            dieta: {
              bsonType: "array",
              items: { bsonType: "string" }
            },
            serviciosFavoritos: {
              bsonType: "array",
              items: { bsonType: "string" }
            }
          }
        },
        idiomas: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        favoritos: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              categoria: { bsonType: "string" },
              nombre: { bsonType: "string" }
            }
          }
        },
        ultimaConexion: { bsonType: "date" },
        fechaCreacion: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("recomendaciones", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["idHuesped", "recomendaciones", "fechaGeneracion"],
      properties: {
        idHuesped: { bsonType: "int" },
        recomendaciones: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["categoria", "nombre"],
            properties: {
              categoria: { bsonType: "string" },
              nombre: { bsonType: "string" },
              descripcion: { bsonType: "string" },
              prioridad: {
                bsonType: "int",
                minimum: 1,
                maximum: 5
              }
            }
          }
        },
        fechaGeneracion: { bsonType: "date" }
      }
    }
  }
});

// Índices
db.encuestas.createIndex({ idHuesped: 1, fecha: -1 });
db.encuestas.createIndex({ idReserva: 1 });

db.historial_cliente.createIndex({ idHuesped: 1 }, { unique: true });

db.perfil_cliente.createIndex({ idHuesped: 1 }, { unique: true });
db.perfil_cliente.createIndex({ "preferencias.tipoHabitacion": 1 });

db.recomendaciones.createIndex({ idHuesped: 1, fechaGeneracion: -1 });
