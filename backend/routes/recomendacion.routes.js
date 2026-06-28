const { Router } = require("express");
const controller = require("../controllers/recomendacion.controller");

const router = Router();

router.get("/", controller.listRecomendaciones);
router.get("/huesped/:idHuesped", controller.getRecomendacionesByHuesped);
router.put("/huesped/:idHuesped", controller.upsertRecomendaciones);
router.delete("/huesped/:idHuesped", controller.deleteRecomendaciones);

module.exports = router;
