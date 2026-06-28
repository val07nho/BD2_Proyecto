const { Router } = require("express");
const controller = require("../controllers/historial.controller");

const router = Router();

router.get("/", controller.listHistoriales);
router.get("/huesped/:idHuesped", controller.getHistorialByHuesped);
router.put("/huesped/:idHuesped", controller.upsertHistorial);
router.delete("/huesped/:idHuesped", controller.deleteHistorial);

module.exports = router;
