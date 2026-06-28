const { Router } = require("express");
const controller = require("../controllers/encuesta.controller");

const router = Router();

router.get("/", controller.listEncuestas);
router.get("/stats", controller.getEncuestasStats);
router.get("/huesped/:idHuesped", controller.listEncuestasByHuesped);
router.post("/", controller.createEncuesta);
router.delete("/:id", controller.deleteEncuesta);

module.exports = router;
