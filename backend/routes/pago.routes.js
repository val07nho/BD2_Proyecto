const { Router } = require("express");
const controller = require("../controllers/pago.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.use(requireAuth);

router.get("/", controller.listPagos);
router.post("/", requireRole("ADMIN", "GERENTE"), controller.createPago);
router.put("/:id", requireRole("ADMIN", "GERENTE"), controller.updatePago);
router.delete("/:id", requireRole("ADMIN"), controller.deletePago);

module.exports = router;
