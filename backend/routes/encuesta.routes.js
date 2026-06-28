const { Router } = require("express");
const controller = require("../controllers/encuesta.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN", "GERENTE"), controller.listEncuestas);
router.get("/stats", requireAuth, requireRole("ADMIN", "GERENTE"), controller.getEncuestasStats);
router.use(requireAuth);
router.get("/huesped/:idHuesped", controller.listEncuestasByHuesped);
router.post("/", controller.createEncuesta);
router.delete("/:id", requireRole("ADMIN"), controller.deleteEncuesta);

module.exports = router;
