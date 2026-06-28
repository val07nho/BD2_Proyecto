const { Router } = require("express");
const controller = require("../controllers/recomendacion.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("ADMIN", "GERENTE"), controller.listRecomendaciones);
router.get("/huesped/:idHuesped", controller.getRecomendacionesByHuesped);
router.put("/huesped/:idHuesped", requireRole("ADMIN", "GERENTE"), controller.upsertRecomendaciones);
router.delete("/huesped/:idHuesped", requireRole("ADMIN"), controller.deleteRecomendaciones);

module.exports = router;
