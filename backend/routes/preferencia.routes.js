const { Router } = require("express");
const controller = require("../controllers/preferencia.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("ADMIN", "GERENTE"), controller.listPreferencias);
router.get("/huesped/:idHuesped", controller.getPreferenciaByHuesped);
router.post("/", controller.createPreferencia);
router.put("/:idHuesped", controller.updatePreferencia);
router.delete("/:idHuesped", requireRole("ADMIN"), controller.deletePreferencia);

module.exports = router;
