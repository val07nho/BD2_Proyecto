const { Router } = require("express");
const controller = require("../controllers/historial.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("ADMIN", "GERENTE"), controller.listHistoriales);
router.get("/huesped/:idHuesped", controller.getHistorialByHuesped);
router.put("/huesped/:idHuesped", controller.upsertHistorial);
router.delete("/huesped/:idHuesped", requireRole("ADMIN"), controller.deleteHistorial);
router.post("/huesped/:idHuesped/visita", controller.registrarVisita);
router.post("/huesped/:idHuesped/busqueda", controller.registrarBusqueda);

module.exports = router;
